import { expect } from '@playwright/test';
import { test } from '../fixtures';

// Test suite for archiving a patient
test.describe('Archive Patient', () => {
  test.beforeEach(async ({ patientsPage }) => {
    await patientsPage.goto();
  });

  test('Archive a patient named AB', async ({ patientsPage }) => {
    // check if AB exists in /patients
    await expect(await patientsPage.getPatientRowByName('AB')).toBeVisible();

    await patientsPage.gotoAdminPatients();

    // check if AB exists in admins/patients
    await expect(
      await patientsPage.getAdminPatientRowByName('AB')
    ).toBeVisible();

    await patientsPage.archivePatientByName('AB');

    // check that AB is not visible in /patients
    await expect(
      await patientsPage.getAdminPatientRowByName('AB')
    ).not.toBeVisible();
  });
});
