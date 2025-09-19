import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { TransferModal } from './pages/transfer-modal.page';
import { TestUtils } from './utils/test-utils';
import { testUsers, testWallets, testTransactions } from './fixtures/test-data';

test.describe('Dashboard Functionality', () => {
  let dashboardPage: DashboardPage;
  let transferModal: TransferModal;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    transferModal = new TransferModal(page);

    await TestUtils.setLocalStorage(page, 'user', testUsers.validUser);
    await TestUtils.setLocalStorage(page, 'wallets', [
      testWallets.usdWallet,
      testWallets.eurWallet,
    ]);

    await dashboardPage.goto();
    await TestUtils.waitForAngularToLoad(page);
  });

  test('should display dashboard with user data', async ({ page }) => {
    await dashboardPage.expectDashboardVisible();
    await dashboardPage.expectUserName(
      `${testUsers.validUser.firstName} ${testUsers.validUser.lastName}`
    );

    await dashboardPage.expectWalletBalance('USD', testWallets.usdWallet.balance);
    await dashboardPage.expectWalletBalance('EUR', testWallets.eurWallet.balance);
  });

  test('should navigate to transactions page', async ({ page }) => {
    await dashboardPage.navigateToTransactions();
    await expect(page).toHaveURL('/dashboard/transactions');
  });

  test('should navigate to fx analytics page', async ({ page }) => {
    await dashboardPage.navigateToFxAnalytics();
    await expect(page).toHaveURL('/dashboard/fx-analytics');
  });

  test('should open transfer modal', async ({ page }) => {
    await dashboardPage.clickTransfer();
    await transferModal.expectModalVisible();
  });

  test('should complete a transfer', async ({ page }) => {
    await TestUtils.mockApiResponse(page, '/api/transfers', {
      success: true,
      transactionId: 'tx_123456789',
    });

    await dashboardPage.clickTransfer();
    await transferModal.expectModalVisible();

    const transfer = testTransactions.transfer;
    await transferModal.selectSourceWallet('USD');
    await transferModal.enterRecipientAddress(transfer.recipientAddress);
    await transferModal.enterAmount(transfer.amount);
    await transferModal.addDescription(transfer.description);

    await transferModal.submitTransfer();
    await transferModal.expectSuccessMessage();
  });

  test('should validate transfer form', async ({ page }) => {
    await dashboardPage.clickTransfer();
    await transferModal.expectModalVisible();

    await transferModal.submitTransfer();

    await transferModal.expectValidationError('recipient-address', 'Recipient address is required');
    await transferModal.expectValidationError('transfer-amount', 'Amount is required');
  });

  test('should handle insufficient balance', async ({ page }) => {
    await dashboardPage.clickTransfer();
    await transferModal.expectModalVisible();

    await transferModal.selectSourceWallet('USD');
    await transferModal.enterRecipientAddress(testTransactions.transfer.recipientAddress);
    await transferModal.enterAmount('2000.00');

    await transferModal.submitTransfer();
    await transferModal.expectValidationError('transfer-amount', 'Insufficient balance');
  });

  test('should display recent transactions', async ({ page }) => {
    await TestUtils.mockApiResponse(page, '/api/transactions/recent', [
      {
        id: 'tx_1',
        amount: '100.00',
        currency: 'USD',
        type: 'transfer',
        status: 'completed',
        date: new Date().toISOString(),
      },
    ]);

    await dashboardPage.verifyRecentTransactions();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await TestUtils.mockApiError(page, '/api/wallets', 500);

    await page.reload();
    await TestUtils.waitForAngularToLoad(page);

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
