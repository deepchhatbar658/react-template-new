import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { getErrorMessage, getFieldErrors } from '@/shared/api/api-error';

import { loginInputSchema, type LoginInput } from '../api/auth.contracts';
import { loginMutationOptions } from '../api/auth.queries';
import styles from './login-form.module.css';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const login = useMutation(loginMutationOptions(queryClient));
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: { email: 'demo@example.com', password: 'password123' },
    resolver: zodResolver(loginInputSchema),
  });

  const submit = handleSubmit(async (input) => {
    try {
      await login.mutateAsync(input);
      onSuccess();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors?.email?.[0]) {
        setError('email', { message: fieldErrors.email[0], type: 'server' });
      }
      if (fieldErrors?.password?.[0]) {
        setError('password', {
          message: fieldErrors.password[0],
          type: 'server',
        });
      }
      setError('root.server', {
        message: getErrorMessage(error),
        type: 'server',
      });
    }
  });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      <div className={styles.field}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="login-email-error">{errors.email.message}</p>
        ) : null}
      </div>
      <div className={styles.field}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
          {...register('password')}
        />
        {errors.password ? (
          <p id="login-password-error">{errors.password.message}</p>
        ) : null}
      </div>
      {errors.root?.server ? (
        <p className={styles.formError} role="alert">
          {errors.root.server.message}
        </p>
      ) : null}
      <button type="submit" disabled={isSubmitting || login.isPending}>
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>
      <p className={styles.demoNote}>
        Mock account: <strong>demo@example.com</strong> /{' '}
        <strong>password123</strong>
      </p>
    </form>
  );
}
