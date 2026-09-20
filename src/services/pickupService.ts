import { AwsPickupService } from './awsPickupService';
import { IPickupService } from './interfaces';

// PickupService delegates directly to AwsPickupService, ensuring 
// all pages and components utilize real AWS DynamoDB, API Gateway, and AppSync Events.
export const PickupService: IPickupService = AwsPickupService;
