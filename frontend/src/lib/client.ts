import { CreateClientConfig } from './api/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl:
    typeof window === 'undefined'
      ? process.env.INTERNAL_API_BASE_URL!
      : undefined,
});
