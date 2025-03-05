/* eslint-disable react-hooks/rules-of-hooks */
import {
  APIRequestContext,
  test as baseTest,
  request as apiRequest,
  expect,
} from '@playwright/test';
import { BASE_API_URL } from './constants';
import { PatientSummaryPageModel } from './page-object-models/patient-summary-page-model';
import { NewReferralFormPageModel } from './page-object-models/new-referral-form-page-model';
import { NewPatientPageModel } from './page-object-models/new-patient-page-model';

/** All test patients should be given the same name, so that they can be identified
 * later for deletion.
 */
export const TEST_PATIENT_NAME = 'e2e-test-patient';

export type TestPatient = {
  name: string;
  id: string;
};

export type CradleFixtures = {
  api: APIRequestContext;

  testPatient: TestPatient;
  newPatientPage: NewPatientPageModel;
  patientSummaryPage: PatientSummaryPageModel;
  newReferralFormPage: NewReferralFormPageModel;
};

/**
 * This test object extends the Playwright base test object to add
 * common fixtures that we want to make available to all of our
 * Playwright tests.
 */
export const test = baseTest.extend<CradleFixtures>({
  /** This fixture is used for directly sending requests to our REST API.
   * It is configured to attach the Authorization header with an access token
   * to all outgoing requests.
   */
  api: async ({ context }, use) => {
    const storageState = await context.storageState();
    const { value: accessToken } = storageState.origins[0].localStorage.find(
      ({ name }) => name === 'accessToken'
    )!;

    const api = await apiRequest.newContext({
      baseURL: BASE_API_URL,
      extraHTTPHeaders: {
        Authorization: `bearer ${accessToken}`,
      },
    });
    await use(api);
  },

  /** This fixture creates a test patient through the REST API.
   * This will be run for each individual test, so each test will get their
   * own patient. This ensures that tests won't conflict with each other.
   * The test patients will be deleted during the `teardown` phase, after all
   * tests have run.
   **/
  testPatient: async ({ browserName, api }, use) => {
    const response = await api.post('/api/patients', {
      data: {
        name: TEST_PATIENT_NAME,
        sex: 'MALE',
        dateOfBirth: '2000-01-01',
        isExactDateOfBirth: true,
      },
    });
    await expect(response).toBeOK();
    const patient: TestPatient = await response.json();
    await use(patient);
  },

  /** Page Object Models
   * see: https://playwright.dev/docs/pom
   */
  newPatientPage: async ({ page }, use) => {
    await use(new NewPatientPageModel(page));
  },
  patientSummaryPage: async ({ page, testPatient }, use) => {
    await use(new PatientSummaryPageModel(page, testPatient.id));
  },
  newReferralFormPage: async ({ page, testPatient }, use) => {
    await use(new NewReferralFormPageModel(page, testPatient.id));
  },
});
