# Server state

TanStack Query is the only server-state cache. Feature API modules return domain data; adjacent query modules define key hierarchies and reusable `queryOptions` / `mutationOptions` factories.

Queries use a 30-second stale time and 30-minute garbage-collection time. Stale data refetches after focus and reconnect. Transient query failures receive at most two retries with capped exponential backoff and jitter. Aborts, validation failures, and ordinary 4xx responses are not retried. Mutations have no global retry.

Mutation examples in `features/users/api/users.queries.ts` show:

- idempotent create with a caller-provided key and list invalidation;
- optimistic detail update with cancellation, snapshot, rollback, and targeted invalidation;
- delete with detail removal and list invalidation.

Do not invalidate the whole cache after routine mutations.

## Optional persistence

Persistence is intentionally absent. If the product later needs offline public data, install the TanStack persistence adapter and whitelist explicit non-sensitive query prefixes. Use a versioned buster, bounded max age, and logout cleanup. Never persist auth queries or private customer data by default.
