import type { ProblemDetails } from '@/lib/api/types.gen';

const FALLBACK = 'Something went wrong. Please try again.';

export function extractApiError(
  error: ProblemDetails | unknown,
  fallback = FALLBACK
): string {
  if (!error || typeof error !== 'object') {
    if (typeof error === 'string' && error.length > 0) return error;
    return fallback;
  }

  const pd = error as ProblemDetails;
  const status = pd.status ?? 0;

  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 409)
    return 'This item was modified by someone else. Please refresh and try again.';
  if (status === 429)
    return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500)
    return 'An unexpected error occurred. Please try again or contact support if the issue persists.';

  return pd.title ?? fallback;
}
