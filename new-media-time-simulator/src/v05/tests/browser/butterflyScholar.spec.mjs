import { test, expect } from '@playwright/test';

async function clearRoute(page) {
  await page.evaluate(() => {
    localStorage.removeItem('nmas-special-butterfly-narrative-v1');
    localStorage.removeItem('nmas-special-butterfly-world-v1');
    localStorage.removeItem('nmas-blueprint-editor-autosave-v2');
    localStorage.removeItem('nmas-butterfly-training-complete-v1');
  });
}

async function choose(page, name) {
  await page.getByRole('button', { name }).click();
}

test('Butterfly Scholar is a formal special chapter with staged training and an incomplete Blueprint lesson', async ({ page, isMobile }) => {
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await expect(page.getByText('哥斯达黎加的蝴蝶学者', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加的蝴蝶学者/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await choose(page, /接受，但先写下一句话/);
  await choose(page, /先记下来，不追问/);
  await choose(page, /记录“今天没有出现”/);
  await expect(page.getByText('FIELD CHECK', { exact: true })).toBeVisible();
  await choose(page, /现在补拍缺口/);
  await expect(page.getByText('CAMERA SOLVE', { exact: true })).toBeVisible();
  await choose(page, /先诊断相机与匹配/);
  await choose(page, /保留视图连续性，做 Gaussian/);
  await expect(page.getByText('WEB PREVIEW', { exact: true })).toBeVisible();
  await choose(page, /在 SuperSplat 里先清理再预览/);
  await choose(page, /保留一部分缺口/);
  await choose(page, /听她把话说完/);
  await choose(page, /归档：保留分歧和关系/);

  await expect(page.getByRole('heading', { name: '采集方法已经变成作品方法。' })).toBeVisible();
  await page.getByRole('link', { name: '进入训练工作图' }).click();
  await page.waitForURL(/core=v05.*lab=blueprint.*preset=butterfly|lab=blueprint.*preset=butterfly/);
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 采集训练"]')).toBeVisible();
  await expect(page.getByLabel('蝴蝶学者训练任务')).toContainText('任务 1 / 3');

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '节点' }).click();
    const library = page.getByLabel('节点库');
    await expect(library.getByRole('button', { name: /Gaussian Splatting 用大量三维高斯表示空间外观/ })).toBeVisible();
    await expect(library.getByRole('button', { name: /LED 屏/ })).toBeHidden();
  } else {
    await expect(page.getByText('摄影测量采集', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('现场采集检查', { exact: true }).first()).toBeVisible();
  }
});

test('desktop Butterfly training advances 1/3 to complete through real graph connections', async ({ page, isMobile }) => {
  test.skip(isMobile, 'port-connection training is locked on desktop in this regression');
  await page.goto('/?core=v05&lab=blueprint&preset=butterfly', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('任务 1 / 3');

  await page.getByLabel('摄影测量采集 输出 照片序列').click();
  await page.getByLabel('现场采集检查 输入 采集数据').click();
  await expect(hud).toContainText('任务 2 / 3');

  await page.getByLabel('现场采集检查 输出 可处理数据').click();
  await page.getByLabel('Metashape · 照片对齐 输入 照片序列').click();
  await expect(hud).toContainText('任务 3 / 3');

  await page.getByLabel('Metashape · 照片对齐 输出 相机位姿').click();
  await page.getByLabel('Gaussian Splatting 输入 相机位姿 + 图像').click();
  await expect(hud).toContainText('训练完成');
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
