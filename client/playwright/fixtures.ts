/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { ADMIN_CREDENTIALS } from './constants';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Go to website.
    await page.goto('/');
    await use(page);
  },
});
