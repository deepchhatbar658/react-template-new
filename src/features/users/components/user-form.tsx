import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { getErrorMessage, getFieldErrors } from '@/shared/api/api-error';

import {
  type User,
  type UserFormInput,
  userFormSchema,
} from '../api/users.contracts';
import {
  createUserMutationOptions,
  updateUserMutationOptions,
} from '../api/users.queries';
import styles from './users.module.css';

const defaults: UserFormInput = {
  email: '',
  name: '',
  role: 'member',
  status: 'active',
};

export function UserForm({
  onCancel,
  onSuccess,
  user,
}: {
  onCancel: () => void;
  onSuccess: (user: User) => void;
  user: User | undefined;
}) {
  const queryClient = useQueryClient();
  const createUser = useMutation(createUserMutationOptions(queryClient));
  const updateUser = useMutation(updateUserMutationOptions(queryClient));
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ?? defaults,
  });

  useEffect(() => {
    reset(user ?? defaults);
  }, [reset, user]);

  const pending = isSubmitting || createUser.isPending || updateUser.isPending;
  const paused = createUser.isPaused || updateUser.isPaused;

  const submit = handleSubmit(async (input) => {
    try {
      const saved = user
        ? await updateUser.mutateAsync({ id: user.id, input })
        : await createUser.mutateAsync({
            input,
            idempotencyKey: crypto.randomUUID(),
          });
      if (!user) reset(defaults);
      onSuccess(saved);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      for (const field of ['email', 'name', 'role', 'status'] as const) {
        const message = fieldErrors?.[field]?.[0];
        if (message) setError(field, { message, type: 'server' });
      }
      setError('root.server', {
        message: getErrorMessage(error),
        type: 'server',
      });
    }
  });

  return (
    <form
      className={styles.userForm}
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      <div className={styles.formHeading}>
        <div>
          <p className="eyebrow">{user ? 'Edit record' : 'New record'}</p>
          <h2>{user ? user.name : 'Create user'}</h2>
        </div>
        <button className={styles.ghostButton} type="button" onClick={onCancel}>
          Close
        </button>
      </div>
      <FormField id="user-name" label="Name" error={errors.name?.message}>
        <input
          id="user-name"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
      </FormField>
      <FormField id="user-email" label="Email" error={errors.email?.message}>
        <input
          id="user-email"
          type="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>
      <div className={styles.formRow}>
        <FormField id="user-role" label="Role" error={errors.role?.message}>
          <select id="user-role" {...register('role')}>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </FormField>
        <FormField
          id="user-status"
          label="Status"
          error={errors.status?.message}
        >
          <select id="user-status" {...register('status')}>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
        </FormField>
      </div>
      {errors.root?.server ? (
        <p className={styles.formError} role="alert">
          {errors.root.server.message}
        </p>
      ) : null}
      {paused ? (
        <p role="status">This change is paused until the network reconnects.</p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : user ? 'Save changes' : 'Create user'}
      </button>
    </form>
  );
}

function FormField({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error: string | undefined;
  id: string;
  label: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}
