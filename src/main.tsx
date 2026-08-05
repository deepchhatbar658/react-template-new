import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { env } from '@/app/config/env';
import { AppProvider } from '@/app/providers/app-provider';
import { configureApiClient } from '@/shared/api/api-client';

import '@/app/styles/globals.css';

configureApiClient({ baseUrl: env.apiUrl });

const enableMocking = async (): Promise<void> => {
  if (!env.enableMsw) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};

const start = async (): Promise<void> => {
  await enableMocking();
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
