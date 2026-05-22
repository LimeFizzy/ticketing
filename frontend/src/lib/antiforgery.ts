import { client } from './api/client.gen';
import { getAntiforgeryToken } from './api/sdk.gen';

let tokenPromise: Promise<string> | null = null;

function fetchToken(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = getAntiforgeryToken()
      .then(({ data }) => (data as { token: string }).token)
      .catch(() => {
        tokenPromise = null;
        throw new Error('Failed to fetch antiforgery token');
      });
  }
  return tokenPromise;
}

export function resetAntiforgeryToken() {
  tokenPromise = null;
}

export function initAntiforgery() {
  if (typeof window === 'undefined') return;

  client.interceptors.request.use(async (request) => {
    const method = request.method?.toUpperCase();
    if (
      method &&
      method !== 'GET' &&
      method !== 'HEAD' &&
      method !== 'OPTIONS'
    ) {
      const token = await fetchToken();
      request.headers.set('X-XSRF-TOKEN', token);
    }
    return request;
  });
}