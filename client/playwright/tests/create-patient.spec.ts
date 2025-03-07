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
  test.beforeEach(
    'Go to New Patient Form',
    async ({ newPatientFormPage: newPatientPage }) => {
      await newPatientPage.goto();
      await newPatientPage.enterBasicFields();
    }
  );
  test.describe(' Successful', () => {
    test.beforeEach(
      'Go to New Patient Form',
      async ({ newPatientFormPage: newPatientPage, patientName }) => {
        await newPatientPage.enterPatientName(patientName);
        await newPatientPage.selectSex();
      }
    );
    test('Exact DOB', async ({ newPatientFormPage: newPatientPage }) => {
      await newPatientPage.enterExactDateOfBirth();
    });
    test('Estimated Age', async ({ newPatientFormPage: newPatientPage }) => {
      await newPatientPage.enterEstimatedAge();
    });
    test.afterEach(
      async ({ page, newPatientFormPage: newPatientPage, patientName }) => {
        await newPatientPage.selectSex();
        await newPatientPage.clickNextButton();
        await newPatientPage.clickNextButton();
        await newPatientPage.clickCreateButton();

        await expect(
          page.getByRole('heading', { name: 'Patient Summary' })
        ).toContainText(patientName);
      }
    );
  });

  test.describe('Unsuccessful', () => {
    test('Missing Name', async ({ newPatientFormPage }) => {
      await newPatientFormPage.enterExactDateOfBirth();
      await newPatientFormPage.selectSex();
    });
    test('Missing Sex', async ({ newPatientFormPage, patientName }) => {
      await newPatientFormPage.enterPatientName(patientName);
      await newPatientFormPage.enterExactDateOfBirth();
    });
    test('Missing Date of Birth / Estimated Age', async ({
      newPatientFormPage,
      patientName,
    }) => {
      await newPatientFormPage.enterPatientName(patientName);
      await newPatientFormPage.selectSex();
    });
    test.afterEach(async ({ newPatientFormPage }) => {
      await newPatientFormPage.clickNextButton();
      await newPatientFormPage.clickNextButton();
      await newPatientFormPage.expectNextButton();
    });
  });
});
