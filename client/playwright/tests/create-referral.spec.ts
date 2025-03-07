import { expect } from '@playwright/test';
import moment from 'moment';
import { test } from '../fixtures';

test.describe('Create Referral', () => {
  test('Create Referral', async ({
    page,
    testPatient,
    patientSummaryPage,
    newReferralFormPage,
  }) => {
    /** Use timestamp in the comment to identify the referral later. */
    const referralComment = `e2e-test | patientId=${
      testPatient.id
    } | dateTime=${moment().format()}`;

    await patientSummaryPage.goto();

    await patientSummaryPage.clickCreateReferralButton();

    await expect(page).toHaveURL(newReferralFormPage.url);

    await newReferralFormPage.selectReferToOption('H1000');
    await newReferralFormPage.enterComment(referralComment);
    await newReferralFormPage.submitForm();

    await patientSummaryPage.expectToHaveUrl();
    await patientSummaryPage.expectSuccessToast();

    // const referralCard = page.getByText(referralComment);
    // await referralCard.scrollIntoViewIfNeeded();
    // await expect(referralCard).toContainText(referralComment);
    await patientSummaryPage.expectReferralPendingCardByComment(
      referralComment
    );
  });
});
