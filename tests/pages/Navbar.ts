import { type Locator, type Page, expect } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;

    constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    
    // Ищем любую ссылку с текстом Login внутри Navbar
    this.loginLink = page.locator('nav').getByText('Login', { exact: true });
  }

  async logout() {
    await this.logoutButton.click();
  }
}
