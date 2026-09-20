import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/responses';
import { BackendPickupService } from '../services/pickupService';
import { BackendTransactionService } from '../services/transactionService';
import { BackendCertificateService } from '../services/certificateService';
import { BackendAuthService } from '../services/authService';
import { BackendRecoveryService } from '../services/recoveryService';

export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
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
      if (!body.phone) return errorResponse('Phone number is required', 400);
      const result = await BackendAuthService.sendOtp(body.phone);
      return successResponse(result);
    }

    if (path.includes('/auth/verify-otp')) {
      const body = JSON.parse(event.body || '{}');
      if (!body.phone || !body.otp) return errorResponse('Phone and OTP required', 400);
      const result = await BackendAuthService.verifyOtp(body.phone, body.otp, body.name, body.role);
      if (!result.success) return errorResponse(result.message, 400);

      const response = successResponse(result);
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

      if (!token) return errorResponse('Unauthenticated', 401);
      const session = await BackendAuthService.getSession(token);
      if (!session) return errorResponse('Invalid session', 401);
      return successResponse(session);
    }

    // GET /health (supports /health, /$default/health, /health/, etc.)
    if (path.includes('health') || path === '/' || path === '') {
      return successResponse({
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
      const certificates = await BackendCertificateService.getAllCertificates();
      return successResponse(certificates);
    }

    // GET /transactions
    if (path.includes('transactions')) {
      const transactions = await BackendTransactionService.getAllTransactions();
      return successResponse(transactions);
    }

    // Recovery routes
    if (path.includes('recovery')) {
      const recoveryId = pathParameters.recoveryId || pathParameters.id || rawPath.split('/recovery/')[1]?.split('/')[0];

      if (httpMethod === 'GET') {
        if (recoveryId && !path.endsWith('/recovery')) {
          const record = await BackendRecoveryService.getRecoveryById(recoveryId);
          if (!record) return errorResponse('Recovery record not found', 404);
          return successResponse(record);
        }
        const records = await BackendRecoveryService.getAllRecoveryRecords();
        return successResponse(records);
      }

      if (httpMethod === 'POST' && recoveryId) {
        const body = JSON.parse(event.body || '{}');

        if (path.endsWith('/receive')) {
          const recyclerId = body.recyclerId || 'rec-partner-01';
          const recyclerName = body.recyclerName || 'EcoRecycle Facilities Hub';
          const updated = await BackendRecoveryService.updateStatus(recoveryId, 'RECEIVED', {
            recyclerId,
            recyclerName,
          });
          if (!updated) return errorResponse('Recovery record not found', 404);
          if (updated.pickupId) {
            try {
              await BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                recyclerId,
                recyclerName,
                recoveryStatus: 'RECEIVED',
              });
            } catch (e) {
              console.warn('[Pickup link update error]', e);
            }
          }
          return successResponse(updated);
        }

        if (path.endsWith('/process')) {
          const updated = await BackendRecoveryService.updateStatus(recoveryId, 'PROCESSING');
          if (!updated) return errorResponse('Recovery record not found', 404);
          if (updated.pickupId) {
            try {
              await BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                recoveryStatus: 'PROCESSING',
              });
            } catch (e) {
              console.warn('[Pickup link update error]', e);
            }
          }
          return successResponse(updated);
        }

        if (path.endsWith('/recover')) {
          const updated = await BackendRecoveryService.updateStatus(recoveryId, 'RECOVERED');
          if (!updated) return errorResponse('Recovery record not found', 404);
          if (updated.pickupId) {
            try {
              await BackendPickupService.updateStatus(updated.pickupId, 'COMPLETED', {
                recoveryStatus: 'RECOVERED',
              });
            } catch (e) {
              console.warn('[Pickup link update error]', e);
            }
          }
          return successResponse(updated);
        }
      }
    }

    // GET /pickups or GET /pickups/:id
    if (httpMethod === 'GET') {
      if (pickupId) {
        const pickup = await BackendPickupService.getPickupById(pickupId);
        if (!pickup) return errorResponse('Pickup not found', 404);
        return successResponse(pickup);
      }
      const pickups = await BackendPickupService.getAllPickups();
      return successResponse(pickups);
    }

    // POST /pickups - Create Request
    if (httpMethod === 'POST' && path.includes('pickups') && !pickupId) {
      const body = JSON.parse(event.body || '{}');
      if (!body.customerId || !body.wasteItems || body.wasteItems.length === 0) {
        return errorResponse('Missing customerId or wasteItems', 400);
      }
      const newPickup = await BackendPickupService.createPickup(body);
      return successResponse(newPickup, 201);
    }

    // Actions on /pickups/:id
    if (pickupId) {
      const body = JSON.parse(event.body || '{}');

      if (path.endsWith('/accept')) {
        const updated = await BackendPickupService.updateStatus(pickupId, 'ACCEPTED', {
          collectorId: body.collectorId || 'col-unknown',
          collectorName: body.collectorName || body.name || 'Collector',
          collectorPhone: body.collectorPhone || body.phone || '',
          collectorVehicle: body.vehicle || body.collectorVehicle || 'EV Loader',
        });
        return successResponse(updated);
      }

      if (path.endsWith('/status')) {
        const { status, extraFields } = body;
        const STATUS_MAP: Record<string, string> = {
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
        const updated = await BackendPickupService.updateStatus(pickupId, normalizedStatus as any, extraFields);
        return successResponse(updated);
      }

      if (path.endsWith('/verify-otp')) {
        const { otp } = body;
        if (!otp) return errorResponse('OTP is required', 400);
        const result = await BackendPickupService.verifyOtp(pickupId, otp);
        if (!result.success) return errorResponse(result.message, 400);
        return successResponse(result);
      }

      if (path.endsWith('/weight')) {
        const { weighedItems } = body;
        if (!weighedItems) return errorResponse('weighedItems required', 400);
        const updated = await BackendPickupService.submitWeighing(pickupId, weighedItems);
        return successResponse(updated);
      }

      if (path.endsWith('/complete')) {
        const pickup = await BackendPickupService.getPickupById(pickupId);
        if (!pickup) return errorResponse('Pickup not found', 404);

        const tx = await BackendTransactionService.createTransactionForPickup(pickup);
        const cert = await BackendCertificateService.createCertificateForPickup(pickup, tx.id);
        const recovery = await BackendRecoveryService.createRecoveryFromPickup(pickup, tx.id);
        const updated = await BackendPickupService.updateStatus(pickupId, 'COMPLETED', {
          certificateId: cert.id,
          paymentStatus: 'completed',
          recoveryId: recovery.id,
          recoveryStatus: 'AVAILABLE',
        });

        return successResponse({ pickup: updated, transaction: tx, certificate: cert, recovery });
      }
    }

    return errorResponse('Route not found', 404);
  } catch (err: any) {
    console.error('[Pickups Handler Error]', err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
