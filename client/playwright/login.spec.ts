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

  test.describe('Login attempt - Missing fields', () => {
    test('Login attempt - Missing username', async ({ loginPage }) => {
      await loginPage.enterPassword(ADMIN.password);
    });
    test('Login attempt - Missing password', async ({ loginPage }) => {
      await loginPage.enterUsername(ADMIN.username);
    });
    test.afterEach('Attempt login', async ({ loginPage }) => {
      await loginPage.expectLoginButtonToBeDisabled();
    });
  });

  test.describe('Login attempt - Incorrect credentials', () => {
    test('Login attempt - Incorrect username', async ({ loginPage }) => {
      await loginPage.enterUsername('incorrect-username');
      await loginPage.enterPassword(ADMIN.password);
    });
    test('Login attempt - Incorrect password', async ({ loginPage }) => {
      await loginPage.enterUsername(ADMIN.username);
      await loginPage.enterPassword('incorrect-password');
    });
    test.afterEach('Attempt login', async ({ loginPage }) => {
      await loginPage.clickLoginButton();
      await loginPage.expectToHaveUrl();
      await loginPage.expectErrorToastIncorrectCredentials();
      await loginPage.expectLoginButtonToBeEnabled();
    });
  });
});
