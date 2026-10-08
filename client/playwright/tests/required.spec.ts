import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { FormTemplateBuilderPageModel } from '../page-object-models/form-template-builder-page-model';

test.describe('Required question for form templates', () => {
  test.beforeEach(async ({ formTemplatesPage }) => {
    await formTemplatesPage.goto();
    await formTemplatesPage.clickNewFormTemplateButton();
  });

  async function createTemplateWithTextField(
    builder: FormTemplateBuilderPageModel,
    title: string
  ) {
    await builder.fillFormMetadata(title, String(Date.now() % 100000));
    await builder.addCategory('Category');
    await builder.addTextField('Any dietary restrictions?', 'dietary');
  }

  test('unsaved toggle does not persist', async ({
    formTemplateBuilderPage: builder,
    browserName,
  }) => {
    const title = `Toggle without Save ${browserName} ${Date.now()}`;
    await createTemplateWithTextField(builder, title);

    // Existing field: toggle on > cancel > reopen field editor → toggle should be off
    await builder.editFieldIcon.click();
    await expect(builder.englishFieldTextInput).toHaveValue('Any dietary restrictions?');
    await builder.requiredSwitch.check();
    await builder.cancelFieldDetailsButton.click();
    await builder.editFieldIcon.click();
    await expect(builder.requiredSwitch).not.toBeChecked();
    await builder.cancelFieldDetailsButton.click();

    // New field: toggle off by default > toggle on > cancel > reopen field editor → toggle should be off again
    await builder.addFieldButton.click();
    await builder.textFieldTypeButton.check();
    await expect(builder.requiredSwitch).not.toBeChecked();
    await builder.requiredSwitch.check();
    await builder.cancelFieldDetailsButton.click();
    await builder.addFieldButton.click();
    await builder.textFieldTypeButton.check();
    await expect(builder.requiredSwitch).not.toBeChecked();
  });

  test('saved toggle persists after submit template', async ({
    formTemplatesPage,
    formTemplateBuilderPage: builder,
    browserName,
  }) => {
    const title = `Toggle with Save ${browserName} ${Date.now()}`;
    await createTemplateWithTextField(builder, title);

    await builder.editFieldIcon.click();
    await expect(builder.englishFieldTextInput).toHaveValue('Any dietary restrictions?');
    await builder.requiredSwitch.check();
    await builder.saveFieldDetailsButton.click();

    await builder.editFieldIcon.click();
    await expect(builder.requiredSwitch).toBeChecked();
    await builder.cancelFieldDetailsButton.click();

    await builder.submitForm();

    // Reopen the saved template and verify that the required toggle is still checked
    await formTemplatesPage.editFormTemplateByName(title);
    await builder.editFieldIcon.click();
    await expect(builder.englishFieldTextInput).toHaveValue('Any dietary restrictions?');
    await expect(builder.requiredSwitch).toBeChecked();
    await builder.cancelFieldDetailsButton.click();
  });
});