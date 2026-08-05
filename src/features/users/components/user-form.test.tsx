import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockState } from '@/mocks/data/users';
import { renderApp } from '@/test/render';

import { UserForm } from './user-form';

describe('UserForm', () => {
  it('shows backend field errors returned by a create mutation', async () => {
    mockState.authenticated = true;
    const user = userEvent.setup();
    renderApp(
      <UserForm user={undefined} onCancel={vi.fn()} onSuccess={vi.fn()} />,
    );

    await user.type(screen.getByLabelText('Name'), 'Another Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    expect(
      await screen.findByText('Email is already registered'),
    ).toBeInTheDocument();
  });
});
