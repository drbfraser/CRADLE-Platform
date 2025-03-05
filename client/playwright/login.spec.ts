import { expect } from '@playwright/test';
import { test } from './fixtures';
import { ADMIN_CREDENTIALS } from './constants';

const ADMIN = ADMIN_CREDENTIALS;

test.describe('Login Tests', () => {
  // Reset storage state for this file to avoid being authenticated
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Login', async ({ page, loginPage }) => {
    await loginPage.enterUsername(ADMIN.username);
    await loginPage.enterPassword(ADMIN.password);
    await loginPage.clickLoginButton();

    await expect(page).toHaveURL('/referrals');
    await expect(
      page.getByRole('heading', { name: 'Referrals' })
    ).toBeVisible();
  });

  test('Login attempt without username', async ({ loginPage }) => {
    await loginPage.enterPassword(ADMIN.password);
    await loginPage.expectLoginButtonToBeDisabled();
  });

  test('Login attempt without password', async ({ loginPage }) => {
    await loginPage.enterUsername(ADMIN.username);
    await loginPage.expectLoginButtonToBeDisabled();
  });

  test('Login attempt with incorrect username', async ({ loginPage }) => {
    await loginPage.enterUsername('incorrect-username');
    await loginPage.enterPassword(ADMIN.password);
    await loginPage.clickLoginButton();
    await loginPage.expectToHaveUrl();
    await loginPage.expectLoginButtonToBeEnabled();
  });

  test('Login attempt with incorrect password', async ({ loginPage }) => {
    await loginPage.enterUsername(ADMIN.username);
    await loginPage.enterPassword('incorrect-password');
    await loginPage.clickLoginButton();
    await loginPage.expectToHaveUrl();
    await loginPage.expectLoginButtonToBeEnabled();
  });
});
