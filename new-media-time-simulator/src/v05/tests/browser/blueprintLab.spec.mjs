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
    await page.getByRole('button', { name: /节点 Shift A/ }).click();
  } else {
    await page.keyboard.press('Shift+A');
  }
  await expect(page.locator('.be-palette')).toBeVisible();
}

test('v05 home exposes practice free and blueprint modes', async ({ page }) => {
  await page.goto('/?core=v05&mode=home', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '新媒体艺术家模拟器' })).toBeVisible();
  await expect(page.getByRole('link', { name: /实践模式/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /自由模式/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /节点编辑器/ })).toBeVisible();
});

test('editor opens a production graph and nodes really drag', async ({ page }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('新媒体艺术家节点编辑器', { exact: true })).toBeVisible();
  await expect(page.locator('.be-node')).toHaveCount(11);

  const node = page.locator('.be-node[data-node-id="p2"]');
  const before = await node.boundingBox();
  expect(before).toBeTruthy();
  await node.dragTo(page.locator('.be-world'), { targetPosition: { x: 700, y: 600 } });
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

test('LED parameters and Notes are editable and autosave survives reload', async ({ page, isMobile }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await tabs.getByRole('button', { name: '节点' }).click();
    await page.getByLabel('节点库').getByRole('button', { name: /LED 屏/ }).click();
    await tabs.getByRole('button', { name: '画布' }).click();
    const node = page.locator('.be-node').last();
    await node.scrollIntoViewIfNeeded();
    await node.click();
    await tabs.getByRole('button', { name: '参数' }).click();
  } else {
    await page.locator('.be-node[data-node-id="p5"]').click();
  }

  const widthControl = page.locator('.be-param').filter({ hasText: '宽度' }).locator('input[type="range"]');
  await widthControl.fill('10');
  await page.locator('.be-note textarea').fill('现场要求：屏宽改成 10m，必须预留备份信号。');
  await page.getByLabel('蓝图名称').fill('测试 / LED 现场版本');

  const beforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-blueprint-editor-autosave-v2') || '{}'));
  expect(beforeReload.title).toBe('测试 / LED 现场版本');
  const led = beforeReload.nodes.find((item) => item.definitionId === 'prod-led-wall' && Number(item.params?.widthM) === 10);
  expect(led).toBeTruthy();
  expect(led.params._note).toMatch(/屏宽改成 10m/);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('蓝图名称')).toHaveValue('测试 / LED 现场版本');
});

test('save, save-as, export and share code are real persistence actions', async ({ page }) => {
  await openEditor(page);
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /^保存/ }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-blueprint-library-v2') || '[]'));
  expect(saved.length).toBe(1);

  await page.getByRole('button', { name: '另存为' }).click();
  const dialog = page.locator('.be-dialog').filter({ hasText: '另存为新蓝图' });
  await dialog.getByRole('textbox').fill('展览版 / Remix');
  await dialog.getByRole('button', { name: '另存为', exact: true }).click();
  await expect(page.getByLabel('蓝图名称')).toHaveValue('展览版 / Remix');
  const library = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-blueprint-library-v2') || '[]'));
  expect(library.length).toBe(2);
  expect(library[1].parentBlueprintId).toBeTruthy();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.nmas\.json$/);

  await page.getByRole('button', { name: '分享' }).click();
  const shareDialog = page.locator('.be-share');
  const code = await shareDialog.getByLabel('图纸码').inputValue();
  expect(code.startsWith('NMAS-BP1-')).toBe(true);
});

test('free mode starts blank and mobile switches library canvas inspector', async ({ page, isMobile }) => {
  await openEditor(page, '&mode=free&blank=1');
  await clearEditorStorage(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.be-node')).toHaveCount(0);
  await expect(page.getByText(/Shift\+A 或 Space 新建节点/)).toBeVisible();

  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: '手机编辑视图' });
    await expect(tabs).toBeVisible();
    await tabs.getByRole('button', { name: '节点' }).click();
    await expect(page.getByLabel('节点库')).toBeVisible();
    await page.getByLabel('节点库').getByRole('button', { name: /LED 屏/ }).click();
    await tabs.getByRole('button', { name: '画布' }).click();
    await expect(page.locator('.be-node')).toHaveCount(1);
    await page.locator('.be-node').click();
    await tabs.getByRole('button', { name: '参数' }).click();
    await expect(page.getByLabel('节点检查器')).toBeVisible();
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
