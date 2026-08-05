# Adding an endpoint

1. Define request/domain types and a critical response schema in the owning feature's `*.contracts.ts`.
2. Add a plain async function to `*.api.ts`. Build the path, pass query values, forward `signal`, choose a response mode, validate once, and return domain data.
3. Add every response-affecting input to a normalized query key.
4. Expose a `queryOptions` or `mutationOptions` factory. Keep query options reusable by components, prefetching, tests, and manual cache operations.
5. Decide retry and idempotency explicitly. Never add retry loops to the API function.
6. Add an MSW handler and network-level tests for success and meaningful failures.
7. Choose precise cache updates and invalidations.

For non-idempotent creates, do not retry. If the backend supports idempotency keys, generate a key per user intent and reuse it only for that operation.
