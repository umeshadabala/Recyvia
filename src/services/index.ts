import { IPickupService, IEventService } from './interfaces';
import { PickupService as LocalPickupService } from './pickupService';
import { EventService as LocalEventService } from './eventService';
import { AwsPickupService } from './awsPickupService';
import { AppSyncEventService } from './appsyncEventService';

const isAwsProvider =
  (import.meta as any).env?.VITE_DATA_PROVIDER === 'aws' ||
  (import.meta as any).env?.VITE_USE_MOCK === 'false';

export const activePickupService: IPickupService = isAwsProvider
  ? AwsPickupService
  : LocalPickupService;

export const activeEventService: IEventService = isAwsProvider
  ? AppSyncEventService
  : LocalEventService;

export { RecoveryService } from './recoveryService';
