import { test, expect } from '@playwright/test';

async function clearEp00(page) {
  await page.evaluate(() => {
    for (const key of [
      'nmas-v05-career-profile',
      'nmas-v05-world-hub-preview',
      'nmas-blueprint-editor-autosave-v2',
      'nmas-ep00-onboarding-v1',
      'nmas-ep00-blueprint-complete-v1',
      'nmas-ep00-archive-v1'
    ]) localStorage.removeItem(key);
  });
}

async function dismissFeedback(page) {
  const layer = page.locator('.gf-layer');
  if (await layer.count()) {
    try { await layer.first().click({ timeout: 1200 }); } catch {}
  }
}

test('EP00 turns a scan choice into a three-node work graph, archive, and career handoff', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearEp00(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await expect(page.getByText('建立你的工作台', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /开始 EP00/ }).click();
  await page.waitForURL(/mode=ep00/);

  await expect(page.getByRole('heading', { name: '建立你的工作台' })).toBeVisible();
  await page.getByRole('button', { name: /先让东西真的运行/ }).click();

  await expect(page.getByRole('heading', { name: '桌上只有三样真正重要的东西。' })).toBeVisible();
  await page.getByRole('button', { name: /电脑/ }).click();
  await page.getByRole('button', { name: /移动硬盘/ }).click();
  await page.getByRole('button', { name: /空白档案/ }).click();
  await page.getByRole('button', { name: /出去记录一次/ }).click();

  await expect(page.getByRole('heading', { name: '保存一个你今天经过的地方。' })).toBeVisible();
  await page.getByRole('button', { name: /扫下来/ }).click();
  await dismissFeedback(page);
  await expect(page.getByRole('heading', { name: 'SCAN_SET_001' })).toBeVisible();
  await expect(page.getByText('1 个空间采集 · 1.8 GB', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /把它接成第一张工作图/ }).click();
  await page.waitForURL(/lab=blueprint.*preset=ep00.*capture=scan/);

  const hud = page.getByLabel('EP00 工作图训练');
  const canvasNodes = page.locator('.be-node');
  await expect(hud).toBeVisible();
  await expect(canvasNodes).toHaveCount(3);
  await expect(canvasNodes.filter({ hasText: '空间采集' })).toHaveCount(1);
  await expect(canvasNodes.filter({ hasText: '空间重建' })).toHaveCount(1);
  await expect(canvasNodes.filter({ hasText: '三维场景' })).toHaveCount(1);
  await expect(canvasNodes.filter({ hasText: '照片素材' })).toHaveCount(0);
  await expect(canvasNodes.filter({ hasText: '声音素材' })).toHaveCount(0);

  await page.getByLabel('空间采集 输出 空间数据').click();
  await page.getByLabel('空间重建 输入 空间数据').click();
  await expect(hud).toContainText('任务 2 / 2');
  await page.getByLabel('空间重建 输出 三维数据').click();
  await page.getByLabel('三维场景 输入 三维数据').click();
  await expect(hud).toContainText('2 / 2 完成');
  await dismissFeedback(page);

  await hud.getByRole('link', { name: /回到 EP00 归档/ }).click();
  await page.waitForURL(/mode=ep00/);
  await expect(page.getByRole('heading', { name: '第一次记录已经进入你的档案。' })).toBeVisible();
  await expect(page.getByText('空间采集', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('现实空间可以被采样成可编辑的数据', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /带着这些东西进入生涯/ }).click();
  await page.waitForURL(/mode=story/);
  const local = await page.evaluate(() => ({
    profile: JSON.parse(localStorage.getItem('nmas-v05-career-profile') || '{}'),
    save: JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'),
    archive: JSON.parse(localStorage.getItem('nmas-ep00-archive-v1') || '{}')
  }));
  expect(local.profile.id).toContain('career-ep00');
  expect(local.save.methodIds).toContain('method-spatial-capture');
  expect(local.save.readKnowledgeEntryIds).toContain('knowledge-space-as-data');
  expect(local.save.evidenceIds).toContain('record-001-first-capture');
  expect(local.archive.asset.id).toBe('SCAN_SET_001');
});
