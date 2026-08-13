import { test, expect } from '@playwright/test';

test('v051 core loop saves a work and resumes after refresh', async ({ page }) => {
  await page.goto('/v051/?mode=core', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('nmas-v05.1-run'));
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '一个真实委托来了。' })).toBeVisible();
  await page.getByRole('button', { name: /先做一个可靠的版本/ }).click();
  await expect(page.getByRole('heading', { name: '第一版已经有了结果。' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05.1-run') || '{}').works?.[0]?.id)).toBe('work-first');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('第一件作品')).toBeVisible();
  await expect(page.getByText('未完成系统')).toBeVisible();
});
