"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const responses_1 = require("../utils/responses");
const transactionService_1 = require("../services/transactionService");
const handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            const txs = await transactionService_1.BackendTransactionService.getAllTransactions();
            return (0, responses_1.successResponse)(txs);
        }
        return (0, responses_1.errorResponse)('Method not allowed', 405);
    }
    catch (err) {
        return (0, responses_1.errorResponse)(err.message || 'Internal Server Error', 500);
    }
};
exports.handler = handler;
