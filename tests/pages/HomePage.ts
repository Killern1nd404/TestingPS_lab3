import { type Locator, type Page, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly productCards: Locator;
  readonly firstAddToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Products' });
    // Карточки товаров имеют класс group border...
    this.productCards = page.locator('.group');
    // Кнопка "Add Cart" внутри первой карточки
    this.firstAddToCartButton = this.productCards.first().getByRole('button', { name: /add cart/i });
  }

  async goto() {
    await this.page.goto('/products');
    // Ждем, пока загрузятся товары (пропадет спиннер)
    await expect(this.pageTitle).toBeVisible();
    await expect(this.productCards.first()).toBeVisible({ timeout: 10000 });
  }

  async addFirstProductToCart() {
    await this.firstAddToCartButton.click();
  }
}
