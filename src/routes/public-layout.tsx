import { Outlet } from 'react-router';

import styles from './routes.module.css';

export function PublicLayout() {
  return (
    <main className={styles.publicShell}>
      <div className={styles.brandMark} aria-hidden="true">
        A
      </div>
      <Outlet />
    </main>
  );
}
