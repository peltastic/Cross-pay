import { Page, expect } from '@playwright/test';

export class BaseModal {
  readonly page: Page;
  readonly modalSelector: string;

  constructor(page: Page, modalSelector: string) {
    this.page = page;
    this.modalSelector = modalSelector;
  }

  async expectModalVisible() {
    await expect(this.page.locator(this.modalSelector)).toBeVisible();
  }

  async expectModalHidden() {
    await expect(this.page.locator(this.modalSelector)).not.toBeVisible();
  }

  async closeModal() {
      const cancelButton = this.page.locator('button:has-text("Cancel")');
      const closeButton = this.page.locator('[data-testid="close-modal"], .close-btn');
      
      if (await cancelButton.isVisible()) {
          await cancelButton.click();
        } else if (await closeButton.isVisible()) {
            await closeButton.click();
        } else {
            await this.page.click('body', { position: { x: 10, y: 10 } });
        }
    }
    
    async expectTitle(title: string) {
        await expect(this.page.locator('h2, h3').filter({ hasText: title })).toBeVisible();
    }
    
    async expectFormVisible() {
        await expect(this.page.locator('form')).toBeVisible();
    }
    
    async expectSubmitButtonEnabled() {
        await expect(this.page.locator('button[type="submit"]')).toBeEnabled();
    }
    
    async expectSubmitButtonDisabled() {
        await expect(this.page.locator('button[type="submit"]')).toBeDisabled();
    }
    
    async expectLoadingState(loadingText: string) {
        await expect(this.page.locator(`text="${loadingText}"`)).toBeVisible();
    }
    
    async expectErrorMessage() {
        await expect(
            this.page.locator('app-error-message, .text-error-message-text, .text-red-600')
        ).toBeVisible();
    }
    
    async expectSuccessMessage() {
        await expect(this.page.locator('.bg-success-background, .text-success-text')).toBeVisible();
    }
    
    async waitForModalToLoad() {
        await this.page.waitForSelector(this.modalSelector, { state: 'visible' });
    }
    
    async waitForModalToClose() {
        await this.page.waitForSelector(this.modalSelector, { state: 'hidden' });
    }
}
