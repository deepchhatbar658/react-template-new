import {
  normalizeUserListParams,
  type UserListParams,
} from './users.contracts';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) =>
    [...userKeys.lists(), normalizeUserListParams(params)] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
