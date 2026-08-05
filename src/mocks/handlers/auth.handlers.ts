import { http, HttpResponse } from 'msw';

import { mockState } from '../data/users';

const demoUser = {
  id: 'session-user',
  email: 'demo@example.com',
  name: 'Demo Operator',
};

export const authHandlers = [
  http.get('/api/auth/me', () =>
    mockState.authenticated
      ? HttpResponse.json(demoUser)
      : HttpResponse.json(
          { error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } },
          { status: 401 },
        ),
  ),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as unknown;
    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('password' in body) ||
      body.email !== 'demo@example.com' ||
      body.password !== 'password123'
    ) {
      return HttpResponse.json(
        {
          message: 'Sign-in failed',
          code: 'INVALID_CREDENTIALS',
          errors: { email: ['Use the demo account shown below.'] },
        },
        { status: 400 },
      );
    }
    mockState.authenticated = true;
    mockState.refreshValid = true;
    return HttpResponse.json({ user: demoUser });
  }),

  http.post('/api/auth/logout', () => {
    mockState.authenticated = false;
    mockState.refreshValid = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/auth/refresh', () => {
    if (!mockState.refreshValid) {
      return HttpResponse.json(
        { error: { message: 'Session expired', code: 'REFRESH_EXPIRED' } },
        { status: 401 },
      );
    }
    mockState.authenticated = true;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/test/expire-session', () => {
    mockState.authenticated = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/test/revoke-session', () => {
    mockState.authenticated = false;
    mockState.refreshValid = false;
    return new HttpResponse(null, { status: 204 });
  }),
];
