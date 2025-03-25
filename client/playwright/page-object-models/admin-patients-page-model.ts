import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class AdminPatientsPageModel extends PageObjectModel {
  private readonly patientRow: (name: string) => Locator;
  private readonly archiveButton: (name: string) => Locator;

  constructor(page: Page) {
    super(page, '/admin/patients');

    this.patientRow = (patientName) =>
      page.getByRole('gridcell', { name: patientName });

    this.archiveButton = (patientName) =>
      page
        .getByRole('row', { name: patientName, exact: false })
        .getByRole('button');
  }

  async goto() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('includeArchived=true') &&
        response.status() === 200
    );
    await super.goto();
    await responsePromise;
  }

  async getPatientRowByName(name: string) {
    return this.patientRow(name);
  }

  // can also be used to unarchive patient
  async archivePatientByName(name: string) {
    const button = this.archiveButton(name);
    await button.click();

    const confirm = this.page.getByRole('button', { name: 'Yes' });
    await expect(confirm).toBeVisible();
    await confirm.click();

    await this.page.waitForResponse(
      (response) =>
        response.url().includes('/admin?includeArchived=true') &&
        response.status() === 200
    );
  }
}
