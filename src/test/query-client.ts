import { createQueryClient } from '@/shared/api/query-client';

export const createTestQueryClient = () => {
  const client = createQueryClient();
  client.setDefaultOptions({
    queries: { retry: false },
    mutations: { retry: false },
  });
  return client;
};
