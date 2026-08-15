import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { CustomFormPageModel } from '../page-object-models/custom-form-page-model';

const QUESTION_LABEL = 'Patient notes';

const makeTemplatePayload = (name: string) => ({
  classification: {
    name: { english: name },
  },
  version: Date.now() % 100000,
  questions: [
    {
      questionType: 'STRING',
      required: true,
      order: 0,
      questionText: { english: QUESTION_LABEL },
      mcOptions: [],
      visibleCondition: [],
      isBlank: true,
    },
  ],
});

test.describe('Submit custom form', () => {
  test('submit, view, and edit a patient form', async ({
    api,
    testPatient,
    patientSummaryPage,
    customFormPage,
    browserName,
    page,
  }) => {
    const templateName = `E2E Custom Form ${browserName} ${Date.now()}`;
    const createResponse = await api.post('/api/forms/v2/templates/body', {
      data: makeTemplatePayload(templateName),
    });
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    const templateId = created.id as string;

    try {
      await patientSummaryPage.goto();
      await patientSummaryPage.clickSubmitNewFormButton();
      await customFormPage.waitForUrl();

      await customFormPage.selectTemplate(templateName);
      await customFormPage.fetchForm();
      await customFormPage.fillTextQuestion(QUESTION_LABEL, 'initial notes');
      await customFormPage.submitNewForm();

      await patientSummaryPage.expectToHaveUrl();
      await patientSummaryPage.clickViewFormByName(templateName);

      const viewPage = new CustomFormPageModel(
        page,
        `/forms/view/${testPatient.id}/`
      );
      await expect(page).toHaveURL(
        new RegExp(`/forms/view/${testPatient.id}/`)
      );
      await viewPage.expectQuestionDisabled(QUESTION_LABEL);
      await viewPage.expectTextValue('initial notes');

      await viewPage.clickEditForm();
      await expect(page).toHaveURL(
        new RegExp(`/forms/edit/${testPatient.id}/`)
      );

      const editPage = new CustomFormPageModel(
        page,
        `/forms/edit/${testPatient.id}/`
      );
      await editPage.fillTextQuestion(QUESTION_LABEL, 'updated notes');
      await editPage.saveEditedForm();

      await patientSummaryPage.expectToHaveUrl();
      await patientSummaryPage.clickViewFormByName(templateName);
      await viewPage.expectQuestionDisabled(QUESTION_LABEL);
      await viewPage.expectTextValue('updated notes');
    } finally {
      if (templateId) {
        await api.put(`/api/forms/v2/templates/${templateId}`, {
          params: { archived: true },
        });
      }
    }
  });
});
