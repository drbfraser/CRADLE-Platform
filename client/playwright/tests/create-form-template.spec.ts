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
}) => {
  const formTemplateTitle = `Test Form Template ${browserName} ${Date.now()}`;
  const version = String(Date.now() % 100000);
  const categoryName = 'Dietary';

  await formTemplateBuilderPage.fillFormMetadata(formTemplateTitle, version);

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

  await formTemplatesPage.expectFormTemplateToBeListed(formTemplateTitle);

  await formTemplatesPage.archiveFormTemplateByName(formTemplateTitle);
  await expect(
    formTemplatesPage.getFormTemplateRowByName(formTemplateTitle)
  ).not.toBeVisible();
});
