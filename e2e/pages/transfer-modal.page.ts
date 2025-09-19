import { Page, expect } from '@playwright/test';

export class TransferModal {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectModalVisible() {
    await expect(this.page.locator('[data-testid="transfer-modal"]')).toBeVisible();
  }

  async selectSourceWallet(currency: string) {
    await this.page.click('[data-testid="source-wallet-select"]');
    await this.page.click(`[data-testid="wallet-option-${currency}"]`);
  }

  async enterRecipientAddress(address: string) {
    await this.page.fill('[data-testid="recipient-address-input"]', address);
  }

  async enterAmount(amount: string) {
    await this.page.fill('[data-testid="transfer-amount-input"]', amount);
  }

  async addDescription(description: string) {
    await this.page.fill('[data-testid="transfer-description-input"]', description);
  }

  async submitTransfer() {
    await this.page.click('[data-testid="submit-transfer-button"]');
  }

  async expectSuccessMessage() {
    await expect(this.page.locator('[data-testid="transfer-success"]')).toBeVisible();
  }

  async expectValidationError(field: string, message: string) {
    await expect(this.page.locator(`[data-testid="${field}-error"]`)).toContainText(message);
  }

  async closeModal() {
    await this.page.click('[data-testid="close-modal-button"]');
  }

  async expectModalClosed() {
    await expect(this.page.locator('[data-testid="transfer-modal"]')).not.toBeVisible();
  }
}