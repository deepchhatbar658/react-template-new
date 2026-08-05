import {
  mutationOptions,
  queryOptions,
  type QueryClient,
} from '@tanstack/react-query';

import { authApi } from './auth.api';
import type { AuthUser, LoginInput } from './auth.contracts';
import { authKeys } from './auth.keys';

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => authApi.getMe({ signal }),
    retry: false,
    staleTime: 60_000,
    meta: { private: true },
  });

export const loginMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData<AuthUser>(authKeys.me(), user);
    },
  });

export const logoutMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
