export type UserRole = 'INDIVIDUAL' | 'BUSINESS' | 'COLLECTOR' | 'RECYCLER';

export type PickupStatus =
  | 'REQUESTED'
  | 'MATCHING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'OTP_VERIFICATION'
  | 'COLLECTING'
  | 'WEIGHT_VERIFICATION'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'wallet';

export interface UserEntity {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  language: string;
  location?: { lat: number; lng: number; address: string };
  createdAt: string;
  updatedAt: string;
}

export interface CollectorEntity {
  id: string;
  userId: string;
  name: string;
  phone: string;
  location: { lat: number; lng: number };
  acceptedMaterials: string[];
  isAvailable: boolean;
  rating: number;
  completedCollections: number;
  createdAt: string;
  updatedAt: string;
}

export interface PickupItem {
  categoryId: string;
  categoryName: string;
  categoryKey: string;
  estimatedWeightKg: number;
  verifiedWeightKg?: number;
  ratePerKg: number;
  totalAmount?: number;
}

export interface PickupRequestEntity {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  customerType: 'individual' | 'business';
  phone: string;
  collectorId?: string;
  collectorName?: string;
  collectorPhone?: string;
  collectorVehicle?: string;
  wasteItems: PickupItem[];
  pickupLocation: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  scheduledAt: string;
  scheduledTimeSlot: string;
  status: PickupStatus;
  estimatedAmount: number;
  verifiedQuantityKg?: number;
  finalAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  otp: string;
  otpVerified: boolean;
  certificateId?: string;
  recyclerId?: string;
  recyclerName?: string;
  recoveryId?: string;
  recoveryStatus?: RecoveryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntity {
  id: string;
  transactionNumber: string;
  pickupId: string;
  customerId: string;
  collectorId: string;
  recyclerId?: string;
  totalAmount: number;
  totalWeightKg: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'completed';
  createdAt: string;
  completedAt: string;
}

export interface CertificateEntity {
  id: string;
  certificateNumber: string;
  transactionId: string;
  pickupId: string;
  sellerName: string;
  sellerType: 'individual' | 'business';
  collectorName: string;
  recyclerName: string;
  itemsSummary: { categoryName: string; weightKg: number; ratePerKg: number; amount: number }[];
  totalWeightKg: number;
  totalAmountPaid: number;
  co2OffsetKg: number;
  treesSavedEquivalent: number;
  landfillDivertedKg: number;
  verificationHash: string;
  issuedAt: string;
}

export type RecoveryStatus = 'AVAILABLE' | 'RECEIVED' | 'PROCESSING' | 'RECOVERED';

export interface RecoveryRecordEntity {
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

export interface RecyclerBatchEntity {
  id: string;
  batchNumber: string;
  status: 'AVAILABLE' | 'RECEIVED' | 'PROCESSING' | 'RECOVERED';
  totalWeightKg: number;
  collectorName: string;
  facilityName: string;
  intakeDate: string;
  createdAt: string;
}

export interface RealtimeDomainEvent {
  type: string;
  pickupId: string;
  timestamp: string;
  payload: any;
}
