import { test, expect } from '@playwright/test';

async function reset(page) {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });
}

async function start(page) {
  await page.getByRole('button', { name: '开始新的实践' }).click();
}

async function openNav(page, name) {
  await page.getByRole('navigation', { name: '主要系统' }).getByRole('button', { name, exact: true }).click();
}

async function doMinimumSystem(page) {
  await openNav(page, '工作室');
  await page.getByRole('button', { name: /做一个最小系统/ }).click();
  const sheet = page.locator('.vx-sheet');
  await expect(sheet.getByRole('heading', { name: '做一个最小系统' })).toBeVisible();
  await sheet.getByRole('button', { name: '执行这张卡' }).click();
}

async function visitBasicStudio(page) {
  await openNav(page, '地图');
  await page.getByRole('button', { name: /基础工作室/ }).click();
  const sheet = page.locator('.vx-sheet');
  await expect(sheet.getByRole('heading', { name: '基础工作室' })).toBeVisible();
  await sheet.getByRole('button', { name: '去一次' }).click();
}

test('new game opens as a complete simulator hub with all major systems visible', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await start(page);

  await expect(page.getByRole('heading', { name: '当前实践' })).toBeVisible();
  await expect(page.getByRole('button', { name: /EP.01 · 0\/5/ })).toBeVisible();
  const nav = page.getByRole('navigation', { name: '主要系统' });
  for (const name of ['首页', 'EPISODE', '地图', '工作室', '项目', '联络', '工作台', '档案']) {
    await expect(nav.getByRole('button', { name, exact: true })).toBeVisible();
  }
  await expect(page.locator('.gh-module')).toHaveCount(6);
  await expect(page.locator('.gh-mini-map')).toBeVisible();
  await expect(page.locator('.vx-fragment')).toHaveCount(0);
});

test('systems are visible before they are usable instead of disappearing from navigation', async ({ page }) => {
  await reset(page);
  await start(page);

  await openNav(page, '项目');
  await expect(page.getByRole('heading', { name: '项目', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '先做出一个东西' })).toBeVisible();

  await openNav(page, '联络');
  await expect(page.getByRole('heading', { name: '还没有真正认识的人' })).toBeVisible();

  await openNav(page, '工作台');
  await expect(page.getByText('可查看，暂不可升级', { exact: true })).toBeVisible();
  const upgradeButtons = page.getByRole('button', { name: /升级 · ¥800/ });
  expect(await upgradeButtons.count()).toBe(4);
  for (let i = 0; i < 4; i += 1) await expect(upgradeButtons.nth(i)).toBeDisabled();
});

test('episode one advances from a real studio action and keeps text ecology secondary', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);

  await expect(page.getByRole('heading', { name: '工作室之外' })).toBeVisible();
  expect(await page.locator('.vx-fragment').count()).toBeGreaterThanOrEqual(1);

  await openNav(page, 'EPISODE');
  await expect(page.getByRole('heading', { name: '第一个能被别人看见的版本' })).toBeVisible();
  await expect(page.getByText('2. 离开桌面', { exact: true })).toBeVisible();
  await expect(page.getByText('01', { exact: true }).first()).toBeVisible();
});

test('map is a spatial layer with regions, connections, facilities and enterable places', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await openNav(page, '地图');

  await expect(page.getByRole('heading', { name: '地图', exact: true })).toBeVisible();
  await expect(page.locator('.gh-world-map')).toBeVisible();
  expect(await page.locator('.gh-world-map > button').count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByText('空间节点', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /基础工作室/ })).toBeVisible();
  await expect(page.getByText(/工业楼工作室/)).toBeVisible();
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalOverflow).toBe(true);
});

test('visiting a real place forms the project and advances episode two', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await visitBasicStudio(page);

  await openNav(page, '项目');
  await expect(page.getByRole('heading', { name: '最小反馈系统' })).toBeVisible();
  await expect(page.getByText('没进场地', { exact: true })).toHaveCount(0);

  await openNav(page, 'EPISODE');
  await expect(page.getByText('3. 形成项目', { exact: true })).toBeVisible();
});

test('episode three requires both project articulation and learning', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await visitBasicStudio(page);

  await openNav(page, '项目');
  await page.getByRole('button', { name: /做一个一页项目版本/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '执行这张卡' }).click();

  await openNav(page, 'EPISODE');
  await expect(page.getByText('3. 形成项目', { exact: true })).toBeVisible();

  await openNav(page, '档案');
  const firstEntry = page.locator('.vx-entry-list button').first();
  await firstEntry.click();
  await openNav(page, 'EPISODE');
  await expect(page.getByText('4. 建立协作', { exact: true })).toBeVisible();
});

test('contact, workbench upgrade and blackbox visit complete the five-part opening episode', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await visitBasicStudio(page);

  await openNav(page, '项目');
  await page.getByRole('button', { name: /做一个一页项目版本/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '执行这张卡' }).click();
  await openNav(page, '档案');
  await page.locator('.vx-entry-list button').first().click();

  await openNav(page, '联络');
  await expect(page.getByRole('heading', { name: '林', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /看一个当前版本/ }).click();

  await openNav(page, '工作台');
  const outputCard = page.locator('.vx-capability').filter({ hasText: '输出 / Output' });
  await expect(outputCard.getByRole('button', { name: '升级 · ¥800' })).toBeEnabled();
  await outputCard.getByRole('button', { name: '升级 · ¥800' }).click();

  await openNav(page, '地图');
  const westbund = page.locator('.gh-world-map > button').filter({ hasText: '西岸' }).first();
  await westbund.click();
  await page.getByRole('button', { name: /黑盒 \/ 演出空间/ }).click();
  await page.locator('.vx-sheet').getByRole('button', { name: '去一次' }).click();

  await openNav(page, 'EPISODE');
  await expect(page.getByText('EP.01 完成', { exact: true })).toBeVisible();
  await expect(page.getByText('完成', { exact: true })).toHaveCount(5);
});

test('archive remains a large text library and activity history stays separate', async ({ page }) => {
  await reset(page);
  await start(page);
  await openNav(page, '档案');

  await expect(page.getByRole('heading', { name: '档案 / 学习', exact: true })).toBeVisible();
  const entries = page.locator('.vx-entry-list button');
  expect(await entries.count()).toBeGreaterThanOrEqual(30);
  await page.getByPlaceholder('搜索词条').fill('媒体考古');
  await expect(page.getByRole('button', { name: /媒体考古实验室/ })).toBeVisible();
  await page.getByRole('button', { name: /媒体考古实验室/ }).click();
  await expect(page.locator('.vx-reader').getByRole('heading', { name: '媒体考古实验室' })).toBeVisible();

  await page.getByRole('button', { name: '记录', exact: true }).click();
  const log = page.locator('.vx-log');
  await expect(log.getByRole('heading', { name: '行动记录' })).toBeVisible();
  await expect(log.getByText('媒体考古实验室', { exact: true })).toHaveCount(0);
});

test('dark interactions keep light text and mobile hub does not overflow the page', async ({ page }) => {
  await reset(page);
  const startButton = page.getByRole('button', { name: '开始新的实践' });
  expect(await startButton.evaluate((node) => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)');
  await start(page);

  const episodeButton = page.locator('.gh-episode-focus');
  expect(await episodeButton.evaluate((node) => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)');
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalOverflow).toBe(true);
});
