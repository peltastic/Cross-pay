import { Page, expect } from '@playwright/test';

export class TransactionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard/transactions');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectTransactionsVisible() {
    await expect(this.page.locator('[data-testid="transactions-table"]')).toBeVisible();
  }

  async filterByType(type: string) {
    await this.page.click('[data-testid="transaction-type-filter"]');
    await this.page.click(`[data-testid="filter-${type}"]`);
  }

  async filterByDateRange(startDate: string, endDate: string) {
    await this.page.fill('[data-testid="start-date-input"]', startDate);
    await this.page.fill('[data-testid="end-date-input"]', endDate);
    await this.page.click('[data-testid="apply-date-filter"]');
  }

  async searchTransactions(query: string) {
    await this.page.fill('[data-testid="transaction-search"]', query);
    await this.page.press('[data-testid="transaction-search"]', 'Enter');
  }

  async expectTransactionCount(count: number) {
    const transactions = this.page.locator('[data-testid="transaction-row"]');
    await expect(transactions).toHaveCount(count);
  }

  async expectPaginationVisible() {
    await expect(this.page.locator('[data-testid="pagination"]')).toBeVisible();
  }

  async navigateToPage(pageNumber: number) {
    await this.page.click(`[data-testid="page-${pageNumber}"]`);
  }

  async expectTransactionDetails(index: number, details: {
    amount?: string;
    currency?: string;
    type?: string;
    status?: string;
  }) {
    const transaction = this.page.locator(`[data-testid="transaction-row"]:nth-child(${index + 1})`);
    
    if (details.amount) {
      await expect(transaction.locator('[data-testid="transaction-amount"]')).toContainText(details.amount);
    }
    
    if (details.currency) {
      await expect(transaction.locator('[data-testid="transaction-currency"]')).toContainText(details.currency);
    }
    
    if (details.type) {
      await expect(transaction.locator('[data-testid="transaction-type"]')).toContainText(details.type);
    }
    
    if (details.status) {
      await expect(transaction.locator('[data-testid="transaction-status"]')).toContainText(details.status);
    }
  }
}