# Testing

Vitest runs behavior tests under jsdom. React Testing Library and user-event exercise forms and guards. MSW intercepts native fetch at the network boundary; most tests do not mock API modules.

`src/test/setup.ts` starts the Node worker, resets handlers and mutable mock data after each test, and closes the worker. `renderApp` creates a fresh QueryClient with retries disabled for deterministic component tests.

Playwright starts Vite and uses the browser MSW worker. Tests cover protected redirect, login, list/search/filter, create/edit/delete, server-error recovery, and session expiry. Use roles, labels, and visible names. Scope locators when repeated actions are legitimate.

The CI coverage gate targets the highest-risk network, authentication, query/mutation, guard, and form seams. Lazy route shells and browser-owned journeys are verified by Playwright instead of being diluted into unit coverage totals.

Add focused tests beside the owning module. Network tests should distinguish HTTP, validation, network, timeout, and abort behavior. Do not assert private implementation calls when the public response or UI behavior is observable.
