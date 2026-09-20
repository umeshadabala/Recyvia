"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = exports.buildResponse = void 0;
const buildResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    body: JSON.stringify(body),
});
exports.buildResponse = buildResponse;
const successResponse = (data, statusCode = 200) => (0, exports.buildResponse)(statusCode, { success: true, data });
exports.successResponse = successResponse;
const errorResponse = (message, statusCode = 400, details) => (0, exports.buildResponse)(statusCode, { success: false, error: message, details });
exports.errorResponse = errorResponse;
