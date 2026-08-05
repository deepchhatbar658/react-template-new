import { QueryClient } from '@tanstack/react-query';

import { retryDelay, shouldRetryQuery } from './retry-policy';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 30 * 60 * 1000,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        retry: shouldRetryQuery,
        retryDelay,
        staleTime: 30 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const queryClient = createQueryClient();
