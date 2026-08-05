import { ZodError } from 'zod';

import {
  ApiError,
  defaultBackendErrorAdapter,
  isRetryableStatus,
  safeHttpMessage,
} from './api-error';
import { type AuthRefreshCoordinator } from './auth-refresh';
import type {
  ApiMutationOptions,
  ApiRequestObservation,
  ApiRequestOptions,
  BackendErrorAdapter,
} from './api-types';
import {
  parseErrorPayload,
  parseResponse,
  parseWithSchema,
  ResponseParseError,
} from './response-parser';
import { buildUrl } from './url-builder';

export interface ApiClientConfig {
  authRefresh?: AuthRefreshCoordinator;
  backendErrorAdapter?: BackendErrorAdapter;
  baseUrl: string;
  fetch?: typeof fetch;
  getCsrfToken?: () => string | undefined;
  onRequest?: (observation: ApiRequestObservation) => void;
  timeoutMs?: number;
}

interface InternalRequestOptions<
  TResponse,
> extends ApiMutationOptions<TResponse> {
  retriedAfterRefresh?: boolean;
}

const mutatingMethods = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

const createBody = (body: unknown, headers: Headers): BodyInit | undefined => {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (!headers.has('content-type'))
    headers.set('content-type', 'application/json');
  return JSON.stringify(body);
};

export class ApiClient {
  private authRefresh: AuthRefreshCoordinator | undefined;
  private backendErrorAdapter: BackendErrorAdapter;
  private baseUrl: string;
  private readonly fetchImplementation: typeof fetch | undefined;
  private readonly getCsrfToken: (() => string | undefined) | undefined;
  private readonly onRequest:
    ((observation: ApiRequestObservation) => void) | undefined;
  private readonly timeoutMs: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchImplementation = config.fetch;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.getCsrfToken = config.getCsrfToken;
    this.backendErrorAdapter =
      config.backendErrorAdapter ?? defaultBackendErrorAdapter;
    this.authRefresh = config.authRefresh;
    this.onRequest = config.onRequest;
  }

  configure(config: {
    authRefresh?: AuthRefreshCoordinator;
    backendErrorAdapter?: BackendErrorAdapter;
    baseUrl: string;
  }): void {
    this.baseUrl = config.baseUrl;
    if (config.authRefresh) {
      this.authRefresh = config.authRefresh;
    }
    if (config.backendErrorAdapter) {
      this.backendErrorAdapter = config.backendErrorAdapter;
    }
  }

  setAuthRefresh(coordinator: AuthRefreshCoordinator): void {
    this.authRefresh = coordinator;
  }

  get<TResponse = unknown>(
    path: string,
    options: ApiRequestOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request('GET', path, options);
  }

  post<TResponse = unknown>(
    path: string,
    options: ApiMutationOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request('POST', path, options);
  }

  put<TResponse = unknown>(
    path: string,
    options: ApiMutationOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request('PUT', path, options);
  }

  patch<TResponse = unknown>(
    path: string,
    options: ApiMutationOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request('PATCH', path, options);
  }

  delete<TResponse = unknown>(
    path: string,
    options: ApiMutationOptions<TResponse> = {},
  ): Promise<TResponse> {
    return this.request('DELETE', path, options);
  }

  private async request<TResponse>(
    method: string,
    path: string,
    options: InternalRequestOptions<TResponse>,
  ): Promise<TResponse> {
    const url = buildUrl(this.baseUrl, path, options.query);
    const headers = new Headers(options.headers);
    headers.set(
      'accept',
      options.responseType === 'blob' ? '*/*' : 'application/json',
    );

    if (options.idempotencyKey) {
      headers.set('idempotency-key', options.idempotencyKey);
    }

    if (mutatingMethods.has(method)) {
      const csrfToken = this.getCsrfToken?.();
      if (csrfToken) headers.set('x-csrf-token', csrfToken);
    }

    const timeoutController = new AbortController();
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const timeoutId = globalThis.setTimeout(() => {
      timeoutController.abort(new DOMException('Timed out', 'TimeoutError'));
    }, timeoutMs);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeoutController.signal])
      : timeoutController.signal;

    this.onRequest?.({ method, metadata: options.metadata, url });

    try {
      const fetchImplementation = this.fetchImplementation ?? globalThis.fetch;
      const body = createBody(options.body, headers);
      const response = await fetchImplementation(url, {
        ...(body === undefined ? {} : { body }),
        credentials: 'include',
        headers,
        method,
        signal,
      });

      if (
        response.status === 401 &&
        !options.metadata?.skipAuthRefresh &&
        !options.retriedAfterRefresh &&
        this.authRefresh
      ) {
        const refreshed = await this.authRefresh.refresh();
        if (refreshed) {
          return await this.request(method, path, {
            ...options,
            retriedAfterRefresh: true,
          });
        }
      }

      if (!response.ok) {
        const details = await parseErrorPayload(response);
        const backend = this.backendErrorAdapter(details);
        const traceId =
          response.headers.get('x-request-id') ??
          response.headers.get('x-trace-id') ??
          undefined;

        throw new ApiError({
          kind: 'http',
          status: response.status,
          ...(backend.code ? { backendCode: backend.code } : {}),
          ...(backend.fieldErrors ? { fieldErrors: backend.fieldErrors } : {}),
          ...(traceId ? { traceId } : {}),
          details,
          safeMessage: backend.message ?? safeHttpMessage(response.status),
          technicalMessage: `${method} ${url} failed with ${response.status}`,
          retryable: isRetryableStatus(response.status),
        });
      }

      const payload = await parseResponse(
        response,
        options.responseType ?? 'auto',
      );
      return options.responseSchema
        ? parseWithSchema(options.responseSchema, payload)
        : (payload as TResponse);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (options.signal?.aborted) {
        throw new ApiError({
          kind: 'aborted',
          originalCause: error,
          safeMessage: 'The request was cancelled.',
          technicalMessage: `${method} ${url} was aborted by the caller`,
        });
      }
      if (timeoutController.signal.aborted) {
        throw new ApiError({
          kind: 'timeout',
          originalCause: error,
          retryable: true,
          safeMessage: 'The request took too long. Please try again.',
          technicalMessage: `${method} ${url} timed out after ${timeoutMs}ms`,
        });
      }
      if (error instanceof ZodError || error instanceof ResponseParseError) {
        throw new ApiError({
          kind: 'validation',
          details:
            error instanceof ResponseParseError ? error.payload : error.issues,
          originalCause: error,
          safeMessage: 'The server returned an unexpected response.',
          technicalMessage: `${method} ${url} response validation failed`,
        });
      }
      if (error instanceof TypeError) {
        throw new ApiError({
          kind: 'network',
          originalCause: error,
          retryable: true,
          safeMessage: 'Unable to reach the service. Check your connection.',
          technicalMessage: `${method} ${url} failed before receiving a response`,
        });
      }
      throw new ApiError({
        kind: 'unknown',
        originalCause: error,
        safeMessage: 'Something went wrong. Please try again.',
        technicalMessage: `${method} ${url} failed unexpectedly`,
      });
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

export const apiClient = new ApiClient({ baseUrl: '/api' });

export const configureApiClient = (
  config: Pick<
    ApiClientConfig,
    'authRefresh' | 'backendErrorAdapter' | 'baseUrl'
  >,
): void => {
  apiClient.configure(config);
};
