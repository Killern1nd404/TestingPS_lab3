import { test, expect } from '@playwright/test';
import { LoginPage } from '../tests/pages/LoginPage';

test.describe('Аутентификация', () => {
  let testEmail: string;
  const testPassword = 'Password123!';

  test.beforeEach(async ({ request }) => {
    testEmail = `auth_test_${Date.now()}@example.com`;
    
    await request.post('http://localhost:5000/api/users/register', {
      data: { 
        fullName: 'Auth Test User', 
        email: testEmail, 
        password: testPassword 
      }
    });
  });

  test('успешный вход в систему', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(testEmail, testPassword);

    await expect(page).toHaveURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('неверный пароль показывает ошибку', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(testEmail, 'wrong_password');

    await expect(
      page.locator('.Toastify__toast--error')
    ).toBeVisible({ timeout: 5000 });
    
    await expect(page).toHaveURL('/login');
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
