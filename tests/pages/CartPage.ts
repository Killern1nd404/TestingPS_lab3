import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly totalPriceText: Locator;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Your Cart' });
    // Ищем текст, который начинается с "Total:"
    this.totalPriceText = page.locator('p', { hasText: 'Total:' });
    this.checkoutButton = page.getByRole('button', { name: /Proceed to Checkout/i });
    // Карточки товаров в корзине
    this.cartItems = page.locator('.bg-white.rounded-lg.shadow');
  }

  async goto() {
    await this.page.goto('/cart');
    await expect(this.pageTitle).toBeVisible();
  }
}
