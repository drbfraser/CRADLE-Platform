import { test, expect } from '@playwright/test';
import { TEST_PATIENTS } from './constants';

test('Create Referral', async ({ page, browserName }) => {
  const patient = TEST_PATIENTS.AA;
  await page.goto(`/patients/${patient.id}`);
  await page.waitForURL(`/patients/${patient.id}`);

  await page.getByRole('button', { name: 'Create Referral' }).click();
  await expect(page).toHaveURL(`/referrals/new/${patient.id}`);

  await page.getByRole('combobox', { name: 'Refer To' }).click();
  await page.getByText('H1000').click();
  await page
    .getByRole('textbox', { name: 'Comments' })
    .fill(`referral-test | patient_id=${patient.id} | browser=${browserName}`);

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(`/patients/${patient.id}`);
  const successAlert = await page.getByRole('alert').getByText('success');
  await expect(successAlert).toBeVisible();
});
