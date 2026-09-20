import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/responses';
import { BackendAuthService } from '../services/authService';

export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const httpMethod = (event.httpMethod || event.requestContext?.http?.method || 'GET').toUpperCase();
  const path = (event.rawPath || event.path || event.requestContext?.http?.path || '').toLowerCase();
  const headers = event.headers || {};

  try {
    // Extract session token from Cookie or Authorization header
    const cookieHeader = headers.cookie || headers.Cookie || '';
    const authHeader = headers.authorization || headers.Authorization || '';
    const cookieToken = cookieHeader.split('recyvia_session=')[1]?.split(';')[0];
    const bearerToken = authHeader.replace('Bearer ', '').trim();
    const token = cookieToken || bearerToken;

    // POST /auth/send-otp
    if (httpMethod === 'POST' && path.includes('/auth/send-otp')) {
      const body = JSON.parse(event.body || '{}');
      if (!body.phone) return errorResponse('Phone number is required', 400);

      const result = await BackendAuthService.sendOtp(body.phone);
      return successResponse(result);
    }

    // POST /auth/verify-otp
    if (httpMethod === 'POST' && path.includes('/auth/verify-otp')) {
      const body = JSON.parse(event.body || '{}');
      if (!body.phone || !body.otp) {
        return errorResponse('Phone number and OTP code are required', 400);
      }

      const result = await BackendAuthService.verifyOtp(body.phone, body.otp, body.name, body.role);
      if (!result.success) return errorResponse(result.message, 400);

      const response = successResponse({
        message: result.message,
        session: result.session,
      });

      if (result.cookieHeader) {
        response.headers = {
          ...response.headers,
          'Set-Cookie': result.cookieHeader,
        };
      }

      return response;
    }

    // GET /auth/me
    if (httpMethod === 'GET' && path.includes('/auth/me')) {
      if (!token) return errorResponse('Unauthenticated', 401);
      const session = await BackendAuthService.getSession(token);
      if (!session) return errorResponse('Session expired or invalid', 401);

      return successResponse(session);
    }

    // POST /auth/logout
    if (httpMethod === 'POST' && path.includes('/auth/logout')) {
      const result = await BackendAuthService.logout(token);
      const response = successResponse({ message: 'Logged out successfully' });
      response.headers = {
        ...response.headers,
        'Set-Cookie': result.cookieHeader,
      };
      return response;
    }

    return errorResponse('Auth route not found', 404);
  } catch (err: any) {
    console.error('[Auth Handler Error]', err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
