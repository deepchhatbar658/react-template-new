import type { ApiQueryParams, QueryPrimitive } from './api-types';

const appendValue = (
  searchParams: URLSearchParams,
  key: string,
  value: QueryPrimitive,
): void => {
  if (value === null || value === undefined || value === '') return;
  searchParams.append(key, String(value));
};

const isQueryArray = (
  value: QueryPrimitive | readonly QueryPrimitive[],
): value is readonly QueryPrimitive[] => Array.isArray(value);

export const buildUrl = (
  baseUrl: string,
  path: string,
  query?: ApiQueryParams,
): string => {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;

  if (!query) return url;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (isQueryArray(value)) {
      for (const item of value) appendValue(searchParams, key, item);
    } else {
      appendValue(searchParams, key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString.length > 0 ? `${url}?${queryString}` : url;
};
