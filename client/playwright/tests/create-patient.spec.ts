/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test';
import { test as cradleTest, TEST_PATIENT_NAME } from '../fixtures';

type Fixtures = {
  patientName: string;
};

const test = cradleTest.extend<Fixtures>({
  patientName: async ({ browserName }, use) => {
    await use(`${TEST_PATIENT_NAME}-${browserName}`);
  },
});

test.describe('Create Patient', () => {
  test.beforeEach('Go to New Patient Form', async ({ newPatientPage }) => {
    await newPatientPage.goto();
    await newPatientPage.enterBasicFields();
  });
  test.describe('Create Patient - Successful', () => {
    test.beforeEach(
      'Go to New Patient Form',
      async ({ newPatientPage, patientName }) => {
        await newPatientPage.enterPatientName(patientName);
        await newPatientPage.selectSex();
      }
    );
    test('Create Patient - Exact DOB', async ({ newPatientPage }) => {
      await newPatientPage.enterExactDateOfBirth();
    });
    test('Create Patient - Estimated Age', async ({ newPatientPage }) => {
      await newPatientPage.enterEstimatedAge();
    });
    test.afterEach(async ({ page, newPatientPage, patientName }) => {
      await newPatientPage.selectSex();
      await newPatientPage.clickNextButton();
      await newPatientPage.clickNextButton();
      await newPatientPage.clickCreateButton();

      await expect(
        page.getByRole('heading', { name: 'Patient Summary' })
      ).toContainText(patientName);
    });
  });

  test.describe('Create Patient - Unsuccessful', () => {});
});
