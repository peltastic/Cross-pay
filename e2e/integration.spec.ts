import { test, expect } from '@playwright/test';
import { OnboardingPage } from './pages/onboarding.page';
import { DashboardPage } from './pages/dashboard.page';
import { TransactionsPage } from './pages/transactions.page';
import { TransferModal } from './pages/transfer-modal.page';
import { FxAnalyticsPage } from './pages/fx-analytics.page';
import { TestUtils } from './utils/test-utils';
import { testUsers, testTransactions } from './fixtures/test-data';

test.describe('End-to-End User Journey', () => {
  test('should complete full user journey from onboarding to transfer', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    const dashboardPage = new DashboardPage(page);
    const transferModal = new TransferModal(page);
    const transactionsPage = new TransactionsPage(page);
    const fxAnalyticsPage = new FxAnalyticsPage(page);

    await TestUtils.clearLocalStorage(page);
    
    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    
    const user = testUsers.validUser;
    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);
    await onboardingPage.clickContinue();

    await onboardingPage.verifyOnboardingComplete();
    await dashboardPage.expectDashboardVisible();
    await dashboardPage.expectUserName(`${user.firstName} ${user.lastName}`);
    
    await dashboardPage.navigateToFxAnalytics();
    await fxAnalyticsPage.expectAnalyticsVisible();
    
    await dashboardPage.navigateToTransactions();
    await transactionsPage.expectTransactionsVisible();
    
    await dashboardPage.goto();
    await dashboardPage.expectDashboardVisible();
    
    await TestUtils.mockApiResponse(page, '/api/transfers', {
        success: true,
        transactionId: 'tx_e2e_test'
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
    
    await transferModal.closeModal();
    await dashboardPage.navigateToTransactions();
    
    await TestUtils.mockApiResponse(page, '/api/transactions', {
        transactions: [
            {
                id: 'tx_e2e_test',
                amount: transfer.amount,
                currency: 'USD',
                type: 'transfer',
                status: 'completed',
                date: new Date().toISOString(),
                description: transfer.description
            }
        ],
        pagination: {
            currentPage: 0,
            totalPages: 1,
            totalCount: 1,
            pageSize: 10
        }
    });
    
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    await transactionsPage.expectTransactionCount(1);
    await transactionsPage.expectTransactionDetails(0, {
        amount: transfer.amount,
        currency: 'USD',
        type: 'transfer',
        status: 'completed'
    });
});

test('should handle network failures gracefully throughout the journey', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    
    const user = testUsers.validUser;
    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);

    await TestUtils.mockApiError(page, '/api/users', 500, 'Network error');
    await onboardingPage.clickContinue();
    await onboardingPage.expectErrorMessage('Network error');
    
    await TestUtils.mockApiResponse(page, '/api/users', { success: true, userId: 'user_123' });
    await onboardingPage.clickContinue();
    await onboardingPage.verifyOnboardingComplete();
    
    await TestUtils.mockApiError(page, '/api/wallets', 503, 'Service unavailable');
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
});

test('should work across different browsers and screen sizes', async ({ page, browserName }) => {
    const onboardingPage = new OnboardingPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    
    const user = testUsers.validUser;
    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);
    await onboardingPage.clickContinue();
    
    await onboardingPage.verifyOnboardingComplete();
    await dashboardPage.expectDashboardVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
});
});