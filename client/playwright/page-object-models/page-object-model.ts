import { type Page, type Locator, expect } from '@playwright/test';

/** Base class for our Page Object Model classes to inherit from. */
export class PageObjectModel {
  protected readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string) {
    this.url = url;
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForURL(this.url);
  }

  async expectToHaveUrl() {
    await this.page.waitForURL(this.url);
    await expect(this.page).toHaveURL(this.url);
  }
}
