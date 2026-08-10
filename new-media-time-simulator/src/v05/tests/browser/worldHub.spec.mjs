import { test, expect } from '@playwright/test';

async function reset(page) {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });
}

async function enterWorld(page, direction = /现场 \/ 演出/) {
  await page.getByRole('button', { name: '开始' }).click();
  await page.getByRole('button', { name: direction }).click();
}

test('v0.5 map uses a richer Shanghai place graph and keeps tools outside the map', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await enterWorld(page);

  await expect(page.getByRole('heading', { name: '地点', exact: true })).toBeVisible();
  const map = page.locator('.wf-map');
  await expect(map.getByRole('button')).toHaveCount(9);
  await expect(map.getByText('苏河 / 普陀', { exact: true })).toBeVisible();
  await expect(map.getByText('西岸 / 徐汇滨江', { exact: true })).toBeVisible();
  await expect(map.getByText('杨浦滨江 / 大学路', { exact: true })).toBeVisible();
  await expect(map.getByText('杭州', { exact: true })).toBeVisible();
  await expect(map.getByText('工作台', { exact: true })).toHaveCount(0);
  await expect(map.getByText('档案库', { exact: true })).toHaveCount(0);
  await expect(map.getByText(/渲染农场/)).toHaveCount(0);

  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByText('工作台', { exact: true })).toBeVisible();
  await expect(nav.getByText('联络', { exact: true })).toBeVisible();
  await expect(nav.getByText('档案库', { exact: true })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});

test('archive is a readable encyclopedia and activity log is separate', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /研究 \/ 批评/);

  await page.keyboard.press('k');
  await expect(page.getByRole('heading', { name: '档案库', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /技术单 \/ Technical Rider/ }).click();
  await expect(page.getByRole('heading', { name: '技术单 / Technical Rider', exact: true })).toBeVisible();
  await expect(page.locator('.wf-knowledge-reader').getByText(/不是“设备愿望清单”/)).toBeVisible();
  await expect(page.getByRole('heading', { name: '相关词条', exact: true })).toBeVisible();

  await page.keyboard.press('l');
  await expect(page.getByRole('heading', { name: '行动记录', exact: true })).toBeVisible();
  await expect(page.getByText(/这里只记录“你做过什么”/)).toBeVisible();
  await page.keyboard.press('l');
  await expect(page.getByRole('heading', { name: '行动记录', exact: true })).toBeHidden();
});

test('contacts are actionable threads rather than relationship bars', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /系统 \/ 生成/);
  await page.keyboard.press('c');
  await expect(page.getByRole('heading', { name: '联络', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /李工/ }).click();
  await expect(page.getByRole('heading', { name: '李工', exact: true })).toBeVisible();
  await expect(page.getByText(/等你补一版技术单/)).toBeVisible();
  await expect(page.getByRole('button', { name: /确认信号链/ })).toBeVisible();
});

test('workbench specialist services are practice-dependent', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /研究 \/ 批评/);
  await page.keyboard.press('w');
  await expect(page.getByRole('heading', { name: '工作台', exact: true })).toBeVisible();
  await expect(page.getByText('远程算力', { exact: true })).toHaveCount(0);

  await reset(page);
  await enterWorld(page, /影像 \/ 扫描/);
  await page.keyboard.press('w');
  await expect(page.getByText('远程算力', { exact: true })).toBeVisible();
  await expect(page.getByText('离线预演', { exact: true })).toBeVisible();
});

test('venue preview is entered through a real venue and nested local map', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /空间 \/ 装置/);

  await page.locator('.wf-map').getByRole('button', { name: /西岸 \/ 徐汇滨江/ }).click();
  await expect(page.getByRole('heading', { name: '西岸 / 徐汇滨江', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /多功能黑盒/ }).click();
  const contextualPreview = page.locator('.wf-text-event .wf-decisions button').first();
  await expect(contextualPreview).toContainText('进入场地预演');
  await contextualPreview.click();

  await expect(page.getByRole('heading', { name: '场地预演', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /平面屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /超宽屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /环形屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /球幕/ })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});
