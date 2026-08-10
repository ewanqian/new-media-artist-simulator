import { test, expect } from '@playwright/test';

async function openWithDiagnostics(page, path) {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  const diagnostics = {
    path,
    status: response?.status(),
    url: page.url(),
    title: await page.title(),
    body: (await page.locator('body').innerText()).slice(0, 600),
    pageErrors
  };
  console.log('BROWSER_DIAGNOSTICS', JSON.stringify(diagnostics));
  return diagnostics;
}

test('legacy simulator still loads as the default entry', async ({ page }) => {
  const diagnostics = await openWithDiagnostics(page, '/');
  expect(diagnostics.status).toBe(200);
  expect(diagnostics.pageErrors).toEqual([]);
  await expect(page.getByText('新媒体时间模拟器', { exact: true })).toBeVisible();
  await expect(page.getByText('艺术生态、生存策略与技能演化实验')).toBeVisible();
});

test('v0.3 journey lab loads, advances, persists, and fits viewport', async ({ page }) => {
  const diagnostics = await openWithDiagnostics(page, '/?core=v03');
  expect(diagnostics.status).toBe(200);
  expect(diagnostics.pageErrors).toEqual([]);
  await page.evaluate(() => localStorage.removeItem('nmas-v03-journey-lab'));
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('新媒体艺术家模拟器 · 十个记忆点压力测试')).toBeVisible();
  await expect(page.getByText('遗产不是钱，是一根转接头')).toBeVisible();
  await expect(page.getByText('中规中矩')).toBeVisible();
  await expect(page.getByText('无脑吹')).toBeVisible();
  await expect(page.getByText('黑色幽默')).toBeVisible();

  const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(bodyOverflow).toBe(true);

  await page.getByRole('button', { name: /收进工具箱/ }).click();
  await expect(page.getByText('掉帧十二秒')).toBeVisible();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('掉帧十二秒')).toBeVisible();
  await expect(page.getByText('祖传 HDMI 转接头')).toBeVisible();
});
