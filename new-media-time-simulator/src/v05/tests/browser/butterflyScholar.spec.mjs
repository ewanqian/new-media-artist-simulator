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
  if (await layer.count()) await layer.click({ position: { x: 4, y: 4 } }).catch(() => {});
}

async function choose(page, name) {
  await dismissFeedback(page);
  const button = page.getByRole('button', { name });
  await expect(button).toBeVisible();
  await button.click();
}

test('Butterfly Scholar is a formal special chapter with study actions and a real art-making route', async ({ page, isMobile }) => {
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加的蝴蝶学者/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await choose(page, /接下合作，同时确认数据边界/);
  await choose(page, /带相机 \+ 轻量三脚架/);
  await choose(page, /先给她看以前的点云动画/);

  await expect(page.getByText(/飞着的蝴蝶很难用普通摄影测量/)).toBeVisible();
  const studyButterfly = page.getByRole('button', { name: /研究：蝴蝶怎么进入数字作品/ });
  await expect(studyButterfly).toBeVisible();
  await studyButterfly.click();
  await expect(page.getByLabel('已知信息')).toContainText('飞着的蝴蝶很难用普通摄影测量稳定重建');
  await page.getByLabel('已知信息').getByRole('button', { name: '×' }).click();
  await dismissFeedback(page);

  await choose(page, /今天这一小时没出现：照样记录/);
  await expect(page.getByText(/谁先用了蝴蝶/)).toBeVisible();
  await choose(page, /建一条来源记录/);

  await expect(page.getByText('FIELD CHECK', { exact: true })).toBeVisible();
  await choose(page, /现在补拍 10 分钟/);
  await expect(page.getByText('CAMERA SOLVE', { exact: true })).toBeVisible();
  await expect(page.getByText(/61 \/ 80 注册成功/)).toBeVisible();

  const studySolve = page.getByRole('button', { name: /研究：什么是相机求解/ });
  await expect(studySolve).toBeVisible();
  await studySolve.click();
  await expect(page.getByLabel('已知信息')).toContainText('每张照片是从哪里拍的');
  await page.getByLabel('已知信息').getByRole('button', { name: '×' }).click();
  await dismissFeedback(page);

  await choose(page, /先看注册失败和相机轨迹/);
  await choose(page, /Gaussian → 网页预览/);
  await expect(page.getByText('WEB PREVIEW', { exact: true })).toBeVisible();
  await choose(page, /先做一次轻量清理/);
  await choose(page, /保留，但写清楚它为什么在/);
  await choose(page, /先把署名和私人记录逐条对一遍/);
  await choose(page, /发布作品版本，不发布完整原始数据/);
  await choose(page, /归档这次项目/);

  await expect(page.getByRole('heading', { name: '这个项目终于做完了。' })).toBeVisible();
  await expect(page.getByText(/SPECIAL 01\s*COMPLETE/)).toBeVisible();
  await page.getByRole('link', { name: /3 步训练工作图/ }).click();
  await page.waitForURL(/core=v05.*lab=blueprint.*preset=butterfly|lab=blueprint.*preset=butterfly/);
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 入门训练"]')).toBeVisible();
  await expect(page.getByLabel('蝴蝶学者训练任务')).toContainText('0 / 3');
  await expect(page.getByLabel('蝴蝶学者训练任务')).toContainText('现在只做这一件事');

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
  await expect(hud).toContainText('2. 检查 → 相机求解');

  await page.getByLabel('离场前检查 输出 可继续的数据').click();
  await page.getByLabel('Metashape · 相机求解 输入 照片').click();
  await expect(hud).toContainText('2 / 3');
  await expect(hud).toContainText('3. 相机求解 → 你要的结果');

  await page.getByLabel('Metashape · 相机求解 输出 相机位置').click();
  await page.getByLabel('Gaussian Splatting 输入 相机位置 + 图像').click();
  await expect(hud).toContainText('完成');
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
