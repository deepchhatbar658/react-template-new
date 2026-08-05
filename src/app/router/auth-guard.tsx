import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { currentUserQueryOptions } from '@/features/auth/api/auth.queries';
import { isUnauthorizedError } from '@/shared/api/api-error';
import { onAuthExpired } from '@/shared/api/auth-refresh';
import { ErrorState } from '@/shared/components/error-state/error-state';
import { LoadingState } from '@/shared/components/loading-state/loading-state';

import { routePaths } from './route-paths';

export function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [expired, setExpired] = useState(false);
  const session = useQuery(currentUserQueryOptions());

  useEffect(
    () =>
      onAuthExpired(() => {
        setExpired(true);
      }),
    [],
  );

  if (expired || (session.isError && isUnauthorizedError(session.error))) {
    const redirectTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        replace
        to={`${routePaths.login}?redirectTo=${encodeURIComponent(redirectTo)}`}
      />
    );
  }

  if (session.isPending) {
    return <LoadingState label="Checking your session…" />;
  }

  if (session.isError) {
    return (
      <ErrorState
        error={session.error}
        title="We could not verify your session"
        onRetry={() => void session.refetch()}
      />
    );
  }

  return children;
}
