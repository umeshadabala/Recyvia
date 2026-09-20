"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const certificateService_1 = require("../services/certificateService");
const handler = async (event) => {
    const httpMethod = event.httpMethod;
    const certId = event.pathParameters?.id;
    try {
        if (httpMethod === 'GET') {
            if (certId) {
                const cert = await certificateService_1.BackendCertificateService.getCertificateById(certId);
                if (!cert)
                    return (0, responses_1.errorResponse)('Certificate not found', 404);
                return (0, responses_1.successResponse)(cert);
            }
            const certs = await certificateService_1.BackendCertificateService.getAllCertificates();
            return (0, responses_1.successResponse)(certs);
        }
        return (0, responses_1.errorResponse)('Method not allowed', 405);
    }
    catch (err) {
        return (0, responses_1.errorResponse)(err.message || 'Internal Server Error', 500);
    }
};
exports.handler = handler;
