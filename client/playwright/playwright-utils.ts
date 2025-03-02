/* eslint-disable react-hooks/rules-of-hooks */
import {
  APIRequestContext,
  test as pwTest,
  request as apiRequest,
} from '@playwright/test';
import { BASE_API_URL } from './constants';

type CommonFixtures = {
  api: APIRequestContext;
};

export const baseTest = pwTest.extend<CommonFixtures>({
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
