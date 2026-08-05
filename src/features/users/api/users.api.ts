import { apiClient } from '@/shared/api/api-client';

import {
  type CreateUserInput,
  normalizeUserListParams,
  type UpdateUserInput,
  type User,
  type UserListParams,
  type UserListResponse,
  userListResponseSchema,
  userSchema,
} from './users.contracts';

interface RequestSignalOptions {
  signal?: AbortSignal;
}

export const usersApi = {
  getUsers(
    params: UserListParams,
    options: RequestSignalOptions = {},
  ): Promise<UserListResponse> {
    const normalized = normalizeUserListParams(params);
    return apiClient.get('/users', {
      ...(options.signal ? { signal: options.signal } : {}),
      metadata: { operationName: 'list-users', private: true },
      query: {
        page: normalized.page,
        pageSize: normalized.pageSize,
        role: normalized.role,
        search: normalized.search,
        status: normalized.status,
      },
      responseSchema: userListResponseSchema,
    });
  },

  getUser(id: string, options: RequestSignalOptions = {}): Promise<User> {
    return apiClient.get(`/users/${encodeURIComponent(id)}`, {
      ...(options.signal ? { signal: options.signal } : {}),
      metadata: { operationName: 'get-user', private: true },
      responseSchema: userSchema,
    });
  },

  createUser(
    input: CreateUserInput,
    options: { idempotencyKey: string },
  ): Promise<User> {
    return apiClient.post('/users', {
      body: input,
      idempotencyKey: options.idempotencyKey,
      metadata: { operationName: 'create-user', private: true },
      responseSchema: userSchema,
    });
  },

  updateUser(id: string, input: UpdateUserInput): Promise<User> {
    return apiClient.patch(`/users/${encodeURIComponent(id)}`, {
      body: input,
      metadata: { operationName: 'update-user', private: true },
      responseSchema: userSchema,
    });
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${encodeURIComponent(id)}`, {
      metadata: { operationName: 'delete-user', private: true },
    });
  },
};
