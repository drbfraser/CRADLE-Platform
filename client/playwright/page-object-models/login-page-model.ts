import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class LoginPageModel extends PageObjectModel {
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.usernameField = page.getByRole('textbox', { name: 'username' });
    this.passwordField = page.getByRole('textbox', { name: 'password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await super.goto();
    await expect(
      this.page.getByRole('heading', { name: /Login/ })
    ).toBeVisible();
  }

  async enterUsername(username: string) {
    await this.usernameField.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordField.fill(password);
  }

  async clickLoginButton() {
    await this.clickLoginButton();
  }

  async expectLoginButtonToBeDisabled() {
    await expect(this.loginButton).toBeDisabled();
  }

  async expectLoginButtonToBeEnabled() {
    await expect(this.loginButton).toBeEnabled();
  }
}
