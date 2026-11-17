import { test, expect } from '@playwright/test';
import { RegisterPage } from '../tests/pages/RegisterPage'; // Убедитесь, что путь правильный

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

  test('ошибка при регистрации с существующим email', async ({ page, request }) => {
    const registerPage = new RegisterPage(page);
    
    // 1. Генерируем уникальный email для этого теста
    const existingEmail = `existing_${Date.now()}@example.com`;
    const password = 'Password123!';

    // 2. Создаем пользователя через API (напрямую в базу), чтобы он ТОЧНО существовал
    // В CI бэкенд уже запущен, поэтому этот запрос пройдет успешно.
    const response = await request.post('http://localhost:5000/api/users/register', {
      data: {
        fullName: 'Existing User',
        email: existingEmail,
        password: password
      }
    });
    expect(response.ok()).toBeTruthy();

    // 3. Переходим на страницу регистрации и пытаемся зарегистрировать этого же юзера
    await registerPage.goto();
    await registerPage.register('Another User', existingEmail, password);

    // 4. Проверяем, что появился красный тост с ошибкой
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    
    // 5. И что редиректа не произошло (мы остались на /signup)
    await expect(page).toHaveURL('/signup');
  });
});
