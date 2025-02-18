import { test, expect } from '@playwright/test';

/**
 *
 */

test('Create Patient', async ({ page, browserName }) => {
  test.skip(true, 'Skipping this test until it is completed.');

  await page.goto('/patients');
  await page.waitForURL('/patients');
  await expect(page).toHaveURL('/patients');

  // Click New Patient button.
  await page.getByRole('link', { name: 'New Patient' }).click();
  await expect(page).toHaveURL('/patients/new');

  /**
   * TODO: Remove Patient ID field from New Patient form, as it makes testing difficult.
   * Playwright runs tests in parallel, and runs the test for each browser specified
   * in the playwright config, so each test will be run multiple times in parallel.
   * This means that we can't hardcode values for mutation operations that our
   * database expects to be unique. Patient IDs are one such value which we cannot
   * hardcode in these tests. The `id` field of the Patient table in our database
   * is a string, but right now the New Patient form requires that the patientId
   * be a number. If it could be an arbitrary string, then we could use the
   * browserName in the patientId field to ensure that the parallel runs of the
   * test in different browsers aren't all trying to create a patient with the
   * same ID.
   *
   * Better yet, we probably shouldn't have the patient ID be a field in the
   * form at all, as this ID can be set to a unique value on the server side.
   *
   */

  await page
    .getByRole('textbox', { name: 'Patient Name' })
    .fill(`E2E-Test-Patient-${browserName}`);
});
