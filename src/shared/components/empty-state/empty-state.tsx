import styles from '../status-states.module.css';

export function EmptyState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <section className={styles.empty}>
      <strong>{title}</strong>
      <p>{message}</p>
    </section>
  );
}
