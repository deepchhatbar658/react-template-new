import { MutationObserver } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';

import { mockState } from '@/mocks/data/users';
import { server } from '@/mocks/server';
import { createQueryClient } from '@/shared/api/query-client';

import type { User } from './users.contracts';
import { userKeys } from './users.keys';
import {
  updateUserMutationOptions,
  userListQueryOptions,
} from './users.queries';

describe('users query contracts', () => {
  it('uses stable keys for semantically identical list parameters', () => {
    expect(userKeys.list({ page: 1, search: '  ada  ' })).toEqual(
      userKeys.list({ search: 'ada' }),
    );
  });

  it('fetches a paginated list through reusable query options', async () => {
    mockState.authenticated = true;
    const queryClient = createQueryClient();

    const result = await queryClient.fetchQuery(
      userListQueryOptions({ page: 2, pageSize: 2 }),
    );

    expect(result.data.map((user) => user.name)).toEqual([
      'Katherine Johnson',
      'Margaret Hamilton',
    ]);
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 2,
      total: 7,
      totalPages: 4,
    });
  });

  it('rolls back an optimistic detail update when the mutation fails', async () => {
    mockState.authenticated = true;
    const queryClient = createQueryClient();
    const user: User = {
      id: 'u1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2025-01-10T10:00:00.000Z',
    };
    queryClient.setQueryData(userKeys.detail(user.id), user);

    server.use(
      http.patch('/api/users/u1', async () => {
        await delay(200);
        return HttpResponse.json({ message: 'Update failed' }, { status: 503 });
      }),
    );

    const observer = new MutationObserver(
      queryClient,
      updateUserMutationOptions(queryClient),
    );
    const result = observer
      .mutate({ id: 'u1', input: { name: 'Temporary' } })
      .catch((error: unknown) => error);

    await vi.waitFor(() => {
      expect(queryClient.getQueryData<User>(userKeys.detail('u1'))?.name).toBe(
        'Temporary',
      );
    });
    await expect(result).resolves.toMatchObject({ status: 503 });
    expect(queryClient.getQueryData(userKeys.detail('u1'))).toEqual(user);
  });
});
