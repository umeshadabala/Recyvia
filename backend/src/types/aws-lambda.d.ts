declare module 'aws-lambda' {
  export interface APIGatewayProxyEvent {
    httpMethod: string;
    path: string;
    headers: Record<string, string | undefined>;
    queryStringParameters: Record<string, string | undefined> | null;
    pathParameters: Record<string, string | undefined> | null;
    body: string | null;
    requestContext?: any;
  }

  export interface APIGatewayProxyResult {
    statusCode: number;
    headers?: Record<string, string | boolean>;
    body: string;
  }
}

declare module '@aws-sdk/client-dynamodb' {
  export class DynamoDBClient {
    constructor(config?: any);
  }
}

declare module '@aws-sdk/lib-dynamodb' {
  export class DynamoDBDocumentClient {
    static from(client: any): DynamoDBDocumentClient;
    send(command: any): Promise<any>;
  }
  export class GetCommand {
    constructor(input: any);
  }
  export class PutCommand {
    constructor(input: any);
  }
  export class UpdateCommand {
    constructor(input: any);
  }
  export class QueryCommand {
    constructor(input: any);
  }
  export class ScanCommand {
    constructor(input: any);
  }
}
