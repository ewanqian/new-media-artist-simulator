import { test, expect } from '@playwright/test';

async function reset(page) {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });
}

async function start(page) {
  await page.getByRole('button', { name: '开始新的实践' }).click();
}

async function doMinimumSystem(page) {
  await page.getByRole('button', { name: /做一个最小系统/ }).click();
  const sheet = page.locator('.vx-sheet');
  await expect(sheet.getByRole('heading', { name: '做一个最小系统' })).toBeVisible();
  await sheet.getByRole('button', { name: '执行这张卡' }).click();
}

test('new game starts with studio and archive only', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await start(page);

  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByRole('button', { name: '工作室', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '档案', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '探索', exact: true })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: '项目', exact: true })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: '联络', exact: true })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: '工作台', exact: true })).toHaveCount(0);

  await expect(page.getByRole('heading', { name: '今天在工作室做什么' })).toBeVisible();
  await expect(page.locator('.vx-card')).toHaveCount(3);
  await expect(page.getByText('苏河 / 普陀', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/浦东|徐汇滨江|杨浦滨江/)).toHaveCount(0);
});

test('first concrete action unlocks exploration without dumping the whole game', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);

  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByRole('button', { name: '探索', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '项目', exact: true })).toHaveCount(0);

  await nav.getByRole('button', { name: '探索', exact: true }).click();
  await expect(page.getByRole('heading', { name: '去哪里' })).toBeVisible();
  await expect(page.getByRole('button', { name: '工作', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '展示', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '学习', exact: true })).toBeVisible();

  const fontSize = await page.locator('.vx-place-card > p').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(15);
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalOverflow).toBe(true);
});

test('visiting a readable place unlocks a project grown from prior actions', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await page.getByRole('navigation', { name: '主要系统' }).getByRole('button', { name: '探索', exact: true }).click();

  await page.getByRole('button', { name: /基础工作室/ }).click();
  const placeSheet = page.locator('.vx-sheet');
  await expect(placeSheet.getByRole('heading', { name: '基础工作室' })).toBeVisible();
  await expect(placeSheet.getByText('费用低', { exact: true })).toBeVisible();
  await expect(placeSheet.getByText('适合长期试错', { exact: true })).toBeVisible();
  await placeSheet.getByRole('button', { name: '去一次' }).click();

  await expect(page.getByRole('heading', { name: '最小反馈系统' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByRole('button', { name: '项目', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '联络', exact: true })).toHaveCount(0);
});

test('project work reveals only contacts the player actually met', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  const nav = page.getByRole('navigation', { name: '主要系统' });
  await nav.getByRole('button', { name: '探索', exact: true }).click();
  await page.getByRole('button', { name: /基础工作室/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '去一次' }).click();

  await page.getByRole('button', { name: /做一个一页项目版本/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '执行这张卡' }).click();

  await expect(nav.getByRole('button', { name: '联络', exact: true })).toBeVisible();
  await nav.getByRole('button', { name: '联络', exact: true }).click();
  await expect(page.getByRole('heading', { name: '林', exact: true })).toBeVisible();
  await expect(page.getByText(/做实时影像和小型装置/)).toBeVisible();
  await expect(page.getByText(/在基础工作室测试时认识/)).toBeVisible();
  await expect(page.getByText(/先别做 PPT/)).toBeVisible();
  await expect(page.getByRole('button', { name: /李工/ })).toHaveCount(0);
});

test('contact chat creates a delayed reply and then unlocks workbench', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  const nav = page.getByRole('navigation', { name: '主要系统' });
  await nav.getByRole('button', { name: '探索', exact: true }).click();
  await page.getByRole('button', { name: /基础工作室/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '去一次' }).click();
  await page.getByRole('button', { name: /做一个一页项目版本/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '执行这张卡' }).click();
  await nav.getByRole('button', { name: '联络', exact: true }).click();

  await page.getByRole('button', { name: /看一个当前版本/ }).click();
  await expect(page.getByText('看一个当前版本', { exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '工作台', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '结束本周' }).click();
  await expect(page.getByText(/发我一个能跑的版本/)).toBeVisible();
});

test('archive is large readable reference content and activity log remains separate', async ({ page }) => {
  await reset(page);
  await start(page);
  const nav = page.getByRole('navigation', { name: '主要系统' });
  await nav.getByRole('button', { name: '档案', exact: true }).click();

  await expect(page.getByRole('heading', { name: '档案', exact: true })).toBeVisible();
  const entries = page.locator('.vx-entry-list button');
  expect(await entries.count()).toBeGreaterThanOrEqual(30);
  await page.getByPlaceholder('搜索词条').fill('媒体考古');
  await expect(page.getByRole('button', { name: /媒体考古实验室/ })).toBeVisible();
  await page.getByRole('button', { name: /媒体考古实验室/ }).click();
  await expect(page.locator('.vx-reader').getByRole('heading', { name: '媒体考古实验室' })).toBeVisible();
  await expect(page.locator('.vx-reader').getByText(/复古滤镜/)).toBeVisible();

  await page.getByRole('button', { name: '记录', exact: true }).click();
  const log = page.locator('.vx-log');
  await expect(log.getByRole('heading', { name: '行动记录' })).toBeVisible();
  await expect(log.getByText('媒体考古实验室', { exact: true })).toHaveCount(0);
  await expect(log.getByText(/复古滤镜/)).toHaveCount(0);
});
