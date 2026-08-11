import { test, expect } from '@playwright/test';

async function reset(page) {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });
}

async function start(page) {
  await page.getByRole('button', { name: '开始新的实践' }).click();
}

async function openPrimary(page, name) {
  await page.getByRole('navigation', { name: '主要系统' }).getByRole('button', { name: new RegExp(name) }).click();
}

async function openSub(page, layer, name) {
  await page.getByRole('navigation', { name: `${layer}子系统` }).getByRole('button', { name: new RegExp(name) }).click();
}

async function doMinimumSystem(page) {
  await openPrimary(page, '工作台');
  await page.getByRole('button', { name: /做一个最小系统/ }).click();
  const sheet = page.locator('.vx-sheet');
  await expect(sheet.getByRole('heading', { name: '做一个最小系统' })).toBeVisible();
  await sheet.getByRole('button', { name: '执行' }).click();
}

async function enterPlace(page, name) {
  await openPrimary(page, '场域');
  await openSub(page, '场域', '空间');
  await page.getByRole('button', { name: new RegExp(name) }).first().click();
  const sheet = page.locator('.vx-sheet');
  await expect(sheet.getByRole('heading', { name })).toBeVisible();
  await sheet.getByRole('button', { name: /进入环境/ }).click();
}

test('v05 exposes only field workbench and records as primary systems', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await start(page);

  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByRole('button')).toHaveCount(3);
  for (const name of ['场域', '工作台', '记录']) await expect(nav.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  for (const removed of ['EPISODE', '地图', '工作室', '项目', '联络', '档案']) await expect(nav.getByRole('button', { name: removed, exact: true })).toHaveCount(0);

  await expect(page.getByText(/EP\.01/)).toHaveCount(0);
  await expect(page.getByText(/Episode/i)).toHaveCount(0);
  await expect(page.getByText('自己的工作位', { exact: true })).toBeVisible();
  await expect(page.locator('.vx-card')).toHaveCount(3);
});

test('field is a 3 by 3 practice network rather than a Shanghai-first map', async ({ page }) => {
  await reset(page);
  await start(page);
  await openPrimary(page, '场域');

  const sub = page.getByRole('navigation', { name: '场域子系统' });
  await expect(sub.getByRole('button')).toHaveCount(3);
  for (const name of ['空间', '人物', '信号']) await expect(sub.getByRole('button', { name: new RegExp(name) })).toBeVisible();

  await expect(page.getByRole('heading', { name: '制作环境' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '展示环境' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '社会环境' })).toBeVisible();
  expect(await page.locator('.tri-family-cells > article').count()).toBe(9);
  await expect(page.getByText(/苏河|徐汇滨江|浦东|杨浦滨江|杭州|深圳/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /同行碰面/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /黑盒 \/ 演出空间/ })).toBeVisible();
});

test('entering an environment changes the workbench verbs instead of opening a generic location deck', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);
  await enterPlace(page, '黑盒 / 演出空间');

  await expect(page.getByRole('heading', { name: '工作台', exact: true })).toBeVisible();
  const actionSub = page.getByRole('navigation', { name: '工作台子系统' });
  await actionSub.getByRole('button', { name: /工作/ }).click();
  await expect(page.getByText('黑盒 / 演出空间', { exact: true })).toBeVisible();

  const preview = page.getByRole('button', { name: /场地预演/ });
  const compose = page.getByRole('button', { name: /编排/ });
  await expect(preview).toBeEnabled();
  await expect(compose).toBeDisabled();
  await expect(page.getByText('当前环境无意义', { exact: true })).toBeVisible();
});

test('workbench contains projects capabilities and actions with 3 by 3 capability grammar', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);

  const sub = page.getByRole('navigation', { name: '工作台子系统' });
  await expect(sub.getByRole('button')).toHaveCount(3);
  for (const name of ['项目', '能力', '工作']) await expect(sub.getByRole('button', { name: new RegExp(name) })).toBeVisible();

  await sub.getByRole('button', { name: /项目/ }).click();
  await expect(page.getByRole('heading', { name: '最小反馈系统' })).toBeVisible();
  await expect(page.getByText('SIDE PROJECTS', { exact: true })).toBeVisible();

  await sub.getByRole('button', { name: /能力/ }).click();
  await expect(page.getByRole('heading', { name: '输入' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '处理' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '输出' })).toBeVisible();
  expect(await page.locator('.tri-family-cells > article').count()).toBe(9);
});

test('records contains quests six archive categories and triumphs while episode stays hidden', async ({ page }) => {
  await reset(page);
  await start(page);
  await openPrimary(page, '记录');

  const sub = page.getByRole('navigation', { name: '记录子系统' });
  await expect(sub.getByRole('button')).toHaveCount(3);
  for (const name of ['任务', '档案', '成就']) await expect(sub.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await expect(page.getByRole('heading', { name: '第一个能被别人看见的版本' })).toBeVisible();
  await expect(page.getByText(/EP\.01/)).toHaveCount(0);

  await sub.getByRole('button', { name: /档案/ }).click();
  await expect(page.locator('.tri-archive-categories button')).toHaveCount(6);
  for (const name of ['人物', '场域', '项目', '方法', '媒介', '生态']) await expect(page.locator('.tri-archive-categories').getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await page.locator('.tri-archive-categories').getByRole('button', { name: /场域/ }).click();
  await page.getByPlaceholder('搜索当前分类').fill('媒体考古');
  await expect(page.getByRole('button', { name: /媒体考古实验室/ })).toBeVisible();

  await sub.getByRole('button', { name: /成就/ }).click();
  for (const name of ['挑战', '成就组', '称号']) await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByText('先让它运行', { exact: true })).toBeVisible();
});

test('main quest line is playable across environment action contact diagnosis and public output', async ({ page }) => {
  await reset(page);
  await start(page);
  await doMinimumSystem(page);

  await enterPlace(page, '基础工作室');
  await openSub(page, '工作台', '工作');
  await page.getByRole('button', { name: /运行/ }).click();

  await openPrimary(page, '记录');
  await expect(page.getByText('别人怎么理解它', { exact: true })).toBeVisible();

  await openPrimary(page, '场域');
  await openSub(page, '场域', '人物');
  await page.getByRole('button', { name: /林/ }).first().click();
  await page.getByRole('button', { name: /看一个当前版本/ }).click();
  await page.getByRole('button', { name: '结束本周' }).click();
  await expect(page.getByText(/发我一个能跑的版本/)).toBeVisible();

  await openPrimary(page, '工作台');
  await openSub(page, '工作台', '工作');
  await page.getByRole('button', { name: /诊断/ }).click();

  await openSub(page, '工作台', '项目');
  await page.getByRole('button', { name: /收缩到当前能力可可靠完成的版本/ }).click();

  await enterPlace(page, '黑盒 / 演出空间');
  await openSub(page, '工作台', '工作');
  await page.getByRole('button', { name: /运行/ }).click();

  await openPrimary(page, '记录');
  await openSub(page, '记录', '任务');
  await expect(page.getByText('主线完成', { exact: true })).toBeVisible();
  await expect(page.getByText('COMPLETED', { exact: true })).toHaveCount(5);

  await openSub(page, '记录', '成就');
  const title = page.locator('.tri-triumph-list article').filter({ hasText: '现场生物' });
  await expect(title).toHaveClass(/done/);
  await expect(page.locator('.tri-triumph-list article.done').count()).resolves.toBeGreaterThanOrEqual(4);
});

test('light reading mode and mobile triad navigation do not overflow', async ({ page }) => {
  await reset(page);
  const startButton = page.getByRole('button', { name: '开始新的实践' });
  expect(await startButton.evaluate((node) => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)');
  await start(page);
  const nav = page.getByRole('navigation', { name: '主要系统' });
  await expect(nav.getByRole('button')).toHaveCount(3);
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalOverflow).toBe(true);
});
