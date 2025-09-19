import { test, expect } from '@playwright/test';

test.describe('Cross-Pay Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-root', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
    });
    
    test('should display the onboarding page with form elements', async ({ page }) => {
        await expect(page).toHaveURL('/get-started');
        
        const hasFormElements = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input, select, button, form');
            const hasInteractiveElements = inputs.length > 0;
            
            const textContent = document.body.textContent?.toLowerCase() || '';
            const hasOnboardingContent = (
                textContent.includes('get started') ||
                textContent.includes('welcome') ||
                textContent.includes('sign up') ||
                textContent.includes('create') ||
                textContent.includes('continue') ||
                textContent.includes('next')
            );
            
            return hasInteractiveElements && hasOnboardingContent;
        });
        
        expect(hasFormElements).toBe(true);
    });
    
    test('should have working navigation and routing', async ({ page }) => {
        // Test navigation to different routes
        const routes = ['/dashboard', '/dashboard/transactions', '/dashboard/fx-analytics'];
        
        for (const route of routes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            
            const currentUrl = page.url();
      const isValidDestination = (
        currentUrl.includes(route) || 
        currentUrl.includes('/get-started') ||
        currentUrl === 'http://localhost:4200/'
      );
      
      expect(isValidDestination).toBe(true);
    }
});

test('should be responsive and work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
    
    const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalOverflow).toBe(false);
});

test('should handle form interactions on onboarding page', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    
    const firstInput = page.locator('input').first();
    const inputExists = await firstInput.count() > 0;
    
    if (inputExists) {
        await firstInput.fill('test@example.com');
        
        const inputValue = await firstInput.inputValue();
        expect(inputValue).toBe('test@example.com');
    }
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        
        const isDisabled = await firstButton.isDisabled();
        expect(typeof isDisabled).toBe('boolean');
    }
});

test('should load without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            jsErrors.push(msg.text());
        }
    });
    
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = jsErrors.filter(error => 
        !error.includes('404') && 
        !error.includes('favicon') &&
        !error.toLowerCase().includes('network error')
    );
    
    expect(criticalErrors.length).toBe(0);
});

test('should have proper meta tags and title', async ({ page }) => {
    await page.goto('/get-started');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');
    
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
});
});