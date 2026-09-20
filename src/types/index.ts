export type UserRole = 'individual' | 'business' | 'collector' | 'recycler';

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'mr' | 'bn';

export type Theme = 'light' | 'dark' | 'system';

export type WasteCategory =
  | 'e_waste'
  | 'metals'
  | 'paper'
  | 'cardboard'
  | 'plastics'
  | 'glass'
  | 'batteries'
  | 'appliances'
  | 'cables'
  | 'motors'
  | 'other';

export interface WasteRateItem {
  id: string;
  name: string;
  nativeName?: Record<string, string>;
  category: WasteCategory;
  ratePerKg: number;
  unit: string; // 'kg' | 'piece' | 'set'
  icon: string;
  description: string;
  marketTrend: 'up' | 'down' | 'stable';
  co2OffsetFactor: number; // kg CO2 saved per kg of waste recycled
  popular?: boolean;
}

export type PickupStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'arrived'
  | 'otp_verified'
  | 'weighed'
  | 'paid'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'wallet';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PickupItemEstimate {
  categoryId: string;
  categoryName: string;
  categoryKey: WasteCategory;
  estimatedWeightKg: number;
  actualWeightKg?: number;
  ratePerKg: number;
  totalCalculatedValue?: number;
}

export interface Address {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface PickupRequest {
  id: string;
  requestNumber: string;
  generatorId: string;
  generatorName: string;
  generatorType: 'individual' | 'business';
  phone: string;
  address: Address;
  wasteItems: PickupItemEstimate[];
  photos: string[];
  notes?: string;
  status: PickupStatus;
  otp: string;
  collectorId?: string;
  collectorName?: string;
  collectorPhone?: string;
  collectorVehicle?: string;
  collectorRating?: number;
  scheduledDate: string;
  scheduledTimeSlot: string;
  totalEstimatedValue: number;
  totalFinalValue?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  certificateId?: string;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
  recyclerId?: string;
  recyclerName?: string;
  recoveryStatus?: RecoveryStatus;
  recoveryId?: string;
}

export interface WasteSaleCertificate {
  id: string;
  certificateNumber: string;
  pickupRequestId: string;
  generatorName: string;
  generatorType: 'individual' | 'business';
  generatorAddress: string;
  collectorName: string;
  recyclerName?: string;
  itemsSummary: {
    categoryName: string;
    weightKg: number;
    ratePerKg: number;
    amount: number;
  }[];
  totalWeightKg: number;
  totalValuePaid: number;
  co2OffsetKg: number;
  treesSavedEquivalent: number;
  landfillDivertedKg: number;
  qrCodeDataUrl?: string;
  issueDate: string;
  verificationHash: string;
}

export interface CollectorProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  rating: number;
  completedPickups: number;
  totalEarnings: number;
  currentLocation: { lat: number; lng: number };
}

export type RecoveryStatus = 'AVAILABLE' | 'RECEIVED' | 'PROCESSING' | 'RECOVERED';

export interface RecoveryItem {
  id: string;
  batchNumber: string;
  pickupId: string;
  pickupNumber: string;
  transactionId: string;
  collectorId: string;
  collectorName: string;
  material: string;
  category: string;
  composition: { category: string; weightKg: number; ratePerKg?: number; amount?: number }[];
  verifiedQuantity: number;
  unit: string;
  finalAmount: number;
  collectionDate: string;
  status: RecoveryStatus;
  recyclerId?: string;
  recyclerName?: string;
  receivedAt?: string;
  processingStartedAt?: string;
  recoveredAt?: string;
  certificateOfRecoveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecyclerBatch {
  id: string;
  batchNumber: string;
  status: 'incoming' | 'received' | 'sorting' | 'processing' | 'recovered' | RecoveryStatus;
  totalWeightKg: number;
  composition: { category: string; weightKg: number }[];
  collectorName: string;
  facilityName: string;
  intakeDate: string;
  certificateOfRecoveryId?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface ImpactMetrics {
  totalRecycledKg: number;
  totalCO2SavedKg: number;
  totalTreesSaved: number;
  totalPayoutsINR: number;
  activeCollectors: number;
  landfillDivertedKg: number;
}
