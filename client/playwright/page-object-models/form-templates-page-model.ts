import { expect, Locator, Page } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class FormTemplatesPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/admin/form-templates');
  }

  get newFormTemplateButton(): Locator {
    return this.page.getByRole('button', { name: 'New Form' });
  }

  async archiveFormTemplateByName(formTemplateName: string) {
    const archiveFormButton = this.page
      .getByRole('row', { name: formTemplateName, exact: false })
      .getByLabel('Archive Form Template')
      .getByRole('button');
    await archiveFormButton.click();

    const confirmArchiveButton = this.page.getByRole('button', {
      name: 'Archive',
    });
    await confirmArchiveButton.click();
  }

  getFormTemplateRowByName(formTemplateName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('gridcell', { name: formTemplateName }),
    });
  }

  async clickNewFormTemplateButton() {
    await this.newFormTemplateButton.click();
  }

  async expectFormTemplateToBeListed(formName: string) {
    await expect(this.getFormTemplateRowByName(formName)).toBeVisible();
  }
}
