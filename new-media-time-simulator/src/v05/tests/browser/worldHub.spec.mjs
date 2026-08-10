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

test('v0.5 keeps the correct title and opens a low-fidelity world map', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await expect(page.getByText('NEW MEDIA ARTIST SIMULATOR')).toBeVisible();
  await expect(page.getByText(/时间模拟器/)).toHaveCount(0);
  await enterWorld(page);
  await expect(page.getByRole('heading', { name: '世界地图' })).toBeVisible();
  await expect(page.getByText('咖啡馆', { exact: true })).toBeVisible();
  await expect(page.getByText('工作台', { exact: true })).toBeVisible();
  await expect(page.getByText('场地预演', { exact: true })).toBeVisible();
  await expect(page.getByText(/场景铸造/)).toHaveCount(0);
  await expect(page.getByText(/STAGE FORGE/)).toHaveCount(0);
  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});

test('A opens archive globally and café decisions stay in document flow', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /系统 \/ 生成/);
  await page.keyboard.press('a');
  await expect(page.getByRole('heading', { name: '档案' })).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByRole('heading', { name: '档案' })).toBeHidden();

  await page.getByText('咖啡馆', { exact: true }).click();
  await expect(page.getByRole('heading', { name: '咖啡馆' })).toBeVisible();
  await expect(page.getByText(/黑盒测试场周四晚上空两个小时/)).toBeVisible();
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

test('workbench and venue test are reachable on desktop and mobile', async ({ page }) => {
  await reset(page);
  await enterWorld(page, /空间 \/ 装置/);

  await page.getByText('工作台', { exact: true }).click();
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible();
  await expect(page.getByText('当前设备能力')).toBeVisible();
  await page.getByRole('button', { name: /世界地图/ }).click();

  await page.getByText('场地预演', { exact: true }).click();
  await expect(page.getByRole('heading', { name: '场地预演' })).toBeVisible();
  await expect(page.getByRole('button', { name: /平面屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /超宽屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /环形屏/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /球幕/ })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});
