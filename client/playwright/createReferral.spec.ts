import { expect } from '@playwright/test';
import moment from 'moment';
import { cradleTest as test } from './fixtures';

test.describe('Create Referral', () => {
  test('Create Referral', async ({
    page,
    testPatient,
    patientSummaryPage,
    newReferralFormPage,
  }) => {
    const referralComment = `e2e-test | patientId=${
      testPatient.id
    } | dateTime=${moment().format()}`;

    await patientSummaryPage.goto();

    await patientSummaryPage.clickCreateReferralButton();

    await expect(page).toHaveURL(newReferralFormPage.url);

    await newReferralFormPage.selectReferToOption('H1000');
    await newReferralFormPage.enterComment(referralComment);
    await newReferralFormPage.submitForm();

    await expect(page).toHaveURL(patientSummaryPage.url);

    const successAlert = page.getByRole('alert').getByText('success');
    await expect(successAlert).toBeVisible();

    const referralCard = page.getByText(referralComment);
    await referralCard.scrollIntoViewIfNeeded();
    await expect(referralCard).toContainText(referralComment);
  });
});
