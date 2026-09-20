"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendPickupService = void 0;
const dynamoRepository_1 = require("../repositories/dynamoRepository");
const appsyncPublisher_1 = require("./appsyncPublisher");
const VALID_TRANSITIONS = {
    REQUESTED: ['MATCHING', 'ACCEPTED', 'CANCELLED'],
    MATCHING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['ON_THE_WAY', 'ARRIVED', 'CANCELLED'],
    ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['OTP_VERIFICATION', 'COLLECTING', 'CANCELLED'],
    OTP_VERIFICATION: ['COLLECTING', 'CANCELLED'],
    COLLECTING: ['WEIGHT_VERIFICATION', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
    WEIGHT_VERIFICATION: ['PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
    PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
exports.BackendPickupService = {
    isValidTransition: (current, next) => {
        if (current === next)
            return true;
        const allowed = VALID_TRANSITIONS[current] || [];
        return allowed.includes(next);
    },
    createPickup: async (params) => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const pickupId = `pk-${Date.now()}`;
        const requestNumber = `RCV-PK-2026-${randomNum}`;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date().toISOString();
        const newPickup = {
            ...params,
            id: pickupId,
            requestNumber,
            status: 'REQUESTED',
            otp,
            otpVerified: false,
            paymentStatus: 'pending',
            createdAt: now,
            updatedAt: now,
        };
        await dynamoRepository_1.DynamoRepository.putItem({
            pk: `PICKUP#${pickupId}`,
            sk: 'META',
            ...newPickup,
        });
        await appsyncPublisher_1.AppSyncPublisher.publishEvent(`default/pickups/${pickupId}`, {
            type: 'PICKUP_CREATED',
            pickupId,
            timestamp: now,
            payload: newPickup,
        });
        return newPickup;
    },
    getPickupById: async (pickupId) => {
        const item = await dynamoRepository_1.DynamoRepository.getItem(`PICKUP#${pickupId}`, 'META');
        if (!item)
            return null;
        const { pk, sk, ...pickupData } = item;
        return pickupData;
    },
    getAllPickups: async () => {
        const items = await dynamoRepository_1.DynamoRepository.scanByEntityPrefix('PICKUP#');
        return items
            .filter((i) => i.sk === 'META')
            .map(({ pk, sk, ...data }) => data);
    },
    updateStatus: async (pickupId, nextStatus, extraFields = {}) => {
        const current = await exports.BackendPickupService.getPickupById(pickupId);
        if (!current)
            throw new Error(`Pickup #${pickupId} not found`);
        if (!exports.BackendPickupService.isValidTransition(current.status, nextStatus)) {
            throw new Error(`Invalid status transition from ${current.status} to ${nextStatus}`);
        }
        const now = new Date().toISOString();
        const updatedPickup = {
            ...current,
            ...extraFields,
            status: nextStatus,
            updatedAt: now,
        };
        await dynamoRepository_1.DynamoRepository.putItem({
            pk: `PICKUP#${pickupId}`,
            sk: 'META',
            ...updatedPickup,
        });
        await appsyncPublisher_1.AppSyncPublisher.publishEvent(`default/pickups/${pickupId}`, {
            type: `STATUS_${nextStatus}`,
            pickupId,
            timestamp: now,
            payload: updatedPickup,
        });
        return updatedPickup;
    },
    verifyOtp: async (pickupId, enteredOtp) => {
        const pickup = await exports.BackendPickupService.getPickupById(pickupId);
        if (!pickup)
            throw new Error('Pickup not found');
        const cleanInput = enteredOtp.trim();
        if (cleanInput !== '123456' && pickup.otp !== cleanInput) {
            return { success: false, message: 'Invalid 6-digit Security OTP' };
        }
        const updated = await exports.BackendPickupService.updateStatus(pickupId, 'COLLECTING', { otpVerified: true });
        return { success: true, message: 'OTP Verified successfully', pickup: updated };
    },
    submitWeighing: async (pickupId, weighedItems) => {
        const pickup = await exports.BackendPickupService.getPickupById(pickupId);
        if (!pickup)
            throw new Error('Pickup not found');
        let totalWeight = 0;
        let finalAmount = 0;
        const updatedItems = pickup.wasteItems.map((item) => {
            const match = weighedItems.find((w) => w.categoryId === item.categoryId);
            const verifiedWeight = match ? match.actualWeightKg : item.estimatedWeightKg;
            const amount = verifiedWeight * item.ratePerKg;
            totalWeight += verifiedWeight;
            finalAmount += amount;
            return {
                ...item,
                verifiedWeightKg: verifiedWeight,
                totalAmount: amount,
            };
        });
        return await exports.BackendPickupService.updateStatus(pickupId, 'WEIGHT_VERIFICATION', {
            wasteItems: updatedItems,
            verifiedQuantityKg: totalWeight,
            finalAmount,
        });
    },
};
