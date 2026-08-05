# Adding a feature

1. Create `src/features/<feature>/api` with contracts, plain API functions, keys, and query/mutation options.
2. Add components or pages only when they contain real behavior. Do not create empty placeholder folders.
3. Use relative imports inside the feature and `@/shared/...` for shared infrastructure.
4. Compose the feature from a route module. A feature never imports another feature.
5. Add MSW handlers and deterministic mock data for new endpoints.
6. Test public seams: contract parsing, keys/options, mutation cache effects, forms, and route behavior.
7. Update docs when the feature establishes a new convention.

If two features need the same business concept, first ask whether one owns it and routes should compose it. Move code to shared only when it is genuinely business-agnostic.
