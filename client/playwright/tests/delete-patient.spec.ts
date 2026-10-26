import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.describe('Delete a patient', () => {
  test('Admin deletes a patient', async ({
    patientsPage,
    adminPatientsPage,
    testPatient,
  }) => {
    const patientName = testPatient.name;

    await adminPatientsPage.goto();
    await expect(
      adminPatientsPage.getPatientRowByName(patientName)
    ).toBeVisible();

    await adminPatientsPage.deletePatientByName(patientName);

    // Gone from the admin table and from the Patients page
    await expect(
      adminPatientsPage.getPatientRowByName(patientName)
    ).not.toBeVisible();
    await patientsPage.goto();
    await expect(
      patientsPage.getPatientRowByName(patientName)
    ).not.toBeVisible();
  });
});
