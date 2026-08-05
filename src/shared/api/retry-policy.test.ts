import { ApiError } from './api-error';
import { retryDelay, shouldRetryQuery } from './retry-policy';

describe('query retry policy', () => {
  it('retries transient failures no more than twice', () => {
    const transient = new ApiError({
      kind: 'network',
      retryable: true,
      safeMessage: 'Offline',
      technicalMessage: 'Network failed',
    });

    expect(shouldRetryQuery(0, transient)).toBe(true);
    expect(shouldRetryQuery(1, transient)).toBe(true);
    expect(shouldRetryQuery(2, transient)).toBe(false);
  });

  it('does not retry aborted, validation, or ordinary HTTP failures', () => {
    for (const error of [
      new ApiError({
        kind: 'aborted',
        safeMessage: 'Cancelled',
        technicalMessage: 'Cancelled',
      }),
      new ApiError({
        kind: 'validation',
        safeMessage: 'Invalid',
        technicalMessage: 'Invalid',
      }),
      new ApiError({
        kind: 'http',
        status: 404,
        safeMessage: 'Missing',
        technicalMessage: 'Missing',
      }),
    ]) {
      expect(shouldRetryQuery(0, error)).toBe(false);
    }
  });

  it('caps exponential backoff and applies bounded jitter', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(retryDelay(0)).toBe(825);
    expect(retryDelay(10)).toBe(11_000);
    random.mockRestore();
  });
});
