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

  // can also be used to unarchive patient
  async archivePatientByName(name: string) {
    const archiveButton = this.page
      .getByRole('row', { name, exact: false })
      .getByRole('button');
    await archiveButton.click();

    const confirmButton = this.page.getByRole('button', { name: 'Yes' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    const responsePromise = this.waitForPatientsApiResponse();
    await responsePromise;
  }
}
