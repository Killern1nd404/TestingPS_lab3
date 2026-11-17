import { test, expect } from '@playwright/test';
import { LoginPage } from '../tests/pages/LoginPage';

test.describe('Аутентификация', () => {
  test('успешный вход в систему', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // ⚠️ Замените на реального пользователя из вашей БД.
    // Если пользователя нет — сначала создайте через регистрацию
    // или через API (POST /api/auth/register).
    await loginPage.login('testuser@example.com', 'Password123!');

    // В коде после логина:
    //   localStorage.setItem("token", ...)
    //   setTimeout(() => navigate("/"), 2000)
    // Поэтому ждём редирект на "/" с увеличенным таймаутом.
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Проверяем, что токен реально сохранился
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('неверный пароль показывает ошибку', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('testuser@example.com', 'wrong_password');

    // В коде: toast.error(...) — react-toastify рендерит текст ошибки.
    // Точный текст зависит от ответа бэкенда, проверяем по общему паттерну.
    await expect(
      page.locator('.Toastify__toast--error')
    ).toBeVisible({ timeout: 5000 });
  });

  test('переключение Show/Hide меняет тип поля пароля', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  test('переход на Sign Up', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToSignUp();
  });
});
