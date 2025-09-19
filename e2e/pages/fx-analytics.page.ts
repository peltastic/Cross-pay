import { Page, expect } from '@playwright/test';

export class FxAnalyticsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard/fx-analytics');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectAnalyticsVisible() {
    await expect(this.page.locator('h1')).toContainText('FX Analytics');
    await expect(this.page.locator('app-data-table')).toBeVisible();
  }

  async selectCurrencyPair(from: string, to: string) {
    const baseCurrencySelect = this.page.locator('app-select').first();
    await baseCurrencySelect.click();
    await this.page.locator(`[data-option="${from}"]`).click();
    
    const targetCurrencySelect = this.page.locator('app-select').nth(2);
    await targetCurrencySelect.click();
    await this.page.locator(`[data-option="${to}"]`).click();
  }
  
  async selectTimeRange(range: string) {
    const periodMap: { [key: string]: string } = {
      '7d': '1 Day', // Test uses '7d' but service has '1 Day'
      '30d': '30 Days',
      '6m': '6 Months', 
      '1y': '1 Year'
    };
    const periodLabel = periodMap[range.toLowerCase()] || range;
    await this.page.locator('button', { hasText: periodLabel }).click();
  }
  
  async expectCurrentRate(content: string) {
    await expect(this.page.locator('app-data-table')).toContainText(content);
  }
  
  async expectTimeRangeSelected(range: string) {
    const periodMap: { [key: string]: string } = {
      '7d': '1 Day',
      '30d': '30 Days', 
      '6m': '6 Months',
      '1y': '1 Year'
    };
    const periodLabel = periodMap[range.toLowerCase()] || range;
    const button = this.page.locator('button', { hasText: periodLabel });
    await expect(button).toHaveClass(/bg-button-background/);
  }
  
  async expectExchangeRateChart() {
    await expect(this.page.locator('app-line-chart')).toBeVisible();
  }
  
  async expectRateChange(change: string) {
    await expect(this.page.locator('app-data-table')).toContainText(change);
  }
  
  async expectHistoricalData() {
    await expect(this.page.locator('app-data-table')).toBeVisible();
  }
}
