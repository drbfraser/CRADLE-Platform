/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test';
import moment from 'moment';
import { cradleTest } from './playwright-utils';
import { Patient } from '../src/shared/types';

type Fixtures = {
  patient: Patient;
};

const test = cradleTest.extend<Fixtures>({
  patient: async ({ api, browserName }, use) => {
    const patientName = `e2e-test-create-referral-${browserName}`;
    /**
     * Create test patient through REST API.  This will be run for each
     * individual test, so each test will get their own patient.
     **/
    const response = await api.post('/patients', {
      data: {
        name: patientName,
        sex: 'Male',
        dateOfBirth: '2000-01-01',
        isExactDateOfBirth: true,
      },
    });
    expect(response).toBeOK();
    const patient: Patient = await response.json();

    // Make the patient available to tests.
    use(patient);

    // Cleanup test patient.
    await api.delete(`/patients/${patient.id}`);
  },
});

test.describe('Create Referral', () => {
  test.beforeAll(async ({ api }) => {});

  test('Create Referral', async ({ page, patient }) => {
    const referralComment = `e2e-test | patientId=${
      patient.id
    } | dateTime=${moment().format()}`;

    await page.goto(`/patients/${patient.id}`);
    await page.waitForURL(`/patients/${patient.id}`);

    await page.getByRole('button', { name: 'Create Referral' }).click();
    await expect(page).toHaveURL(`/referrals/new/${patient.id}`);

    await page.getByRole('combobox', { name: 'Refer To' }).click();
    await page.getByText('H1000').click();
    await page.getByRole('textbox', { name: 'Comments' }).fill(referralComment);

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(`/patients/${patient.id}`);

    const successAlert = page.getByRole('alert').getByText('success');
    await expect(successAlert).toBeVisible();

    const referralCard = page.getByText(referralComment);
    await referralCard.scrollIntoViewIfNeeded();
    await expect(referralCard).toContainText(referralComment);
  });
});
