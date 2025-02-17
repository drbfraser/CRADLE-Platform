import { test as setup, expect } from '@playwright/test';
import { PASSWORD, USERNAME } from './constants';

const authFile = 'test-results/.auth/user.json';

/**
 * This setup test will be run first, before running any other tests.
 * It logs the user in and then writes the authentication state to a temporary
 * file so that all of the other tests can use it. This means that we will not
 * need to authenticate for each individual test.
 *
 * The temporary auth state file is in the `test-results/` directory, which
 * gets cleared at the start of each run of tests, so any potentially expired
 * tokens will be discarded and the authentication setup will be re-run once for
 * each execution of the test suite.
 */

setup('authenticate', async ({ page }) => {
  // Go to website and log in.
  page.goto('/');
  await expect(page.getByRole('heading', { name: /Login/ })).toBeVisible();
  // Fill in credentials.
  await page.getByRole('textbox', { name: 'username' }).fill(USERNAME);
  await page.getByRole('textbox', { name: 'password' }).fill(PASSWORD);
  // Click Log in button.
  await page.getByRole('button', { name: 'login' }).click();

  // Wait until url has been redirected to Referrals page.
  await page.waitForURL('/referrals');

  // Write auth state to temporary file, to make it available to all tests.
  await page.context().storageState({ path: authFile });
});
