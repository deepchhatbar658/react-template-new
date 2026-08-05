import { getErrorMessage } from '@/shared/api/api-error';

import styles from '../status-states.module.css';

export function ErrorState({
  error,
  onRetry,
  title = 'We could not load this content',
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <section className={styles.error} role="alert">
      <strong>{title}</strong>
      <p>{getErrorMessage(error)}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </section>
  );
}
