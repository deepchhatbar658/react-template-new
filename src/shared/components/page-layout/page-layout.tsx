import type { ReactNode } from 'react';

import styles from './page-layout.module.css';

export function PageLayout({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
