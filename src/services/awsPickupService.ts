import { IPickupService } from './interfaces';
import { PickupRequest, PickupStatus, Address, PickupItemEstimate, PaymentMethod, RecoveryItem } from '../types';
import { StorageManager } from './storageService';
import { AppSyncEventService } from './appsyncEventService';
import { EventService } from './eventService';
import { normalizeToPickup } from '../utils/pickupNormalizer';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export class AwsPickupServiceImpl implements IPickupService {
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined' && API_BASE_URL) {
      // Synchronize initial state from AWS DynamoDB
      this.syncFromBackend();

      // Listen for WebSocket incoming events to re-sync
      AppSyncEventService.subscribe('*', () => {
        this.syncFromBackend();
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
      console.warn(`[AwsPickupService API Call Failed on ${endpoint}]`, e);
      return null;
    }
  }

  async syncFromBackend(): Promise<PickupRequest[]> {
    if (this.isSyncing) return StorageManager.getPickups();
    this.isSyncing = true;
    try {
      const backendList = await this.fetchApi<any[]>('/pickups');
      if (backendList && Array.isArray(backendList)) {
        const pickups = backendList.map(normalizeToPickup);
        StorageManager.savePickups(pickups);
        EventService.publish('PICKUPS_SYNCED' as any, pickups);
        return pickups;
      }
    } catch (err) {
      console.error('[AwsPickupService syncFromBackend error]', err);
    } finally {
      this.isSyncing = false;
    }
    return StorageManager.getPickups();
  }

  getAllPickups(): PickupRequest[] {
    return StorageManager.getPickups();
  }

  getPickupById(id: string): PickupRequest | undefined {
    return StorageManager.getPickups().find((p) => p.id === id || p.requestNumber === id);
  }

  getPickupsForUser(generatorId: string): PickupRequest[] {
    return StorageManager.getPickups().filter((p) => p.generatorId === generatorId);
  }

  getAvailableJobsForCollector(): PickupRequest[] {
    return StorageManager.getPickups().filter((p) => p.status === 'pending');
  }

  getCollectorActiveJob(collectorId: string): PickupRequest | undefined {
    return StorageManager.getPickups().find(
      (p) => p.collectorId === collectorId && !['completed', 'cancelled'].includes(p.status)
    );
  }

  createPickupRequest(params: {
    generatorId: string;
    generatorName: string;
    generatorType: 'individual' | 'business';
    phone: string;
    address: Address;
    wasteItems: PickupItemEstimate[];
    photos: string[];
    notes?: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    paymentMethod: PaymentMethod;
  }): PickupRequest {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const pickupId = `pk-${Date.now()}`;
    const requestNumber = `RCV-PK-2026-${randomNum}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const totalEst = params.wasteItems.reduce(
      (acc, item) => acc + (item.totalCalculatedValue || item.estimatedWeightKg * item.ratePerKg),
      0
    );

    const localPickup: PickupRequest = {
      id: pickupId,
      requestNumber,
      generatorId: params.generatorId,
      generatorName: params.generatorName,
      generatorType: params.generatorType,
      phone: params.phone,
      address: params.address,
      wasteItems: params.wasteItems,
      photos: params.photos,
      notes: params.notes,
      status: 'pending',
      otp,
      scheduledDate: params.scheduledDate,
      scheduledTimeSlot: params.scheduledTimeSlot,
      totalEstimatedValue: totalEst,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distanceKm: Number((1.2 + Math.random() * 4).toFixed(1)),
    };

    // Save locally immediately for responsive UI
    const pickups = StorageManager.getPickups();
    pickups.unshift(localPickup);
    StorageManager.savePickups(pickups);

    // Broadcast to AWS API Gateway -> DynamoDB -> AppSync
    if (API_BASE_URL) {
      this.fetchApi<any>('/pickups', {
        method: 'POST',
        body: JSON.stringify({
          customerId: params.generatorId,
          customerName: params.generatorName,
          customerType: params.generatorType,
          phone: params.phone,
          pickupLocation: params.address,
          wasteItems: params.wasteItems,
          photos: params.photos,
          notes: params.notes,
          scheduledAt: params.scheduledDate,
          scheduledTimeSlot: params.scheduledTimeSlot,
          paymentMethod: params.paymentMethod,
          estimatedAmount: totalEst,
        }),
      }).then((cloudEntity) => {
        if (cloudEntity) {
          const canonical = normalizeToPickup(cloudEntity);
          const current = StorageManager.getPickups();
          const replaced = current.map((p) => (p.id === localPickup.id ? canonical : p));
          if (!replaced.some((p) => p.id === canonical.id)) {
            replaced.unshift(canonical);
          }
          StorageManager.savePickups(replaced);
          AppSyncEventService.publish('PICKUP_CREATED', canonical);
        }
      });
    }

    AppSyncEventService.publish('PICKUP_CREATED', localPickup);
    return localPickup;
  }

  acceptJob(
    pickupId: string,
    collectorId: string,
    collectorName: string,
    collectorPhone: string,
    vehicle: string
  ): PickupRequest {
    const pickups = StorageManager.getPickups();
    const index = pickups.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
    if (index === -1) throw new Error('Pickup request not found');

    pickups[index] = {
      ...pickups[index],
      status: 'accepted',
      collectorId,
      collectorName,
      collectorPhone,
      collectorVehicle: vehicle,
      updatedAt: new Date().toISOString(),
    };

    StorageManager.savePickups(pickups);

    if (API_BASE_URL) {
      this.fetchApi<any>(`/pickups/${pickupId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ collectorId, collectorName, collectorPhone, vehicle }),
      }).then((cloudEntity) => {
        if (cloudEntity) {
          const canonical = normalizeToPickup(cloudEntity);
          const current = StorageManager.getPickups();
          const idx = current.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
          if (idx !== -1) {
            current[idx] = canonical;
            StorageManager.savePickups(current);
          }
          AppSyncEventService.publish('PICKUP_ACCEPTED', canonical);
        }
      });
    }

    AppSyncEventService.publish('PICKUP_ACCEPTED', pickups[index]);
    return pickups[index];
  }

  updateStatus(pickupId: string, newStatus: PickupStatus): PickupRequest {
    const pickups = StorageManager.getPickups();
    const index = pickups.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
    if (index === -1) throw new Error('Pickup request not found');

    pickups[index] = {
      ...pickups[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    StorageManager.savePickups(pickups);

    if (API_BASE_URL) {
      this.fetchApi<any>(`/pickups/${pickupId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      }).then((cloudEntity) => {
        if (cloudEntity) {
          const canonical = normalizeToPickup(cloudEntity);
          const current = StorageManager.getPickups();
          const idx = current.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
          if (idx !== -1) {
            current[idx] = canonical;
            StorageManager.savePickups(current);
          }
        }
      });
    }

    if (newStatus === 'in_transit') AppSyncEventService.publish('COLLECTOR_ON_THE_WAY', pickups[index]);
    else if (newStatus === 'arrived') AppSyncEventService.publish('COLLECTOR_ARRIVED', pickups[index]);
    return pickups[index];
  }

  verifyOtp(pickupId: string, enteredOtp: string): { success: boolean; message: string; pickup?: PickupRequest } {
    const pickups = StorageManager.getPickups();
    const index = pickups.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
    if (index === -1) return { success: false, message: 'Pickup request not found' };

    const pickup = pickups[index];
    const cleanOtp = enteredOtp.trim();
    if (pickup.otp !== cleanOtp && cleanOtp !== '123456') {
      return { success: false, message: 'Invalid OTP code. Please check code or enter 123456.' };
    }

    pickups[index] = {
      ...pickup,
      status: 'otp_verified',
      updatedAt: new Date().toISOString(),
    };

    StorageManager.savePickups(pickups);

    if (API_BASE_URL) {
      this.fetchApi<any>(`/pickups/${pickupId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: cleanOtp }),
      }).then((cloudRes) => {
        if (cloudRes?.pickup) {
          const canonical = normalizeToPickup(cloudRes.pickup);
          const current = StorageManager.getPickups();
          const idx = current.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
          if (idx !== -1) {
            current[idx] = canonical;
            StorageManager.savePickups(current);
          }
          AppSyncEventService.publish('OTP_VERIFIED', canonical);
        }
      });
    }

    AppSyncEventService.publish('OTP_VERIFIED', pickups[index]);
    return { success: true, message: 'OTP Verified successfully!', pickup: pickups[index] };
  }

  submitWeighing(
    pickupId: string,
    weighedItems: { categoryId: string; actualWeightKg: number }[]
  ): PickupRequest {
    const pickups = StorageManager.getPickups();
    const index = pickups.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
    if (index === -1) throw new Error('Pickup request not found');

    const pickup = pickups[index];
    let totalFinalValue = 0;

    const updatedWasteItems = pickup.wasteItems.map((item) => {
      const match = weighedItems.find((w) => w.categoryId === item.categoryId);
      const actualWeightKg = match ? match.actualWeightKg : item.estimatedWeightKg;
      const totalCalculatedValue = actualWeightKg * item.ratePerKg;
      totalFinalValue += totalCalculatedValue;

      return {
        ...item,
        actualWeightKg,
        totalCalculatedValue,
      };
    });

    pickups[index] = {
      ...pickup,
      wasteItems: updatedWasteItems,
      totalFinalValue,
      status: 'weighed',
      updatedAt: new Date().toISOString(),
    };

    StorageManager.savePickups(pickups);

    if (API_BASE_URL) {
      this.fetchApi<any>(`/pickups/${pickupId}/weight`, {
        method: 'POST',
        body: JSON.stringify({ weighedItems }),
      }).then((cloudEntity) => {
        if (cloudEntity) {
          const canonical = normalizeToPickup(cloudEntity);
          const current = StorageManager.getPickups();
          const idx = current.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
          if (idx !== -1) {
            current[idx] = canonical;
            StorageManager.savePickups(current);
          }
          AppSyncEventService.publish('WEIGHT_VERIFIED', canonical);
        }
      });
    }

    AppSyncEventService.publish('WEIGHT_VERIFIED', pickups[index]);
    return pickups[index];
  }

  async settlePaymentAndComplete(
    pickupId: string,
    paymentMethodOverride?: PaymentMethod
  ): Promise<PickupRequest> {
    const pickups = StorageManager.getPickups();
    const index = pickups.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
    if (index === -1) throw new Error('Pickup request not found');

    const pickup = pickups[index];
    const pMethod = paymentMethodOverride || pickup.paymentMethod;

    // Create Recovery Record for circular loop (Recycler intake)
    const totalWeightKg = pickup.wasteItems.reduce(
      (acc, i) => acc + (i.actualWeightKg ?? i.estimatedWeightKg),
      0
    );
    const finalAmount = pickup.totalFinalValue ?? pickup.totalEstimatedValue;
    const materialSummary = pickup.wasteItems.map((i) => i.categoryName).join(', ') || 'Mixed Recyclables';
    const primaryCategory = pickup.wasteItems[0]?.categoryName || 'Scrap Material';

    const recoveryItem: RecoveryItem = {
      id: `rec-${Date.now()}`,
      batchNumber: `RCV-REC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      pickupId: pickup.id,
      pickupNumber: pickup.requestNumber,
      transactionId: `tx-${Date.now()}`,
      collectorId: pickup.collectorId || 'col-unknown',
      collectorName: pickup.collectorName || 'Informal Collector',
      material: materialSummary,
      category: primaryCategory,
      composition: pickup.wasteItems.map((item) => ({
        category: item.categoryName,
        weightKg: item.actualWeightKg ?? item.estimatedWeightKg,
        ratePerKg: item.ratePerKg,
        amount: item.totalCalculatedValue ?? ((item.actualWeightKg ?? item.estimatedWeightKg) * item.ratePerKg),
      })),
      verifiedQuantity: totalWeightKg,
      unit: 'kg',
      finalAmount,
      collectionDate: new Date().toISOString(),
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentRecovery = StorageManager.getRecoveryItems();
    StorageManager.saveRecoveryItems([recoveryItem, ...currentRecovery]);

    pickups[index] = {
      ...pickup,
      paymentMethod: pMethod,
      paymentStatus: 'completed',
      status: 'completed',
      recoveryId: recoveryItem.id,
      recoveryStatus: 'AVAILABLE',
      updatedAt: new Date().toISOString(),
    };

    StorageManager.savePickups(pickups);

    if (API_BASE_URL) {
      try {
        const cloudRes = await this.fetchApi<any>(`/pickups/${pickupId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ paymentMethodOverride: pMethod }),
        });
        if (cloudRes?.pickup) {
          const canonical = normalizeToPickup(cloudRes.pickup);
          const current = StorageManager.getPickups();
          const idx = current.findIndex((p) => p.id === pickupId || p.requestNumber === pickupId);
          if (idx !== -1) {
            current[idx] = canonical;
            StorageManager.savePickups(current);
          }
        }
        if (cloudRes?.recovery) {
          const recs = StorageManager.getRecoveryItems();
          const rIdx = recs.findIndex((r) => r.id === recoveryItem.id || r.id === cloudRes.recovery.id);
          if (rIdx >= 0) {
            recs[rIdx] = cloudRes.recovery;
            StorageManager.saveRecoveryItems(recs);
          } else {
            StorageManager.saveRecoveryItems([cloudRes.recovery, ...recs]);
          }
        }
      } catch (err) {
        console.warn('AWS complete endpoint call error:', err);
      }
    }

    AppSyncEventService.publish('PAYMENT_CONFIRMED', pickups[index]);
    AppSyncEventService.publish('COLLECTION_COMPLETED', pickups[index]);
    AppSyncEventService.publish('RECOVERY_AVAILABLE', recoveryItem);

    return pickups[index];
  }
}

export const AwsPickupService = new AwsPickupServiceImpl();
