import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { onAuthExpired } from '@/shared/api/auth-refresh';
import { queryClient } from '@/shared/api/query-client';

function PrivateCacheCleaner() {
  useEffect(
    () =>
      onAuthExpired(() => {
        queryClient.removeQueries({
          predicate: (query) => query.meta?.private === true,
        });
      }),
    [],
  );
  return null;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivateCacheCleaner />
      {children}
    </QueryClientProvider>
  );
}
