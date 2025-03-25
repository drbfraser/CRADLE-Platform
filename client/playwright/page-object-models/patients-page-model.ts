import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientsPageModel extends PageObjectModel {
  private readonly patientRow: (name: string) => Locator;

  constructor(page: Page) {
    super(page, '/patients');

    this.patientRow = (patientName) =>
      page.getByRole('cell', { name: patientName });
  }

  async getPatientRowByName(name: string) {
    return this.patientRow(name);
  }
}
