import { Page, expect } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/get-started');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('app-onboarding-form', { state: 'visible' });
  }
  
  async fillEmail(email: string) {
    await this.page.fill('#email input', email);
  }
  
  async clickCreateWallet() {
    await this.page.click('button[type="submit"]');
  }
  
  async verifyOnboardingComplete() {
    await this.page.waitForURL('/dashboard');
  }
  
  async expectErrorMessage(message: string) {
    await expect(this.page.locator('#email-error')).toContainText(message);
  }
  
  async expectEmailError(message: string) {
    await expect(this.page.locator('#email-error')).toContainText(message);
  }
  
  async expectFormVisible() {
    await expect(this.page.locator('app-onboarding-form')).toBeVisible();
  }
  
  async expectEmailInputVisible() {
    await expect(this.page.locator('#email input')).toBeVisible();
  }
  
  async expectCreateWalletButtonVisible() {
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
  }
  
  async isCreateWalletButtonDisabled() {
    return await this.page.locator('button[type="submit"]').isDisabled();
  }
  
  async expectCreateWalletButtonDisabled() {
    await expect(this.page.locator('button[type="submit"]')).toBeDisabled();
  }
  
  async expectCreateWalletButtonEnabled() {
    await expect(this.page.locator('button[type="submit"]')).toBeEnabled();
  }
  
  async getEmailValue() {
    return await this.page.locator('#email input').inputValue();
  }
  
  async expectEmailValue(email: string) {
    const value = await this.getEmailValue();
    expect(value).toBe(email);
  }
  
  async expectPageTitle() {
    await expect(this.page.locator('h1')).toContainText('Welcome to CROSS PAY');
  }
  
  async expectPageDescription() {
    await expect(this.page.locator('p.text-gray-600')).toContainText('Get started by inputing your email and we will handle the wallet creation for you!');
  }
  
  async fillUserDetails(email: string, firstName?: string, lastName?: string) {
    console.warn('fillUserDetails: firstName and lastName fields do not exist in the onboarding form. Only email is supported.');
    await this.fillEmail(email);
  }
  
  async selectCountry(country: string) {
    console.warn('selectCountry: Country selection does not exist in the onboarding form.');
  }
  
  async selectCurrency(currency: string) {
    console.warn('selectCurrency: Currency selection does not exist in the onboarding form.');
  }
  
  async clickContinue() {
    console.warn('clickContinue: Using clickCreateWallet instead as the button text is "Create wallet"');
    await this.clickCreateWallet();
  }
  
  async expectFieldError(field: string, message: string) {
    if (field === 'email') {
      await this.expectEmailError(message);
    } else {
      console.warn(`expectFieldError: Field "${field}" does not exist in the onboarding form. Only email field is supported.`);
    }
  }
}