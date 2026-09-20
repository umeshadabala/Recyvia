"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const dynamoRepository_1 = require("../repositories/dynamoRepository");
const handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            const items = await dynamoRepository_1.DynamoRepository.scanByEntityPrefix('RECYCLER#');
            const recyclers = items.map(({ pk, sk, ...data }) => data);
            return (0, responses_1.successResponse)(recyclers);
        }
        return (0, responses_1.errorResponse)('Method not allowed', 405);
    }
    catch (err) {
        return (0, responses_1.errorResponse)(err.message || 'Internal Server Error', 500);
    }
};
exports.handler = handler;
