import { useNavigate, useSearchParams } from 'react-router';

import { LoginForm } from '../components/login-form';
import styles from './login-page.module.css';

const safeRedirect = (value: string | null): string =>
  value?.startsWith('/') && !value.startsWith('//') ? value : '/users';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = safeRedirect(searchParams.get('redirectTo'));

  return (
    <section className={styles.card} aria-labelledby="login-title">
      <p className="eyebrow">Secure workspace</p>
      <h1 id="login-title">Welcome back</h1>
      <p className={styles.intro}>
        Sign in to manage users and inspect real network behavior.
      </p>
      <LoginForm
        onSuccess={() => void navigate(destination, { replace: true })}
      />
    </section>
  );
}
