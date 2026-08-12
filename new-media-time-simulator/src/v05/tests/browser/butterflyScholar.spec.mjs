import { test, expect } from '@playwright/test';

const STATE_KEY = 'nmas-special-butterfly-narrative-v2';

async function clearRoute(page) {
  await page.evaluate(() => {
    for (const key of [
      'nmas-special-butterfly-narrative-v1', 'nmas-special-butterfly-world-v1',
      'nmas-special-butterfly-narrative-v2', 'nmas-special-butterfly-world-v2',
      'nmas-blueprint-editor-autosave-v2',
      'nmas-butterfly-training-complete-v1', 'nmas-butterfly-training-complete-v2',
      'nmas-butterfly-training-complete-v3', 'nmas-butterfly-training-complete-v4'
    ]) localStorage.removeItem(key);
  });
}

async function dismissFeedback(page) {
  const layer = page.locator('.gf-layer');
  for (let i = 0; i < 8; i += 1) {
    if (!(await layer.isVisible().catch(() => false))) return;
    await layer.click({ position: { x: 4, y: 4 }, force: true }).catch(() => {});
    await page.waitForTimeout(45);
  }
}

async function advanceUntil(page, target) {
  for (let i = 0; i < 24; i += 1) {
    if (await target.isVisible().catch(() => false)) return;
    const enter = page.getByRole('button', { name: '进入场景', exact: true });
    if (await enter.isVisible().catch(() => false)) { await enter.click(); continue; }
    const next = page.getByRole('button', { name: '继续', exact: true });
    if (await next.isVisible().catch(() => false)) { await next.click(); continue; }
    const early = page.getByRole('button', { name: '提前看选择', exact: true });
    if (await early.isVisible().catch(() => false)) { await early.click(); continue; }
    await page.waitForTimeout(120);
  }
  await expect(target).toBeVisible({ timeout: 3000 });
}

async function seedNode(page, currentNodeId, flags = []) {
  await page.evaluate(([key, nodeId, stateFlags]) => {
    localStorage.setItem(key, JSON.stringify({
      packId: 'narrative-butterfly-scholar-v4',
      currentNodeId: nodeId,
      visitedNodeIds: [],
      flags: stateFlags,
      facts: [],
      memories: [],
      trust: {},
      history: []
    }));
  }, [STATE_KEY, currentNodeId, flags]);
  await page.reload({ waitUntil: 'networkidle' });
}

test('Butterfly Scholar browser smoke covers briefing, first meeting, research memory, visible consequences and Blueprint handoff', async ({ page, isMobile }) => {
  test.setTimeout(45000);
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  await page.getByRole('link', { name: /哥斯达黎加的蝴蝶学者/ }).click();
  await page.waitForURL(/core=v05.*mode=butterfly|mode=butterfly/);

  await expect(page.getByRole('button', { name: '进入场景' })).toBeVisible();
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('蝴蝶一直在动');
  const firstChoice = page.getByRole('button', { name: /接。先写下一个问题再出发/ });
  await advanceUntil(page, firstChoice);
  await expect(firstChoice).toContainText('影响：项目方向');
  await firstChoice.click();
  await dismissFeedback(page);

  const inesIntro = page.getByText(/我是 Inés。这周交通、样地、植物档案和数据许可都找我/);
  await advanceUntil(page, inesIntro);
  await expect(inesIntro).toBeVisible();

  await seedNode(page, 'bs-03-field');
  const fieldNote = page.getByRole('button', { name: /小操作：记下这 1.8 秒/ });
  await advanceUntil(page, fieldNote);
  await fieldNote.click();
  await dismissFeedback(page);
  await expect(page.getByRole('button', { name: /小操作：记下这 1.8 秒/ })).toHaveCount(0);

  const researchButterfly = page.getByRole('button', { name: /研究：活蝴蝶怎么采集/ });
  await researchButterfly.click();
  const butterflyDialog = page.getByRole('dialog', { name: /研究：活蝴蝶怎么采集/ });
  await expect(butterflyDialog).toContainText('活体运动不适合硬做成静态摄影测量对象');
  await expect(butterflyDialog).toContainText('时间里的行为');
  await butterflyDialog.getByRole('button', { name: '记住这个方法' }).click();
  await dismissFeedback(page);
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('活蝴蝶怎么采集');

  await seedNode(page, 'bs-04-process', ['field-recapture']);
  await advanceUntil(page, page.getByText('76 / 80 张照片已定位', { exact: true }));
  await expect(page.getByText('76 / 80 张照片已定位', { exact: true })).toBeVisible();
  await expect(page.getByText(/补拍起作用了/)).toBeVisible();
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('缺口已在现场补拍');

  await seedNode(page, 'bs-04-process', ['capture-gap-debt']);
  await advanceUntil(page, page.getByText('61 / 80 张照片已定位', { exact: true }));
  await expect(page.getByText('61 / 80 张照片已定位', { exact: true })).toBeVisible();
  await expect(page.getByText(/白天没补的缺口晚上回来了/)).toBeVisible();
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('已知缺口带回工作室');

  await seedNode(page, 'bs-04x-failure', ['capture-gap-debt', 'forced-reconstruct-bad-solve']);
  const repairChoice = page.getByRole('button', { name: /保留失败版本，然后回去修相机求解/ });
  await advanceUntil(page, repairChoice);
  await expect(page.getByText('FAIL_01', { exact: true })).toBeVisible();
  await expect(repairChoice).toContainText('失败版本留作 Evidence');
  await expect(page.getByRole('button', { name: /不修干净，把断裂本身带进作品/ })).toContainText('技术脆弱性不会被自动消除');

  await page.goto('/?core=v05&lab=blueprint&preset=butterfly', { waitUntil: 'networkidle' });
  await expect(page.locator('input[value="哥斯达黎加的蝴蝶学者 / 三步采集训练"]')).toBeVisible();
  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('任务 1 / 3');
  await expect(hud).toContainText('这条线传递：采集对象');
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

test('desktop Butterfly lesson completes three real graph connections and explains each data type', async ({ page, isMobile }) => {
  test.skip(isMobile, 'port-connection training is locked on desktop in this regression');
  await page.goto('/?core=v05&lab=blueprint&preset=butterfly', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  const hud = page.getByLabel('蝴蝶学者训练任务');
  await expect(hud).toContainText('任务 1 / 3');
  await expect(hud).toContainText('采集对象：寄主植物');

  await page.getByLabel('现场调查 输出 采集对象').click();
  await page.getByLabel('摄影测量采集 输入 要扫描的对象').click();
  await expect(hud).toContainText('任务 2 / 3');
  await expect(hud).toContainText('照片序列');

  await page.getByLabel('摄影测量采集 输出 照片序列').click();
  await page.getByLabel('离场前检查 输入 照片 / 扫描').click();
  await expect(hud).toContainText('任务 3 / 3');
  await expect(hud).toContainText('可用照片');

  await page.getByLabel('离场前检查 输出 可继续的数据').click();
  await page.getByLabel('Metashape · 相机求解 输入 照片').click();
  await expect(hud).toContainText('三步完成');
  await expect(hud).toContainText(/点云 \/ Gaussian/);
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
