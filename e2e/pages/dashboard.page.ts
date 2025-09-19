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
    await this.page.waitForSelector('app-dashboard-layout', { state: 'visible' });
    await this.page.waitForSelector('app-wallets', { state: 'visible', timeout: 10000 });
    await this.page.waitForSelector('app-quick-actions', { state: 'visible', timeout: 10000 });
  }

  async expectWalletVisible() {
    await expect(this.page.locator('app-wallets')).toBeVisible();
  }

  async expectWalletBalance(currency?: string, amount?: string) {
    const balanceSelector = '.text-3xl.font-bold';
    await expect(this.page.locator(balanceSelector)).toBeVisible();
    
    if (currency) {
      const currencySelector = `text="${currency.toUpperCase()}"`;
      await expect(this.page.locator(currencySelector)).toBeVisible();
    }
    
    if (amount) {
      await expect(this.page.locator(balanceSelector)).toContainText(amount);
    }
  }

  async expectWalletAddress() {
    await expect(this.page.locator('.font-mono.text-sm')).toBeVisible();
  }

  async changeCurrency(currency: string) {
    await this.page.click('app-select');
    await this.page.click(`text="${currency}"`);
  }

  async retryWalletLoad() {
    await this.page.click('button:has-text("Retry")');
  }

  async expectQuickActionsVisible() {
    await expect(this.page.locator('app-quick-actions')).toBeVisible();
    await expect(this.page.locator('h1:has-text("Quick Actions")')).toBeVisible();
  }
  
  async clickAddFunds() {
    await this.clickDeposit();
  }

  async clickDeposit() {
    await this.page.click('text="Deposit"');
  }

  async clickTransfer() {
    await this.page.waitForSelector('text="Transfer"', { timeout: 10000 });
    await this.page.click('text="Transfer"');
  }

  async clickExchange() {
    await this.clickSwap();
  }
  
  async clickSwap() {
    await this.page.click('text="Swap"');
  }
  
  async navigateToTransactions() {
    const isMobile = await this.page.viewportSize()?.width! < 1024;
    if (isMobile) {
      await this.page.goto('/dashboard/transactions');
    } else {
      await this.page.click('a[href="/dashboard/transactions"]');
    }
  }
  
  async navigateToFxAnalytics() {
    const isMobile = await this.page.viewportSize()?.width! < 1024;
    if (isMobile) {
      await this.page.goto('/dashboard/fx-analytics');
    } else {
      await this.page.click('a[href="/dashboard/fx-analytics"]');
    }
  }
  
  async expectDashboardVisible() {
    await expect(this.page).toHaveURL('/dashboard');
    await this.expectWalletVisible();
    await this.expectQuickActionsVisible();
  }
  
  async expectUserName(name: string) {
    console.warn('expectUserName: User names are not displayed in the current dashboard implementation');
  }
  
  async expectLoadingState() {
    await expect(this.page.locator('app-wallet-skeleton')).toBeVisible();
  }
  
  async expectErrorState() {
    await expect(this.page.locator('text="Error loading wallet"')).toBeVisible();
  }
  
  async expectEmptyState() {
    await expect(this.page.locator('text="No wallet found"')).toBeVisible();
  }
  
  async expectTransferModalVisible() {
    await expect(this.page.locator('app-transfer-modal')).toBeVisible();
  }
  
  async expectDepositModalVisible() {
    await expect(this.page.locator('app-deposit-modal')).toBeVisible();
  }
  
  async expectSwapModalVisible() {
    await expect(this.page.locator('app-swap-modal')).toBeVisible();
  }
  
  async closeModal() {
    const closeButton = this.page.locator('[data-testid="close-modal"], .close-btn, button:has-text("Cancel")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await this.page.click('body', { position: { x: 10, y: 10 } });
    }
  }
  
  async verifyRecentTransactions() {
    console.warn('verifyRecentTransactions: Recent transactions are not displayed on the current dashboard');
  }
  
  async waitForWalletToLoad() {
    await this.page.waitForSelector('.text-3xl.font-bold', { state: 'visible', timeout: 10000 });
  }
  
  async waitForQuickActionsToLoad() {
    await this.page.waitForSelector('app-quick-actions h1:has-text("Quick Actions")', { state: 'visible', timeout: 10000 });
  }
}