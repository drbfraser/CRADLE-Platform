import { test, expect } from '@playwright/test';
import { ADMIN_CREDENTIALS } from './constants';

const { username, password } = ADMIN_CREDENTIALS;

test.describe('Login Tests', () => {
  // Reset storage state for this file to avoid being authenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Login/ })).toBeVisible();

    await page.getByRole('textbox', { name: 'username' }).fill(username);
    await page.getByRole('textbox', { name: 'password' }).fill(password);

    await page.getByRole('button', { name: 'login' }).click();

    await expect(page).toHaveURL('/referrals');
  });

  test('Login attempt without username', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: 'username' }).fill(username);

    await expect(page.getByRole('button', { name: 'login' })).toBeDisabled();
  });

  test('Login attempt without password', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: 'password' }).fill(password);

    await expect(page.getByRole('button', { name: 'login' })).toBeDisabled();
  });
});
