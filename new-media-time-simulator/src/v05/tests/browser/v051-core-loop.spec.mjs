import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/v051/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('nmas-v05.1-run'));
  await page.reload({ waitUntil: 'networkidle' });
});

test('default entry starts inside one concrete problem with no menu or premature system UI', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '你做的网页黑屏了。' })).toBeVisible();
  await expect(page.getByLabel('作品预览')).toContainText('37 errors');
  await expect(page.getByLabel('现在能做的事').getByRole('button')).toHaveCount(3);
  await expect(page.getByRole('link')).toHaveCount(0);
  const copy = await page.locator('body').innerText();
  for (const premature of ['哥斯达黎加', 'Inés', 'Rojas', '点云', 'Gaussian', 'Asset', 'Evidence', 'Blueprint', '选择游玩内容', '内容管理']) {
    expect(copy).not.toContain(premature);
  }
});

test('first-week loop changes the visible work, records feedback, and resumes after refresh', async ({ page }) => {
  await page.getByRole('button', { name: /看第一条红色报错/ }).click();
  await expect(page.getByRole('heading', { name: '画面回来了。先别急着感动。' })).toBeVisible();
  await page.getByRole('button', { name: /发给一个还没睡的朋友/ }).click();
  await expect(page.getByText(/所以我要干嘛/)).toBeVisible();
  await page.getByRole('button', { name: /加一句“拖动这些圆”/ }).click();
  await expect(page.getByRole('heading', { name: '上午十点要链接。' })).toBeVisible();
  await page.getByRole('button', { name: /现在发链接/ }).click();
  await expect(page.getByRole('heading', { name: '链接发出去了。' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const run = JSON.parse(localStorage.getItem('nmas-v05.1-run') || '{}');
    return [run.schemaVersion, run.works?.[0]?.versions?.length, run.feedback?.[0]?.status, run.history?.length];
  })).toEqual([2, 3, 'used', 4]);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('场地方回：“收到。拖动提示看见了。”')).toBeVisible();
});

for (const width of [1024, 1440]) {
  test(`first problem stays usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel('作品预览')).toBeVisible();
    await expect(page.getByLabel('现在能做的事')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}
