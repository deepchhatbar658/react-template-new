import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { getErrorMessage } from '@/shared/api/api-error';
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
  const [mutationNotice, setMutationNotice] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const confirmDeleteRef = useRef<HTMLButtonElement>(null);
  const ledgerRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (editing || selectedId) panelRef.current?.focus();
  }, [editing, selectedId]);

  useEffect(() => {
    if (confirmingDelete) confirmDeleteRef.current?.focus();
  }, [confirmingDelete]);

  const restorePanelTrigger = () => {
    globalThis.setTimeout(() => returnFocusRef.current?.focus(), 0);
  };

  const closePanel = () => {
    setEditing(null);
    setSelectedId(null);
    restorePanelTrigger();
  };

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
          onClick={(event) => {
            returnFocusRef.current = event.currentTarget;
            setEditing('create');
            setSelectedId(null);
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
        <section
          ref={ledgerRef}
          className={styles.ledger}
          aria-label="User list"
          tabIndex={-1}
        >
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
                            onClick={(event) => {
                              returnFocusRef.current = event.currentTarget;
                              setSelectedId(user.id);
                              setEditing(null);
                            }}
                          >
                            View
                          </button>
                          <button
                            className={styles.textButton}
                            type="button"
                            onClick={(event) => {
                              returnFocusRef.current = event.currentTarget;
                              setEditing(user);
                              setSelectedId(user.id);
                            }}
                          >
                            Edit
                          </button>
                          {confirmingDelete === user.id ? (
                            <>
                              <button
                                ref={confirmDeleteRef}
                                className={styles.dangerButton}
                                type="button"
                                disabled={deleteUser.isPending}
                                onClick={() => {
                                  deleteUser.mutate(user.id, {
                                    onSuccess: () => {
                                      setConfirmingDelete(null);
                                      setMutationNotice(
                                        `${user.name} was deleted.`,
                                      );
                                      if (selectedId === user.id)
                                        setSelectedId(null);
                                      globalThis.setTimeout(
                                        () => ledgerRef.current?.focus(),
                                        0,
                                      );
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
                                  deleteUser.reset();
                                  globalThis.setTimeout(
                                    () => deleteTriggerRef.current?.focus(),
                                    0,
                                  );
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.textButton}
                              type="button"
                              onClick={(event) => {
                                deleteTriggerRef.current = event.currentTarget;
                                deleteUser.reset();
                                setMutationNotice(null);
                                setConfirmingDelete(user.id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                          {confirmingDelete === user.id &&
                          deleteUser.isError ? (
                            <p className={styles.mutationMessage} role="alert">
                              {getErrorMessage(deleteUser.error)} Confirm to try
                              again.
                            </p>
                          ) : null}
                          {confirmingDelete === user.id &&
                          deleteUser.isPaused ? (
                            <p className={styles.mutationMessage} role="status">
                              Delete is paused until the network reconnects.
                            </p>
                          ) : null}
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
            {mutationNotice ? (
              <p className={styles.srOnly} role="status">
                {mutationNotice}
              </p>
            ) : null}
          </AsyncBoundary>
        </section>

        {editing ? (
          <aside
            ref={panelRef}
            className={styles.detail}
            aria-label={editing === 'create' ? 'Create user' : 'Edit user'}
            tabIndex={-1}
          >
            <UserForm
              user={editing === 'create' ? undefined : editing}
              onCancel={closePanel}
              onSuccess={(user) => {
                setEditing(null);
                setSelectedId(user.id);
              }}
            />
          </aside>
        ) : selectedId ? (
          <UserDetail
            id={selectedId}
            panelRef={panelRef}
            onClose={closePanel}
            onEdit={(user) => {
              setEditing(user);
            }}
          />
        ) : null}
      </div>
    </PageLayout>
  );
}
