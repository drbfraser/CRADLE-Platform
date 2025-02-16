import { test, expect } from '@playwright/test';
import { BASE_URL, USERNAME, PASSWORD } from './constants';

test('Login', async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page.getByRole('heading', { name: /Log in/i })).toBeVisible();

  // Fill in credentials.
  await page.getByRole('textbox', { name: /username/i }).fill(USERNAME);
  await page.getByRole('textbox', { name: /password/i }).fill(PASSWORD);

  // Click Log in button.
  await page.getByRole('button', { name: /Log in/i }).click();

  // Check that we have been redirected to the referrals page.
  await expect(page).toHaveURL(/.*\/referrals/);
});
