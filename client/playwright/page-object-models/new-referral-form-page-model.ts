import { type Page, type Locator } from '@playwright/test';
import { PageObjectModel } from './page-object-model';

export class NewReferralFormPageModel extends PageObjectModel {
  private readonly referToDropdown: Locator;
  private readonly commentsField: Locator;
  private readonly submitReferralButton: Locator;

  constructor(page: Page, patientId: string) {
    super(page, `/referrals/new/${patientId}`);

    this.referToDropdown = page.getByRole('combobox', { name: 'Refer To' });
    this.commentsField = page.getByRole('textbox', { name: 'Comments' });
    this.submitReferralButton = page.getByRole('button', { name: 'Submit' });
  }

  async selectReferToOption(option: string = 'H1000') {
    await this.referToDropdown.click();
    await this.page.getByText(option).click();
  }

  async enterComment(comment: string) {
    await this.commentsField.fill(comment);
  }

  async submitForm() {
    await this.submitReferralButton.click();
  }
}
