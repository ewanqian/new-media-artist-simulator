import { test, expect } from '@playwright/test';

test('v051 serves the full v05 home, reaches Costa Rica, and resumes after refresh', async ({ page }) => {
  await page.goto('/v051/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const key of ['nmas-special-costarica-narrative-v1', 'nmas-special-costarica-world-v1', 'nmas-v05.1-run']) localStorage.removeItem(key);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加/ }).click();
  await expect(page.locator('.bs-topbar')).toContainText('COSTA RICA');
  await page.getByRole('button', { name: '进入场景', exact: true }).click();
  const firstChoice = page.getByRole('button', { name: /接。先写下一个问题再出发/ });
  for (let step = 0; step < 4 && !(await firstChoice.isVisible().catch(() => false)); step += 1) {
    const next = page.getByRole('button', { name: /继续|提前看选择/, exact: true });
    await next.click();
  }
  await firstChoice.click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05.1-run') || '{}').currentNodeId)).toBe('bs-02-arrival');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText(/Inés 在研究站门口接你/)).toBeVisible();
});
