import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class CustomFormPageModel extends PageObjectModel {
  constructor(page: Page, url: string) {
    super(page, url);
  }

  static forNew(page: Page, patientId: string) {
    return new CustomFormPageModel(page, `/forms/new/${patientId}`);
  }

  get formCombobox(): Locator {
    return this.page.getByRole('combobox', { name: 'Form' });
  }

  get fetchFormButton(): Locator {
    return this.page.getByRole('button', { name: 'Fetch Form' });
  }

  get submitFormButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit Form' });
  }

  get updateFormButton(): Locator {
    return this.page.getByRole('button', { name: 'Update Form' });
  }

  get editFormButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit Form' });
  }

  async selectTemplate(templateName: string) {
    await this.formCombobox.click();
    await this.formCombobox.fill(templateName);
    await this.page.getByRole('option', { name: templateName }).click();
  }

  async fetchForm() {
    await this.fetchFormButton.click();
  }

  async fillTextQuestion(label: string, value: string) {
    const field = this.page.getByLabel(label, { exact: false });
    await expect(field).toBeVisible();
    await field.fill(value);
  }

  async expectQuestionDisabled(label: string) {
    await expect(this.page.getByLabel(label, { exact: false })).toBeDisabled();
  }

  async expectTextValue(value: string) {
    await expect(this.page.getByDisplayValue(value)).toBeVisible();
  }

  async submitNewForm() {
    await this.submitFormButton.click();
  }

  async saveEditedForm() {
    await this.updateFormButton.click();
  }

  async clickEditForm() {
    await this.editFormButton.click();
  }
}
