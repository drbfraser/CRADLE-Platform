import { expect } from '@playwright/test';
import { test } from '../fixtures';

// Test suite for archiving a patient
test.describe('Go to Patient Page', () => {
  test.beforeEach(async ({ patientsPage, testPatient }) => {
    await patientsPage.goto();
  });

  test(`Archive a patient`, async ({
    patientsPage,
    adminPatientsPage,
    testPatient,
  }) => {
    const patientName = testPatient.name;

    // check if patientName exists in /patients
    await expect(patientsPage.getPatientRowByName(patientName)).toBeVisible();

    await adminPatientsPage.goto();

    // check if patientName exists in admins/patients
    const row = adminPatientsPage.getPatientRowByName(patientName);
    await expect(row).toBeVisible();

    await adminPatientsPage.archivePatientByName(patientName);

    // go back to /patients and check if patientName is no longer there
    await patientsPage.goto();
    await expect(
      patientsPage.getPatientRowByName(patientName)
    ).not.toBeVisible();
  });
});
