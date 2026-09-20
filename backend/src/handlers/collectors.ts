import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/responses';
import { DynamoRepository } from '../repositories/dynamoRepository';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'GET') {
      const items = await DynamoRepository.scanByEntityPrefix('COLLECTOR#');
      const collectors = items.map(({ pk, sk, ...data }: any) => data);
      return successResponse(collectors);
    }
    return errorResponse('Method not allowed', 405);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
