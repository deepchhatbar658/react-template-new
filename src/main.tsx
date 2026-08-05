import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { env, startDevelopmentMocks } from '@/app/config/env';
import { AppProvider } from '@/app/providers/app-provider';
import { authApi } from '@/features/auth/api/auth.api';
import { configureApiClient } from '@/shared/api/api-client';
import { createAuthRefreshCoordinator } from '@/shared/api/auth-refresh';

import '@/app/styles/globals.css';

configureApiClient({
  authRefresh: createAuthRefreshCoordinator({
    refresh: () => authApi.refresh(),
  }),
  baseUrl: env.apiUrl,
});

const start = async (): Promise<void> => {
  await startDevelopmentMocks();
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root application element.');

  createRoot(root).render(
    <StrictMode>
      <AppProvider />
    </StrictMode>,
  );
};

start().catch((error: unknown) => {
  console.error('Application startup failed', error);
  const root = document.getElementById('root');
  if (root)
    root.textContent =
      'Application startup failed. Check the console for details.';
});
