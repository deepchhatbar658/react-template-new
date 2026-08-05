import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';

import { renderApp } from '@/test/render';

import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  it('redirects an unauthenticated user and preserves the requested location', async () => {
    renderApp(
      <Routes>
        <Route
          path="/users"
          element={
            <AuthGuard>
              <div>Private users</div>
            </AuthGuard>
          }
        />
        <Route path="/login" element={<div>Login destination</div>} />
      </Routes>,
      { route: '/users?role=admin' },
    );

    expect(await screen.findByText('Login destination')).toBeInTheDocument();
    expect(screen.queryByText('Private users')).not.toBeInTheDocument();
  });
});
