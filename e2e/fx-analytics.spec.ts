import { test, expect } from '@playwright/test';
import { FxAnalyticsPage } from './pages/fx-analytics.page';
import { TestUtils } from './utils/test-utils';
import { testUsers } from './fixtures/test-data';

test.describe('FX Analytics Page', () => {
  let fxAnalyticsPage: FxAnalyticsPage;

  test.beforeEach(async ({ page }) => {
    fxAnalyticsPage = new FxAnalyticsPage(page);
    
    await TestUtils.setLocalStorage(page, 'user', testUsers.validUser);
    
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
    
    await fxAnalyticsPage.goto();
    await TestUtils.waitForAngularToLoad(page);
});

test('should display FX analytics dashboard', async ({ page }) => {
    await fxAnalyticsPage.expectAnalyticsVisible();
    await fxAnalyticsPage.expectExchangeRateChart();
});

test('should display current exchange rate', async ({ page }) => {
    await fxAnalyticsPage.expectCurrentRate('0.85');
    await fxAnalyticsPage.expectRateChange('+2.35%');
});

test('should change currency pair', async ({ page }) => {
    await TestUtils.mockApiResponse(page, '/api/exchange-rates/GBP/USD', {
        currentRate: 1.25,
        change24h: -0.01,
        changePercent: -0.8,
        historicalRates: [
            { date: '2025-09-19', rate: 1.25 },
            { date: '2025-09-18', rate: 1.26 }
        ]
    });
    
    await fxAnalyticsPage.selectCurrencyPair('GBP', 'USD');
    await fxAnalyticsPage.expectCurrentRate('1.25');
    await fxAnalyticsPage.expectRateChange('-0.8%');
});

test('should change time range', async ({ page }) => {
    await TestUtils.mockApiResponse(page, '/api/exchange-rates/USD/EUR?period=7d', {
        currentRate: 0.85,
      change24h: 0.02,
      changePercent: 2.35,
      historicalRates: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rate: 0.85 + (Math.random() - 0.5) * 0.1
      }))
    });
    
    await fxAnalyticsPage.selectTimeRange('7d');
    await fxAnalyticsPage.expectHistoricalData();
});

test('should handle API errors gracefully', async ({ page }) => {
    await TestUtils.mockApiError(page, '/api/exchange-rates/USD/EUR', 500);
    
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
});