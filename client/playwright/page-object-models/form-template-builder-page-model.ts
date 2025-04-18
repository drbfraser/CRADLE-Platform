import { test, expect, Locator, Page } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class FormTemplateBuilderPageModel extends PageObjectModel {
  constructor(page: Page) {
    super(page, '/admin/form-templates/new');
  }

  get titleInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Title' });
  }

  get versionInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Version' });
  }

  get addCategoryButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Category' });
  }

  get englishCategoryNameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'English Category Name' });
  }

  get cancelCategoryButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get saveCategoryButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  get addFieldButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Field' });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit Template' });
  }

  get confirmSubmitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get englishFieldTextInput(): Locator {
    return this.page.getByRole('textbox', { name: 'English Field Text' });
  }

  get questionIdInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Question ID' });
  }

  get numberFieldTypeButton(): Locator {
    return this.page.getByRole('radio', { name: 'Number' });
  }

  get textFieldTypeButton(): Locator {
    return this.page.getByRole('radio', { name: 'Text' });
  }

  get multipleChoiceFieldTypeButton(): Locator {
    return this.page.getByRole('radio', { name: 'Multiple Choice' });
  }

  get multiSelectFieldTypeButton(): Locator {
    return this.page.getByRole('radio', { name: 'Multi Select' });
  }

  get dateFieldTypeButton(): Locator {
    return this.page.getByRole('radio', { name: 'Date' });
  }

  get cancelFieldDetailsButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get saveFieldDetailsButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  get newFormTemplateButton(): Locator {
    return this.page.getByRole('button', { name: 'New Form' });
  }

  async fillFormMetadata(title: string, version: string) {
    await this.titleInput.fill(title);
    await this.versionInput.fill(version);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.confirmSubmitButton.click();
  }

  private async fillFieldDetails(fieldText: string, questionId: string) {
    await this.englishFieldTextInput.fill(fieldText);
    await this.questionIdInput.fill(questionId);
    await this.saveFieldDetailsButton.click();
  }

  private async fillOptions(options: string[]) {
    for (const option of options) {
      await this.page
        .getByRole('button', { name: 'Add Option', exact: true })
        .click();
      await this.page
        .getByRole('textbox', { name: 'English Option' })
        .fill(option);
    }
  }

  async addNumberField(
    fieldText: string,
    questionId: string,
    minValue?: string,
    maxValue?: string
  ) {
    await this.addFieldButton.click();
    await this.numberFieldTypeButton.check();
    if (minValue !== undefined) {
      await this.page
        .getByRole('textbox', { name: 'Minimum Value' })
        .fill(minValue);
    }
    if (maxValue !== undefined) {
      await this.page
        .getByRole('textbox', { name: 'Maximum Value' })
        .fill(maxValue);
    }
    await this.fillFieldDetails(fieldText, questionId);
  }

  async addTextField(fieldText: string, questionId: string) {
    await this.addFieldButton.click();
    await this.textFieldTypeButton.check();
    await this.fillFieldDetails(fieldText, questionId);
  }

  async addMultipleChoiceField(
    fieldText: string,
    questionId: string,
    options: string[] = []
  ) {
    await this.addFieldButton.click();
    await this.multipleChoiceFieldTypeButton.check();
    await this.fillOptions(options);
    await this.fillFieldDetails(fieldText, questionId);
  }

  async addMultiSelectField(
    fieldText: string,
    questionId: string,
    options: string[] = []
  ) {
    await this.addFieldButton.click();
    await this.multiSelectFieldTypeButton.check();
    await this.fillOptions(options);
    await this.fillFieldDetails(fieldText, questionId);
  }

  async addDateField(fieldText: string, questionId: string) {
    await this.addFieldButton.click();
    await this.dateFieldTypeButton.check();
    await this.fillFieldDetails(fieldText, questionId);
  }
}
