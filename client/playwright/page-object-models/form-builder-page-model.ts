import { test, expect, Locator, Page } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class FormBuilderPageModel extends PageObjectModel {
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

  get questionIDInput(): Locator {
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

  async fillFormMetadata(title: string, version: string) {
    const formTitle = `Test Form Template ${test.info().project.name}`;
    await this.titleInput.fill(title);
    await this.versionInput.fill(version);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.confirmSubmitButton.click();
  }

  async addField({
    fieldType,
    fieldText,
    questionID,
    minValue,
    maxValue,
    option,
  }: {
    fieldType: 'Number' | 'Text' | 'Multiple Choice' | 'Multi Select' | 'Date';
    fieldText: string;
    questionID: string;
    minValue?: string;
    maxValue?: string;
    option?: string;
  }) {
    await this.addFieldButton.click();

    switch (fieldType) {
      case 'Number':
        await this.numberFieldTypeButton.check();
        if (minValue)
          await this.page
            .getByRole('textbox', { name: 'Minimum Value' })
            .fill(minValue);
        if (maxValue)
          await this.page
            .getByRole('textbox', { name: 'Maximum Value' })
            .fill(maxValue);
        break;
      case 'Text':
        await this.textFieldTypeButton.check();
        break;
      case 'Multiple Choice':
        await this.multipleChoiceFieldTypeButton.check();
        if (option) {
          await this.page
            .getByRole('button', { name: 'Add Option', exact: true })
            .click();
          await this.page
            .getByRole('textbox', { name: 'English Option' })
            .fill(option);
        }
        break;
      case 'Multi Select':
        await this.multiSelectFieldTypeButton.check();
        if (option) {
          await this.page
            .getByRole('button', { name: 'Add Option', exact: true })
            .click();
          await this.page
            .getByRole('textbox', { name: 'English Option' })
            .fill(option);
        }
        break;
      case 'Date':
        await this.dateFieldTypeButton.check();
        break;
    }

    await this.englishFieldTextInput.fill(fieldText);
    await this.questionIDInput.fill(questionID);
    await this.saveFieldDetailsButton.click();
  }

  async addFields() {
    await this.addField({
      fieldType: 'Number',
      fieldText: 'Number field',
      questionID: 'number_field',
      minValue: '1',
      maxValue: '10',
    });
    await this.addField({
      fieldType: 'Text',
      fieldText: 'Text field',
      questionID: 'text_field',
    });
    await this.addField({
      fieldType: 'Multiple Choice',
      fieldText: 'Multiple choice field',
      questionID: 'multiple_choice_field',
      option: 'Option 1',
    });
    await this.addField({
      fieldType: 'Multi Select',
      fieldText: 'Multi select field',
      questionID: 'multi_select_field',
      option: 'Option A',
    });
    await this.addField({
      fieldType: 'Date',
      fieldText: 'Date field',
      questionID: 'date_field',
    });
  }
}
