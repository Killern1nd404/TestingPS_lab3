import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Ищем Email по типу (в коде он type="email")
    this.emailInput = page.locator('input[type="email"]');
    //this.emailInput = page.getByLabel('Email');
    
    // Ищем пароль по родительскому div.relative (как мы уже сделали)
    this.passwordInput = page.locator('div.relative input');

    // Кнопка Show/Hide
    this.showPasswordButton = page.getByRole('button', { name: /show|hide/i });

    // Submit
    this.submitButton = page.getByRole('button', { name: 'Login' });

    // Sign Up
    this.signUpLink = page.getByText('Sign Up');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string) {
    // Ждем, пока поле появится, и заполняем
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async togglePasswordVisibility() {
    await this.showPasswordButton.click();
  }

  async goToSignUp() {
    await this.signUpLink.click();
    await expect(this.page).toHaveURL(/\/signup/);
  }
}
