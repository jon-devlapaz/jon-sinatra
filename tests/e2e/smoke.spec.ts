import { expect, test } from '@playwright/test';

test('placeholder home page renders and responds 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Jon Delapaz/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jon Delapaz');
});
