import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/responses';
import { BackendTransactionService } from '../services/transactionService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'GET') {
      const txs = await BackendTransactionService.getAllTransactions();
      return successResponse(txs);
    }
    return errorResponse('Method not allowed', 405);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
