import { expect, test, type Page } from '@playwright/test';

const login = async (page: Page): Promise<void> => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
};

test('redirects a protected route and returns after login', async ({
  page,
}) => {
  await page.goto('/users?role=admin');
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/users\?role=admin/);
});

test('lists, searches, and filters users', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await page.getByLabel('Search users').fill('Grace');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('Grace Hopper')).toBeVisible();
  await page.getByLabel('Search users').fill('');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByLabel('Filter by status').selectOption('invited');
  await expect(page.getByText('Katherine Johnson')).toBeVisible();
});

test('creates, edits, and deletes a user', async ({ page }) => {
  await login(page);
  await page
    .locator('header')
    .getByRole('button', { name: 'Create user' })
    .click();
  await page.getByLabel('Name').fill('Lin Chen');
  await page.getByLabel('Email').fill('lin@example.com');
  await page
    .locator('aside form')
    .getByRole('button', { name: 'Create user' })
    .click();
  const row = page.getByRole('row', { name: /Lin Chen/ });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Name').fill('Lin Chen Updated');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const updatedRow = page.getByRole('row', { name: /Lin Chen Updated/ });
  await expect(updatedRow).toBeVisible();
  await updatedRow.getByRole('button', { name: 'Delete' }).click();
  await updatedRow.getByRole('button', { name: 'Confirm delete' }).click();
  await expect(updatedRow).not.toBeVisible();
});

test('recovers from a simulated server error', async ({ page }) => {
  await login(page);
  await page.getByLabel('Search users').fill('server-error');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Simulated service failure',
    { timeout: 12_000 },
  );
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('No users match')).toBeVisible();
});

test('returns to login when the session and refresh expire', async ({
  page,
}) => {
  await login(page);
  await page.evaluate(async () => {
    await fetch('/api/test/revoke-session', { method: 'POST' });
  });
  await page.getByLabel('Search users').fill('Ada');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
});
