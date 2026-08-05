import {
  keepPreviousData,
  mutationOptions,
  queryOptions,
  type QueryClient,
} from '@tanstack/react-query';

import { usersApi } from './users.api';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListParams,
} from './users.contracts';
import { userKeys } from './users.keys';

export const userListQueryOptions = (params: UserListParams) =>
  queryOptions({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => usersApi.getUsers(params, { signal }),
    placeholderData: keepPreviousData,
    meta: { private: true },
  });

export const userDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => usersApi.getUser(id, { signal }),
    meta: { private: true },
  });

export const createUserMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (variables: {
      idempotencyKey: string;
      input: CreateUserInput;
    }) => usersApi.createUser(variables.input, variables),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      return queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

export const updateUserMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (variables: { id: string; input: UpdateUserInput }) =>
      usersApi.updateUser(variables.id, variables.input),
    onMutate: async (variables) => {
      const key = userKeys.detail(variables.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<User>(key);
      if (previous) {
        queryClient.setQueryData<User>(key, {
          ...previous,
          ...variables.input,
        });
      }
      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          userKeys.detail(variables.id),
          context.previous,
        );
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });

export const deleteUserMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
