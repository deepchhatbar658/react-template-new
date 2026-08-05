import { useQuery } from '@tanstack/react-query';
import type { Ref } from 'react';

import { ErrorState } from '@/shared/components/error-state/error-state';
import { LoadingState } from '@/shared/components/loading-state/loading-state';

import type { User } from '../api/users.contracts';
import { userDetailQueryOptions } from '../api/users.queries';
import styles from './users.module.css';

export function UserDetail({
  id,
  onClose,
  onEdit,
  panelRef,
}: {
  id: string;
  onClose: () => void;
  onEdit: (user: User) => void;
  panelRef: Ref<HTMLElement>;
}) {
  const query = useQuery(userDetailQueryOptions(id));
  if (query.isPending)
    return (
      <aside
        ref={panelRef}
        className={styles.detail}
        aria-label="User detail"
        tabIndex={-1}
      >
        <LoadingState label="Loading user…" />
      </aside>
    );
  if (query.isError)
    return (
      <aside
        ref={panelRef}
        className={styles.detail}
        aria-label="User detail"
        tabIndex={-1}
      >
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </aside>
    );
  const user = query.data;
  return (
    <aside
      ref={panelRef}
      className={styles.detail}
      aria-label="User detail"
      tabIndex={-1}
    >
      <div className={styles.formHeading}>
        <div>
          <p className="eyebrow">User detail</p>
          <h2>{user.name}</h2>
        </div>
        <button className={styles.ghostButton} type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <dl>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{user.status}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => {
          onEdit(user);
        }}
      >
        Edit user
      </button>
    </aside>
  );
}
