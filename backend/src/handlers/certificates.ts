import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/responses';
import { BackendCertificateService } from '../services/certificateService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const httpMethod = event.httpMethod;
  const certId = event.pathParameters?.id;

  try {
    if (httpMethod === 'GET') {
      if (certId) {
        const cert = await BackendCertificateService.getCertificateById(certId);
        if (!cert) return errorResponse('Certificate not found', 404);
        return successResponse(cert);
      }
      const certs = await BackendCertificateService.getAllCertificates();
      return successResponse(certs);
    }
    return errorResponse('Method not allowed', 405);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
