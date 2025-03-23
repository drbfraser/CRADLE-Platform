import { expect } from '@playwright/test';
import { test } from '../fixtures';

// Test suite for archiving a patient
test.describe('Archive Patient', () => {
  test.beforeEach(async ({ patientsPage, testPatient }) => {
    await patientsPage.goto();
  });

  test(`Archive a patient`, async ({ patientsPage, testPatient }) => {
    const patientName = testPatient.name;

    // check if patientName exists in /patients
    await expect(
      await patientsPage.getPatientRowByName(patientName)
    ).toBeVisible();

    await patientsPage.gotoAdminPatients();

    // check if patientName exists in admins/patients
    const row = patientsPage.getAdminPatientRowByName(patientName);
    await expect(await row).toBeVisible();

    await patientsPage.archivePatientByName(patientName);

    // go back to /patients and check if patientName is no longer there
    await patientsPage.goto();
    await expect(
      await patientsPage.getPatientRowByName(patientName)
    ).not.toBeVisible();
  });
});
