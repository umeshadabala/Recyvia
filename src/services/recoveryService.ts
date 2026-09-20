import { IRecoveryService } from './interfaces';
import { RecoveryItem, RecoveryStatus } from '../types';
import { StorageManager } from './storageService';
import { AppSyncEventService } from './appsyncEventService';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export class RecoveryServiceImpl implements IRecoveryService {
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined' && API_BASE_URL) {
      this.syncFromBackend();

      AppSyncEventService.subscribe('*', (ev) => {
        if (
          ev.type.includes('RECOVERY') ||
          ev.type.includes('RECYCLER') ||
          ev.type.includes('PROCESSING') ||
          ev.type === 'COLLECTION_COMPLETED'
        ) {
          this.syncFromBackend();
        }
      });
    }
  }

  async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.warn(`[RecoveryService API Call Failed on ${endpoint}]`, e);
      return null;
    }
  }

  async syncFromBackend(): Promise<RecoveryItem[]> {
    if (this.isSyncing) return StorageManager.getRecoveryItems();
    this.isSyncing = true;
    try {
      const backendList = await this.fetchApi<any[]>('/recovery');
      if (backendList && Array.isArray(backendList)) {
        StorageManager.saveRecoveryItems(backendList);
        return backendList;
      }
    } catch (err) {
      console.error('[RecoveryService syncFromBackend error]', err);
    } finally {
      this.isSyncing = false;
    }
    return StorageManager.getRecoveryItems();
  }

  getAllRecoveryItems(): RecoveryItem[] {
    return StorageManager.getRecoveryItems();
  }

  getAvailableItems(): RecoveryItem[] {
    return StorageManager.getRecoveryItems().filter((item) => item.status === 'AVAILABLE');
  }

  getProcessingItems(): RecoveryItem[] {
    return StorageManager.getRecoveryItems().filter(
      (item) => item.status === 'RECEIVED' || item.status === 'PROCESSING'
    );
  }

  getRecoveredItems(): RecoveryItem[] {
    return StorageManager.getRecoveryItems().filter((item) => item.status === 'RECOVERED');
  }

  getRecoveryForPickup(pickupId: string): RecoveryItem | undefined {
    return StorageManager.getRecoveryItems().find((item) => item.pickupId === pickupId);
  }

  async receiveMaterial(id: string, recyclerId: string, recyclerName: string): Promise<RecoveryItem> {
    const items = StorageManager.getRecoveryItems();
    const index = items.findIndex((item) => item.id === id || item.batchNumber === id);
    if (index === -1) throw new Error(`Recovery item #${id} not found`);

    const now = new Date().toISOString();
    const updated: RecoveryItem = {
      ...items[index],
      status: 'RECEIVED',
      recyclerId,
      recyclerName,
      receivedAt: now,
      updatedAt: now,
    };

    items[index] = updated;
    StorageManager.saveRecoveryItems(items);

    // Update corresponding pickup request
    if (updated.pickupId) {
      const pickups = StorageManager.getPickups();
      const pIdx = pickups.findIndex((p) => p.id === updated.pickupId);
      if (pIdx !== -1) {
        pickups[pIdx] = {
          ...pickups[pIdx],
          recyclerId,
          recyclerName,
          recoveryStatus: 'RECEIVED',
          updatedAt: now,
        };
        StorageManager.savePickups(pickups);
      }
    }

    if (API_BASE_URL) {
      this.fetchApi<any>(`/recovery/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ recyclerId, recyclerName }),
      });
    }

    AppSyncEventService.publish('RECYCLER_RECEIVED', updated);
    return updated;
  }

  async startProcessing(id: string): Promise<RecoveryItem> {
    const items = StorageManager.getRecoveryItems();
    const index = items.findIndex((item) => item.id === id || item.batchNumber === id);
    if (index === -1) throw new Error(`Recovery item #${id} not found`);

    const now = new Date().toISOString();
    const updated: RecoveryItem = {
      ...items[index],
      status: 'PROCESSING',
      processingStartedAt: now,
      updatedAt: now,
    };

    items[index] = updated;
    StorageManager.saveRecoveryItems(items);

    // Update corresponding pickup request
    if (updated.pickupId) {
      const pickups = StorageManager.getPickups();
      const pIdx = pickups.findIndex((p) => p.id === updated.pickupId);
      if (pIdx !== -1) {
        pickups[pIdx] = {
          ...pickups[pIdx],
          recoveryStatus: 'PROCESSING',
          updatedAt: now,
        };
        StorageManager.savePickups(pickups);
      }
    }

    if (API_BASE_URL) {
      this.fetchApi<any>(`/recovery/${id}/process`, {
        method: 'POST',
      });
    }

    AppSyncEventService.publish('PROCESSING_STARTED', updated);
    return updated;
  }

  async completeRecovery(id: string): Promise<RecoveryItem> {
    const items = StorageManager.getRecoveryItems();
    const index = items.findIndex((item) => item.id === id || item.batchNumber === id);
    if (index === -1) throw new Error(`Recovery item #${id} not found`);

    const now = new Date().toISOString();
    const certOfRecovery = `COR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated: RecoveryItem = {
      ...items[index],
      status: 'RECOVERED',
      recoveredAt: now,
      certificateOfRecoveryId: certOfRecovery,
      updatedAt: now,
    };

    items[index] = updated;
    StorageManager.saveRecoveryItems(items);

    // Update corresponding pickup request
    if (updated.pickupId) {
      const pickups = StorageManager.getPickups();
      const pIdx = pickups.findIndex((p) => p.id === updated.pickupId);
      if (pIdx !== -1) {
        pickups[pIdx] = {
          ...pickups[pIdx],
          recoveryStatus: 'RECOVERED',
          updatedAt: now,
        };
        StorageManager.savePickups(pickups);
      }
    }

    if (API_BASE_URL) {
      this.fetchApi<any>(`/recovery/${id}/recover`, {
        method: 'POST',
      });
    }

    AppSyncEventService.publish('RECOVERY_COMPLETED', updated);
    return updated;
  }
}

export const RecoveryService = new RecoveryServiceImpl();
