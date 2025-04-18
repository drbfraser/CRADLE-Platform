import { test } from '../fixtures';
import { expect } from '@playwright/test';

test.beforeEach(async ({ formTemplatesPage }) => {
  await formTemplatesPage.goto();
  await formTemplatesPage.clickNewFormTemplateButton();
});

test('should allow an admin to create a new form template', async ({
  formTemplatesPage,
  formTemplateBuilderPage,
  browserName,
}, testInfo) => {
  const formTemplateTitle = `Test Form Template ${browserName}`;
  const version = 'v1.0';
  const categoryName = 'Dietary';

  await formTemplateBuilderPage.fillFormMetadata(formTemplateTitle, version);

  // add a category
  await formTemplateBuilderPage.addCategoryButton.click();
  await formTemplateBuilderPage.englishCategoryNameInput.fill(categoryName);
  await formTemplateBuilderPage.saveCategoryButton.click();

  await formTemplateBuilderPage.addNumberField(
    'Number field',
    'number_field',
    '1',
    '10'
  );
  await formTemplateBuilderPage.addTextField('Text field', 'text_field');
  await formTemplateBuilderPage.addMultipleChoiceField(
    'Multiple choice field',
    'multiple_choice_field',
    ['Option 1']
  );
  await formTemplateBuilderPage.addMultiSelectField(
    'Multi select field',
    'multi_select_field',
    ['Option A']
  );
  await formTemplateBuilderPage.addDateField('Date field', 'date_field');

  await formTemplateBuilderPage.submitForm();

  // verify form is listed
  await formTemplatesPage.expectFormTemplateToBeListed(formTemplateTitle);

  // archive form and ensure it's gone
  await formTemplatesPage.archiveFormTemplateByName(formTemplateTitle);
  await expect(
    formTemplatesPage.getFormTemplateRowByName(formTemplateTitle)
  ).not.toBeVisible();
});
