import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'Recyvia';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const DynamoRepository = {
  putItem: async (item: { pk: string; sk: string; [key: string]: any }) => {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );
    return item;
  },

  getItem: async (pk: string, sk: string) => {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk, sk },
      })
    );
    return response.Item || null;
  },

  queryByPk: async (pk: string) => {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': pk,
        },
      })
    );
    return response.Items || [];
  },

  scanByEntityPrefix: async (pkPrefix: string) => {
    const response = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(pk, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': pkPrefix,
        },
      })
    );
    return response.Items || [];
  },

  updateItem: async (pk: string, sk: string, updateExpression: string, expressionAttributeValues: any) => {
    const response = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { pk, sk },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );
    return response.Attributes;
  },
};
