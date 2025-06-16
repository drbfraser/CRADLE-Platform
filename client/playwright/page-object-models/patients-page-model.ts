import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientsPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/patients');
  }

  getPatientRowByName(name: string) {
    // Match MUI DataGrid rows; each row is a div with class "MuiDataGrid-row"
    return this.page.locator('.MuiDataGrid-row', { hasText: name });
  }
}
