import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';
import { renderApp } from '@/test/render';

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('maps backend validation errors to accessible fields', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json(
          {
            message: 'Validation failed',
            errors: { email: ['This account is locked.'] },
          },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderApp(<LoginForm onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('This account is locked.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
