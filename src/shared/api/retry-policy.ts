import { isRetryableError } from './api-error';

const MAX_QUERY_RETRIES = 2;

export const shouldRetryQuery = (
  failureCount: number,
  error: unknown,
): boolean => failureCount < MAX_QUERY_RETRIES && isRetryableError(error);

export const retryDelay = (attemptIndex: number): number => {
  const exponential = Math.min(750 * 2 ** attemptIndex, 10_000);
  const jitter = exponential * 0.2 * Math.random();
  return Math.round(exponential + jitter);
};
