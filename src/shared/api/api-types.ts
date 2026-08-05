import type { ZodType } from 'zod';

export type ApiResponseType = 'auto' | 'blob' | 'json' | 'text';

export type QueryPrimitive = boolean | number | string | null | undefined;

export type ApiQueryParams = Record<
  string,
  QueryPrimitive | readonly QueryPrimitive[]
>;

interface RequestMetadata {
  operationName?: string;
  private?: boolean;
  skipAuthRefresh?: boolean;
}

export interface ApiRequestOptions<TResponse = unknown> {
  headers?: HeadersInit;
  idempotencyKey?: string;
  metadata?: RequestMetadata;
  query?: ApiQueryParams;
  responseSchema?: ZodType<TResponse>;
  responseType?: ApiResponseType;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiMutationOptions<
  TResponse = unknown,
> extends ApiRequestOptions<TResponse> {
  body?: unknown;
}

export interface ApiRequestObservation {
  method: string;
  metadata: RequestMetadata | undefined;
  url: string;
}

export interface BackendErrorDetails {
  code?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export type BackendErrorAdapter = (payload: unknown) => BackendErrorDetails;
