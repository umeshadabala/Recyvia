import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/responses';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return successResponse({
    service: 'Recyvia API',
    status: 'HEALTHY',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: process.env.AWS_REGION || 'ap-south-1',
  });
};
