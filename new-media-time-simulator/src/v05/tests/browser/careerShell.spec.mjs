import { test, expect } from '@playwright/test';

async function clearCareer(page) {
  await page.evaluate(() => {
    for (const key of [
      'nmas-v05-career-profile',
      'nmas-v05-world-hub-preview',
      'nmas-v05-ui-settings',
      'nmas-blueprint-library-v2',
      'nmas-blueprint-editor-autosave-v2'
    ]) localStorage.removeItem(key);
  });
}

test('career preset creates a real starting dossier and seeds stage one', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '建立你的起步档案' })).toBeVisible();

  await page.getByRole('button', { name: /从自己的桌面开始/ }).click();
  await expect(page.getByRole('heading', { name: '你想怎么完成制作环节？' })).toBeVisible();
  await page.getByRole('button', { name: /纯叙事/ }).click();
  await page.getByRole('button', { name: /继续：查看起步档案/ }).click();
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
  await expect(page.getByLabel('生涯工具')).toBeVisible();
  await expect(page.getByLabel('生涯工具').getByRole('link', { name: '工作图' })).toHaveCount(0);
});

test('five-question role model reaches the same career shell without creating a class', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clearCareer(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /开始 5 题建模/ }).click();

  for (let index = 1; index <= 5; index += 1) {
    await expect(page.getByText(`ROLE MODEL / ${index} OF 5`, { exact: true })).toBeVisible();
    await page.locator('.vc-options button').first().click();
  }
  await expect(page.getByRole('heading', { name: '你想怎么完成制作环节？' })).toBeVisible();
  await page.getByRole('button', { name: /混合/ }).click();
  await page.getByRole('button', { name: /继续：查看起步档案/ }).click();
  await expect(page.getByText('这是当前入口，不是固定身份。')).toBeVisible();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await page.waitForURL(/mode=story/);

  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-career-profile') || '{}'));
  expect(profile.source).toBe('assessment');
  expect(profile.workMode).toBe('hybrid');
  expect(profile.classId).toBeUndefined();
  await expect(page.getByLabel('生涯工具').getByRole('link', { name: '工作图' })).toBeVisible();
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
