import {
  PickupRequest,
  PickupStatus,
  PickupItemEstimate,
  Address,
  PaymentMethod,
  WasteRateItem,
  WasteCategory,
  CollectorProfile,
  RecoveryItem,
} from '../types';
import { DomainEvent, DomainEventType } from './eventService';
import { CollectorDutyConfig } from './collectorService';

export interface IPickupService {
  getAllPickups(): PickupRequest[];
  getPickupById(id: string): PickupRequest | undefined;
  getPickupsForUser(generatorId: string): PickupRequest[];
  getAvailableJobsForCollector(): PickupRequest[];
  getCollectorActiveJob(collectorId: string): PickupRequest | undefined;
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
  }): PickupRequest;
  acceptJob(
    pickupId: string,
    collectorId: string,
    collectorName: string,
    collectorPhone: string,
    vehicle: string
  ): PickupRequest;
  updateStatus(pickupId: string, newStatus: PickupStatus): PickupRequest;
  verifyOtp(pickupId: string, enteredOtp: string): { success: boolean; message: string; pickup?: PickupRequest };
  submitWeighing(
    pickupId: string,
    weighedItems: { categoryId: string; actualWeightKg: number }[]
  ): PickupRequest;
  settlePaymentAndComplete(
    pickupId: string,
    paymentMethodOverride?: PaymentMethod
  ): Promise<PickupRequest>;
}

export interface IWasteRateService {
  getAllRates(): WasteRateItem[];
  getRatesByCategory(category: WasteCategory): WasteRateItem[];
  getPopularRates(): WasteRateItem[];
  searchRates(query: string): WasteRateItem[];
  updateRate(rateId: string, newRatePerKg: number, trend: 'up' | 'down' | 'stable'): WasteRateItem;
  calculateEstimate(items: { rateId: string; weightKg: number }[]): { totalEstimatedValue: number; co2SavedKg: number };
}

export interface ICollectorService {
  getProfile(): CollectorProfile;
  getDutyConfig(): CollectorDutyConfig;
  updateDutyConfig(config: Partial<CollectorDutyConfig>): CollectorDutyConfig;
  getEarningsBreakdown(): {
    today: number;
    thisWeek: number;
    thisMonth: number;
    transactions: { id: string; date: string; pickupNumber: string; amount: number; category: string; paymentMode: string }[];
  };
}

export interface IEventService {
  subscribe<T = any>(eventType: DomainEventType | '*', listener: (event: DomainEvent<T>) => void): () => void;
  publish<T = any>(type: DomainEventType, payload: T): DomainEvent<T>;
  getHistory(): DomainEvent[];
}

export interface IRecoveryService {
  getAllRecoveryItems(): Promise<RecoveryItem[]> | RecoveryItem[];
  getAvailableItems(): RecoveryItem[];
  getProcessingItems(): RecoveryItem[];
  getRecoveredItems(): RecoveryItem[];
  getRecoveryForPickup(pickupId: string): RecoveryItem | undefined;
  receiveMaterial(id: string, recyclerId: string, recyclerName: string): Promise<RecoveryItem>;
  startProcessing(id: string): Promise<RecoveryItem>;
  completeRecovery(id: string): Promise<RecoveryItem>;
}
