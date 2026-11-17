import { type Locator, type Page, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // В форме регистрации есть плейсхолдеры, используем их
    this.nameInput = page.getByPlaceholder('Name');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    
    // Кнопка отправки (внутри есть span с текстом Sign Up)
    this.submitButton = page.getByRole('button', { name: 'Sign Up' });
    
    // Ссылка на логин внизу
    this.loginLink = page.getByText('Login', { exact: true });
  }

  async goto() {
    await this.page.goto('/signup');
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Заполнить форму и отправить.
   */
  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goToLogin() {
    await this.loginLink.click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
