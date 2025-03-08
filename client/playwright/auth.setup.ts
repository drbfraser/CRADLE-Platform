import { test as setup } from '@playwright/test';
import { BASE_API_URL, AUTH_FILE, ADMIN_CREDENTIALS } from './constants';

const AUTH_API_URL = `${BASE_API_URL}/api/user/auth`;

type AuthResponse = {
  accessToken: string;
};

/**
 * This setup test will be run first, before running any other tests.
 * It authenticates the user via API and then writes the authentication state
 * to a temporary file so that all of the other tests can use it.
 * This means that we will not need to authenticate for each individual test.
 *
 * The temporary auth state file is in the `test-results/` directory, which
 * gets cleared at the start of each run of tests, so any potentially expired
 * tokens will be discarded and the authentication setup will be re-run once for
 * each execution of the test suite.
 */

setup('authenticate', async ({ page }) => {
  await page.goto('/');

  // Authenticate through auth API.
  const response = await page.request.post(AUTH_API_URL, {
    data: ADMIN_CREDENTIALS,
  });

  // Get access token from response.
  const { accessToken }: AuthResponse = await response.json();

  // Set access token in local storage.
  await page.evaluate(
    (accessToken) => localStorage.setItem('accessToken', accessToken),
    accessToken
  );

  // Write local storage to temporary file, to make it available to all tests.
  await page.context().storageState({ path: AUTH_FILE });
});
