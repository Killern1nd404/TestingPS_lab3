import { test, expect } from '@playwright/test';
import { RegisterPage } from '../tests/pages/RegisterPage';

test.describe('Регистрация', () => {
  test('успешная регистрация нового пользователя', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    // Генерируем уникальный email (чтобы не было конфликта при повторных прогонах)
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';

    await registerPage.register('Test User', uniqueEmail, password);

    // В коде Signup.tsx после успеха: 
    // toast.success(...) и setTimeout(() => navigate("/login"), 2000)
    
    // Проверяем, что нас перекинуло на страницу логина (ждем до 5 сек)
    await expect(page).toHaveURL('/login', { timeout: 5000 });
    
    // Проверяем, что появился зеленый тост об успехе
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 5000 });
  });

  test('ошибка при регистрации с существующим email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    // Используем заведомо существующий email (например, тот, что вы создали вручную)
    // ВАЖНО: Замените на email, который точно есть в вашей базе!
    await registerPage.register('Another User', 'testuser@example.cm', 'Password123!');

    // Проверяем, что появился красный тост с ошибкой
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    // И что редиректа не произошло
    await expect(page).toHaveURL('/signup');
  });
});
