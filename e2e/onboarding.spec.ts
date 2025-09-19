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

    await TestUtils.clearLocalStorage(page);

    await onboardingPage.goto();
    await TestUtils.waitForAngularToLoad(page);
  });

  test('should complete successful onboarding flow', async ({ page }) => {
    const user = testUsers.validUser;

    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);
    await onboardingPage.clickContinue();
    await onboardingPage.verifyOnboardingComplete();

    await dashboardPage.expectDashboardVisible();
    await dashboardPage.expectUserName(`${user.firstName} ${user.lastName}`);
  });

  test('should validate required fields', async ({ page }) => {
    await onboardingPage.clickContinue();

    await onboardingPage.expectFieldError('email', validationMessages.email.required);
    await onboardingPage.expectFieldError('firstName', validationMessages.firstName.required);
    await onboardingPage.expectFieldError('lastName', validationMessages.lastName.required);
  });

  test('should validate email format', async ({ page }) => {
    await onboardingPage.fillUserDetails('invalid-email', 'John', 'Doe');
    await onboardingPage.clickContinue();

    await onboardingPage.expectFieldError('email', validationMessages.email.invalid);
  });

  test('should validate minimum name length', async ({ page }) => {
    await onboardingPage.fillUserDetails('john@example.com', 'J', 'D');
    await onboardingPage.clickContinue();

    await onboardingPage.expectFieldError('firstName', validationMessages.firstName.minLength);
    await onboardingPage.expectFieldError('lastName', validationMessages.lastName.minLength);
  });

  test('should work with different countries and currencies', async ({ page }) => {
    const user = testUsers.ukUser;

    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);

    await onboardingPage.clickContinue();
    await onboardingPage.verifyOnboardingComplete();

    await dashboardPage.expectWalletBalance('GBP');
  });

  test('should handle server errors gracefully', async ({ page }) => {
    await TestUtils.mockApiError(page, '/api/users', 500, 'Server temporarily unavailable');

    const user = testUsers.validUser;
    await onboardingPage.fillUserDetails(user.email, user.firstName, user.lastName);
    await onboardingPage.selectCountry(user.country);
    await onboardingPage.selectCurrency(user.currency);

    await onboardingPage.clickContinue();

    await onboardingPage.expectErrorMessage('Server temporarily unavailable');
  });
});
