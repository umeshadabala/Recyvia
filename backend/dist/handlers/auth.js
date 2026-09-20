"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const authService_1 = require("../services/authService");
const handler = async (event) => {
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
            if (!body.phone)
                return (0, responses_1.errorResponse)('Phone number is required', 400);
            const result = await authService_1.BackendAuthService.sendOtp(body.phone);
            return (0, responses_1.successResponse)(result);
        }
        // POST /auth/verify-otp
        if (httpMethod === 'POST' && path.includes('/auth/verify-otp')) {
            const body = JSON.parse(event.body || '{}');
            if (!body.phone || !body.otp) {
                return (0, responses_1.errorResponse)('Phone number and OTP code are required', 400);
            }
            const result = await authService_1.BackendAuthService.verifyOtp(body.phone, body.otp, body.name, body.role);
            if (!result.success)
                return (0, responses_1.errorResponse)(result.message, 400);
            const response = (0, responses_1.successResponse)({
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
            if (!token)
                return (0, responses_1.errorResponse)('Unauthenticated', 401);
            const session = await authService_1.BackendAuthService.getSession(token);
            if (!session)
                return (0, responses_1.errorResponse)('Session expired or invalid', 401);
            return (0, responses_1.successResponse)(session);
        }
        // POST /auth/logout
        if (httpMethod === 'POST' && path.includes('/auth/logout')) {
            const result = await authService_1.BackendAuthService.logout(token);
            const response = (0, responses_1.successResponse)({ message: 'Logged out successfully' });
            response.headers = {
                ...response.headers,
                'Set-Cookie': result.cookieHeader,
            };
            return response;
        }
        return (0, responses_1.errorResponse)('Auth route not found', 404);
    }
    catch (err) {
        console.error('[Auth Handler Error]', err);
        return (0, responses_1.errorResponse)(err.message || 'Internal Server Error', 500);
    }
};
exports.handler = handler;
