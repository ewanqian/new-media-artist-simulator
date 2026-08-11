import { test, expect } from '@playwright/test';

async function clearRoute(page) {
  await page.evaluate(() => {
    localStorage.removeItem('nmas-special-butterfly-narrative-v1');
    localStorage.removeItem('nmas-special-butterfly-world-v1');
    localStorage.removeItem('nmas-blueprint-editor-autosave-v2');
  });
}

test('Butterfly Scholar special route is reachable from home, completes narrative, and opens its real Blueprint preset', async ({ page, isMobile }) => {
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /进入特殊路线/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await expect(page.getByRole('heading', { name: '出发前的工作室' })).toBeVisible();
  await expect(page.getByText('艺术家 / 蝴蝶研究者', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /接受，但先写下一句话/ }).click();
  await expect(page.getByRole('heading', { name: '研究站入口' })).toBeVisible();

  await page.getByRole('button', { name: /先记下来，不追问/ }).click();
  await expect(page.getByRole('heading', { name: '第一次采集' })).toBeVisible();
  await expect(page.getByText(/说法当前互相冲突/)).toBeVisible();

  await page.getByRole('button', { name: /记录“今天没有出现”/ }).click();
  await expect(page.getByRole('heading', { name: '晚上的工作台' })).toBeVisible();
  await expect(page.getByText(/个路线节点/)).toBeVisible();

  await page.getByRole('button', { name: /保留一部分缺口/ }).click();
  await expect(page.getByText(/另一张证件/)).toBeVisible();
  await page.getByRole('button', { name: /听她把话说完/ }).click();

  await expect(page.getByRole('heading', { name: '花园第一次被别人进入' })).toBeVisible();
  await page.getByRole('button', { name: /归档：保留分歧和关系/ }).click();
  await expect(page.getByText('ROUTE COMPLETE', { exact: true })).toBeVisible();
  await expect(page.getByText(/Inés 信任：\d+ · 人物记忆：\d+/)).toBeVisible();

  await page.getByRole('link', { name: '打开最终工作图' }).click();
  await page.waitForURL(/core=v05.*lab=blueprint.*preset=butterfly|lab=blueprint.*preset=butterfly/);
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 第一次采集"]')).toBeVisible();

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '节点' }).click();
    const library = page.getByLabel('节点库');
    await expect(library).toBeVisible();
    await expect(library.getByRole('button', { name: /Gaussian Splatting/ })).toBeVisible();
    await expect(library.getByRole('button', { name: /摄影测量采集/ })).toBeVisible();
  } else {
    await expect(page.getByText('Gaussian Splatting', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('摄影测量采集', { exact: true }).first()).toBeVisible();
  }
});
