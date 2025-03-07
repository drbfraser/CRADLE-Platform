import { type Page, type Locator, expect } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientSummaryPageModel extends PageObjectModel {
  private readonly createReferralButton: Locator;
  private readonly successToast: Locator;
  private readonly referralPendingCard: Locator;

  constructor(page: Page, patientId: string) {
    super(page, `/patients/${patientId}`);
    this.createReferralButton = page.getByRole('button', {
      name: 'Create Referral',
    });
    this.successToast = page.getByRole('alert').filter({ hasText: 'success' });
    this.referralPendingCard = page
      .locator('div')
      .filter({
        has: page.getByRole('heading', { name: 'Referral Pending' }),
      })
      .filter({ has: page.getByText('Referral Comment') });
  }

  async clickCreateReferralButton() {
    await this.createReferralButton.click();
  }

  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  /** Assert visibility of a Referral Pending card with a particular comment. */
  async expectReferralPendingCardByComment(comment: string) {
    const referralPendingCard = this.referralPendingCard.getByText(comment);
    await referralPendingCard.scrollIntoViewIfNeeded();
    await expect(referralPendingCard).toBeVisible();
  }
}
