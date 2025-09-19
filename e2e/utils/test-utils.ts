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

  static async waitForNgRxStoreToLoad(page: Page) {
    // Wait for NgRx store to be initialized
    await page.waitForFunction(() => {
      return (window as any).__ngrx_store__ !== undefined;
    }, { timeout: 5000 }).catch(() => {
      // Store might not be available in window, continue anyway
      console.log('NgRx store not found in window object');
    });
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

  static async mockLocalStorageData(page: Page, data: Record<string, any>) {
    await page.addInitScript((data) => {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    }, data);
  }

  static async setSessionStorage(page: Page, key: string, value: any) {
    try {
      await page.evaluate(({ key, value }) => {
        sessionStorage.setItem(key, JSON.stringify(value));
      }, { key, value });
    } catch (error) {
      console.log(`Could not set sessionStorage item ${key}:`, error);
    }
  }

  static async getSessionStorage(page: Page, key: string) {
    try {
      return await page.evaluate((key) => {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }, key);
    } catch (error) {
      console.log(`Could not get sessionStorage item ${key}:`, error);
      return null;
    }
  }

  static async clearSessionStorage(page: Page) {
    try {
      await page.evaluate(() => sessionStorage.clear());
    } catch (error) {
      console.log('Could not clear sessionStorage:', error);
    }
  }

  static async setLocalStorage(page: Page, key: string, value: any) {
    try {
      await page.evaluate(({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value));
      }, { key, value });
    } catch (error) {
      console.log(`Could not set localStorage item ${key}:`, error);
    }
  }

  static async getLocalStorage(page: Page, key: string) {
    try {
      return await page.evaluate((key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }, key);
    } catch (error) {
      console.log(`Could not get localStorage item ${key}:`, error);
      return null;
    }
  }

  static async clearLocalStorage(page: Page) {
    try {
      await page.evaluate(() => localStorage.clear());
    } catch (error) {
      // localStorage might not be available before page load, that's ok
      console.log('Could not clear localStorage (page might not be loaded yet)');
    }
  }

  static async setupMockWallet(page: Page, email: string, currencies: string[] = ['USD', 'EUR', 'GBP']) {
    const wallet = {
      email,
      walletAddress: this.generateRandomWalletAddress(),
      currencies: currencies.reduce((acc, currency) => {
        acc[currency] = Math.floor(Math.random() * 10000) + 1000; // Random balance between 1000-11000
        return acc;
      }, {} as Record<string, number>),
      isCreatingWallet: false,
      createWalletError: null
    };

    // Use sessionStorage for email (route guard requirement) and localStorage for wallet data
    await this.setSessionStorage(page, 'email', email);
    await this.setLocalStorage(page, 'wallet', wallet);
    return wallet;
  }

  static async setupMockTransactions(page: Page, count: number = 10) {
    const transactions = Array.from({ length: count }, (_, i) => ({
      id: `tx-${i + 1}`,
      type: ['deposit', 'transfer', 'swap'][Math.floor(Math.random() * 3)],
      amount: Math.floor(Math.random() * 1000) + 10,
      currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      recipient: this.generateRandomWalletAddress()
    }));

    await this.setLocalStorage(page, 'transactions', transactions);
    return transactions;
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test-user-${timestamp}-${random}@example.com`;
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

  static async waitForElement(page: Page, selector: string, timeout: number = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  static async waitForText(page: Page, text: string, timeout: number = 10000) {
    await page.waitForSelector(`text="${text}"`, { state: 'visible', timeout });
  }

  static async retryAction(action: () => Promise<void>, maxRetries: number = 3, delay: number = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  static async interceptNetworkRequests(page: Page, patterns: string[]) {
    const interceptedRequests: any[] = [];
    
    for (const pattern of patterns) {
      await page.route(pattern, route => {
        interceptedRequests.push({
          url: route.request().url(),
          method: route.request().method(),
          headers: route.request().headers(),
          postData: route.request().postData()
        });
        route.continue();
      });
    }
    
    return interceptedRequests;
  }

  static async simulateNetworkConditions(page: Page, condition: 'slow' | 'offline' | 'fast') {
    const context = page.context();
    
    switch (condition) {
      case 'slow':
        await context.route('**/*', route => {
          setTimeout(() => route.continue(), 2000); // 2 second delay
        });
        break;
      case 'offline':
        await context.setOffline(true);
        break;
      case 'fast':
        await context.setOffline(false);
        // Clear any existing routes by unrouting all patterns
        await context.unroute('**/*');
        break;
    }
  }
}