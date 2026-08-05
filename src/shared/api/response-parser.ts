import type { ZodType } from 'zod';

import type { ApiResponseType } from './api-types';

export class ResponseParseError extends Error {
  readonly payload: string;

  constructor(message: string, payload: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ResponseParseError';
    this.payload = payload;
  }
}

const looksLikeJson = (value: string): boolean => {
  const trimmed = value.trimStart();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new ResponseParseError('The server returned invalid JSON.', text, {
      cause: error,
    });
  }
};

export const parseResponse = async (
  response: Response,
  responseType: ApiResponseType,
): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) return undefined;

  if (responseType === 'blob') return response.blob();

  const text = await response.text();
  if (text.length === 0) return undefined;
  if (responseType === 'text') return text;
  if (responseType === 'json') return parseJson(text);

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.includes('json') || looksLikeJson(text))
    return parseJson(text);
  return text;
};

export const parseWithSchema = <T>(schema: ZodType<T>, payload: unknown): T =>
  schema.parse(payload);

export const parseErrorPayload = async (
  response: Response,
): Promise<unknown> => {
  const text = await response.text();
  if (text.length === 0) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};
