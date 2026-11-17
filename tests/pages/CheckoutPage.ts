import { type Locator, type Page, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.placeOrderButton = page.getByRole('button', { name: /Place Order/i });
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShippingForm() {
    // В коде инпуты ищутся по атрибуту name
    await this.page.locator('input[name="firstName"]').fill('John');
    await this.page.locator('input[name="lastName"]').fill('Doe');
    await this.page.locator('input[name="email"]').fill('john.doe@example.com');
    await this.page.locator('input[name="address"]').fill('123 Main St');
    await this.page.locator('input[name="city"]').fill('New York');
    await this.page.locator('input[name="pinCode"]').fill('10001');
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}
