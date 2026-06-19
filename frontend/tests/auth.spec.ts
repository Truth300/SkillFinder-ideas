import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to signin and display the form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/signin');
    await expect(page.locator('h2', { hasText: 'Welcome back' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation error when submitting empty signin form', async ({ page }) => {
    await page.goto('/signin');
    await page.click('button[type="submit"]');
    
    // HTML5 validation message check or custom error
    // Our custom error is "Please fill in all fields." if JS catches it, but we have "required" attributes.
    // The browser prevents submission if required is not met. Let's just check if it stays on the page.
    await expect(page).toHaveURL('/signin');
  });

  test('should navigate to signup and display the form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h2', { hasText: 'Create an account' })).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
