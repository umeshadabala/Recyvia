"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const pickupService_1 = require("../services/pickupService");
const transactionService_1 = require("../services/transactionService");
const certificateService_1 = require("../services/certificateService");
const authService_1 = require("../services/authService");
const recoveryService_1 = require("../services/recoveryService");
const handler = async (event) => {
    console.log('[Lambda Handler Event]:', JSON.stringify({
        rawPath: event.rawPath,
        path: event.path,
        httpMethod: event.httpMethod,
        requestContext: event.requestContext,
    }));
    const httpMethod = (event.httpMethod || event.requestContext?.http?.method || 'GET').toUpperCase();
    const rawPath = event.rawPath || event.path || event.requestContext?.http?.path || '';
    const path = rawPath.toLowerCase();
    const pathParameters = event.pathParameters || {};
    const pickupId = pathParameters.id || rawPath.split('/pickups/')[1]?.split('/')[0];
    const headers = event.headers || {};
    try {
        // Auth routes
        if (path.includes('/auth/send-otp')) {
            const body = JSON.parse(event.body || '{}');
            if (!body.phone)
                return (0, responses_1.errorResponse)('Phone number is required', 400);
            const result = await authService_1.BackendAuthService.sendOtp(body.phone);
            return (0, responses_1.successResponse)(result);
        }
        if (path.includes('/auth/verify-otp')) {
            const body = JSON.parse(event.body || '{}');
            if (!body.phone || !body.otp)
                return (0, responses_1.errorResponse)('Phone and OTP required', 400);
            const result = await authService_1.BackendAuthService.verifyOtp(body.phone, body.otp, body.name, body.role);
            if (!result.success)
                return (0, responses_1.errorResponse)(result.message, 400);
            const response = (0, responses_1.successResponse)(result);
            if (result.cookieHeader) {
                response.headers = { ...response.headers, 'Set-Cookie': result.cookieHeader };
            }
            return response;
        }
        if (path.includes('/auth/me')) {
            const cookieHeader = headers.cookie || headers.Cookie || '';
            const authHeader = headers.authorization || headers.Authorization || '';
            const cookieToken = cookieHeader.split('recyvia_session=')[1]?.split(';')[0];
            const bearerToken = authHeader.replace('Bearer ', '').trim();
            const token = cookieToken || bearerToken;
            if (!token)
                return (0, responses_1.errorResponse)('Unauthenticated', 401);
            const session = await authService_1.BackendAuthService.getSession(token);
            if (!session)
                return (0, responses_1.errorResponse)('Invalid session', 401);
            return (0, responses_1.successResponse)(session);
        }
        // GET /health (supports /health, /$default/health, /health/, etc.)
        if (path.includes('health') || path === '/' || path === '') {
            return (0, responses_1.successResponse)({
                service: 'Recyvia API',
                status: 'HEALTHY',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                receivedPath: rawPath,
                receivedMethod: httpMethod,
            });
        }
        // GET /certificates
        if (path.includes('certificates')) {
            const certificates = await certificateService_1.BackendCertificateService.getAllCertificates();
            return (0, responses_1.successResponse)(certificates);
        }
        // GET /transactions
        if (path.includes('transactions')) {
            const transactions = await transactionService_1.BackendTransactionService.getAllTransactions();
            return (0, responses_1.successResponse)(transactions);
        }
        // Recovery routes
        if (path.includes('recovery')) {
            const recoveryId = pathParameters.recoveryId || pathParameters.id || rawPath.split('/recovery/')[1]?.split('/')[0];
            if (httpMethod === 'GET') {
                if (recoveryId && !path.endsWith('/recovery')) {
                    const record = await recoveryService_1.BackendRecoveryService.getRecoveryById(recoveryId);
                    if (!record)
                        return (0, responses_1.errorResponse)('Recovery record not found', 404);
                    return (0, responses_1.successResponse)(record);
                }
                const records = await recoveryService_1.BackendRecoveryService.getAllRecoveryRecords();
                return (0, responses_1.successResponse)(records);
            }
            if (httpMethod === 'POST' && recoveryId) {
                const body = JSON.parse(event.body || '{}');
                if (path.endsWith('/receive')) {
                    const recyclerId = body.recyclerId || 'rec-partner-01';
                    const recyclerName = body.recyclerName || 'EcoRecycle Facilities Hub';
                    const updated = await recoveryService_1.BackendRecoveryService.updateStatus(recoveryId, 'RECEIVED', {
                        recyclerId,
                        recyclerName,
                    });
                    if (!updated)
                        return (0, responses_1.errorResponse)('Recovery record not found', 404);
                    if (updated.pickupId) {
                        try {
                            await pickupService_1.BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                                recyclerId,
                                recyclerName,
                                recoveryStatus: 'RECEIVED',
                            });
                        }
                        catch (e) {
                            console.warn('[Pickup link update error]', e);
                        }
                    }
                    return (0, responses_1.successResponse)(updated);
                }
                if (path.endsWith('/process')) {
                    const updated = await recoveryService_1.BackendRecoveryService.updateStatus(recoveryId, 'PROCESSING');
                    if (!updated)
                        return (0, responses_1.errorResponse)('Recovery record not found', 404);
                    if (updated.pickupId) {
                        try {
                            await pickupService_1.BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                                recoveryStatus: 'PROCESSING',
                            });
                        }
                        catch (e) {
                            console.warn('[Pickup link update error]', e);
                        }
                    }
                    return (0, responses_1.successResponse)(updated);
                }
                if (path.endsWith('/recover')) {
                    const updated = await recoveryService_1.BackendRecoveryService.updateStatus(recoveryId, 'RECOVERED');
                    if (!updated)
                        return (0, responses_1.errorResponse)('Recovery record not found', 404);
                    if (updated.pickupId) {
                        try {
                            await pickupService_1.BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                                recoveryStatus: 'RECOVERED',
                            });
                        }
                        catch (e) {
                            console.warn('[Pickup link update error]', e);
                        }
                    }
                    return (0, responses_1.successResponse)(updated);
                }
            }
        }
        // GET /pickups or GET /pickups/:id
        if (httpMethod === 'GET') {
            if (pickupId) {
                const pickup = await pickupService_1.BackendPickupService.getPickupById(pickupId);
                if (!pickup)
                    return (0, responses_1.errorResponse)('Pickup not found', 404);
                return (0, responses_1.successResponse)(pickup);
            }
            const pickups = await pickupService_1.BackendPickupService.getAllPickups();
            return (0, responses_1.successResponse)(pickups);
        }
        // POST /pickups - Create Request
        if (httpMethod === 'POST' && path.includes('pickups') && !pickupId) {
            const body = JSON.parse(event.body || '{}');
            if (!body.customerId || !body.wasteItems || body.wasteItems.length === 0) {
                return (0, responses_1.errorResponse)('Missing customerId or wasteItems', 400);
            }
            const newPickup = await pickupService_1.BackendPickupService.createPickup(body);
            return (0, responses_1.successResponse)(newPickup, 201);
        }
        // Actions on /pickups/:id
        if (pickupId) {
            const body = JSON.parse(event.body || '{}');
            if (path.endsWith('/accept')) {
                const updated = await pickupService_1.BackendPickupService.updateStatus(pickupId, 'ACCEPTED', {
                    collectorId: body.collectorId || 'col-unknown',
                    collectorName: body.collectorName || body.name || 'Collector',
                    collectorPhone: body.collectorPhone || body.phone || '',
                    collectorVehicle: body.vehicle || body.collectorVehicle || 'EV Loader',
                });
                return (0, responses_1.successResponse)(updated);
            }
            if (path.endsWith('/status')) {
                const { status, extraFields } = body;
                const STATUS_MAP = {
                    pending: 'REQUESTED',
                    matching: 'MATCHING',
                    accepted: 'ACCEPTED',
                    in_transit: 'ON_THE_WAY',
                    arrived: 'ARRIVED',
                    otp_verified: 'COLLECTING',
                    collecting: 'COLLECTING',
                    weighed: 'WEIGHT_VERIFICATION',
                    weight_verification: 'WEIGHT_VERIFICATION',
                    paid: 'PAYMENT_PENDING',
                    payment_pending: 'PAYMENT_PENDING',
                    completed: 'COMPLETED',
                    cancelled: 'CANCELLED',
                };
                const normalizedStatus = STATUS_MAP[String(status).toLowerCase()] || String(status).toUpperCase();
                const updated = await pickupService_1.BackendPickupService.updateStatus(pickupId, normalizedStatus, extraFields);
                return (0, responses_1.successResponse)(updated);
            }
            if (path.endsWith('/verify-otp')) {
                const { otp } = body;
                if (!otp)
                    return (0, responses_1.errorResponse)('OTP is required', 400);
                const result = await pickupService_1.BackendPickupService.verifyOtp(pickupId, otp);
                if (!result.success)
                    return (0, responses_1.errorResponse)(result.message, 400);
                return (0, responses_1.successResponse)(result);
            }
            if (path.endsWith('/weight')) {
                const { weighedItems } = body;
                if (!weighedItems)
                    return (0, responses_1.errorResponse)('weighedItems required', 400);
                const updated = await pickupService_1.BackendPickupService.submitWeighing(pickupId, weighedItems);
                return (0, responses_1.successResponse)(updated);
            }
            if (path.endsWith('/complete')) {
                const pickup = await pickupService_1.BackendPickupService.getPickupById(pickupId);
                if (!pickup)
                    return (0, responses_1.errorResponse)('Pickup not found', 404);
                const tx = await transactionService_1.BackendTransactionService.createTransactionForPickup(pickup);
                const cert = await certificateService_1.BackendCertificateService.createCertificateForPickup(pickup, tx.id);
                const recovery = await recoveryService_1.BackendRecoveryService.createRecoveryFromPickup(pickup, tx.id);
                const updated = await pickupService_1.BackendPickupService.updateStatus(pickupId, 'COMPLETED', {
                    certificateId: cert.id,
                    paymentStatus: 'completed',
                    recoveryId: recovery.id,
                    recoveryStatus: 'AVAILABLE',
                });
                return (0, responses_1.successResponse)({ pickup: updated, transaction: tx, certificate: cert, recovery });
            }
        }
        return (0, responses_1.errorResponse)('Route not found', 404);
    }
    catch (err) {
        console.error('[Pickups Handler Error]', err);
        return (0, responses_1.errorResponse)(err.message || 'Internal Server Error', 500);
    }
};
exports.handler = handler;
