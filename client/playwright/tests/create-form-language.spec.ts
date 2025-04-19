import { test } from '../fixtures';
import { expect } from '@playwright/test';
// import { FormTemplatesPageModel } from '../page-object-models/form-templates-page-model';
import { Page } from '@playwright/test';

async function setBrowserLanguage(page: Page, language: string) {
  await page.addInitScript((lang) => {
    Object.defineProperty(navigator, 'language', {
      get: () => lang,
    });
  }, language);
}

test.describe('browser language', () => {
  let formTemplateTitle: string;

  test.beforeEach(async ({ browserName }) => {
    formTemplateTitle = `Test Form Template ${browserName}`;
  });

  test('should create form with Polish as browser language', async ({
    page,
    formTemplatesPage,
    formTemplateBuilderPage,
  }) => {
    await setBrowserLanguage(page, 'pl');

    await formTemplatesPage.goto();
    await formTemplatesPage.clickNewFormTemplateButton();
    await formTemplateBuilderPage.fillFormMetadata(formTemplateTitle, 'v1.0');

    await formTemplateBuilderPage.assertDefaultLanguageIs('Polish');
    await formTemplateBuilderPage.addSecondLanguage('English');

    // add bilingual category
    await formTemplateBuilderPage.addBilingualCategory(
      'Informacje Osobiste',
      'Personal Information'
    );

    // add bilingual text field
    await formTemplateBuilderPage.addBilingualTextField(
      'Pełne Imię I Nazwisko',
      'Full Name'
    );

    // submit
    await formTemplateBuilderPage.submitForm();

    await formTemplatesPage.expectFormTemplateToBeListed(formTemplateTitle);

    // To-do: go to patients page
    // press Submit New Form
    // choose the form we just created
    // confirm that it's using the right language
    // cancel

    // archive form and ensure it's gone
    await formTemplatesPage.archiveFormTemplateByName(formTemplateTitle);
    await expect(
      formTemplatesPage.getFormTemplateRowByName(formTemplateTitle)
    ).not.toBeVisible();
  });
});
