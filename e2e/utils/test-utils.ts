import { Page } from '@playwright/test';

export class TestUtils {
    static async waitForAngularToLoad(page: Page) {
        await page.waitForFunction(() => {
            return (window as any).ng !== undefined || 
            (window as any).getAllAngularRootElements !== undefined ||
            document.querySelector('app-root') !== null;
        }, { timeout: 10000 });
        
    await page.waitForLoadState('networkidle');
  }

  static async mockApiResponse(page: Page, endpoint: string, response: any) {
    await page.route(`**${endpoint}**`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  static async mockApiError(page: Page, endpoint: string, statusCode: number = 500, errorMessage?: string) {
    await page.route(`**${endpoint}**`, route => {
      route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: errorMessage || 'Internal Server Error',
          message: errorMessage || 'Something went wrong'
        })
      });
    });
  }

  static async setLocalStorage(page: Page, key: string, value: any) {
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key, value });
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => localStorage.clear());
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test-user-${timestamp}@example.com`;
  }

  static generateRandomWalletAddress(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}