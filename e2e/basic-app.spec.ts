import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
      await page.goto('/');
      
    await page.waitForSelector('app-root', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('should load the application', async ({ page }) => {
      await expect(page.locator('app-root')).toBeVisible();
      
      await expect(page).toHaveURL('/get-started');
    });
    
    test('should display onboarding page', async ({ page }) => {
        // Navigate to onboarding page
        await page.goto('/get-started');
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('h1, h2, .title, .heading')).toBeVisible();
    });
    
    test('should handle navigation to dashboard (may redirect)', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        
        const url = page.url();
        expect(url).toMatch(/\/(dashboard|get-started)/);
    });
    
    test('should handle navigation to transactions', async ({ page }) => {
        await page.goto('/dashboard/transactions');
        await page.waitForLoadState('networkidle');
        
        const url = page.url();
        expect(url).toMatch(/\/(dashboard\/transactions|get-started)/);
    });
    
    test('should handle navigation to fx-analytics', async ({ page }) => {
        await page.goto('/dashboard/fx-analytics');
        await page.waitForLoadState('networkidle');
    
        const url = page.url();
        expect(url).toMatch(/\/(dashboard\/fx-analytics|get-started)/);
    });
    
    test('should handle 404 pages gracefully', async ({ page }) => {
        await page.goto('/non-existent-page');
        await page.waitForLoadState('networkidle');
        
        const url = page.url();
        expect(url).toMatch(/\/(get-started|dashboard|$)/);
    });
});
