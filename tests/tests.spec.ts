import { test, expect } from '@playwright/test';
import { HomePage } from '../tests/pages/HomePage';
import { CartPage } from '../tests/pages/CartPage';
import { CheckoutPage } from '../tests/pages/CheckoutPage';
import { Navbar } from '../tests/pages/Navbar';

test.describe('Сценарии магазина (Корзина и Заказ)', () => {
  let testEmail: string;
  const testPassword = 'Password123!';
  let authToken: string;
  let userId: string;

  test.beforeEach(async ({ request, page }) => {
    testEmail = `shop_test_${Date.now()}@example.com`;

    await request.post('http://localhost:5000/api/users/register', {
      data: { fullName: 'Shop User', email: testEmail, password: testPassword }
    });

    const loginResponse = await request.post('http://localhost:5000/api/users/login', {
      data: { email: testEmail, password: testPassword }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
    userId = loginData.userId;

    await page.addInitScript(({ token, id }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('userId', id);
    }, { token: authToken, id: userId });

      await page.waitForTimeout(1500); 
  });
  
  test('Поиск товара и добавление в корзину', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.productCards.first()).toBeVisible();
    
    await homePage.addFirstProductToCart();

    await expect(page.getByRole('alert')).toBeVisible();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.cartItems.first()).toBeVisible();
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
    
    await expect(page).toHaveURL('/placed', { timeout: 5000 });
    
    await page.waitForTimeout(1500); 

    await expect(page.getByRole('heading', { name: /Order Placed Successfully/i })).toBeVisible();
    
    await expect(page.getByText(/Order ID:/i)).toBeVisible();
  });
  
  test('Выход из системы (Logout)', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible({ timeout: 15000 });
    
    const navbar = new Navbar(page);

    await expect(navbar.logoutButton).toBeVisible();
    await navbar.logout();
    await expect(page).toHaveURL('/login');

    await page.waitForTimeout(500); 

    await expect(navbar.logoutButton).not.toBeVisible();
    
    await expect(navbar.loginLink.first()).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
