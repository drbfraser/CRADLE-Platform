import { type Page, type Locator } from '@playwright/test';

export class NewPatientPage {
  private readonly page: Page;
  private readonly url = '/patients/new';
  private readonly patientNameField: Locator;
  private readonly householdNumberField: Locator;
  private readonly villageNumberField: Locator;
  private readonly zoneIdField: Locator;
  private readonly dateOfBirthButton: Locator;
  private readonly estimatedAgeButton: Locator;
  private readonly dateOfBirthField: Locator;
  private readonly patientAgeField: Locator;
  private readonly sexDropdown: Locator;
  private readonly allergiesField: Locator;
  private readonly nextButton: Locator;
  private readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.patientNameField = page.getByRole('textbox', { name: 'Patient Name' });
    this.householdNumberField = page.getByRole('textbox', {
      name: 'Household Number',
    });
    this.villageNumberField = page.getByRole('textbox', {
      name: 'Village Number',
    });
    this.zoneIdField = page.getByRole('textbox', { name: 'Zone ID' });
    this.dateOfBirthButton = page.getByRole('button', {
      name: 'Date of Birth',
    });
    this.estimatedAgeButton = page.getByRole('button', {
      name: 'Estimated Age',
    });
    this.dateOfBirthField = page.getByRole('textbox', {
      name: 'Date of Birth',
    });
    this.patientAgeField = page.getByRole('spinbutton', {
      name: 'Patient Age',
    });
    this.sexDropdown = page.getByRole('combobox', { name: /Sex.*/ });
    this.allergiesField = page.getByRole('textbox', { name: 'Allergies' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.createButton = page.getByRole('button', { name: 'Create' });
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForURL(this.url);
  }

  async fillBasicFields(name: string) {
    await this.patientNameField.fill(name);
    await this.householdNumberField.fill('1');
    await this.villageNumberField.fill('1');
    await this.zoneIdField.fill('1');
  }

  async fillExactDateOfBirth(dateOfBirth: string = '01/01/2000') {
    await this.dateOfBirthButton.click();
    await this.dateOfBirthField.fill(dateOfBirth);
  }

  async fillEstimatedAge(estimatedAge: string = '25') {
    await this.estimatedAgeButton.click();
    await this.patientAgeField.fill(estimatedAge);
  }

  async selectGender(gender: 'Male' | 'Female' = 'Male') {
    await this.sexDropdown.click();
    await this.page.getByRole('option', { name: gender, exact: true }).click();
  }

  async fillAllergies(allergies: string) {
    await this.allergiesField.fill(allergies);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickCreate() {
    await this.createButton.click();
  }
}
