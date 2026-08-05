# Error handling

Every transport failure becomes `ApiError` with a discriminated `kind`: `http`, `network`, `timeout`, `aborted`, `validation`, or `unknown`. It may also include status, backend code, safe and technical messages, field errors, response details, trace ID, retryability, and original cause.

The default backend adapter accepts top-level `{ message, code, errors }` and nested `{ error: { message, code } }` shapes. Supply another adapter when a backend contract differs; do not scatter payload assumptions through features.

Use `getErrorMessage` for safe UI copy and `getFieldErrors` to map backend validation into React Hook Form. First-load errors replace missing content with recovery. Background errors preserve successful content and show an adjacent status. The client never opens toasts or redirects.

Technical messages and causes are for observability. Avoid sending sensitive response details to analytics without review.
