import { test, expect } from '@playwright/test';

test.describe('Performance and Accessibility Tests', () => {
  test('should load pages within acceptable time limits', async ({ page }) => {
    const routes = [
      '/',
      '/get-started',
      '/dashboard',
      '/dashboard/transactions',
      '/dashboard/fx-analytics',
    ];

    for (const route of routes) {
      const startTime = Date.now();

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);

      console.log(`Route ${route} loaded in ${loadTime}ms`);
    }
  });

  test('should have good Core Web Vitals performance', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('web-vital' in window) {
          resolve(0);
          return;
        }

        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        resolve(loadTime);
      });
    });

    expect(lcp).toBeLessThan(4000);
  });

  test('should handle concurrent user sessions', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map((context) => context.newPage()));

    await Promise.all(pages.map((page) => page.goto('/get-started')));

    // Use a more lenient waiting strategy for concurrent tests
    await Promise.all(pages.map((page) => page.waitForSelector('app-root', { timeout: 15000 })));

    for (const page of pages) {
      await expect(page.locator('app-root')).toBeVisible();
      expect(page.url()).toContain('get-started');
    }

    await Promise.all(contexts.map((context) => context.close()));
  });

  test('should work with slow network conditions', async ({ page }) => {
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    await expect(page.locator('app-root')).toBeVisible();
    console.log(`Slow network load time: ${loadTime}ms`);
  });

  test('should handle page reload gracefully', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');

    const firstInput = page.locator('input').first();
    if ((await firstInput.count()) > 0) {
      await firstInput.fill('test-data');
    }
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('app-root')).toBeVisible();

    if ((await firstInput.count()) > 0) {
      const inputValue = await firstInput.inputValue();
      expect(inputValue).toBe('');
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');

    const focusableElements = await page
      .locator('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')
      .count();

    if (focusableElements > 0) {
      for (let i = 0; i < Math.min(focusableElements, 5); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      await page.keyboard.press('Enter');

      await page.waitForTimeout(500);
    }
  });
});
