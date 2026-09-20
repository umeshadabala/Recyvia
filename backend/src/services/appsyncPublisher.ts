import { RealtimeDomainEvent } from '../types/index';

const APPSYNC_HTTP_ENDPOINT = process.env.APPSYNC_ENDPOINT || '';
const APPSYNC_API_KEY = process.env.APPSYNC_API_KEY || '';

export const AppSyncPublisher = {
  publishEvent: async (channel: string, event: RealtimeDomainEvent): Promise<boolean> => {
    if (!APPSYNC_HTTP_ENDPOINT) {
      console.log(`[AppSyncPublisher Mock Log] Channel: ${channel}, Event:`, event);
      return true;
    }

    try {
      const endpoint = APPSYNC_HTTP_ENDPOINT.endsWith('/event')
        ? APPSYNC_HTTP_ENDPOINT
        : `${APPSYNC_HTTP_ENDPOINT}/event`;

      const normalizedChannel = channel.startsWith('default/')
        ? channel
        : `default/${channel.replace(/^\/+/, '')}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          channel: normalizedChannel,
          events: [JSON.stringify(event)],
        }),
      });

      if (!response.ok) {
        console.error(`[AppSyncPublisher Error] Status: ${response.status} for channel ${normalizedChannel}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[AppSyncPublisher Exception]', err);
      return false;
    }
  },
};
