import { test, expect } from '@playwright/test';

async function openLab(page) {
  await page.goto('/?core=v05&lab=blueprint', { waitUntil: 'networkidle' });
}

test('blueprint lab renders a real node graph with run build read diagnostics', async ({ page }) => {
  await openLab(page);
  await expect(page.getByRole('heading', { name: '创作基因实验台' })).toBeVisible();
  await expect(page.locator('.bp-node')).toHaveCount(8);
  for (const name of ['RUN', 'BUILD', 'READ']) await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByLabel('Blueprint graph')).toBeVisible();
  const code = await page.getByLabel('Blueprint share code').inputValue();
  expect(code.startsWith('NMAS-BP1-')).toBe(true);
});

test('stress preset keeps 28 nodes readable and exposes pressure charts', async ({ page }) => {
  await openLab(page);
  await page.getByLabel('预置图纸').selectOption('bp-stress-28');
  await expect(page.locator('.bp-node')).toHaveCount(28);
  await expect(page.getByText('STRESS', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '制作压力剖面' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '创作基因分布' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '谱系不是撤销历史' })).toBeVisible();
});

test('blueprint can be remixed exported and re-read from its share code', async ({ page }) => {
  await openLab(page);
  const originalCode = await page.getByLabel('Blueprint share code').inputValue();
  await page.getByRole('button', { name: '另存 Remix' }).click();
  await expect(page.getByLabel('作品名')).toHaveValue(/Remix/);
  const remixCode = await page.getByLabel('Blueprint share code').inputValue();
  expect(remixCode).not.toBe(originalCode);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出图纸' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.nmas\.json$/);

  await page.getByPlaceholder('粘贴 NMAS-BP1-...').fill(originalCode);
  await page.getByRole('button', { name: '读取' }).click();
  await expect(page.locator('.bp-node')).toHaveCount(8);
});

test('quest books and memorable moments remain content packs rather than new primary menus', async ({ page }) => {
  await openLab(page);
  await expect(page.getByRole('heading', { name: '前期任务书骨架' })).toBeVisible();
  await expect(page.locator('.bp-books article')).toHaveCount(5);
  await expect(page.getByText('遇见 → 获得 → 组装 → 测试 → 部署 → 归档', { exact: false })).toBeVisible();
  await expect(page.locator('.bp-moments article')).toHaveCount(8);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
