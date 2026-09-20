export const buildResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  } as Record<string, string>,
  body: JSON.stringify(body),
});

export const successResponse = (data: any, statusCode = 200) => buildResponse(statusCode, { success: true, data });

export const errorResponse = (message: string, statusCode = 400, details?: any) =>
  buildResponse(statusCode, { success: false, error: message, details });
