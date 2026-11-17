import { test, expect } from '@playwright/test';
import { HomePage } from '../tests/pages/HomePage';
import { CartPage } from '../tests/pages/CartPage';
import { CheckoutPage } from '../tests/pages/CheckoutPage';
import { Navbar } from '../tests/pages/Navbar';
import { LoginPage } from '../tests/pages/LoginPage';

test.describe('Сценарии магазина (Корзина и Заказ)', () => {
  let testEmail: string;
  const testPassword = 'Password123!';

  test.beforeEach(async ({ request, page }) => {
    testEmail = `shop_test_${Date.now()}@example.com`;

    await request.post('http://localhost:5000/api/users/register', {
      data: { fullName: 'Shop User', email: testEmail, password: testPassword }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);
    
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('Поиск товара и добавление в корзину', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    });
    
    // Слушаем необработанные исключения
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });
    
    const homePage = new HomePage(page);
    await homePage.goto();

    await page.goto('/products');
    await expect(homePage.productCards.first()).toBeVisible({ timeout: 15000 });
    
    await homePage.addFirstProductToCart();
    await expect(page.getByRole('alert')).toBeVisible();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.cartItems.first()).toBeVisible({ timeout: 15000 });
  });

  test('Оформление заказа', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addFirstProductToCart();
    await expect(page.getByRole('alert')).toBeVisible();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.checkoutButton.click();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillShippingForm();
    await checkoutPage.placeOrder();

    await expect(page).toHaveURL('/placed', { timeout: 15000 });
    await page.waitForTimeout(1500); 

    await expect(page.getByRole('heading', { name: /Order Placed Successfully/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Order ID:/i)).toBeVisible();
  });
  
  test('Выход из системы (Logout)', async ({ page }) => {
    await page.goto('/');
    
    const navbar = new Navbar(page);
    await expect(navbar.logoutButton).toBeVisible({ timeout: 15000 });
    await navbar.logout();

    await expect(page).toHaveURL('/login', { timeout: 15000 });
    await page.waitForTimeout(500); 

    await expect(navbar.logoutButton).not.toBeVisible();
    await expect(navbar.loginLink.first()).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
