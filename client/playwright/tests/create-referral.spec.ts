import moment from 'moment';
import { test } from '../fixtures';

test.describe('Create Referral', () => {
  test.beforeEach(
    'Go to Referral Form',
    async ({ patientSummaryPage, newReferralFormPage }) => {
      await patientSummaryPage.goto();
      await patientSummaryPage.clickCreateReferralButton();
      await newReferralFormPage.waitForUrl();
    }
  );

  test('Successful', async ({
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

  test('Unsuccessful - Missing Facility', async ({ newReferralFormPage }) => {
    await newReferralFormPage.enterComment('Lorem ipsum doler sit amet.');
    await newReferralFormPage.clickSubmitForm();
    await newReferralFormPage.expectToHaveUrl();
  });
});
