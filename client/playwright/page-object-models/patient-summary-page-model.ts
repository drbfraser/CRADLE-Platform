import { type Page, type Locator } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class PatientSummaryPageModel extends PageObjectModel {
  private readonly createReferralButton: Locator;

  constructor(page: Page, patientId: string) {
    super(page, `/patients/${patientId}`);
    this.createReferralButton = page.getByRole('button', {
      name: 'Create Referral',
    });
  }

  async clickCreateReferralButton() {
    await this.createReferralButton.click();
  }
}
