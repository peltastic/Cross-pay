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
    await expect(this.page.locator('[data-testid="fx-analytics-container"]')).toBeVisible();
  }

  async expectExchangeRateChart() {
    await expect(this.page.locator('[data-testid="exchange-rate-chart"]')).toBeVisible();
  }

  async selectCurrencyPair(from: string, to: string) {
    await this.page.click('[data-testid="currency-from-select"]');
    await this.page.click(`[data-testid="currency-option-${from}"]`);
    
    await this.page.click('[data-testid="currency-to-select"]');
    await this.page.click(`[data-testid="currency-option-${to}"]`);
  }

  async selectTimeRange(range: string) {
    await this.page.click(`[data-testid="time-range-${range}"]`);
  }

  async expectCurrentRate(rate: string) {
    await expect(this.page.locator('[data-testid="current-exchange-rate"]')).toContainText(rate);
  }

  async expectRateChange(change: string) {
    await expect(this.page.locator('[data-testid="rate-change"]')).toContainText(change);
  }

  async expectHistoricalData() {
    await expect(this.page.locator('[data-testid="historical-rates-table"]')).toBeVisible();
  }
}