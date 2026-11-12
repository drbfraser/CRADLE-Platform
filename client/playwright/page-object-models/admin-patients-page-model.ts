import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class AdminPatientsPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/admin/patients');
  }

  private async waitForPatientsApiResponse() {
    return await this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/patients/admin') &&
        response.status() === 200
    );
  }

  async goto() {
    const responsePromise = this.waitForPatientsApiResponse();
    await super.goto();
    await responsePromise;
  }

  getPatientRowByName(name: string) {
    return this.page.getByRole('gridcell', { name });
  }

  async archivePatientByName(name: string) {
    await this.clickRowActionAndConfirm(name, 'Archive Patient');
  }

  async unarchivePatientByName(name: string) {
    await this.clickRowActionAndConfirm(name, 'Unarchive Patient');
  }

  async deletePatientByName(name: string) {
    await this.clickRowActionAndConfirm(name, 'Delete Patient');
  }

  // Each row has several action buttons, so pick the one by its tooltip label.
  private async clickRowActionAndConfirm(name: string, action: string) {
    const actionButton = this.page
      .getByRole('row', { name, exact: false })
      .getByLabel(action)
      .getByRole('button');
    await actionButton.click();

    const confirmButton = this.page.getByRole('button', { name: 'Yes' });
    await expect(confirmButton).toBeVisible();

    const responsePromise = this.waitForPatientsApiResponse();
    await confirmButton.click();
    await responsePromise;
  }
}
