# React Production Template

A production-grade foundation for client-rendered, authenticated, API-driven React products. The template prioritizes request safety, server-state ownership, cookie authentication, runtime contracts, cancellation, retries, and testability over UI-library breadth.

Use it for dashboards, SaaS applications, admin tools, customer portals, and CRUD-heavy products. Do not use it when you need SSR, React Server Components, a monorepo, a prebuilt design system, or a generated full-stack framework.

## Quick start

Prerequisites: Node.js 24.18.0 and pnpm 11.20.0.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

The default environment enables MSW and serves a complete in-browser mock API. Sign in with `demo@example.com` / `password123`.

For Linux CI or a new development machine, install the Playwright browser once:

```bash
pnpm e2e:install
```

## Commands

| Command              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Start Vite with optional browser MSW         |
| `pnpm typecheck`     | Run strict TypeScript project checks         |
| `pnpm lint`          | Run type-aware ESLint and architecture rules |
| `pnpm test`          | Run Vitest unit and integration tests        |
| `pnpm test:coverage` | Run tests with enforced coverage thresholds  |
| `pnpm build`         | Typecheck and build production assets        |
| `pnpm knip`          | Find unused files, exports, and dependencies |
| `pnpm e2e`           | Run Playwright browser journeys              |
| `pnpm format:check`  | Verify Prettier formatting                   |

## Structure

```text
src/
├── app/       # startup config, providers, router, global boundaries and styles
├── routes/    # cross-feature route composition and layouts
├── features/  # feature-owned contracts, API calls, queries and UI
├── shared/    # business-agnostic API infrastructure and reusable UI
├── mocks/     # one MSW API for browser development and tests
└── test/      # shared test setup and render utilities
```

Dependency direction is enforced by ESLint: `shared → shared`; `features → shared + same feature`; `routes → shared + features`; `app → all layers`. Features use relative imports internally and never import another feature.

## Main choices

- Native Fetch is hidden behind `ApiClient`; feature code can survive a future transport replacement.
- TanStack Query is the only server-state cache. Query options are reusable outside components.
- Zod validates environment values and critical external response boundaries.
- React Hook Form and Zod handle forms without a generic form framework.
- React Router runs in library/data mode with lazy route modules.
- React Compiler uses the official Vite 8 `reactCompilerPreset` integration.
- CSS Modules and global tokens provide a small responsive visual foundation.
- MSW intercepts real fetch calls in Vitest and optional local development.

## Authentication assumptions

The template expects server-managed `HttpOnly`, `Secure`, appropriately scoped `SameSite` cookies. Requests use `credentials: "include"`. Tokens are not stored in localStorage. A one-flight refresh coordinator retries each failed request once, emits a framework-independent expiry signal, and lets the provider/router layers clear private queries and navigate.

Replace the mock `/auth/*` handlers with backend endpoints that preserve those semantics. See [authentication.md](docs/authentication.md).

## Environment and mock API

Only browser-safe variables use the `VITE_` prefix:

```dotenv
VITE_APP_NAME=Atlas Console
VITE_API_URL=/api
VITE_ENABLE_MSW=true
```

`src/app/config/env.ts` validates them at startup. Never place secrets in frontend environment files.

Set `VITE_ENABLE_MSW=false` to disable browser mocking. Tests still start their Node MSW server explicitly. The mock worker is generated at `public/mockServiceWorker.js` and must remain aligned with the installed MSW version.

## Production and deployment

```bash
VITE_ENABLE_MSW=false pnpm build
pnpm preview
```

Serve `dist/` as static assets, configure SPA fallback to `index.html`, use HTTPS, and set the backend cookie/CORS/CSRF policy for the frontend origin. Prefer a same-origin `/api` reverse proxy. Do not ship browser MSW in production unless a deliberate non-production environment requires it.

Start with [architecture.md](docs/architecture.md), then use [adding-a-feature.md](docs/adding-a-feature.md) or [adding-an-endpoint.md](docs/adding-an-endpoint.md).
