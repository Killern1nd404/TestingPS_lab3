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

  // 1. Подготовка: создаем пользователя и логинимся через API
  test.beforeEach(async ({ request, page }) => {
    testEmail = `shop_test_${Date.now()}@example.com`;

    // Создаем
    await request.post('http://localhost:5000/api/users/register', {
      data: { fullName: 'Shop User', email: testEmail, password: testPassword }
    });

    // Логинимся, чтобы забрать token и userId
    const loginResponse = await request.post('http://localhost:5000/api/users/login', {
      data: { email: testEmail, password: testPassword }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
    userId = loginData.userId;

    // 2. Внедряем данные в браузер ДО загрузки приложения
    await page.addInitScript(({ token, id }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('userId', id);
    }, { token: authToken, id: userId });
  });

  test('Поиск товара и добавление в корзину', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // ПРОВЕРКА "ПОИСКА": Так как поля поиска нет, 
    // мы проверяем, что товары вообще отображаются (это наш "поиск").
    await expect(homePage.productCards.first()).toBeVisible();
    
    // Добавляем первый товар в корзину
    await homePage.addFirstProductToCart();

    // Проверяем, что выскочил зеленый тост
    await expect(page.getByRole('alert')).toBeVisible();

    // Идем в корзину и проверяем, что товар там
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.cartItems.first()).toBeVisible();
  });

  test('Оформление заказа', async ({ page }) => {
    // 1. Сначала добавим товар в корзину
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addFirstProductToCart();
    await expect(page.getByRole('alert')).toBeVisible();

    // 2. Переходим в корзину и нажимаем Checkout
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.checkoutButton.click();

    // 3. Заполняем форму на странице Checkout
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillShippingForm();
    await checkoutPage.placeOrder();

    // 4. Проверяем, что нас перекинуло на страницу успеха /placed
    //await expect(page).toHaveURL('/placed', { timeout: 5000 });
    //await expect(page.getByText('Order Placed Successfully!')).toBeVisible();
    
        // 4. Проверяем, что нас перекинуло на страницу успеха /placed
    await expect(page).toHaveURL('/placed', { timeout: 5000 });
    
    // Ждем, пока компонент сделает запрос getOrder и отрисует данные
    await page.waitForTimeout(1500); 

    // Ищем ИМЕННО ЗАГОЛОВОК, чтобы не пересекаться с текстом тоста
    await expect(page.getByRole('heading', { name: /Order Placed Successfully/i })).toBeVisible();
    //await expect(page.getByText(/Order Placed Successfully/i)).toBeVisible();
    
    // И проверяем наличие ID заказа
    await expect(page.getByText(/Order ID:/i)).toBeVisible();
  });
  
  // ВОТ ЗДЕСЬ ДОЛЖЕН БЫТЬ ТЕСТ НА ЛОГАУТ (внутри test.describe)
  test('Выход из системы (Logout)', async ({ page }) => {
    await page.goto('/');
    
    const navbar = new Navbar(page);

    await expect(navbar.logoutButton).toBeVisible();
    await navbar.logout();
    // 3. Проверяем, что нас перекинуло на страницу логина
    await expect(page).toHaveURL('/login');

    // Даем React время перерисовать навбар
    await page.waitForTimeout(500); 

    // 4. Проверяем, что кнопка Logout исчезла, а вместо неё появилась ссылка Login
    await expect(navbar.logoutButton).not.toBeVisible();
    
    // Ищем ссылку Login. Используем .first(), так как их может быть две (мобильная и десктопная)
    await expect(navbar.loginLink.first()).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
