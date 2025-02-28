/* eslint-disable react-hooks/rules-of-hooks */
import { test as baseTest, expect } from '@playwright/test';
import { NewPatientPage } from './pages/new-patient-page';

/**
 *
 */

type Fixtures = {
  newPatientPage: NewPatientPage;
  patientName: string;
};

const test = baseTest.extend<Fixtures>({
  patientName: async ({ browserName }, use) => {
    const patientName = `E2E-Test-Patient-${browserName}`;
    await use(patientName);
  },
  newPatientPage: async ({ page, patientName }, use) => {
    const newPatientPage = new NewPatientPage(page);
    await newPatientPage.goto();
    await newPatientPage.fillBasicFields(patientName);
    await use(newPatientPage);
  },
});

test.describe('Create Patient', () => {
  test('Create Patient - Exact DOB', async ({
    page,
    newPatientPage,
    patientName,
  }) => {
    newPatientPage.fillExactDateOfBirth();
    newPatientPage.selectGender();
    newPatientPage.clickNext();
    newPatientPage.clickNext();
    newPatientPage.clickNext();

    const header = page.getByRole('heading', { name: patientName });
    await expect(header).toHaveText('Patient Summary');
  });
});
