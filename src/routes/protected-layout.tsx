import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router';

import { logoutMutationOptions } from '@/features/auth/api/auth.queries';
import styles from './routes.module.css';

export function ProtectedLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useMutation(logoutMutationOptions(queryClient));

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.wordmark}>
          <span aria-hidden="true">A</span>
          <strong>Atlas</strong>
        </div>
        <nav aria-label="Primary navigation">
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Users
          </NavLink>
        </nav>
        <button
          className={styles.logout}
          type="button"
          disabled={logout.isPending}
          onClick={() => {
            logout.mutate(undefined, {
              onSuccess: () => void navigate('/login', { replace: true }),
            });
          }}
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
