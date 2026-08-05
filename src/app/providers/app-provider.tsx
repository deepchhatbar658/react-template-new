import { AppErrorBoundary } from '../errors/app-error-boundary';
import { QueryProvider } from './query-provider';
import { RouterProvider } from './router-provider';

export function AppProvider() {
  return (
    <AppErrorBoundary>
      <QueryProvider>
        <RouterProvider />
      </QueryProvider>
    </AppErrorBoundary>
  );
}
