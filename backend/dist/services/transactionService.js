"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendTransactionService = void 0;
const dynamoRepository_1 = require("../repositories/dynamoRepository");
exports.BackendTransactionService = {
    createTransactionForPickup: async (pickup) => {
        const txId = `tx-${Date.now()}`;
        const txNumber = `RCV-TX-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date().toISOString();
        const totalWeightKg = pickup.verifiedQuantityKg || pickup.wasteItems.reduce((acc, i) => acc + i.estimatedWeightKg, 0);
        const totalAmount = pickup.finalAmount || pickup.estimatedAmount;
        const newTx = {
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
        await dynamoRepository_1.DynamoRepository.putItem({
            pk: `TRANSACTION#${txId}`,
            sk: 'META',
            ...newTx,
        });
        return newTx;
    },
    getAllTransactions: async () => {
        const items = await dynamoRepository_1.DynamoRepository.scanByEntityPrefix('TRANSACTION#');
        return items
            .filter((i) => i.sk === 'META')
            .map(({ pk, sk, ...data }) => data);
    },
};
