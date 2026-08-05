import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';

import { server } from '@/mocks/server';

import {
  ApiError,
  getFieldErrors,
  isApiError,
  isUnauthorizedError,
} from './api-error';
import { ApiClient } from './api-client';

const baseUrl = 'http://localhost/api';
const client = new ApiClient({ baseUrl, timeoutMs: 100 });

describe('ApiClient', () => {
  it('parses and validates a successful JSON response', async () => {
    server.use(
      http.get(`${baseUrl}/user`, () =>
        HttpResponse.json({ id: 'user-1', name: 'Ada' }),
      ),
    );

    const result = await client.get('/user', {
      responseSchema: z.object({ id: z.string(), name: z.string() }),
    });

    expect(result).toEqual({ id: 'user-1', name: 'Ada' });
  });

  it('returns undefined for a 204 response', async () => {
    server.use(
      http.delete(
        `${baseUrl}/user/user-1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    await expect(client.delete('/user/user-1')).resolves.toBeUndefined();
  });

  it('supports text and blob responses', async () => {
    server.use(
      http.get(`${baseUrl}/text`, () => HttpResponse.text('plain text')),
      http.get(
        `${baseUrl}/file`,
        () =>
          new HttpResponse('file content', {
            headers: { 'content-type': 'application/octet-stream' },
          }),
      ),
    );

    await expect(
      client.get<string>('/text', { responseType: 'text' }),
    ).resolves.toBe('plain text');

    const blob = await client.get<Blob>('/file', { responseType: 'blob' });
    expect(blob).toBeInstanceOf(Blob);
    await expect(blob.text()).resolves.toBe('file content');
  });

  it('distinguishes invalid JSON from a network failure', async () => {
    server.use(
      http.get(
        `${baseUrl}/invalid-json`,
        () =>
          new HttpResponse('{broken', {
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );

    await expect(client.get('/invalid-json')).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it('parses JSON with an incorrect content type and preserves plain-text errors', async () => {
    server.use(
      http.get(`${baseUrl}/mislabelled-json`, () =>
        HttpResponse.text('{"ok":true}'),
      ),
      http.get(`${baseUrl}/plain-error`, () =>
        HttpResponse.text('upstream unavailable', { status: 502 }),
      ),
    );

    await expect(client.get('/mislabelled-json')).resolves.toEqual({
      ok: true,
    });
    await expect(client.get('/plain-error')).rejects.toMatchObject({
      details: 'upstream unavailable',
      kind: 'http',
      retryable: true,
      status: 502,
    });
  });

  it('distinguishes timeout, caller abort, and network failure', async () => {
    server.use(
      http.get(`${baseUrl}/slow`, async () => {
        await delay(200);
        return HttpResponse.json({ ok: true });
      }),
      http.get(`${baseUrl}/network-error`, () => HttpResponse.error()),
    );

    await expect(client.get('/slow', { timeoutMs: 5 })).rejects.toMatchObject({
      kind: 'timeout',
      retryable: true,
    });

    const controller = new AbortController();
    const request = client.get('/slow', { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ kind: 'aborted' });

    await expect(client.get('/network-error')).rejects.toMatchObject({
      kind: 'network',
      retryable: true,
    });
  });

  it('normalizes backend messages, field errors, trace IDs, and HTTP status', async () => {
    server.use(
      http.post(`${baseUrl}/users`, () =>
        HttpResponse.json(
          {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: { email: ['Email is already registered'] },
          },
          { status: 400, headers: { 'x-request-id': 'trace-123' } },
        ),
      ),
    );

    const error = await client
      .post('/users', { body: { email: 'used@example.com' } })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({
      backendCode: 'VALIDATION_ERROR',
      kind: 'http',
      safeMessage: 'Validation failed',
      status: 400,
      traceId: 'trace-123',
    });
    expect(getFieldErrors(error)).toEqual({
      email: ['Email is already registered'],
    });
  });

  it('normalizes nested unauthorized errors', async () => {
    server.use(
      http.get(`${baseUrl}/private`, () =>
        HttpResponse.json(
          { error: { message: 'Unauthorized', code: 'AUTH_EXPIRED' } },
          { status: 401 },
        ),
      ),
    );

    const error = await client
      .get('/private')
      .catch((caught: unknown) => caught);
    expect(isUnauthorizedError(error)).toBe(true);
    expect(error).toMatchObject({ backendCode: 'AUTH_EXPIRED' });
  });

  it('sends JSON, FormData, query, CSRF, idempotency, and request metadata', async () => {
    const observations: string[] = [];
    const observedRequests: {
      body: unknown;
      header: string | null;
      query: string;
    }[] = [];
    const instrumentedClient = new ApiClient({
      baseUrl,
      getCsrfToken: () => 'csrf-token',
      onRequest: ({ metadata }) => {
        if (metadata?.operationName) observations.push(metadata.operationName);
      },
    });

    server.use(
      http.post(`${baseUrl}/observe`, async ({ request }) => {
        observedRequests.push({
          body: await request.json(),
          header: request.headers.get('idempotency-key'),
          query: new URL(request.url).search,
        });
        expect(request.headers.get('x-csrf-token')).toBe('csrf-token');
        return HttpResponse.json({ ok: true });
      }),
    );

    await instrumentedClient.post('/observe', {
      body: { value: 1 },
      idempotencyKey: 'idem-1',
      metadata: { operationName: 'create-observation' },
      query: { enabled: true, tags: ['one', 'two'] },
    });

    expect(observations).toEqual(['create-observation']);
    expect(observedRequests).toEqual([
      {
        body: { value: 1 },
        header: 'idem-1',
        query: '?enabled=true&tags=one&tags=two',
      },
    ]);

    let uploadedName = '';
    server.use(
      http.post(`${baseUrl}/upload`, async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name');
        if (typeof name === 'string') uploadedName = name;
        expect(request.headers.get('content-type')).toContain(
          'multipart/form-data',
        );
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const formData = new FormData();
    formData.set('name', 'Ada');
    await instrumentedClient.post('/upload', { body: formData });
    expect(uploadedName).toBe('Ada');
  });
});
