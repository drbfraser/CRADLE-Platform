/* eslint-disable react-hooks/rules-of-hooks */
import { test as baseTest, expect } from '@playwright/test';
import { NewPatientPage } from './pages/new-patient-page';
import { BASE_API_URL } from './constants';

/**
 *
 */

type Fixtures = {
  newPatientPage: NewPatientPage;
  patientName: string;
  authHeader: { Authorization: string };
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
  authHeader: async ({ page }, use) => {
    const accessToken = await page.evaluate(() => {
      return localStorage.getItem('accessToken');
    });
    const authHeader = {
      Authorization: `bearer ${accessToken}`,
    };
    await use(authHeader);
  },
});

test.describe('Create Patient', () => {
  test('Create Patient - Exact DOB', async ({
    page,
    newPatientPage,
    patientName,
    authHeader,
  }) => {
    await newPatientPage.fillExactDateOfBirth();
    await newPatientPage.selectGender();
    await newPatientPage.clickNext();
    await newPatientPage.clickNext();
    await newPatientPage.clickCreate();

    const header = page.getByRole('heading', { name: patientName });
    await expect(header).toContainText('Patient Summary');

    // Get patientId from URL.
    const patientId = page.url().match(/(?<=\/patients\/).*/)?.[0];
    expect(patientId).toBeTruthy();

    // Delete newly created patient.
    const response = await page.request.fetch(
      `${BASE_API_URL}/patients/${patientId}`,
      {
        method: 'DELETE',
        headers: authHeader,
      }
    );
    await expect(response).toBeOK();
  });
});
