import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import styles from '../status-states.module.css';

export function NetworkStatusBanner() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const [online, setOnline] = useState(() => navigator.onLine);
  const active = fetching + mutating > 0;

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!online) {
    return (
      <div className={styles.offline} role="status">
        You are offline. Changes will pause until the connection returns.
      </div>
    );
  }
  if (!active) return null;
  return <DelayedActivity />;
}

function DelayedActivity() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVisible(true);
    }, 250);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  if (!visible) return null;
  return (
    <div className={styles.activity} role="status">
      Syncing with the service…
    </div>
  );
}
