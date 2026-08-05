import { Navigate, createBrowserRouter } from 'react-router';

import { RouteErrorBoundary } from '../errors/route-error-boundary';
import { AuthGuard } from './auth-guard';
import { NotFoundRoute } from '@/routes/not-found-route';
import { ProtectedLayout } from '@/routes/protected-layout';
import { PublicLayout } from '@/routes/public-layout';
import { RootLayout } from '@/routes/root-layout';

import { routePaths } from './route-paths';

export const router = createBrowserRouter([
  {
    path: routePaths.home,
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, element: <Navigate replace to={routePaths.users} /> },
      {
        Component: PublicLayout,
        children: [
          {
            path: routePaths.login,
            lazy: () => import('@/routes/login-route'),
          },
        ],
      },
      {
        element: (
          <AuthGuard>
            <ProtectedLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: routePaths.users,
            lazy: () => import('@/routes/users-route'),
          },
        ],
      },
      { path: '*', Component: NotFoundRoute },
    ],
  },
]);
