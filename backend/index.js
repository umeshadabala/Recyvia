exports.handler = async (event) => {
  console.log('[Lambda Handler Event]:', JSON.stringify(event));

  try {
    const httpMethod = (event.httpMethod || event.requestContext?.http?.method || 'GET').toUpperCase();
    const rawPath = event.rawPath || event.path || event.requestContext?.http?.path || '';
    const path = rawPath.toLowerCase();

    // Health check endpoint - ZERO dependencies required!
    if (path.includes('health') || path === '/' || path === '') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        body: JSON.stringify({
          success: true,
          data: {
            service: 'Recyvia API',
            status: 'HEALTHY',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            receivedPath: rawPath,
            receivedMethod: httpMethod,
          }
        })
      };
    }

    // Load main pickups router safely inside handler try/catch block
    const pickupsHandler = require('./dist/handlers/pickups').handler;
    return await pickupsHandler(event);
  } catch (error) {
    console.error('[Lambda Root Handler Error]:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error',
        stack: error.stack
      })
    };
  }
};
