import type { UserFormInput } from '@/features/users/api/users.contracts';

export interface MockUserDto extends UserFormInput {
  created_at: string;
  id: string;
}

const initialUsers: MockUserDto[] = [
  {
    id: 'u1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    role: 'member',
    status: 'active',
    created_at: '2025-02-11T10:00:00.000Z',
  },
  {
    id: 'u3',
    name: 'Katherine Johnson',
    email: 'katherine@example.com',
    role: 'member',
    status: 'invited',
    created_at: '2025-03-12T10:00:00.000Z',
  },
  {
    id: 'u4',
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2025-04-13T10:00:00.000Z',
  },
  {
    id: 'u5',
    name: 'Dorothy Vaughan',
    email: 'dorothy@example.com',
    role: 'viewer',
    status: 'suspended',
    created_at: '2025-05-14T10:00:00.000Z',
  },
  {
    id: 'u6',
    name: 'Mary Jackson',
    email: 'mary@example.com',
    role: 'member',
    status: 'active',
    created_at: '2025-06-15T10:00:00.000Z',
  },
  {
    id: 'u7',
    name: 'Annie Easley',
    email: 'annie@example.com',
    role: 'viewer',
    status: 'active',
    created_at: '2025-07-16T10:00:00.000Z',
  },
];

export const mockState = {
  authenticated: false,
  refreshValid: false,
  users: structuredClone(initialUsers),
  searchFailures: new Map<string, number>(),
};

export const resetMockData = (): void => {
  mockState.authenticated = false;
  mockState.refreshValid = false;
  mockState.users = structuredClone(initialUsers);
  mockState.searchFailures.clear();
};
