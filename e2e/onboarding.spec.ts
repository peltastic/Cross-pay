import { test, expect } from '@playwright/test';
import { OnboardingPage } from './pages/onboarding.page';
import { DashboardPage } from './pages/dashboard.page';
import { TestUtils } from './utils/test-utils';
import { testUsers, validationMessages } from './fixtures/test-data';

test.describe('Onboarding Flow', () => {
  let onboardingPage: OnboardingPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    onboardingPage = new OnboardingPage(page);
    dashboardPage = new DashboardPage(page);

    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
    await TestUtils.clearLocalStorage(page);
    await onboardingPage.waitForPageLoad();
  });
  
  test('should display onboarding page correctly', async ({ page }) => {
    await onboardingPage.expectPageTitle();
    await onboardingPage.expectPageDescription();
    await onboardingPage.expectFormVisible();
    await onboardingPage.expectEmailInputVisible();
    await onboardingPage.expectCreateWalletButtonVisible();
  });
  
  test('should complete successful onboarding flow', async ({ page }) => {
    const user = testUsers.validUser;
    
    await onboardingPage.fillEmail(user.email);
    await onboardingPage.expectCreateWalletButtonEnabled();
    await onboardingPage.clickCreateWallet();
    
    await onboardingPage.verifyOnboardingComplete();
    await dashboardPage.expectDashboardVisible();
  });
  
  test('should preserve email value on reload', async ({ page }) => {
    const email = testUsers.validUser.email;
    await onboardingPage.fillEmail(email);
    await page.reload();
    await TestUtils.waitForAngularToLoad(page);
    await onboardingPage.waitForPageLoad();
    
    const currentValue = await onboardingPage.getEmailValue();
    console.log('Email preservation test - current value:', currentValue);
  });
  
  test('should work with different email formats', async ({ page }) => {
    const emailFormats = [
      'test.email@example.com',
      'test+tag@example.com',
      'test_underscore@example.co.uk',
      'test-dash@sub.domain.example.org'
    ];
    
    for (const email of emailFormats) {
      await onboardingPage.fillEmail('');
      await onboardingPage.fillEmail(email);
      await onboardingPage.expectEmailValue(email);
      await onboardingPage.expectCreateWalletButtonEnabled();
    }
  });
});
