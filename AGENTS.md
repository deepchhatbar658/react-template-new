# Coding-agent instructions

These rules are mandatory for automated and human changes.

1. Read the relevant documents in `docs/` before changing architecture, networking, authentication, server state, or tests.
2. Server data belongs in TanStack Query. Do not copy API responses into Context or another application store.
3. Do not add Axios, Ky, Redux, Zustand, another server cache, or an OpenAPI generator without an explicit architectural decision.
4. Never import one feature from another. Routes or app modules compose multiple features.
5. Shared code must remain business-agnostic and may import only shared code.
6. Feature API files contain plain asynchronous functions. They must not import React or TanStack Query.
7. Forward the TanStack Query `AbortSignal` from every query function to the API client.
8. Query keys include every serializable input affecting the response and normalize optional values.
9. Do not retry inside `ApiClient`. Query retry policy belongs in `shared/api/retry-policy.ts`; mutations are not retried globally.
10. Do not show UI notifications, mutate React state, access the router, or redirect from the API client.
11. Do not persist access or refresh tokens in localStorage. Cookie-first authentication is the default.
12. Validate untrusted external data at boundaries, not repeatedly during rendering.
13. Add network-level MSW tests for new request, error, refresh, cancellation, and mutation behavior.
14. Preserve successful data during background refetches and expose accessible recovery actions.
15. Do not add manual `useMemo`, `useCallback`, or `React.memo` without profiling evidence; React Compiler is enabled.
16. Do not leave TODO placeholders, empty architecture folders, suppressed TypeScript errors, disabled ESLint rules, or unsafe `any` types.
17. Update documentation when a convention, endpoint, environment variable, or command changes.
18. Before declaring work complete, run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm knip`, and relevant Playwright tests.
