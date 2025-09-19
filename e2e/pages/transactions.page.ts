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
    await expect(this.page.locator('app-data-table')).toBeVisible();
    await expect(this.page.locator('app-data-table table')).toBeVisible();
  }
  
  async filterByType(type: string) {
    console.log(`Filter by type ${type} not implemented in UI`);
  }
  
  async filterByDateRange(startDate: string, endDate: string) {
    console.log(`Filter by date range ${startDate} to ${endDate} not implemented in UI`);
  }
  
  async searchTransactions(query: string) {
    console.log(`Search transactions for ${query} not implemented in UI`);
  }
  
  async expectTransactionCount(count: number) {
    const transactions = this.page.locator('app-data-table tbody tr');
    await expect(transactions).toHaveCount(count);
  }
  
  async expectPaginationVisible() {
    await expect(this.page.locator('app-pagination')).toBeVisible();
  }
  
  async navigateToPage(pageNumber: number) {
    await this.page.click(`app-pagination button:has-text("${pageNumber + 1}")`);
  }
  
  async expectTransactionDetails(index: number, details: {
    amount?: string;
    currency?: string;
    type?: string;
    status?: string;
  }) {
    const transaction = this.page.locator(`app-data-table tbody tr:nth-child(${index + 1})`);
    
    if (details.amount) {
      const amountCell = transaction.locator('td:nth-child(3)');
      await expect(amountCell).toContainText(details.amount);
    }
    
    if (details.type) {
      const typeCell = transaction.locator('td:nth-child(2)');
      await expect(typeCell).toContainText(details.type);
    }
    
    if (details.currency) {
      const currencyCell = transaction.locator('td:nth-child(4)');
      await expect(currencyCell).toContainText(details.currency);
    }
    
    if (details.status) {
      console.log(`Status validation for ${details.status} not supported - column doesn't exist`);
    }
  }
}