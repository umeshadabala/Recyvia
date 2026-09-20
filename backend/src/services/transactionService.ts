import { DynamoRepository } from '../repositories/dynamoRepository';
import { TransactionEntity, PickupRequestEntity } from '../types/index';

export const BackendTransactionService = {
  createTransactionForPickup: async (pickup: PickupRequestEntity): Promise<TransactionEntity> => {
    const txId = `tx-${Date.now()}`;
    const txNumber = `RCV-TX-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const totalWeightKg = pickup.verifiedQuantityKg || pickup.wasteItems.reduce((acc, i) => acc + i.estimatedWeightKg, 0);
    const totalAmount = pickup.finalAmount || pickup.estimatedAmount;

    const newTx: TransactionEntity = {
      id: txId,
      transactionNumber: txNumber,
      pickupId: pickup.id,
      customerId: pickup.customerId,
      collectorId: pickup.collectorId || 'collector-01',
      recyclerId: pickup.recyclerId,
      totalAmount,
      totalWeightKg,
      paymentMethod: pickup.paymentMethod,
      paymentStatus: 'completed',
      createdAt: now,
      completedAt: now,
    };

    await DynamoRepository.putItem({
      pk: `TRANSACTION#${txId}`,
      sk: 'META',
      ...newTx,
    });

    return newTx;
  },

  getAllTransactions: async (): Promise<TransactionEntity[]> => {
    const items = await DynamoRepository.scanByEntityPrefix('TRANSACTION#');
    return items
      .filter((i: any) => i.sk === 'META')
      .map(({ pk, sk, ...data }: any) => data as TransactionEntity);
  },
};
