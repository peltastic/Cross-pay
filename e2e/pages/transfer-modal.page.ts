import { Page, expect } from '@playwright/test';

export class TransferModal {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectModalVisible() {
    await expect(this.page.locator('app-transfer-modal')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('h2:has-text("Transfer Funds")')).toBeVisible({ timeout: 5000 });
  }

  async selectFromCurrency(currency: string) {
    const fromCurrencySelect = this.page.locator('app-select').first();
    await fromCurrencySelect.click();
    await this.page.click(`text="${currency}"`);
  }

  async selectToCurrency(currency: string) {
    const toCurrencySelect = this.page.locator('app-select').nth(1);
    await toCurrencySelect.click();
    await this.page.click(`text="${currency}"`);
  }

  async enterAmount(amount: string) {
    await this.page.fill('input[type="number"]', amount);
  }

  async enterRecipientAddress(address: string) {
    await this.page.fill('input[placeholder="Enter wallet address"]', address);
  }

  async submitTransfer() {
    await this.page.click('button[type="submit"]:has-text("Transfer Funds")');
  }

  async expectTransferring() {
    await expect(this.page.locator('text="Processing Transfer..."')).toBeVisible();
  }

  async expectSuccessMessage() {
    await expect(this.page.locator('.bg-success-background')).toBeVisible();
  }

  async expectValidationError(field: string, message: string) {
    // Generic error expectation
    await expect(this.page.locator('.text-error-message-text, .text-red-600')).toContainText(
      message
    );
  }

  async expectAmountError(message: string) {
    await expect(this.page.locator('.text-xs.text-red-600')).toContainText(message);
  }

  async expectConversionRate() {
    await expect(this.page.locator('text="Rate:"')).toBeVisible();
  }

  async expectConversionResult() {
    await expect(this.page.locator('text="You are sending"')).toBeVisible();
  }

  async expectConversionLoading() {
    await expect(this.page.locator('text="Getting conversion rate..."')).toBeVisible();
  }

  async expectConversionError() {
    await expect(this.page.locator('app-error-message')).toBeVisible();
  }

  async expectAvailableBalance(currency: string) {
    await expect(this.page.locator(`text="Available:"`)).toBeVisible();
    await expect(this.page.locator(`text="${currency}"`)).toBeVisible();
  }

  async closeModal() {
    await this.page.click('button:has-text("Cancel")');
  }

  async expectModalClosed() {
    await expect(this.page.locator('app-transfer-modal')).not.toBeVisible();
  }

  async expectFormValid() {
    const submitButton = this.page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  }

  async expectFormInvalid() {
    const submitButton = this.page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  }

  async waitForModalToLoad() {
    await this.page.waitForSelector('app-transfer-modal', { state: 'visible' });
    await this.page.waitForSelector('h2:has-text("Transfer Funds")', { state: 'visible' });
  }

  async selectSourceWallet(currency: string) {
    await this.selectFromCurrency(currency);
  }

  async addDescription(description: string) {
    console.warn(
      'addDescription: Transfer modal does not have a description field in current implementation'
    );
  }
}
