/* eslint-disable react-hooks/rules-of-hooks */
import {
  APIRequestContext,
  test as baseTest,
  request as apiRequest,
} from '@playwright/test';
import { BASE_API_URL } from './constants';
import { PatientSummaryPage } from './page-object-models/patient-summary-page';
import { NewReferralFormPage } from './page-object-models/new-referral-form-page';

type TestPatient = {
  name: string;
  id: string;
};

export type CradleFixtures = {
  api: APIRequestContext;

  patient: TestPatient;
  patientSummaryPage: PatientSummaryPage;
  newReferralFormPage: NewReferralFormPage;
};

/**
 * This test object extends the Playwright base test object to add
 * common fixtures that we want to make available to all of our
 * Playwright tests.
 */
export const cradleTest = baseTest.extend<CradleFixtures>({
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
});
