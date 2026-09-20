import { IEventService } from './interfaces';
import { DomainEvent, DomainEventType, EventService } from './eventService';
import { StorageManager } from './storageService';
import { PickupRequest, RecoveryItem } from '../types';
import { normalizeToPickup } from '../utils/pickupNormalizer';

const APPSYNC_REALTIME_ENDPOINT = (import.meta as any).env?.VITE_APPSYNC_REALTIME_ENDPOINT || '';
const APPSYNC_ENDPOINT = (import.meta as any).env?.VITE_APPSYNC_ENDPOINT || '';
const APPSYNC_API_KEY = (import.meta as any).env?.VITE_APPSYNC_API_KEY || '';

function getAuthProtocol(apiKey: string, httpEndpoint: string): string {
  try {
    const host = httpEndpoint ? new URL(httpEndpoint).host : '';
    if (!host || !apiKey) return '';
    const auth = {
      'x-api-key': apiKey,
      host,
    };
    const str = btoa(JSON.stringify(auth))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `header-${str}`;
  } catch (e) {
    console.error('[AppSync Realtime] Failed to generate auth subprotocol header', e);
    return '';
  }
}

class AppSyncEventServiceImpl implements IEventService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private listeners: Set<(event: DomainEvent<any>) => void> = new Set();
  private reconnectInterval: any = null;

  constructor() {
    if (APPSYNC_REALTIME_ENDPOINT) {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    try {
      const authProtocol = getAuthProtocol(APPSYNC_API_KEY, APPSYNC_ENDPOINT);
      const subprotocols = authProtocol
        ? ['aws-appsync-event-ws', authProtocol]
        : ['aws-appsync-event-ws'];

      this.socket = new WebSocket(APPSYNC_REALTIME_ENDPOINT, subprotocols);

      this.socket.onopen = () => {
        console.log('[AppSync Realtime] Connected to AWS AppSync Events WebSocket');
        this.isConnected = true;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }

        // Subscribe to default channel namespace
        const subMsg = {
          type: 'subscribe',
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          channel: 'default/*',
          authorization: {
            'x-api-key': APPSYNC_API_KEY,
          },
        };
        this.socket?.send(JSON.stringify(subMsg));
      };

      this.socket.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);

          // Handle subscription confirmation
          if (data.type === 'subscribe_success') {
            console.log('[AppSync Realtime] Successfully subscribed to channel:', data.channel || 'default/*');
            return;
          }

          // Handle periodic keep-alive
          if (data.type === 'ka') {
            return;
          }

          // Handle incoming domain broadcast data
          if (data.type === 'data' && data.event) {
            const parsed = typeof data.event === 'string' ? JSON.parse(data.event) : data.event;
            const domainEvent: DomainEvent<any> = {
              id: parsed.id || `evt-${Date.now()}`,
              type: parsed.type || 'PICKUP_CREATED',
              timestamp: parsed.timestamp || new Date().toISOString(),
              payload: parsed.payload !== undefined ? parsed.payload : parsed,
            };

            // Sync with reactive storage so in-memory state matches cloud state
            this.syncToStorage(domainEvent);

            // Notify local bus & direct subscribers
            EventService.publish(domainEvent.type, domainEvent.payload);
            this.listeners.forEach((listener) => {
              try {
                listener(domainEvent);
              } catch (e) {
                console.error('[AppSync Realtime] Error in event listener', e);
              }
            });
          }
        } catch (e) {
          console.error('[AppSync Realtime] Failed to parse message', e);
        }
      };

      this.socket.onclose = (evt) => {
        console.warn(`[AppSync Realtime] WebSocket closed (code: ${evt.code}). Scheduling auto-reconnect...`);
        this.isConnected = false;
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(() => this.connectWebSocket(), 4000);
        }
      };

      this.socket.onerror = (err) => {
        console.error('[AppSync Realtime Error]', err);
      };
    } catch (e) {
      console.error('[AppSync Realtime Connection Failure]', e);
    }
  }

  private syncToStorage(event: DomainEvent<any>) {
    try {
      const payload = event.payload;
      if (!payload) return;

      // Handle recovery items
      const recItem: RecoveryItem | null =
        payload.recovery || (payload.batchNumber && payload.composition ? payload : null);
      if (recItem && recItem.id) {
        const currentRecItems = StorageManager.getRecoveryItems();
        const recIndex = currentRecItems.findIndex((r) => r.id === recItem.id);
        let updatedRecList: RecoveryItem[];
        if (recIndex >= 0) {
          updatedRecList = [...currentRecItems];
          updatedRecList[recIndex] = { ...updatedRecList[recIndex], ...recItem, updatedAt: new Date().toISOString() };
        } else {
          updatedRecList = [recItem, ...currentRecItems];
        }
        StorageManager.saveRecoveryItems(updatedRecList);

        // Also update linked pickup recoveryStatus if available
        if (recItem.pickupId) {
          const currentPickups = StorageManager.getPickups();
          const pIdx = currentPickups.findIndex((p) => p.id === recItem.pickupId);
          if (pIdx >= 0) {
            currentPickups[pIdx] = {
              ...currentPickups[pIdx],
              recoveryId: recItem.id,
              recoveryStatus: recItem.status,
              recyclerId: recItem.recyclerId || currentPickups[pIdx].recyclerId,
              recyclerName: recItem.recyclerName || currentPickups[pIdx].recyclerName,
            };
            StorageManager.savePickups(currentPickups);
          }
        }
      }

      // Handle pickups
      const rawPickup =
        payload.pickup || (payload.id && (payload.status || payload.requestNumber || payload.customerId) ? payload : null);

      if (!rawPickup || !rawPickup.id) return;

      const pickup = normalizeToPickup(rawPickup);
      const currentPickups = StorageManager.getPickups();
      const existingIndex = currentPickups.findIndex(
        (p) => p.id === pickup.id || p.requestNumber === pickup.requestNumber
      );

      let updatedList: PickupRequest[];
      if (existingIndex >= 0) {
        updatedList = [...currentPickups];
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          ...pickup,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedList = [pickup, ...currentPickups];
      }

      StorageManager.savePickups(updatedList);
    } catch (e) {
      console.error('[AppSync Realtime] Storage sync error:', e);
    }
  }

  subscribe<T = any>(eventType: DomainEventType | '*', listener: (event: DomainEvent<T>) => void): () => void {
    const unsubBus = EventService.subscribe(eventType, listener);
    this.listeners.add(listener);

    return () => {
      unsubBus();
      this.listeners.delete(listener);
    };
  }

  publish<T = any>(type: DomainEventType, payload: T): DomainEvent<T> {
    const event = EventService.publish(type, payload);

    // Publish to AWS AppSync Events HTTP endpoint for cloud-wide distribution
    if (APPSYNC_ENDPOINT && APPSYNC_API_KEY) {
      const eventPayload = {
        id: event.id,
        type,
        timestamp: event.timestamp,
        payload,
      };

      fetch(APPSYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          channel: 'default/recyvia',
          events: [JSON.stringify(eventPayload)],
        }),
      })
        .then((res) => {
          if (!res.ok) {
            console.warn(`[AppSync Realtime Publish Error] HTTP ${res.status}`);
          }
        })
        .catch((err) => {
          console.warn('[AppSync Realtime Publish Network Error]', err);
        });
    }

    return event;
  }

  getHistory(): DomainEvent[] {
    return EventService.getHistory();
  }
}

export const AppSyncEventService = new AppSyncEventServiceImpl();
