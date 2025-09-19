import { test, expect } from '@playwright/test';
import { TransactionsPage } from './pages/transactions.page';
import { TestUtils } from './utils/test-utils';
import { testUsers } from './fixtures/test-data';

test.describe('Transactions Page', () => {
  let transactionsPage: TransactionsPage;

  test.beforeEach(async ({ page }) => {
    transactionsPage = new TransactionsPage(page);
    await TestUtils.setLocalStorage(page, 'user', testUsers.validUser);
    
    await TestUtils.mockApiResponse(page, '/api/transactions', {
      transactions: [
        {
          id: 'tx_1',
          amount: '100.00',
          currency: 'USD',
          type: 'transfer',
          status: 'completed',
          date: '2025-09-19T10:00:00Z',
          description: 'Test transfer'
        },
        {
          id: 'tx_2',
          amount: '50.00',
          currency: 'EUR',
          type: 'exchange',
          status: 'pending',
          date: '2025-09-19T09:00:00Z',
          description: 'Currency exchange'
        }
      ],
      pagination: {
        currentPage: 0,
        totalPages: 5,
        totalCount: 50,
        pageSize: 10
      }
    });
    
    await transactionsPage.goto();
    await TestUtils.waitForAngularToLoad(page);
  });

  test('should display transactions table', async ({ page }) => {
    await transactionsPage.expectTransactionsVisible();
    await transactionsPage.expectTransactionCount(2);
  });

  test('should display transaction details correctly', async ({ page }) => {
    await transactionsPage.expectTransactionDetails(0, {
      amount: '100.00',
      currency: 'USD',
      type: 'transfer',
      status: 'completed'
    });
    
    await transactionsPage.expectTransactionDetails(1, {
      amount: '50.00',
      currency: 'EUR',
      type: 'exchange',
      status: 'pending'
    });
  });

  test('should filter transactions by type', async ({ page }) => {
    // Mock filtered response
    await TestUtils.mockApiResponse(page, '/api/transactions?type=transfer', {
      transactions: [
        {
          id: 'tx_1',
          amount: '100.00',
          currency: 'USD',
          type: 'transfer',
          status: 'completed',
          date: '2025-09-19T10:00:00Z'
        }
      ],
      pagination: {
        currentPage: 0,
        totalPages: 1,
        totalCount: 1,
        pageSize: 10
      }
    });
    
    await transactionsPage.filterByType('transfer');
    await transactionsPage.expectTransactionCount(1);
  });

  test('should filter transactions by date range', async ({ page }) => {
    const startDate = '2025-09-19';
    const endDate = '2025-09-19';
    
    await TestUtils.mockApiResponse(page, `/api/transactions?startDate=${startDate}&endDate=${endDate}`, {
      transactions: [
        {
          id: 'tx_1',
          amount: '100.00',
          currency: 'USD',
          type: 'transfer',
          status: 'completed',
          date: '2025-09-19T10:00:00Z'
        }
      ],
      pagination: {
        currentPage: 0,
        totalPages: 1,
        totalCount: 1,
        pageSize: 10
      }
    });
    
    await transactionsPage.filterByDateRange(startDate, endDate);
    await transactionsPage.expectTransactionCount(1);
  });

  test('should search transactions', async ({ page }) => {
    const searchQuery = 'Test transfer';
    
    await TestUtils.mockApiResponse(page, `/api/transactions?search=${encodeURIComponent(searchQuery)}`, {
      transactions: [
        {
          id: 'tx_1',
          amount: '100.00',
          currency: 'USD',
          type: 'transfer',
          status: 'completed',
          date: '2025-09-19T10:00:00Z',
          description: 'Test transfer'
        }
      ],
      pagination: {
        currentPage: 0,
        totalPages: 1,
        totalCount: 1,
        pageSize: 10
      }
    });
    
    await transactionsPage.searchTransactions(searchQuery);
    await transactionsPage.expectTransactionCount(1);
  });

  test('should handle pagination', async ({ page }) => {
    await transactionsPage.expectPaginationVisible();
    
    // Mock page 2 data
    await TestUtils.mockApiResponse(page, '/api/transactions?page=1', {
      transactions: [
        {
          id: 'tx_3',
          amount: '75.00',
          currency: 'GBP',
          type: 'deposit',
          status: 'completed',
          date: '2025-09-18T15:00:00Z'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        pageSize: 10
      }
    });
    
    await transactionsPage.navigateToPage(2);
    await transactionsPage.expectTransactionCount(1);
  });

  test('should handle empty state', async ({ page }) => {
    // Mock empty response
    await TestUtils.mockApiResponse(page, '/api/transactions', {
      transactions: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalCount: 0,
        pageSize: 10
      }
    });
    
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test('should handle API errors', async ({ page }) => {
    await TestUtils.mockApiError(page, '/api/transactions', 500);
    
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
  });
});