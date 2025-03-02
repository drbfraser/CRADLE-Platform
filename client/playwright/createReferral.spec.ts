/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test';
import moment from 'moment';
import { cradleTest } from './fixtures';
import { Patient } from '../src/shared/types';
import { PatientSummaryPage } from './pages/patient-summary-page';
import { NewReferralFormPage } from './pages/new-referral-form-page';

type TestPatient = {
  name: string;
  id: string;
};

type Fixtures = {
  patient: TestPatient;
  patientSummaryPage: PatientSummaryPage;
  newReferralFormPage: NewReferralFormPage;
};

const test = cradleTest.extend<Fixtures>({
  patient: async ({ api, browserName }, use) => {
    const patientName = `e2e-test-create-referral-${browserName}`;
    /**
     * Create test patient through REST API. This will be run for each
     * individual test, so each test will get their own patient.
     **/
    const response = await api.post('/api/patients', {
      data: {
        name: patientName,
        sex: 'MALE',
        dateOfBirth: '2000-01-01',
        isExactDateOfBirth: true,
      },
    });
    await expect(response).toBeOK();
    const patient: Patient = await response.json();

    // Make the patient available to tests.
    await use(patient);

    // Cleanup test patient.
    await api.delete(`/api/patients/${patient.id}`);
  },
  patientSummaryPage: async ({ page, patient }, use) => {
    const patientSummaryPage = new PatientSummaryPage(page, patient.id);
    await use(patientSummaryPage);
  },
  newReferralFormPage: async ({ page, patient }, use) => {
    const newReferralFormPagePage = new NewReferralFormPage(page, patient.id);
    await use(newReferralFormPagePage);
  },
});

test.describe('Create Referral', () => {
  test('Create Referral', async ({
    page,
    patient,
    patientSummaryPage,
    newReferralFormPage,
  }) => {
    const referralComment = `e2e-test | patientId=${
      patient.id
    } | dateTime=${moment().format()}`;

    await patientSummaryPage.goto();

    await patientSummaryPage.clickCreateReferralButton();

    await expect(page).toHaveURL(newReferralFormPage.url);

    await newReferralFormPage.selectReferToOption('H1000');
    await newReferralFormPage.enterComment(referralComment);
    await newReferralFormPage.submitForm();

    await expect(page).toHaveURL(patientSummaryPage.url);

    const successAlert = page.getByRole('alert').getByText('success');
    await expect(successAlert).toBeVisible();

    const referralCard = page.getByText(referralComment);
    await referralCard.scrollIntoViewIfNeeded();
    await expect(referralCard).toContainText(referralComment);
  });
});
