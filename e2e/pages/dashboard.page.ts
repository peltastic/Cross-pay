import { Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectDashboardVisible() {
    await expect(this.page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="wallet-balance"]')).toBeVisible();
  }

  async expectWalletBalance(currency: string, amount?: string) {
    const walletElement = this.page.locator(`[data-testid="wallet-${currency}"]`);
    await expect(walletElement).toBeVisible();
    
    if (amount) {
      await expect(walletElement.locator('[data-testid="balance-amount"]')).toContainText(amount);
    }
  }

  async clickAddFunds() {
    await this.page.click('[data-testid="add-funds-button"]');
  }

  async clickTransfer() {
    await this.page.click('[data-testid="transfer-button"]');
  }

  async clickExchange() {
    await this.page.click('[data-testid="exchange-button"]');
  }

  async navigateToTransactions() {
    await this.page.click('[data-testid="transactions-nav"]');
    await expect(this.page).toHaveURL('/dashboard/transactions');
  }

  async navigateToFxAnalytics() {
    await this.page.click('[data-testid="fx-analytics-nav"]');
    await expect(this.page).toHaveURL('/dashboard/fx-analytics');
  }

  async expectUserName(name: string) {
    await expect(this.page.locator('[data-testid="user-name"]')).toContainText(name);
  }

  async verifyRecentTransactions() {
    await expect(this.page.locator('[data-testid="recent-transactions"]')).toBeVisible();
  }
}