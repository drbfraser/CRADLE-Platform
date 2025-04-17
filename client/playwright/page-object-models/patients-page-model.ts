import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientsPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/patients');
  }

  async getPatientRowByName(name: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name }),
    });
  }
}
