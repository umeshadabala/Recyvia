"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'Recyvia';
const REGION = process.env.AWS_REGION || 'ap-south-1';
const client = new client_dynamodb_1.DynamoDBClient({ region: REGION });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.DynamoRepository = {
    putItem: async (item) => {
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }));
        return item;
    },
    getItem: async (pk, sk) => {
        const response = await docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: TABLE_NAME,
            Key: { pk, sk },
        }));
        return response.Item || null;
    },
    queryByPk: async (pk) => {
        const response = await docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': pk,
            },
        }));
        return response.Items || [];
    },
    scanByEntityPrefix: async (pkPrefix) => {
        const response = await docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'begins_with(pk, :prefix)',
            ExpressionAttributeValues: {
                ':prefix': pkPrefix,
            },
        }));
        return response.Items || [];
    },
    updateItem: async (pk, sk, updateExpression, expressionAttributeValues) => {
        const response = await docClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: TABLE_NAME,
            Key: { pk, sk },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        }));
        return response.Attributes;
    },
};
