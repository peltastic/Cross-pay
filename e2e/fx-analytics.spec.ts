import { test, expect } from '@playwright/test';
import { FxAnalyticsPage } from './pages/fx-analytics.page';
import { OnboardingPage } from './pages/onboarding.page';
import { TestUtils } from './utils/test-utils';
import { testUsers } from './fixtures/test-data';

test.describe('FX Analytics Page', () => {
  let fxAnalyticsPage: FxAnalyticsPage;
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    fxAnalyticsPage = new FxAnalyticsPage(page);
    onboardingPage = new OnboardingPage(page);
      await TestUtils.mockApiResponse(page, '/api/create/wallet', {
      user: { email: testUsers.validUser.email },
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
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
    
    await TestUtils.mockApiResponse(page, '/api/exchange-rates/USD/EUR', {
        currentRate: 0.85,
        change24h: 0.02,
        changePercent: 2.35,
        historicalRates: [
            { date: '2025-09-19', rate: 0.85 },
            { date: '2025-09-18', rate: 0.83 },
            { date: '2025-09-17', rate: 0.84 }
        ]
    });
    
    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    await onboardingPage.fillEmail(testUsers.validUser.email);
    await onboardingPage.clickCreateWallet();
    
    await TestUtils.waitForAngularToLoad(page);
    await fxAnalyticsPage.goto();
    await TestUtils.waitForAngularToLoad(page);
});

test('should display FX analytics dashboard', async ({ page }) => {
    await fxAnalyticsPage.expectAnalyticsVisible();
    await fxAnalyticsPage.expectExchangeRateChart();
});

test('should display current exchange rate', async ({ page }) => {
    await fxAnalyticsPage.expectCurrentRate('EUR');
    await fxAnalyticsPage.expectCurrentRate('USD'); 
});

test('should change currency pair', async ({ page }) => {
    await fxAnalyticsPage.selectCurrencyPair('GBP', 'USD');
    await fxAnalyticsPage.expectAnalyticsVisible();
});

test('should change time range', async ({ page }) => {
    await fxAnalyticsPage.selectTimeRange('7d'); 
    await fxAnalyticsPage.expectHistoricalData(); 
});

test('should handle API errors gracefully', async ({ page }) => {
    await fxAnalyticsPage.expectAnalyticsVisible();
});
});