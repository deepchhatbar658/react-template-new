# Authentication

The default contract uses server-managed HttpOnly cookies:

- `GET /auth/me`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

The frontend never stores access or refresh tokens in localStorage. Production cookies should be `Secure`, HttpOnly, appropriately scoped, and use a SameSite policy compatible with the deployment. State-changing endpoints should validate CSRF protection.

## Refresh concurrency

`createAuthRefreshCoordinator` stores one in-flight promise. Concurrent 401 responses wait for it. Success replays each request once. Failure emits one framework-independent auth-expired event. The refresh request opts out of refresh handling, and the replay flag prevents loops.

The query provider responds by removing queries whose metadata marks them private. `AuthGuard` responds by navigating to login with the original path encoded in `redirectTo`. The HTTP client does neither of those UI tasks.

When integrating a backend, keep refresh rotation and cookie writes atomic. Return 401 for an expired refresh session. Avoid returning secrets in response JSON.
