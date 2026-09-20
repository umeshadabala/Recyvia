"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const handler = async (event) => {
    return (0, responses_1.successResponse)({
        service: 'Recyvia API',
        status: 'HEALTHY',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        region: process.env.AWS_REGION || 'ap-south-1',
    });
};
exports.handler = handler;
