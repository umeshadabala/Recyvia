import { DynamoRepository } from '../repositories/dynamoRepository';
import { RecoveryRecordEntity, PickupRequestEntity, RecoveryStatus } from '../types/index';
import { AppSyncPublisher } from './appsyncPublisher';

export const BackendRecoveryService = {
  createRecoveryFromPickup: async (pickup: PickupRequestEntity, transactionId: string): Promise<RecoveryRecordEntity> => {
    const recId = `rec-${Date.now()}`;
    const batchNumber = `RCV-REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const verifiedQuantity = pickup.verifiedQuantityKg || pickup.wasteItems.reduce((acc, i) => acc + i.estimatedWeightKg, 0);
    const finalAmount = pickup.finalAmount || pickup.estimatedAmount || 0;
    const materialSummary = pickup.wasteItems.map(i => i.categoryName).join(', ') || 'Mixed Recyclables';
    const primaryCategory = pickup.wasteItems[0]?.categoryName || 'Recyclables';

    const composition = pickup.wasteItems.map(item => ({
      category: item.categoryName,
      weightKg: item.verifiedWeightKg ?? item.estimatedWeightKg,
      ratePerKg: item.ratePerKg,
      amount: item.totalAmount ?? ((item.verifiedWeightKg ?? item.estimatedWeightKg) * item.ratePerKg),
    }));

    const recoveryRecord: RecoveryRecordEntity = {
      id: recId,
      batchNumber,
      pickupId: pickup.id,
      pickupNumber: pickup.requestNumber,
      transactionId,
      collectorId: pickup.collectorId || 'collector-01',
      collectorName: pickup.collectorName || 'Informal Collector',
      material: materialSummary,
      category: primaryCategory,
      composition,
      verifiedQuantity,
      unit: 'kg',
      finalAmount,
      collectionDate: now,
      status: 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
    };

    await DynamoRepository.putItem({
      pk: `RECOVERY#${recId}`,
      sk: 'META',
      ...recoveryRecord,
    });

    // Also publish RECOVERY_AVAILABLE event
    await AppSyncPublisher.publishEvent('recyvia', {
      type: 'RECOVERY_AVAILABLE',
      pickupId: pickup.id,
      timestamp: now,
      payload: recoveryRecord,
    });

    return recoveryRecord;
  },

  getAllRecoveryRecords: async (): Promise<RecoveryRecordEntity[]> => {
    const items = await DynamoRepository.scanByEntityPrefix('RECOVERY#');
    return items
      .filter((i: any) => i.sk === 'META')
      .map(({ pk, sk, ...data }: any) => data as RecoveryRecordEntity)
      .sort((a: RecoveryRecordEntity, b: RecoveryRecordEntity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRecoveryById: async (id: string): Promise<RecoveryRecordEntity | null> => {
    const item = await DynamoRepository.getItem(`RECOVERY#${id}`, 'META');
    if (!item) return null;
    const { pk, sk, ...data } = item;
    return data as RecoveryRecordEntity;
  },

  updateStatus: async (
    id: string,
    newStatus: RecoveryStatus,
    extraFields: Partial<RecoveryRecordEntity> = {}
  ): Promise<RecoveryRecordEntity | null> => {
    const current = await BackendRecoveryService.getRecoveryById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const updated: RecoveryRecordEntity = {
      ...current,
      ...extraFields,
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === 'RECEIVED' && !updated.receivedAt) {
      updated.receivedAt = now;
    } else if (newStatus === 'PROCESSING' && !updated.processingStartedAt) {
      updated.processingStartedAt = now;
    } else if (newStatus === 'RECOVERED' && !updated.recoveredAt) {
      updated.recoveredAt = now;
      updated.certificateOfRecoveryId = `COR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await DynamoRepository.putItem({
      pk: `RECOVERY#${id}`,
      sk: 'META',
      ...updated,
    });

    // Event mapping
    const eventTypeMap: Record<RecoveryStatus, string> = {
      AVAILABLE: 'RECOVERY_AVAILABLE',
      RECEIVED: 'RECYCLER_RECEIVED',
      PROCESSING: 'PROCESSING_STARTED',
      RECOVERED: 'RECOVERY_COMPLETED',
    };

    const eventType = eventTypeMap[newStatus];
    if (eventType) {
      await AppSyncPublisher.publishEvent('recyvia', {
        type: eventType,
        pickupId: updated.pickupId,
        timestamp: now,
        payload: updated,
      });
    }

    return updated;
  },
};
