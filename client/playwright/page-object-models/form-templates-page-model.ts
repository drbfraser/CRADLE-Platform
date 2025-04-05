import { expect, Locator, Page } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class FormTemplatesPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/admin/form-templates');
  }

  get newFormButton(): Locator {
    return this.page.getByRole('button', { name: 'New Form' });
  }

  async archiveFormByName(formName: string) {
    const archiveFormButton = this.page
      .getByRole('row', { name: formName, exact: false })
      .getByLabel('Archive Form Template')
      .getByRole('button');
    await archiveFormButton.click();

    const confirmArchiveButton = this.page.getByRole('button', {
      name: 'Archive',
    });
    await confirmArchiveButton.click();
  }

  getFormRowByName(formName: string): Locator {
    return this.page.getByRole('gridcell', { name: formName });
  }

  async clickNewFormButton() {
    await this.newFormButton.click();
  }

  async expectFormToExist(formName: string) {
    await expect(this.getFormRowByName(formName)).toBeVisible();
  }
}
