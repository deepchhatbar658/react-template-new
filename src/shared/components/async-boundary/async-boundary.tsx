import type { ReactNode } from 'react';

import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';
import { LoadingState } from '../loading-state/loading-state';
import styles from '../status-states.module.css';

export function AsyncBoundary({
  children,
  empty,
  error,
  hasData,
  isEmpty,
  isFetching,
  isPending,
  onRetry,
}: {
  children: ReactNode;
  empty?: ReactNode;
  error: unknown;
  hasData: boolean;
  isEmpty: boolean;
  isFetching: boolean;
  isPending: boolean;
  onRetry: () => void;
}) {
  if (isPending) return <LoadingState label="Loading data…" />;
  if (error && !hasData) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty)
    return (
      empty ?? (
        <EmptyState
          title="No results"
          message="Try changing the current filters."
        />
      )
    );
  return (
    <>
      {isFetching ? (
        <p className={styles.background} role="status">
          Refreshing data…
        </p>
      ) : null}
      {error ? (
        <p className={styles.backgroundError} role="status">
          Refresh failed. Showing the last successful data.
        </p>
      ) : null}
      {children}
    </>
  );
}
