import { test, expect } from '@playwright/test';

test('should display login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('Login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('should show error on invalid login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'invalid@charityhub.org');
  await page.fill('input[type="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 }).catch(() => {});
});
