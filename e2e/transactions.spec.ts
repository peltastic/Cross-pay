import { test, expect } from '@playwright/test';
import { TransactionsPage } from './pages/transactions.page';
import { OnboardingPage } from './pages/onboarding.page';
import { TestUtils } from './utils/test-utils';
import { testUsers } from './fixtures/test-data';

test.describe('Transactions Page', () => {
  let transactionsPage: TransactionsPage;
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    transactionsPage = new TransactionsPage(page);
    onboardingPage = new OnboardingPage(page);
    
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    
    await TestUtils.mockApiResponse(page, '/api/create/wallet', {
      user: { email: testUsers.validUser.email },
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        walletAddress: walletAddress,
        balance: {
          USD: 1000.00,
          EUR: 850.00,
          GBP: 750.00,
          NGN: 450000,
          JPY: 150000,
          CAD: 1200,
          GHS: 5000,
          BTC: 0.05
        }
      }
    });
    
    await TestUtils.mockApiResponse(page, `/api/wallet/${encodeURIComponent(testUsers.validUser.email)}`, {
      id: 'wallet-1',
      userId: 'user-1',
      walletAddress: walletAddress,
      balance: {
        USD: 1000.00,
        EUR: 850.00,
        GBP: 750.00,
        NGN: 450000,
        JPY: 150000,
        CAD: 1200,
        GHS: 5000,
        BTC: 0.05
      }
    });
    
    await TestUtils.mockApiResponse(page, `/api/transactions/${encodeURIComponent(walletAddress)}`, [
      {
        id: 'tx_1',
        amount: 100.00,
        currency: 'USD',
        transactionType: 'transfer',
        destinationAddress: '0xabcd...1234',
        walletAddress: walletAddress,
        email: testUsers.validUser.email,
        direction: 'debit',
        createdAt: '2025-09-19T10:00:00Z'
      },
      {
        id: 'tx_2',
        amount: 50.00,
        currency: 'EUR',
        transactionType: 'deposit',
        destinationAddress: null,
        walletAddress: walletAddress,
        email: testUsers.validUser.email,
        direction: 'credit',
        createdAt: '2025-09-19T09:00:00Z'
      }
    ]);
    
    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    await onboardingPage.fillEmail(testUsers.validUser.email);
    await onboardingPage.clickCreateWallet();
    
    await TestUtils.waitForAngularToLoad(page);
    await transactionsPage.goto();
    await TestUtils.waitForAngularToLoad(page);
  });
  
  test('should display transactions table', async ({ page }) => {
    await transactionsPage.expectTransactionsVisible();
    const transactionCount = await page.locator('app-data-table tbody tr').count();
    expect(transactionCount).toBeGreaterThan(0);
  });
});
