import { useEffect, useState } from 'react';

import styles from '../status-states.module.css';

export function LoadingState({
  label,
  delayed = false,
}: {
  label: string;
  delayed?: boolean;
}) {
  const [visible, setVisible] = useState(!delayed);

  useEffect(() => {
    if (!delayed) return;
    const id = window.setTimeout(() => {
      setVisible(true);
    }, 180);
    return () => {
      window.clearTimeout(id);
    };
  }, [delayed]);

  if (!visible) return null;
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
