import { test, expect } from '@playwright/test';

async function clearCareer(page) {
  await page.evaluate(() => {
    for (const key of [
      'nmas-v05-career-profile',
      'nmas-v05-world-hub-preview',
      'nmas-v05-ui-settings',
      'nmas-blueprint-library-v2',
      'nmas-blueprint-editor-autosave-v2',
      'nmas-special-carryovers-v1',
      'nmas-ep00-onboarding-v1',
      'nmas-ep00-blueprint-complete-v1',
      'nmas-ep00-archive-v1'
    ]) localStorage.removeItem(key);
    for (const key of Object.keys(localStorage)) if (key.startsWith('nmas-career-intro-seen:')) localStorage.removeItem(key);
  });
}

async function openNewCareer(page) {
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await expect(page.getByRole('link', { name: /开始 EP00/ })).toBeVisible();
  await page.getByRole('button', { name: '跳过引导 · 高级开局' }).click();
  await expect(page.getByRole('heading', { name: '跳过 EP00，建立起步档案' })).toBeVisible();
}

async function enterWeekOne(page) {
  await expect(page.getByLabel('第一周开场')).toBeVisible();
  await expect(page.getByRole('heading', { name: '先让一个东西存在。' })).toBeVisible();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await expect(page.getByLabel('第一周开场')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '开始新的实践' })).toHaveCount(0);
  await expect(page.getByLabel('生涯工具')).toBeVisible();
}

test('advanced career preset still creates a real starting dossier and seeds stage one', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await openNewCareer(page);

  await page.getByRole('button', { name: /从自己的桌面开始/ }).click();
  await expect(page.getByRole('heading', { name: '制作环节怎么操作？' })).toBeVisible();
  await page.getByRole('button', { name: /纯叙事/ }).click();
  await page.getByRole('button', { name: '查看起步档案' }).click();
  await expect(page.getByText('自己的桌面', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await page.waitForURL(/mode=story/);

  const local = await page.evaluate(() => ({
    profile: JSON.parse(localStorage.getItem('nmas-v05-career-profile') || '{}'),
    save: JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}')
  }));
  expect(local.profile.workMode).toBe('story');
  expect(local.profile.resourcePackId).toBe('pack-desk');
  expect(local.save.careerStageId).toBe('stage-1');
  expect(local.save.careerEpisodeId).toBe('ep-01-runnable');
  expect(local.save.cash).toBe(3200);
  await enterWeekOne(page);
  await expect(page.getByLabel('生涯工具').getByRole('link', { name: '工作图' })).toHaveCount(0);
});

test('five-question advanced start reaches the same career shell without creating a class', async ({ page, isMobile }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await openNewCareer(page);
  await page.getByRole('button', { name: /开始 5 题建模/ }).click();

  for (let index = 1; index <= 5; index += 1) {
    await expect(page.getByText(`ADVANCED START / ${index} OF 5`, { exact: true })).toBeVisible();
    await page.locator('.vc-options button').first().click();
  }
  await expect(page.getByRole('heading', { name: '制作环节怎么操作？' })).toBeVisible();
  await page.getByRole('button', { name: /混合/ }).click();
  await page.getByRole('button', { name: '查看起步档案' }).click();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await page.waitForURL(/mode=story/);

  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-career-profile') || '{}'));
  expect(profile.source).toBe('assessment');
  expect(profile.workMode).toBe('hybrid');
  expect(profile.classId).toBeUndefined();
  await enterWeekOne(page);
  await expect(page.getByLabel('生涯工具').getByRole('link', { name: '工作图' })).toBeVisible();

  if (!isMobile) {
    await page.locator('.vcareer-stage').click();
    const brief = page.getByLabel('当前任务线简报');
    await expect(brief).toBeVisible();
    await expect(brief.getByRole('heading', { name: '桌上先有一个东西开始运行' })).toBeVisible();
    await expect(brief.getByText('现在真正需要决定的事', { exact: true })).toBeVisible();
  }
});

test('Costa Rica carryover enters a new advanced career and becomes a reusable Stage 2 method', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.evaluate(() => {
    localStorage.setItem('nmas-special-carryovers-v1', JSON.stringify([{
      sourceId: 'special-01-costa-rica', title: '哥斯达黎加', completed: true,
      assetIds: ['CR-PHOTOSET-01'],
      assets: [{ id: 'CR-PHOTOSET-01', kind: 'dataset', title: 'CR-PHOTOSET-01 / 现场采集包', detail: '80 张照片', use: '离场检查' }],
      mementoIds: ['M-CR-TICKET'],
      mementos: [{ id: 'M-CR-TICKET', kind: 'travel', title: '哥斯达黎加往返电子行程单', detail: '一次驻地' }],
      methodIds: ['method-check-before-leave'],
      knowledgeIds: ['research-overlap'],
      nodeIds: ['capture-quality-check'],
      evidenceIds: ['ev-field-recapture']
    }]));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await openNewCareer(page);
  await page.getByRole('button', { name: /从自己的桌面开始/ }).click();
  await page.getByRole('button', { name: /纯叙事/ }).click();
  await page.getByRole('button', { name: '查看起步档案' }).click();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await page.waitForURL(/mode=story/);

  let careerSave = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(careerSave.methodIds).toContain('method-check-before-leave');
  expect(careerSave.specialAssetIds).toContain('CR-PHOTOSET-01');
  expect(careerSave.mementoIds).toContain('M-CR-TICKET');
  await enterWeekOne(page);

  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}');
    save.careerStageId = 'stage-2';
    save.careerEpisodeId = 'ep-04-blackbox';
    save.evidenceIds = [...new Set([...(save.evidenceIds || []), 'stage2:ep4:goal:recovery'])];
    localStorage.setItem('nmas-v05-world-hub-preview', JSON.stringify(save));
  });
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: /时间短的时候/ })).toBeVisible();
  const carryoverPanel = page.getByLabel('哥斯达黎加携带记录');
  await expect(carryoverPanel).toContainText('CR-PHOTOSET-01');
  const reuse = page.getByRole('button', { name: /调用哥斯达黎加的“离场前检查”/ });
  await expect(reuse).toContainText('旧经验复用');
  await reuse.click();
  await expect(page.getByText('旧经验被调用', { exact: true })).toBeVisible();
  await expect(carryoverPanel).toContainText('已经在当前生涯里被再次调用');

  careerSave = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(careerSave.evidenceIds).toContain('special:costarica:preflight-reused');
  expect(careerSave.contextActionIds).toContain('action-reuse-costa-rica-field-check');
  expect(careerSave.projectMetrics.documentation).toBeGreaterThanOrEqual(1);
});

test('settings opens from home and persists real interface preferences', async ({ page }) => {
  await page.goto('/?core=v05&mode=home', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '设置', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: '游戏设置' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('界面尺寸').selectOption('compact');
  await dialog.getByLabel('叙事密度').selectOption('full');
  await dialog.getByLabel('减少动态').check();
  await dialog.getByRole('button', { name: '完成' }).click();

  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-ui-settings') || '{}'));
  expect(settings.scale).toBe('compact');
  expect(settings.narrative).toBe('full');
  expect(settings.reducedMotion).toBe(true);
});

test('content manager treats export and blueprint library as tools rather than a third mode', async ({ page }) => {
  await page.goto('/?core=v05&mode=content', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '内容管理' })).toBeVisible();
  await expect(page.getByRole('button', { name: '导出全部本地内容' })).toBeVisible();
  await expect(page.getByText(/BLUEPRINT LIBRARY/)).toBeVisible();
  await expect(page.getByRole('link', { name: '打开最近工作图' })).toBeVisible();
  await expect(page.getByRole('link', { name: '新建空白工作图' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
