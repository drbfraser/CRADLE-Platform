import { test, expect } from '@playwright/test';
import { BASE_URL, USERNAME, PASSWORD } from './constants';

test.describe('Login Tests', () => {
  test('Login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Login/ })).toBeVisible();

    // Fill in credentials.
    await page.getByRole('textbox', { name: 'username' }).fill(USERNAME);
    await page.getByRole('textbox', { name: 'password' }).fill(PASSWORD);

    // Click Log in button.
    await page.getByRole('button', { name: 'login' }).click();

    // Check that we have been redirected to the referrals page.
    await expect(page).toHaveURL(/.*\/referrals/);
  });

  test('Login attempt without username', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: 'username' }).fill(USERNAME);

    // Login button should be disabled.
    await expect(page.getByRole('button', { name: 'login' })).toBeDisabled();
  });

  test('Login attempt without password', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: 'password' }).fill(PASSWORD);

    // Login button should be disabled.
    await expect(page.getByRole('button', { name: 'login' })).toBeDisabled();
  });
});
