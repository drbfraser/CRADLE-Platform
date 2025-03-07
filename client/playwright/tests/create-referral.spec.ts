import { expect } from '@playwright/test';
import moment from 'moment';
import { test } from '../fixtures';

test.describe('Create Referral', () => {
  test.beforeEach(
    'Navigate to Referral Form',
    async ({ patientSummaryPage, newReferralFormPage }) => {
      await patientSummaryPage.goto();
      await patientSummaryPage.clickCreateReferralButton();
      await newReferralFormPage.expectToHaveUrl();
    }
  );

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

    await newReferralFormPage.selectReferToOption('H1000');
    await newReferralFormPage.enterComment(referralComment);
    await newReferralFormPage.clickSubmitForm();

    await patientSummaryPage.expectToHaveUrl();
    await patientSummaryPage.expectSuccessToast();
    await patientSummaryPage.expectReferralPendingCardByComment(
      referralComment
    );
  });

  test('Attempt Create Referral - Missing Facility', async ({
    newReferralFormPage,
  }) => {
    await newReferralFormPage.enterComment('Lorem ipsum doler sit amet.');
    await newReferralFormPage.clickSubmitForm();

    await newReferralFormPage.expectToHaveUrl();
    expect(newReferralFormPage).toContain('Please fill in this field');
  });
});
