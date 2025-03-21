import { type Page, type Locator } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientsPageModel extends PageObjectModel {
  private readonly patientRow: (name: string) => Locator;
  private readonly adminPatientRow: (name: string) => Locator;
  private readonly archiveButton: (name: string) => Locator;

  constructor(page: Page) {
    super(page, '/patients');

    // find the row that a patient's name (e.g., AB) is in. returns a locator
    // for that row from the patients page
    this.patientRow = (name) => page.locator(`tbody >> text=${name}`);

    // similar to above expect for admin/patients
    this.adminPatientRow = (name) =>
      this.page.locator(`.MuiTableBody-root tr`).filter({ hasText: name });

    this.archiveButton = (name) =>
      page.locator(`tr:has-text("${name}") button[aria-label='Archive']`);
  }

  async gotoAdminPatients() {
    await this.page.goto('/admin/patients');

    await this.page.waitForFunction(() => {
      return document.querySelectorAll('.MuiTableBody-root tr').length > 0;
    });

    // wait until the "Take Action" column is visible
    await this.page.waitForSelector('.MuiTableBody-root tr td:nth-child(4)', {
      state: 'visible',
    });

    await this.page.waitForLoadState('networkidle');
  }

  async getPatientRowByName(name: string) {
    return this.patientRow(name);
  }

  async getAdminPatientRowByName(name: string) {
    return this.adminPatientRow(name);
  }

  async archivePatientByName(name: string) {
    const button = this.archiveButton(name);
    await button.click();
    await this.page.waitForTimeout(500);
  }
}
