# OpenAPI integration

No generator is installed by default. Adopt one only when a maintained backend schema provides enough value to justify generated-code ownership and CI drift checks.

The recommended flow remains:

```text
OpenAPI schema
→ generated endpoint/request/response types
→ feature API functions
→ queryOptions/mutationOptions
→ UI
```

Generate into an isolated directory, exclude generated code from manual formatting where appropriate, and keep feature API functions as the stable boundary. They can map generated DTOs to domain types and still call `ApiClient` for credentials, cancellation, normalized errors, and refresh behavior. TanStack Query keys/options and components should not import generated transport clients directly.

Pin the generator, verify a clean regeneration in CI, and document how backend schema versions are updated. Runtime validation may be retained for high-risk or independently deployed external services even when compile-time types are generated.
