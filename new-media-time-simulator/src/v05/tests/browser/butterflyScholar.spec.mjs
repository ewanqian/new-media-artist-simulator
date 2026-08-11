import { test, expect } from '@playwright/test';

async function clearRoute(page) {
  await page.evaluate(() => {
    localStorage.removeItem('nmas-special-butterfly-narrative-v1');
    localStorage.removeItem('nmas-special-butterfly-world-v1');
    localStorage.removeItem('nmas-blueprint-editor-autosave-v2');
    localStorage.removeItem('nmas-butterfly-training-complete-v1');
    localStorage.removeItem('nmas-butterfly-training-complete-v2');
  });
}

async function dismissFeedback(page) {
  const layer = page.locator('.gf-layer');
  if (await layer.isVisible().catch(() => false)) await layer.click({ position: { x: 4, y: 4 } }).catch(() => {});
}

async function revealScene(page) {
  const enter = page.getByRole('button', { name: '进入场景' });
  if (await enter.isVisible().catch(() => false)) await enter.click();
  for (let i = 0; i < 6; i += 1) {
    const next = page.locator('.narrative-next-line');
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click();
  }
}

async function choose(page, name) {
  await dismissFeedback(page);
  await revealScene(page);
  const decide = page.getByRole('button', { name: '做决定' });
  if (await decide.isVisible().catch(() => false)) await decide.click();
  const button = page.getByRole('button', { name });
  await expect(button).toBeVisible();
  await button.click();
}

async function study(page, title) {
  await dismissFeedback(page);
  await revealScene(page);
  const open = page.getByRole('button', { name: new RegExp(`研究：${title}`) });
  await expect(open).toBeVisible();
  await open.click();
  const dialog = page.getByRole('dialog', { name: new RegExp(`研究：${title}`) });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /记住这个方法|已记住/ }).click();
  await dismissFeedback(page);
}

test('Butterfly Scholar stages dialogue, research, capture, creation and archive as one special chapter', async ({ page, isMobile }) => {
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加的蝴蝶学者/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await choose(page, /去。先写下我真正想弄明白的问题/);
  await choose(page, /先聊工作：明天先看样地和档案/);

  await study(page, '活蝴蝶怎么采集');
  await choose(page, /记录蝴蝶运动，同时扫描寄主植物/);

  await expect(page.getByText('离场前检查', { exact: true }).first()).toBeVisible();
  await study(page, '摄影测量为什么需要重叠');
  await choose(page, /现在补拍/);

  await expect(page.getByText('相机求解', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/61 \/ 80 张照片已定位/)).toBeVisible();
  await study(page, '什么是相机求解');
  await choose(page, /先查相机求解/);

  await study(page, '点云和 Gaussian 有什么区别');
  await choose(page, /做 Gaussian 版本/);

  await study(page, '扫描完以后还能怎么动');
  await choose(page, /用 Noise \/ 程序化形变做动画/);

  await study(page, '“做蝴蝶”算抄袭吗');
  await choose(page, /把来源和差异写清楚/);

  await study(page, '标本、数据和公开边界');
  await choose(page, /先听她把数据边界讲完/);
  await choose(page, /归档这个版本/);

  await expect(page.getByRole('heading', { name: '终于做完了。' })).toBeVisible();
  await expect(page.locator('.bs-seal')).toContainText('SPECIAL 01');
  await expect(page.getByText(/活蝴蝶的运动和植物\/空间要分开采/)).toBeVisible();
  await expect(page.getByText(/扫描可以继续进入程序化动画/)).toBeVisible();

  await page.getByRole('link', { name: /进入三步训练工作图/ }).click();
  await page.waitForURL(/core=v05.*lab=blueprint.*preset=butterfly|lab=blueprint.*preset=butterfly/);
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 入门训练"]')).toBeVisible();
  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('0 / 3');
  await expect(hud).toContainText('INPUT');
  await expect(hud).toContainText('采集');
  await expect(hud).toContainText('相机位置');
  await expect(hud).toContainText('点云 / Gaussian');

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '节点' }).click();
    const library = page.getByLabel('节点库');
    await expect(library.getByRole('button', { name: /Gaussian Splatting/ })).toBeVisible();
    await expect(library.getByRole('button', { name: /Blender · 程序化动画/ })).toBeVisible();
    await expect(library.getByRole('button', { name: /LED 屏/ })).toBeHidden();
  } else {
    await expect(page.getByText('摄影测量采集', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('离场前检查', { exact: true }).first()).toBeVisible();
  }
});

test('desktop Butterfly training completes three explicit input-process-output connections', async ({ page, isMobile }) => {
  test.skip(isMobile, 'precise port-connection regression is desktop-only');
  await page.goto('/?core=v05&lab=blueprint&preset=butterfly', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('0 / 3');
  await expect(hud).toContainText('1. 采集 → 检查');

  await page.getByLabel('摄影测量采集 输出 照片序列').click();
  await page.getByLabel('离场前检查 输入 照片 / 扫描').click();
  await expect(hud).toContainText('1 / 3');

  await page.getByLabel('离场前检查 输出 可继续的数据').click();
  await page.getByLabel('Metashape · 相机求解 输入 照片').click();
  await expect(hud).toContainText('2 / 3');

  await page.getByLabel('Metashape · 相机求解 输出 相机位置').click();
  await page.getByLabel('Gaussian Splatting 输入 相机位置 + 图像').click();
  await expect(hud).toContainText('完成');
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
