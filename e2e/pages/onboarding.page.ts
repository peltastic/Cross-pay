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
  }

  async fillUserDetails(email: string, firstName: string, lastName: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="first-name-input"]', firstName);
    await this.page.fill('[data-testid="last-name-input"]', lastName);
  }

  async selectCountry(country: string) {
    await this.page.click('[data-testid="country-select"]');
    await this.page.click(`[data-testid="country-option-${country}"]`);
  }

  async selectCurrency(currency: string) {
    await this.page.click('[data-testid="currency-select"]');
    await this.page.click(`[data-testid="currency-option-${currency}"]`);
  }

  async clickContinue() {
    await this.page.click('[data-testid="continue-button"]');
  }

  async verifyOnboardingComplete() {
    await expect(this.page).toHaveURL('/dashboard');
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator('[data-testid="error-message"]')).toContainText(message);
  }

  async expectFieldError(field: string, message: string) {
    await expect(this.page.locator(`[data-testid="${field}-error"]`)).toContainText(message);
  }
}