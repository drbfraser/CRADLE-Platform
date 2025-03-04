/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test';
import { cradleTest, TEST_PATIENT_NAME } from './fixtures';

type Fixtures = {
  patientName: string;
};

const test = cradleTest.extend<Fixtures>({
  patientName: async ({ browserName }, use) => {
    await use(`${TEST_PATIENT_NAME}-${browserName}`);
  },
});

test.describe('Create Patient - Successful', () => {
  test.beforeEach(
    'Go to New Patient Form',
    async ({ newPatientPage, patientName }) => {
      await newPatientPage.goto();
      await newPatientPage.fillBasicFields(patientName);
    }
  );
  test('Create Patient - Exact DOB', async ({
    page,
    newPatientPage,
    patientName,
  }) => {
    await newPatientPage.fillExactDateOfBirth();
    await newPatientPage.selectSex();
    await newPatientPage.clickNext();
    await newPatientPage.clickNext();
    await newPatientPage.clickCreate();

    const header = page.getByRole('heading', { name: patientName });
    await expect(header).toContainText('Patient Summary');
  });
  test('Create Patient - Estimated Age', async ({
    page,
    newPatientPage,
    patientName,
  }) => {
    await newPatientPage.fillEstimatedAge();
    await newPatientPage.selectSex();
    await newPatientPage.clickNext();
    await newPatientPage.clickNext();
    await newPatientPage.clickCreate();

    const header = page.getByRole('heading', { name: patientName });
    await expect(header).toContainText('Patient Summary');
  });
});

test.describe('Create Patient - Unsuccessful', () => {});
