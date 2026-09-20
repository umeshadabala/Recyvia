import { PickupRequest, PickupStatus, PaymentStatus } from '../types';

export function normalizeToPickup(item: any): PickupRequest {
  if (!item) throw new Error('Cannot normalize empty pickup');

  // Map both backend and frontend status values to canonical frontend PickupStatus
  const STATUS_MAP: Record<string, PickupStatus> = {
    requested: 'pending',
    matching: 'pending',
    pending: 'pending',
    accepted: 'accepted',
    on_the_way: 'in_transit',
    in_transit: 'in_transit',
    arrived: 'arrived',
    otp_verification: 'arrived',
    collecting: 'otp_verified',
    otp_verified: 'otp_verified',
    weight_verification: 'weighed',
    weighed: 'weighed',
    payment_pending: 'paid',
    paid: 'paid',
    completed: 'completed',
    cancelled: 'cancelled',
  };

  const rawStatus = String(item.status || 'pending').toLowerCase();
  const status: PickupStatus = STATUS_MAP[rawStatus] || 'pending';

  // Normalize wasteItems
  const wasteItems = (item.wasteItems || []).map((w: any) => {
    const estWeight = Number(w.estimatedWeightKg || 0);
    const actWeight = w.actualWeightKg !== undefined 
      ? Number(w.actualWeightKg) 
      : (w.verifiedWeightKg !== undefined ? Number(w.verifiedWeightKg) : undefined);
    const rate = Number(w.ratePerKg || 0);
    const calcVal = w.totalCalculatedValue !== undefined 
      ? Number(w.totalCalculatedValue) 
      : (w.totalAmount !== undefined ? Number(w.totalAmount) : (rate * (actWeight !== undefined ? actWeight : estWeight)));

    return {
      categoryId: w.categoryId || w.id || 'item-default',
      categoryName: w.categoryName || w.name || 'Recyclable Waste',
      categoryKey: w.categoryKey || 'other',
      estimatedWeightKg: estWeight,
      actualWeightKg: actWeight,
      ratePerKg: rate,
      totalCalculatedValue: calcVal,
    };
  });

  const totalEst = item.totalEstimatedValue !== undefined
    ? Number(item.totalEstimatedValue)
    : (item.estimatedAmount !== undefined 
        ? Number(item.estimatedAmount) 
        : wasteItems.reduce((sum: number, w: any) => sum + (w.totalCalculatedValue || 0), 0));

  const totalFinal = item.totalFinalValue !== undefined
    ? Number(item.totalFinalValue)
    : (item.finalAmount !== undefined ? Number(item.finalAmount) : undefined);

  return {
    id: String(item.id || `pk-${Date.now()}`),
    requestNumber: String(item.requestNumber || `RCV-PK-${String(item.id || '').slice(-6) || '2026-0001'}`),
    generatorId: String(item.generatorId || item.customerId || ''),
    generatorName: String(item.generatorName || item.customerName || 'Customer'),
    generatorType: (item.generatorType || item.customerType || 'individual') as 'individual' | 'business',
    phone: String(item.phone || ''),
    address: item.address || item.pickupLocation || {
      street: 'Pickup Location',
      area: 'Area',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
    wasteItems,
    photos: Array.isArray(item.photos) ? item.photos : [],
    notes: item.notes || '',
    status,
    otp: String(item.otp || ''),
    collectorId: item.collectorId ? String(item.collectorId) : undefined,
    collectorName: item.collectorName ? String(item.collectorName) : undefined,
    collectorPhone: item.collectorPhone ? String(item.collectorPhone) : undefined,
    collectorVehicle: item.collectorVehicle || item.vehicle || undefined,
    collectorRating: item.collectorRating !== undefined ? Number(item.collectorRating) : undefined,
    scheduledDate: item.scheduledDate || item.scheduledAt || new Date().toISOString().split('T')[0],
    scheduledTimeSlot: item.scheduledTimeSlot || '10:00 AM - 01:00 PM',
    totalEstimatedValue: totalEst,
    totalFinalValue: totalFinal,
    paymentMethod: item.paymentMethod || 'upi',
    paymentStatus: (item.paymentStatus || 'pending') as PaymentStatus,
    certificateId: item.certificateId ? String(item.certificateId) : undefined,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    distanceKm: item.distanceKm !== undefined ? Number(item.distanceKm) : 2.1,
  };
}
