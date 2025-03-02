/* eslint-disable react-hooks/rules-of-hooks */
import {
  APIRequestContext,
  test as baseTest,
  request as apiRequest,
} from '@playwright/test';
import { BASE_API_URL } from './constants';

/**
 * This test object extends the Playwright base test object to add
 * common fixtures that we want to make available to all of our
 * Playwright tests.
 */

type CommonFixtures = {
  api: APIRequestContext;
};

export const cradleTest = baseTest.extend<CommonFixtures>({
  api: async ({ page }, use) => {
    const accessToken = await page.evaluate(() => {
      return localStorage.getItem('accessToken');
    });
    const api = await apiRequest.newContext({
      baseURL: BASE_API_URL,
      extraHTTPHeaders: {
        Authorization: `bearer ${accessToken}`,
      },
    });
    await use(api);
  },
});
