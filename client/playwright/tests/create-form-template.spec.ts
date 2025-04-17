import { test } from '../fixtures';
import { expect } from '@playwright/test';

test.beforeEach(async ({ formTemplatesPage }) => {
  await formTemplatesPage.goto();
  await formTemplatesPage.clickNewFormTemplateButton();
});

test('should allow an admin to create a new form template', async ({
  formTemplatesPage,
  formBuilderPage,
}, testInfo) => {
  const formTemplateTitle = `Test Form Template ${testInfo.project.use.browserName}`;
  const version = 'v1.0';
  const categoryName = 'Dietary';

  await formBuilderPage.fillFormMetadata(formTemplateTitle, version);

  // add a category
  await formBuilderPage.addCategoryButton.click();
  await formBuilderPage.englishCategoryNameInput.fill(categoryName);
  await formBuilderPage.saveCategoryButton.click();

  await formBuilderPage.addNumberField(
    'Number field',
    'number_field',
    '1',
    '10'
  );
  await formBuilderPage.addTextField('Text field', 'text_field');
  await formBuilderPage.addMultipleChoiceField(
    'Multiple choice field',
    'multiple_choice_field',
    'Option 1'
  );
  await formBuilderPage.addMultiSelectField(
    'Multi select field',
    'multi_select_field',
    'Option A'
  );
  await formBuilderPage.addDateField('Date field', 'date_field');

  await formBuilderPage.submitForm();

  // verify form is listed
  await formTemplatesPage.expectFormTemplateToBeListed(formTemplateTitle);

  // archive form and ensure it's gone
  await formTemplatesPage.archiveFormTemplateByName(formTemplateTitle);
  await expect(
    formTemplatesPage.getFormTemplateRowByName(formTemplateTitle)
  ).not.toBeVisible();
});
