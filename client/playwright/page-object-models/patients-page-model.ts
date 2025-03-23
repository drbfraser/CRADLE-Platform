import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientsPageModel extends PageObjectModel {
  private readonly patientRow: (name: string) => Locator;
  private readonly adminPatientRow: (name: string) => Locator;
  private readonly archiveButton: (name: string) => Locator;

  constructor(page: Page) {
    super(page, '/patients');

    this.patientRow = (patientName) =>
      page.getByRole('cell', { name: patientName });

    this.adminPatientRow = (patientName) =>
      page.getByRole('gridcell', { name: patientName });

    this.archiveButton = (patientName) =>
      page
        .getByRole('row', { name: new RegExp(`^${patientName}`) })
        .getByRole('button');
  }

  async gotoAdminPatients() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('includeArchived=true') &&
        response.status() === 200
    );
    await this.page.goto('/admin/patients');
    await responsePromise;
  }

  async getPatientRowByName(name: string) {
    return this.patientRow(name);
  }

  async getAdminPatientRowByName(name: string) {
    return this.adminPatientRow(name);
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
