export type DomainEventType =
  | 'PICKUP_CREATED'
  | 'PICKUP_ACCEPTED'
  | 'COLLECTOR_ON_THE_WAY'
  | 'COLLECTOR_ARRIVED'
  | 'OTP_VERIFIED'
  | 'COLLECTION_STARTED'
  | 'WEIGHT_VERIFIED'
  | 'PAYMENT_CONFIRMED'
  | 'COLLECTION_COMPLETED'
  | 'RECOVERY_AVAILABLE'
  | 'RECYCLER_RECEIVED'
  | 'RECYCLER_ACCEPTED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'RECOVERY_COMPLETED';

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  timestamp: string;
  payload: T;
}

type EventListener<T = any> = (event: DomainEvent<T>) => void;

class CentralEventBus {
  private listeners: Map<DomainEventType | '*', Set<EventListener>> = new Map();
  private history: DomainEvent[] = [];

  constructor() {
    this.listeners.set('*', new Set());
  }

  public subscribe<T = any>(eventType: DomainEventType | '*', listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const set = this.listeners.get(eventType)!;
    set.add(listener);

    return () => {
      set.delete(listener);
    };
  }

  public publish<T = any>(type: DomainEventType, payload: T): DomainEvent<T> {
    const event: DomainEvent<T> = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.history.unshift(event);
    if (this.history.length > 50) this.history.pop();

    // Notify specific listeners
    const specific = this.listeners.get(type);
    if (specific) {
      specific.forEach((listener) => listener(event));
    }

    // Notify wildcard listeners
    const wildcard = this.listeners.get('*');
    if (wildcard) {
      wildcard.forEach((listener) => listener(event));
    }

    return event;
  }

  public getHistory(): DomainEvent[] {
    return [...this.history];
  }
}

export const EventService = new CentralEventBus();
