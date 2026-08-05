import { delay, http, HttpResponse } from 'msw';

import type { UserFormInput } from '@/features/users/api/users.contracts';

import { mockState, type MockUserDto } from '../data/users';

const unauthorized = () =>
  HttpResponse.json(
    { error: { message: 'Unauthorized', code: 'AUTH_EXPIRED' } },
    { status: 401 },
  );

const readFormInput = async (
  request: Request,
): Promise<UserFormInput | null> => {
  const body = (await request.json()) as unknown;
  if (typeof body !== 'object' || body === null) return null;
  if (
    !('name' in body) ||
    !('email' in body) ||
    !('role' in body) ||
    !('status' in body)
  )
    return null;
  if (typeof body.name !== 'string' || typeof body.email !== 'string')
    return null;
  if (body.role !== 'admin' && body.role !== 'member' && body.role !== 'viewer')
    return null;
  if (
    body.status !== 'active' &&
    body.status !== 'invited' &&
    body.status !== 'suspended'
  )
    return null;
  return {
    name: body.name,
    email: body.email,
    role: body.role,
    status: body.status,
  };
};

export const usersHandlers = [
  http.get('/api/users', async ({ request }) => {
    if (!mockState.authenticated) return unauthorized();
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 5));

    if (search === 'server-error') {
      const failures = mockState.searchFailures.get(search) ?? 0;
      mockState.searchFailures.set(search, failures + 1);
      if (failures < 3) {
        await delay(30);
        return HttpResponse.json(
          { message: 'Simulated service failure' },
          { status: 503 },
        );
      }
    }

    await delay(search ? 80 : 20);
    const filtered = mockState.users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);
      return (
        matchesSearch &&
        (!role || user.role === role) &&
        (!status || user.status === status)
      );
    });
    const totalPages = Math.ceil(filtered.length / pageSize);
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      data: filtered.slice(start, start + pageSize),
      pagination: { page, pageSize, total: filtered.length, totalPages },
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    if (!mockState.authenticated) return unauthorized();
    const user = mockState.users.find(
      (candidate) => candidate.id === params.id,
    );
    return user
      ? HttpResponse.json(user)
      : HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),

  http.post('/api/users', async ({ request }) => {
    if (!mockState.authenticated) return unauthorized();
    const input = await readFormInput(request);
    if (!input)
      return HttpResponse.json({ message: 'Invalid user' }, { status: 400 });
    if (mockState.users.some((user) => user.email === input.email)) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: { email: ['Email is already registered'] },
        },
        { status: 400 },
      );
    }
    const user: MockUserDto = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockState.users.unshift(user);
    return HttpResponse.json(user, { status: 201 });
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    if (!mockState.authenticated) return unauthorized();
    const index = mockState.users.findIndex(
      (candidate) => candidate.id === params.id,
    );
    const existing = mockState.users[index];
    if (!existing)
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    const patch = (await request.json()) as Partial<UserFormInput>;
    const updated: MockUserDto = { ...existing, ...patch };
    mockState.users[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete('/api/users/:id', ({ params }) => {
    if (!mockState.authenticated) return unauthorized();
    const before = mockState.users.length;
    mockState.users = mockState.users.filter((user) => user.id !== params.id);
    return mockState.users.length < before
      ? new HttpResponse(null, { status: 204 })
      : HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),
];
