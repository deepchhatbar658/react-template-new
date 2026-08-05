import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { AsyncBoundary } from '@/shared/components/async-boundary/async-boundary';
import { EmptyState } from '@/shared/components/empty-state/empty-state';
import { PageLayout } from '@/shared/components/page-layout/page-layout';

import {
  type User,
  userRoleSchema,
  userStatusSchema,
} from '../api/users.contracts';
import {
  deleteUserMutationOptions,
  userDetailQueryOptions,
  userListQueryOptions,
} from '../api/users.queries';
import { UserDetail } from '../components/user-detail';
import { UserForm } from '../components/user-form';
import styles from '../components/users.module.css';

const readPage = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get('search') ?? '',
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | 'create' | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const roleResult = userRoleSchema.safeParse(searchParams.get('role'));
  const statusResult = userStatusSchema.safeParse(searchParams.get('status'));
  const params = {
    page: readPage(searchParams.get('page')),
    pageSize: 5,
    search: searchParams.get('search') ?? '',
    ...(roleResult.success ? { role: roleResult.data } : {}),
    ...(statusResult.success ? { status: statusResult.data } : {}),
  };
  const users = useQuery(userListQueryOptions(params));
  const deleteUser = useMutation(deleteUserMutationOptions(queryClient));

  const updateSearch = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const data = users.data?.data ?? [];
  const pagination = users.data?.pagination;

  return (
    <PageLayout
      title="Users"
      description="A complete server-state example: URL filters, cancellable queries, optimistic edits, and targeted invalidation."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditing('create');
          }}
        >
          Create user
        </button>
      }
    >
      <section className={styles.controls} aria-label="User filters">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateSearch({ page: '1', search: searchDraft });
          }}
        >
          <label htmlFor="user-search">Search users</label>
          <div className={styles.searchRow}>
            <input
              id="user-search"
              value={searchDraft}
              onChange={(event) => {
                setSearchDraft(event.target.value);
              }}
              placeholder="Name or email"
            />
            <button type="submit">Search</button>
          </div>
        </form>
        <label>
          Role
          <select
            aria-label="Filter by role"
            value={params.role ?? ''}
            onChange={(event) => {
              updateSearch({ page: '1', role: event.target.value });
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>
        <label>
          Status
          <select
            aria-label="Filter by status"
            value={params.status ?? ''}
            onChange={(event) => {
              updateSearch({ page: '1', status: event.target.value });
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </section>

      <div className={styles.workspace}>
        <section className={styles.ledger} aria-label="User list">
          <AsyncBoundary
            error={users.error}
            hasData={Boolean(users.data)}
            isEmpty={!users.isPending && data.length === 0}
            isFetching={users.isFetching && !users.isPending}
            isPending={users.isPending}
            onRetry={() => void users.refetch()}
            empty={
              <EmptyState
                title="No users match"
                message="Clear a filter or search for another name."
              />
            }
          >
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>
                      <span className={styles.srOnly}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((user) => (
                    <tr key={user.id}>
                      <td data-label="User">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </td>
                      <td data-label="Role">{user.role}</td>
                      <td data-label="Status">
                        <span
                          className={`${styles.status} ${styles[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className={styles.rowActions}>
                          <button
                            className={styles.textButton}
                            type="button"
                            onFocus={() =>
                              void queryClient.prefetchQuery(
                                userDetailQueryOptions(user.id),
                              )
                            }
                            onMouseEnter={() =>
                              void queryClient.prefetchQuery(
                                userDetailQueryOptions(user.id),
                              )
                            }
                            onClick={() => {
                              setSelectedId(user.id);
                              setEditing(null);
                            }}
                          >
                            View
                          </button>
                          <button
                            className={styles.textButton}
                            type="button"
                            onClick={() => {
                              setEditing(user);
                              setSelectedId(user.id);
                            }}
                          >
                            Edit
                          </button>
                          {confirmingDelete === user.id ? (
                            <>
                              <button
                                className={styles.dangerButton}
                                type="button"
                                disabled={deleteUser.isPending}
                                onClick={() => {
                                  deleteUser.mutate(user.id, {
                                    onSuccess: () => {
                                      setConfirmingDelete(null);
                                      if (selectedId === user.id)
                                        setSelectedId(null);
                                    },
                                  });
                                }}
                              >
                                Confirm delete
                              </button>
                              <button
                                className={styles.textButton}
                                type="button"
                                onClick={() => {
                                  setConfirmingDelete(null);
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.textButton}
                              type="button"
                              onClick={() => {
                                setConfirmingDelete(user.id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination ? (
              <nav className={styles.pagination} aria-label="User pages">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || users.isPlaceholderData}
                  onClick={() => {
                    updateSearch({ page: String(pagination.page - 1) });
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                </span>
                <button
                  type="button"
                  disabled={
                    pagination.page >= pagination.totalPages ||
                    users.isPlaceholderData
                  }
                  onClick={() => {
                    updateSearch({ page: String(pagination.page + 1) });
                  }}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </AsyncBoundary>
        </section>

        {editing ? (
          <aside className={styles.detail}>
            <UserForm
              user={editing === 'create' ? undefined : editing}
              onCancel={() => {
                setEditing(null);
              }}
              onSuccess={(user) => {
                setEditing(null);
                setSelectedId(user.id);
              }}
            />
          </aside>
        ) : selectedId ? (
          <UserDetail
            id={selectedId}
            onClose={() => {
              setSelectedId(null);
            }}
            onEdit={(user) => {
              setEditing(user);
            }}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
