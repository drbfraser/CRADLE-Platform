import {
  APIRequestContext,
  test as baseTest,
  request as apiRequest,
  expect,
} from '@playwright/test';
import { BASE_API_URL } from './constants';
import { PatientSummaryPageModel } from './page-object-models/patient-summary-page-model';
import { NewReferralFormPageModel } from './page-object-models/new-referral-form-page-model';
import { NewPatientFormPageModel } from './page-object-models/new-patient-form-page-model';
import { LoginPageModel } from './page-object-models/login-page-model';
import { PatientsPageModel } from './page-object-models/patients-page-model';
import { AdminPatientsPageModel } from './page-object-models/admin-patients-page-model';
import { FormTemplatesPageModel } from './page-object-models/form-templates-page-model';
import { FormTemplateBuilderPageModel } from './page-object-models/form-template-builder-page-model';

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
  loginPage: LoginPageModel;
  patientSummaryPage: PatientSummaryPageModel;
  newPatientFormPage: NewPatientFormPageModel;
  newReferralFormPage: NewReferralFormPageModel;
  patientsPage: PatientsPageModel;
  adminPatientsPage: AdminPatientsPageModel;
  formTemplatesPage: FormTemplatesPageModel;
  formBuilderPage: FormTemplateBuilderPageModel;
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
  testPatient: async ({ api, browserName }, use) => {
    const timestamp = Date.now();
    const response = await api.post('/api/patients', {
      data: {
        name: `${TEST_PATIENT_NAME}-${browserName}-${timestamp}`,
        sex: 'MALE',
        dateOfBirth: '2000-01-01',
        isExactDateOfBirth: true,
      },
    });
    await expect(response).toBeOK();
    const patient: TestPatient = await response.json();
    await use(patient);
    await api.delete(`api/patients/${patient.id}`);
  },

  /** Page Object Models
   * see: https://playwright.dev/docs/pom
   * The Page Object Model classes use the postfix "Model" to avoid naming
   * conflicts with page components.
   */
  loginPage: async ({ page }, use) => {
    await use(new LoginPageModel(page));
  },
  patientSummaryPage: async ({ page, testPatient }, use) => {
    await use(new PatientSummaryPageModel(page, testPatient.id));
  },
  newPatientFormPage: async ({ page }, use) => {
    await use(new NewPatientFormPageModel(page));
  },
  newReferralFormPage: async ({ page, testPatient }, use) => {
    await use(new NewReferralFormPageModel(page, testPatient.id));
  },
  patientsPage: async ({ page }, use) => {
    await use(new PatientsPageModel(page));
  },
  adminPatientsPage: async ({ page }, use) => {
    await use(new AdminPatientsPageModel(page));
  },
  formTemplatesPage: async ({ page }, use) => {
    await use(new FormTemplatesPageModel(page));
  },
  formBuilderPage: async ({ page }, use) => {
    await use(new FormTemplateBuilderPageModel(page));
  },
});
