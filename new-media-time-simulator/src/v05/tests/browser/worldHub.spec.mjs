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

test('v0.5 keeps the title and the map contains places rather than system tools', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await expect(page.getByText('NEW MEDIA ARTIST SIMULATOR')).toBeVisible();
  await expect(page.getByText(/时间模拟器/)).toHaveCount(0);
  await enterWorld(page);

  await expect(page.getByRole('heading', { name: '世界' })).toBeVisible();
  const map = page.locator('.wf-map');
  await expect(map.getByRole('button')).toHaveCount(5);
  await expect(map.getByText('榕树湾工作区', { exact: true })).toBeVisible();
  await expect(map.getByText('深港加速走廊', { exact: true })).toBeVisible();
  await expect(map.getByText('工作台', { exact: true })).toHaveCount(0);
  await expect(map.getByText('档案', { exact: true })).toHaveCount(0);
  await expect(map.getByText(/渲染农场/)).toHaveCount(0);
  await expect(page.getByText(/场景铸造/)).toHaveCount(0);
  await expect(page.getByText(/STAGE FORGE/)).toHaveCount(0);

  await expect(page.getByRole('navigation', { name: '主要系统' }).getByText('工作台', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要系统' }).getByText('档案', { exact: true })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});

test('A opens archive globally and text decisions live inside a real social place', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /系统 \/ 生成/);

  await page.keyboard.press('a');
  await expect(page.getByRole('heading', { name: '档案' })).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByRole('heading', { name: '档案' })).toBeHidden();

  await page.locator('.wf-map').getByRole('button', { name: /榕树湾工作区/ }).click();
  await expect(page.getByRole('heading', { name: '榕树湾工作区' })).toBeVisible();
  await page.getByRole('button', { name: /江边大排档/ }).click();
  await expect(page.getByText(/有个场地空了两个小时/)).toBeVisible();
  await expect(page.getByRole('button', { name: /先判断值不值得去/ })).toBeVisible();

  const flowIsNormal = await page.evaluate(() => {
    const event = document.querySelector('.wf-text-event');
    const decisions = document.querySelector('.wf-decisions');
    if (!event || !decisions) return false;
    const e = event.getBoundingClientRect();
    const d = decisions.getBoundingClientRect();
    return d.top > e.top && getComputedStyle(decisions).position === 'static';
  });
  expect(flowIsNormal).toBe(true);
});

test('workbench is global and specialist compute services are practice-dependent', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /研究 \/ 批评/);
  await page.getByRole('navigation', { name: '主要系统' }).getByRole('button', { name: /工作台/ }).click();
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible();
  await expect(page.getByText('远程算力节点', { exact: true })).toHaveCount(0);

  await reset(page);
  await enterWorld(page, /影像 \/ 扫描/);
  await page.getByRole('navigation', { name: '主要系统' }).getByRole('button', { name: /工作台/ }).click();
  await expect(page.getByText('远程算力节点', { exact: true })).toBeVisible();
  await expect(page.getByText('离线预演节点', { exact: true })).toBeVisible();
});

test('venue preview is entered through a real venue rather than from the world map', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /空间 \/ 装置/);

  await page.locator('.wf-map').getByRole('button', { name: /深港加速走廊/ }).click();
  await page.getByRole('button', { name: /黑盒测试场/ }).click();
  await expect(page.getByRole('button', { name: /场地预演/ })).toBeVisible();
  await page.getByRole('button', { name: /场地预演/ }).click();

  await expect(page.getByRole('heading', { name: '场地预演' })).toBeVisible();
  await expect(page.getByRole('button', { name: /平面屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /超宽屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /环形屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /球幕/ })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});
