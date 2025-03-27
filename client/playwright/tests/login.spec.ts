import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { ADMIN_CREDENTIALS } from '../constants';

const ADMIN = ADMIN_CREDENTIALS;

test.describe('Login', () => {
  // Reset storage state for this file to avoid being authenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Successful', async ({ page, loginPage }) => {
    await loginPage.enterUsername(ADMIN.username);
    await loginPage.enterPassword(ADMIN.password);
    await loginPage.clickLoginButton();

    await expect(page).toHaveURL('/referrals');
    await expect(
      page.getByRole('heading', { name: 'Referrals' })
    ).toBeVisible();
  });

  test.describe('Unsuccessful - Missing Fields', () => {
    test('Missing Username', async ({ loginPage }) => {
      await loginPage.enterPassword(ADMIN.password);
    });
    test('Missing Password', async ({ loginPage }) => {
      await loginPage.enterUsername(ADMIN.username);
    });
    test.afterEach(async ({ loginPage }) => {
      await loginPage.expectLoginButtonToBeDisabled();
    });
  });
});
