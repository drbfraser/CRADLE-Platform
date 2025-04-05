import { test, expect } from '@playwright/test';
import { FormTemplatesPageModel } from '../page-object-models/form-templates-page-model';
import { FormBuilderPageModel } from '../page-object-models/form-builder-page-model';

test.describe('Form Template Creation', () => {
  test('should allow an admin to create a new form template', async ({
    page,
  }) => {
    const formTemplatesPage = new FormTemplatesPageModel(page);
    const formBuilderPage = new FormBuilderPageModel(page);

    const formTitle = `Test Form Template ${test.info().project.name}`;
    const version = 'v1.0';
    const categoryName = 'Dietary';

    // go to form templates and start a new form
    await formTemplatesPage.goto();
    await formTemplatesPage.clickNewFormButton();

    // fill data and submit
    await formBuilderPage.fillFormMetadata(formTitle, version);

    // add a category
    await formBuilderPage.addCategoryButton.click();
    await formBuilderPage.englishCategoryNameInput.fill(categoryName);
    await formBuilderPage.saveCategoryButton.click();

    // Add fields using the addField method
    await formBuilderPage.addField({
      fieldType: 'Number',
      fieldText: 'Number field',
      questionID: 'number_field',
      minValue: '1',
      maxValue: '10',
    });
    await formBuilderPage.addField({
      fieldType: 'Text',
      fieldText: 'Text field',
      questionID: 'text_field',
    });
    await formBuilderPage.addField({
      fieldType: 'Multiple Choice',
      fieldText: 'Multiple choice field',
      questionID: 'multiple_choice_field',
      option: 'Option 1',
    });
    await formBuilderPage.addField({
      fieldType: 'Multi Select',
      fieldText: 'Multi select field',
      questionID: 'multi_select_field',
      option: 'Option A',
    });
    await formBuilderPage.addField({
      fieldType: 'Date',
      fieldText: 'Date field',
      questionID: 'date_field',
    });

    await formBuilderPage.submitForm();

    // verify form is listed
    await formTemplatesPage.expectFormToExist(formTitle);

    // archive form and ensure it's gone
    await formTemplatesPage.archiveFormByName(formTitle);
    await expect(
      formTemplatesPage.getFormRowByName(formTitle)
    ).not.toBeVisible();
  });
});
