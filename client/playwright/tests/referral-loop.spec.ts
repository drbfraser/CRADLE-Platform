import { expect } from '@playwright/test';
import moment from 'moment';
import { test } from '..//fixtures';

for (let i = 0; i < 10; i++) {
  test.describe(`Create Referral Iteration #${i + 1}`, () => {
    test.beforeEach(
      'Navigate to Referral Form',
      async ({ patientSummaryPage, newReferralFormPage }) => {
        await patientSummaryPage.goto();
        await patientSummaryPage.clickCreateReferralButton();
        await newReferralFormPage.expectToHaveUrl();
      }
    );

    test(`Successful Flow for Iteration #${i + 1}`, async ({
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

    test(`Unsuccessful Flow for Iteration #${i + 1}`, async ({
      page,
      newReferralFormPage,
    }) => {
      await newReferralFormPage.enterComment('Lorem ipsum doler sit amet.');
      await newReferralFormPage.clickSubmitForm();
      await newReferralFormPage.expectToHaveUrl();
    });
  });
}
