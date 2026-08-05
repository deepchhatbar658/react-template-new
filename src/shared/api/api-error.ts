import type { BackendErrorAdapter, BackendErrorDetails } from './api-types';

export type ApiErrorKind =
  'http' | 'network' | 'timeout' | 'aborted' | 'validation' | 'unknown';

export interface ApiErrorOptions {
  backendCode?: string;
  details?: unknown;
  fieldErrors?: Record<string, string[]>;
  kind: ApiErrorKind;
  originalCause?: unknown;
  retryable?: boolean;
  safeMessage: string;
  status?: number;
  technicalMessage: string;
  traceId?: string;
}

export class ApiError extends Error {
  readonly backendCode: string | undefined;
  readonly details: unknown;
  readonly fieldErrors: Record<string, string[]> | undefined;
  readonly kind: ApiErrorKind;
  readonly originalCause: unknown;
  readonly retryable: boolean;
  readonly safeMessage: string;
  readonly status: number | undefined;
  readonly technicalMessage: string;
  readonly traceId: string | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.technicalMessage, { cause: options.originalCause });
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.backendCode = options.backendCode;
    this.safeMessage = options.safeMessage;
    this.technicalMessage = options.technicalMessage;
    this.fieldErrors = options.fieldErrors;
    this.details = options.details;
    this.traceId = options.traceId;
    this.retryable = options.retryable ?? false;
    this.originalCause = options.originalCause;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const readFieldErrors = (
  value: unknown,
): Record<string, string[]> | undefined => {
  if (!isRecord(value)) return undefined;

  const result: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(value)) {
    if (Array.isArray(messages)) {
      const strings = messages.filter(
        (message): message is string => typeof message === 'string',
      );
      if (strings.length > 0) result[field] = strings;
      continue;
    }
    if (typeof messages === 'string') result[field] = [messages];
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

export const defaultBackendErrorAdapter: BackendErrorAdapter = (
  payload,
): BackendErrorDetails => {
  if (!isRecord(payload)) return {};

  const nestedError = isRecord(payload.error) ? payload.error : undefined;
  const source = nestedError ?? payload;
  const code = readString(source.code);
  const message = readString(source.message);
  const fieldErrors = readFieldErrors(payload.errors);

  return {
    ...(code ? { code } : {}),
    ...(message ? { message } : {}),
    ...(fieldErrors ? { fieldErrors } : {}),
  };
};

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

export const isRetryableError = (error: unknown): boolean =>
  isApiError(error) && error.retryable;

export const isUnauthorizedError = (error: unknown): boolean =>
  isApiError(error) && error.status === 401;

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => (isApiError(error) ? error.safeMessage : fallback);

export const getFieldErrors = (
  error: unknown,
): Record<string, string[]> | undefined =>
  isApiError(error) ? error.fieldErrors : undefined;

export const isRetryableStatus = (status: number): boolean =>
  status === 408 ||
  status === 429 ||
  status === 502 ||
  status === 503 ||
  status === 504;

export const safeHttpMessage = (status: number): string => {
  if (status === 400) return 'The request could not be completed.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 429) return 'Too many requests. Please wait and try again.';
  if (status >= 500) return 'The service is temporarily unavailable.';
  return 'The request failed. Please try again.';
};
