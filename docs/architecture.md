# Architecture

## Dependency model

The project separates wiring from reusable infrastructure and business ownership:

- `shared` is business-agnostic and imports only `shared`.
- `features/<name>` owns its contracts, endpoints, query options, forms, and UI. It imports `shared` and relative files inside the same feature.
- `routes` composes features into navigable screens.
- `app` owns startup, environment, providers, router creation, and global boundaries.

ESLint enforces this direction. Avoid broad barrels because they hide ownership and make cycles easier.

## Decisions and reconsideration triggers

1. **Native fetch instead of Axios.** It avoids a second HTTP runtime and keeps browser primitives visible behind a replaceable client. Reconsider only if a required platform capability cannot be implemented safely in the client.
2. **TanStack Query for server state.** It owns freshness, cancellation, retry, mutation state, and cache lifecycle. Reconsider only if the product fundamentally adopts a different data synchronization model.
3. **Feature-first organization.** Contracts and behavior change together. Reconsider when a feature becomes a separately deployed package, not merely because folders grow.
4. **No global client-state library by default.** React state, URL state, and Query cover the example. Add one only after concrete cross-tree client-state pressure is measured; never use it for server data.
5. **Cookie-first authentication.** HttpOnly cookies reduce token exposure to JavaScript. Reconsider for a platform that cannot use browser cookies, with a documented threat model.
6. **No query persistence by default.** Private data and stale authorization should not survive browser sessions automatically. Add selective persistence only for public, non-sensitive queries.
7. **Runtime validation at external boundaries.** Critical untrusted payloads are parsed once. Expand validation for unstable integrations; reduce it only when another trusted boundary guarantees the contract.
8. **MSW for API mocking.** The same fetch boundary runs in tests and development. Reconsider when a dedicated disposable backend provides equivalent deterministic behavior.
9. **CSS Modules instead of a UI framework.** The template stays adaptable and dependency-light. Adopt a design system when the product has one, through an explicit migration.
10. **React Router library mode.** The client keeps architectural control without SSR/framework conventions. Reconsider when server rendering or full-stack route modules become a product requirement.
