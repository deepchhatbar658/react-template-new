# Contributing

## Before coding

Read `AGENTS.md` and the relevant architecture document. Keep changes inside the smallest owning layer. New business behavior normally begins in one feature and is composed by a route.

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Use direct imports, strict types, and boundary validation. Add a failing behavior test before changing critical network or authentication behavior. Prefer MSW handlers over mocking feature API modules.

## Quality checks

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm knip
pnpm e2e
```

The Husky pre-commit hook runs only lint-staged formatting and lint fixes. Full verification belongs locally before review and in CI.

## Pull requests

Keep pull requests focused. Explain user-visible behavior, contract changes, cache/invalidation choices, and tests. Include screenshots for meaningful UI changes. Do not mix dependency upgrades with unrelated feature work.
