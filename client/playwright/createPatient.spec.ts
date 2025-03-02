/* eslint-disable react-hooks/rules-of-hooks */
import { expect } from '@playwright/test';
import { NewPatientPage } from './page-object-models/new-patient-page';
import { cradleTest } from './fixtures';

type Fixtures = {
  newPatientPage: NewPatientPage;
  patientName: string;
};

const test = cradleTest.extend<Fixtures>({
  patientName: async ({ browserName }, use) => {
    const patientName = `E2E-Test-Create-Patient-${browserName}`;
    await use(patientName);
  },
  newPatientPage: async ({ page, patientName }, use) => {
    const newPatientPage = new NewPatientPage(page);
    await newPatientPage.goto();
    await newPatientPage.fillBasicFields(patientName);
    await use(newPatientPage);
  },
});

test.describe('Create Patient - Successful', () => {
  test.afterEach('Cleanup New Patients', async ({ patientName, api }) => {
    const response = await api.get('/api/patients', {
      params: {
        search: patientName,
      },
    });
    const testPatients: [{ id: string; name: string }] = await response.json();
    testPatients
      .filter(({ name }) => name === patientName)
      .forEach(async ({ id: patientId }) => {
        await api.delete(`/api/patients/${patientId}`);
      });
  });

  test('Create Patient - Exact DOB', async ({
    page,
    newPatientPage,
    patientName,
  }) => {
    await newPatientPage.fillExactDateOfBirth();
    await newPatientPage.selectGender();
    await newPatientPage.clickNext();
    await newPatientPage.clickNext();
    await newPatientPage.clickCreate();

    const header = page.getByRole('heading', { name: patientName });
    await expect(header).toContainText('Patient Summary');
  });
});

test.describe('Create Patient - Unsuccessful', () => {});
