import { test, expect } from '@playwright/test';

test('malformed v05.1 save recovers into the first concrete problem', async ({ page }) => {
  await page.goto('/v051/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('nmas-v05.1-run', '{broken'));
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '你做的网页黑屏了。' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05.1-run') || '{}').schemaVersion)).toBe(2);
});

test('AI is not required by any first-week action', async ({ page }) => {
  await page.route(/openai|anthropic|api\//, (route) => route.abort());
  await page.goto('/v051/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('nmas-v05.1-run'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /删掉最后加的效果/ }).click();
  await page.getByRole('button', { name: /用自己手机打开/ }).click();
  await page.getByRole('button', { name: /把鼠标操作换成触摸/ }).click();
  await page.getByRole('button', { name: /现在发链接/ }).click();
  await expect(page.getByText('场地方回：“收到，手机也能打开。”')).toBeVisible();
  await page.getByRole('button', { name: '看下午发来的现场照片' }).click();
  await page.getByRole('button', { name: /按现场照片重排画面/ }).click();
  await page.getByRole('button', { name: /认了：今晚就播录屏/ }).click();
  await expect(page.getByRole('heading', { name: '它每十秒准时重来。' })).toBeVisible();
});
