import { type Page, type Locator } from '@playwright/test';

export class PatientSummaryPageModel {
  readonly page: Page;
  readonly url: string;

  private readonly createReferralButton: Locator;

  constructor(page: Page, patientId: string) {
    this.page = page;
    this.url = `/patients/${patientId}`;
    this.createReferralButton = page.getByRole('button', {
      name: 'Create Referral',
    });
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async clickCreateReferralButton() {
    await this.createReferralButton.click();
  }
}
