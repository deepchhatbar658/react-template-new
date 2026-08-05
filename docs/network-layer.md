# Network layer

`shared/api/api-client.ts` is the only transport boundary. Feature API modules call its typed `get`, `post`, `put`, `patch`, and `delete` methods; UI modules never call fetch directly.

## Request behavior

- Base URL is configured from validated `VITE_API_URL` before rendering.
- `credentials: "include"` is always set.
- Plain objects are JSON encoded; FormData keeps the browser-generated content type.
- Query arrays use repeated parameters and nullish/empty values are omitted.
- Callers can provide headers, idempotency keys, CSRF token providers, metadata, timeout overrides, response modes, schemas, and AbortSignals.
- Caller cancellation and timeout cancellation are combined with `AbortSignal.any` and normalized separately.

## Response behavior

The parser handles 204/205, empty bodies, JSON, text, blobs, invalid JSON, misleading content types, and non-JSON errors. Explicit response modes take precedence. Critical data is parsed by a feature-owned Zod schema before it enters the cache.

The client performs no retries. A 401 may trigger the one-flight refresh flow, but every original request is replayed at most once. TanStack Query owns all transient retry policy.

## Replacing fetch

Preserve the `ApiClient` public behavior and feature API functions. Tests at this boundary define the compatibility contract. A replacement must retain credentials, AbortSignal semantics, error normalization, response modes, refresh safeguards, and observation metadata.
