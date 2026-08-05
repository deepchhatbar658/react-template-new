import { delay, http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';

import { createAuthRefreshCoordinator } from './auth-refresh';
import { ApiClient } from './api-client';

const baseUrl = 'http://localhost/api';

describe('authentication refresh coordination', () => {
  it('refreshes once for five simultaneous unauthorized requests', async () => {
    let authenticated = false;
    let protectedRequests = 0;
    let refreshRequests = 0;
    const client = new ApiClient({ baseUrl });
    client.setAuthRefresh(
      createAuthRefreshCoordinator({
        refresh: async () => {
          await client.post('/auth/refresh', {
            metadata: { skipAuthRefresh: true },
          });
        },
      }),
    );

    server.use(
      http.get(`${baseUrl}/private`, () => {
        protectedRequests += 1;
        return authenticated
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post(`${baseUrl}/auth/refresh`, async () => {
        refreshRequests += 1;
        await delay(20);
        authenticated = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const results = await Promise.all(
      Array.from({ length: 5 }, () => client.get('/private')),
    );

    expect(results).toEqual(Array.from({ length: 5 }, () => ({ ok: true })));
    expect(refreshRequests).toBe(1);
    expect(protectedRequests).toBe(10);
  });

  it('emits auth expired once when refresh fails', async () => {
    let expiredEvents = 0;
    const client = new ApiClient({ baseUrl });
    client.setAuthRefresh(
      createAuthRefreshCoordinator({
        onExpired: () => {
          expiredEvents += 1;
        },
        refresh: async () => {
          await client.post('/auth/refresh', {
            metadata: { skipAuthRefresh: true },
          });
        },
      }),
    );

    server.use(
      http.get(`${baseUrl}/private`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
      http.post(`${baseUrl}/auth/refresh`, () =>
        HttpResponse.json({ message: 'Refresh expired' }, { status: 401 }),
      ),
    );

    const results = await Promise.allSettled([
      client.get('/private'),
      client.get('/private'),
      client.get('/private'),
    ]);

    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(expiredEvents).toBe(1);
  });

  it('retries an original request at most once', async () => {
    let protectedRequests = 0;
    let refreshRequests = 0;
    const client = new ApiClient({ baseUrl });
    client.setAuthRefresh(
      createAuthRefreshCoordinator({
        refresh: () => {
          refreshRequests += 1;
          return Promise.resolve();
        },
      }),
    );

    server.use(
      http.get(`${baseUrl}/private`, () => {
        protectedRequests += 1;
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
    );

    await expect(client.get('/private')).rejects.toMatchObject({ status: 401 });
    expect(refreshRequests).toBe(1);
    expect(protectedRequests).toBe(2);
  });
});
