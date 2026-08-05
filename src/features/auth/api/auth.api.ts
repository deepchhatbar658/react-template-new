import { apiClient } from '@/shared/api/api-client';

import {
  authUserSchema,
  type AuthUser,
  type LoginInput,
  loginResponseSchema,
  type LoginResponse,
} from './auth.contracts';

export const authApi = {
  getMe(options: { signal?: AbortSignal } = {}): Promise<AuthUser> {
    return apiClient.get('/auth/me', {
      ...(options.signal ? { signal: options.signal } : {}),
      metadata: { operationName: 'get-current-user', private: true },
      responseSchema: authUserSchema,
    });
  },

  login(input: LoginInput): Promise<LoginResponse> {
    return apiClient.post('/auth/login', {
      body: input,
      metadata: { operationName: 'login', skipAuthRefresh: true },
      responseSchema: loginResponseSchema,
    });
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {
      metadata: { operationName: 'logout', private: true },
    });
  },

  async refresh(): Promise<void> {
    await apiClient.post('/auth/refresh', {
      metadata: { operationName: 'refresh-session', skipAuthRefresh: true },
    });
  },
};
