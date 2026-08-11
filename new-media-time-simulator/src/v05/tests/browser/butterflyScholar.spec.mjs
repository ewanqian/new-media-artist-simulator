import { test, expect } from '@playwright/test';

async function clearRoute(page) {
  await page.evaluate(() => {
    localStorage.removeItem('nmas-special-butterfly-narrative-v1');
    localStorage.removeItem('nmas-special-butterfly-world-v1');
    localStorage.removeItem('nmas-blueprint-editor-autosave-v2');
    localStorage.removeItem('nmas-butterfly-training-complete-v1');
    localStorage.removeItem('nmas-butterfly-training-complete-v2');
    localStorage.removeItem('nmas-butterfly-training-complete-v3');
  });
}

async function dismissFeedback(page) {
  const layer = page.locator('.gf-layer');
  if (await layer.isVisible().catch(() => false)) {
    await layer.click({ position: { x: 4, y: 4 } }).catch(() => {});
    await expect(layer).toBeHidden({ timeout: 1200 }).catch(() => {});
  }
}

async function advanceUntil(page, target) {
  for (let i = 0; i < 36; i += 1) {
    await dismissFeedback(page);
    if (await target.isVisible().catch(() => false)) return;

    const enter = page.getByRole('button', { name: '进入场景', exact: true });
    if (await enter.isVisible().catch(() => false)) {
      await enter.click();
      continue;
    }

    const next = page.getByRole('button', { name: '继续', exact: true });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      continue;
    }

    const decide = page.getByRole('button', { name: '做决定', exact: true });
    if (await decide.isVisible().catch(() => false)) {
      await decide.click();
      continue;
    }

    const dialogue = page.locator('.narrative-dialogue');
    if (await dialogue.isVisible().catch(() => false)) {
      await dialogue.click({ position: { x: 8, y: 8 } }).catch(() => {});
    }
    await page.waitForTimeout(80);
  }
  await expect(target).toBeVisible({ timeout: 4000 });
}

async function choose(page, name) {
  const option = page.getByRole('button', { name });
  await advanceUntil(page, option);
  await option.click();
  await dismissFeedback(page);
}

async function study(page, title) {
  const open = page.getByRole('button', { name: new RegExp(`研究：${title}`) });
  await advanceUntil(page, open);
  await open.click();
  const dialog = page.getByRole('dialog', { name: new RegExp(`研究：${title}`) });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /记住这个方法|已记住/ }).click();
  await dismissFeedback(page);
}

test('Butterfly Scholar is a readable special chapter with research, memory and a new-media making route', async ({ page, isMobile }) => {
  test.setTimeout(60000);
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加的蝴蝶学者/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await expect(page.getByRole('button', { name: '进入场景' })).toBeVisible();
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('蝴蝶一直在动');

  await choose(page, /先写下我真正想弄明白的问题/);
  await choose(page, /先聊工作：明天先看样地和档案/);

  await study(page, '活蝴蝶怎么采集');
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('活蝴蝶怎么采集');
  await choose(page, /记录蝴蝶运动，同时扫描寄主植物/);

  await expect(page.getByText('离场前检查', { exact: true }).first()).toBeVisible();
  await study(page, '摄影测量为什么需要重叠');
  await choose(page, /现在补拍/);

  await study(page, '什么是相机求解');
  await expect(page.getByRole('dialog', { name: /研究：什么是相机求解/ })).toHaveCount(0);
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
  await page.getByRole('button', { name: '生成一条创作记录' }).click();
  await expect(page.getByText(/活体运动.*空间扫描/)).toBeVisible();

  await page.getByRole('link', { name: '进入三步训练工作图' }).click();
  await page.waitForURL(/core=v05.*lab=blueprint.*preset=butterfly|lab=blueprint.*preset=butterfly/);
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 三步采集训练"]')).toBeVisible();
  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('任务 1 / 3');
  await expect(hud).toContainText('【现场调查】右侧');

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '节点' }).click();
    const library = page.getByLabel('节点库');
    await expect(library.getByRole('button', { name: /Gaussian Splatting/ })).toBeVisible();
    await expect(library.getByRole('button', { name: /LED 屏/ })).toBeHidden();
  } else {
    await expect(page.getByText('现场调查', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('摄影测量采集', { exact: true }).first()).toBeVisible();
  }
});

test('desktop Butterfly lesson completes three real graph connections with explicit I/O', async ({ page, isMobile }) => {
  test.skip(isMobile, 'port-connection training is locked on desktop in this regression');
  await page.goto('/?core=v05&lab=blueprint&preset=butterfly', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('任务 1 / 3');

  await page.getByLabel('现场调查 输出 采集对象').click();
  await page.getByLabel('摄影测量采集 输入 要扫描的对象').click();
  await expect(hud).toContainText('任务 2 / 3');

  await page.getByLabel('摄影测量采集 输出 照片序列').click();
  await page.getByLabel('离场前检查 输入 照片 / 扫描').click();
  await expect(hud).toContainText('任务 3 / 3');

  await page.getByLabel('离场前检查 输出 可继续的数据').click();
  await page.getByLabel('Metashape · 相机求解 输入 照片').click();
  await expect(hud).toContainText('三步完成');
  await expect(hud).toContainText(/点云 \/ Gaussian \/ Blender/);
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
