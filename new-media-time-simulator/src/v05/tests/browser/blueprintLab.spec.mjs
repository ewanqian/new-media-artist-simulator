import { test, expect } from '@playwright/test';

async function openEditor(page, suffix = '') {
  await page.goto(`/?core=v05&lab=blueprint${suffix}`, { waitUntil: 'networkidle' });
}

async function clearEditorStorage(page) {
  await page.evaluate(() => {
    localStorage.removeItem('nmas-blueprint-editor-autosave-v2');
    localStorage.removeItem('nmas-blueprint-library-v2');
  });
}

async function openPalette(page, isMobile) {
  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '画布' }).click();
    await page.locator('.be-canvas-tools').getByRole('button', { name: /节点/ }).click();
  } else {
    await page.keyboard.press('Shift+A');
  }
  await expect(page.locator('.be-palette')).toBeVisible();
}

test('v05 home exposes career chapters and free-create modes while tools stay secondary', async ({ page }) => {
  await page.goto('/?core=v05&mode=home', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await expect(page.getByRole('link', { name: /生涯 \/ 章节/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /新建空白/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /打开最近工作图/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /内容管理/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /设置/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /节点编辑器/ })).toHaveCount(0);
});

test('editor opens a production graph and nodes really drag', async ({ page, isMobile }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('新媒体艺术家节点编辑器', { exact: true })).toBeVisible();
  await expect(page.locator('.be-node')).toHaveCount(11);

  const node = page.locator('.be-node[data-node-id="p2"]');
  const before = await node.boundingBox();
  expect(before).toBeTruthy();

  if (isMobile) {
    const viewport = await page.locator('.be-viewport').boundingBox();
    expect(viewport).toBeTruthy();
    const startX = before.x + before.width / 2;
    const startY = before.y + Math.min(28, before.height / 2);
    const endX = Math.min(viewport.x + viewport.width - 35, startX + 85);
    const endY = Math.min(viewport.y + viewport.height - 90, startY + 70);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 8 });
    await page.mouse.up();
  } else {
    await node.dragTo(page.locator('.be-world'), { targetPosition: { x: 700, y: 600 } });
  }

  const after = await node.boundingBox();
  expect(after).toBeTruthy();
  expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(50);
});

test('node palette creates nodes and desktop output-to-input clicks create a link', async ({ page, isMobile }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });

  await openPalette(page, isMobile);
  const palette = page.locator('.be-palette');
  await palette.getByPlaceholder(/输入：LED/).fill('毫米波');
  await palette.getByRole('button', { name: /毫米波雷达/ }).click();
  await expect(page.locator('.be-node')).toHaveCount(12);

  if (!isMobile) {
    const wiresBefore = await page.locator('.be-wires .wire').count();
    await page.getByLabel('渲染电脑 输出 视频输出').click();
    await page.getByLabel('LED 屏 输入 视频').click();
    await expect(page.locator('.be-wires .wire')).toHaveCount(wiresBefore + 1);
  }
});

test('editor saves, saves as, restores and exports share code', async ({ page }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  const title = page.getByLabel('蓝图名称');
  await title.fill('OUTPUT Demo Blueprint');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await page.getByRole('button', { name: '另存为' }).click();
  await page.locator('.be-dialog input').fill('OUTPUT Demo Blueprint / B');
  await page.locator('.be-dialog').getByRole('button', { name: '另存为' }).click();
  await expect(title).toHaveValue('OUTPUT Demo Blueprint / B');
  await page.getByRole('button', { name: '分享' }).click();
  const code = await page.getByLabel('图纸码').inputValue();
  expect(code.startsWith('NMAS-BP1-')).toBe(true);
  await page.locator('.be-dialog').getByRole('button', { name: '×' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('蓝图名称')).toHaveValue('OUTPUT Demo Blueprint / B');
});

test('desktop camera tools fit, center and zoom without breaking node selection', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop-only camera toolbar');
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  const node = page.locator('.be-node[data-node-id="p2"]');
  await node.click();
  await expect(page.getByLabel('节点检查器')).toBeVisible();
  await page.locator('.be-camera-tools').getByRole('button', { name: /适配/ }).click();
  await page.locator('.be-camera-tools').getByRole('button', { name: /居中/ }).click();
  await page.locator('.be-camera-tools').getByRole('button', { name: '＋' }).click();
  await expect(page.locator('.be-camera-tools span')).not.toHaveText('82%');
});

test('mobile editor switches between library, canvas and inspector', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only editing layout');
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
  await tabs.getByRole('button', { name: '节点' }).click();
  await expect(page.getByLabel('节点库')).toBeVisible();
  await tabs.getByRole('button', { name: '画布' }).click();
  await expect(page.getByLabel('节点编辑画布')).toBeVisible();
  await page.locator('.be-node').first().click();
  await tabs.getByRole('button', { name: '参数' }).click();
  await expect(page.getByLabel('节点检查器')).toBeVisible();
});
