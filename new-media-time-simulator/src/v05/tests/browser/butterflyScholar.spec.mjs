import { test, expect } from '@playwright/test';

const STATE_KEY = 'nmas-special-costarica-narrative-v1';

async function clearRoute(page) {
  await page.evaluate(() => {
    for (const key of [
      'nmas-special-butterfly-narrative-v1', 'nmas-special-butterfly-world-v1',
      'nmas-special-butterfly-narrative-v2', 'nmas-special-butterfly-world-v2',
      'nmas-special-costarica-narrative-v1', 'nmas-special-costarica-world-v1',
      'nmas-blueprint-editor-autosave-v2',
      'nmas-butterfly-training-complete-v1', 'nmas-butterfly-training-complete-v2',
      'nmas-butterfly-training-complete-v3', 'nmas-butterfly-training-complete-v4',
      'nmas-costarica-training-complete-v1'
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

test('Costa Rica chapter covers invitation, route state, knowledge, assets, consequences and work-graph handoff', async ({ page, isMobile }) => {
  test.setTimeout(45000);
  await page.goto('/?core=v05', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('link', { name: /生涯 \/ 章节/ }).click();
  await expect(page.getByRole('heading', { name: '选择游玩内容' })).toBeVisible();
  const costaRicaChapter = page.getByRole('link', { name: /哥斯达黎加/ });
  await expect(costaRicaChapter).toContainText('知识 → 节点 → Assets');
  await costaRicaChapter.click();
  await page.waitForURL(/core=v05.*mode=costarica|mode=costarica/);

  await expect(page.locator('.bs-topbar')).toContainText('SPECIAL 01 · COSTA RICA');
  await expect(page.locator('.bs-topbar')).toContainText('哥斯达黎加');
  await expect(page.getByLabel('哥斯达黎加任务进度')).toContainText('等待确认是否出发');
  await expect(page.getByRole('button', { name: '进入场景' })).toBeVisible();
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('蝴蝶一直在动');
  const firstChoice = page.getByRole('button', { name: /接。先写下一个问题再出发/ });
  await advanceUntil(page, firstChoice);
  await expect(firstChoice).toContainText('项目方向');
  await firstChoice.click();
  await dismissFeedback(page);
  await expect(page.getByLabel('哥斯达黎加任务进度')).toContainText('哥斯达黎加驻地行程已建立');
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('哥斯达黎加往返电子行程单');

  const inesIntro = page.getByText(/我是 Inés。这周交通、样地、植物档案和数据许可都找我/);
  await advanceUntil(page, inesIntro);
  await expect(inesIntro).toBeVisible();

  await seedNode(page, 'bs-03-field');
  const fieldNote = page.getByRole('button', { name: /小操作：记下这 1.8 秒/ });
  await advanceUntil(page, fieldNote);
  await fieldNote.click();
  await dismissFeedback(page);
  await expect(page.getByRole('button', { name: /小操作：记下这 1.8 秒/ })).toHaveCount(0);
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('CR-FIELD-1.8S');

  const researchButterfly = page.getByRole('button', { name: /研究：活蝴蝶怎么采集/ });
  await researchButterfly.click();
  const researchDialog = page.getByRole('dialog', { name: /研究：活蝴蝶怎么采集/ });
  await expect(researchDialog).toContainText('活体运动不适合硬做成静态摄影测量对象');
  await expect(researchDialog).toContainText('理解以后可进入工作台');
  await expect(researchDialog).toContainText('节点 · 活体运动记录');
  await researchDialog.getByRole('button', { name: '理解并写入知识库' }).click();
  await dismissFeedback(page);
  await expect(page.getByLabel('临时记忆与已知信息')).toContainText('活蝴蝶怎么采集');

  await seedNode(page, 'bs-04-process', ['field-recapture']);
  await advanceUntil(page, page.getByText('76 / 80 张照片已定位', { exact: true }));
  await expect(page.getByText('CR-SOLVE-01 / 相机求解', { exact: true })).toBeVisible();
  await expect(page.getByText('76 / 80 张照片已定位', { exact: true })).toBeVisible();
  await expect(page.getByText(/补拍起作用了/)).toBeVisible();

  await seedNode(page, 'bs-04-process', ['capture-gap-debt']);
  await advanceUntil(page, page.getByText('61 / 80 张照片已定位', { exact: true }));
  await expect(page.getByText('61 / 80 张照片已定位', { exact: true })).toBeVisible();
  await expect(page.getByText(/白天没补的缺口晚上回来了/)).toBeVisible();

  await seedNode(page, 'bs-04x-failure', ['capture-gap-debt', 'forced-reconstruct-bad-solve']);
  const repairChoice = page.getByRole('button', { name: /保留失败版本，然后回去修相机求解/ });
  await advanceUntil(page, repairChoice);
  await expect(page.getByText('FAIL_01', { exact: true })).toBeVisible();
  await expect(repairChoice).toContainText('失败版本留作 Evidence');
  await expect(page.getByRole('button', { name: /不修干净，把断裂本身带进作品/ })).toContainText('技术脆弱性不会被自动消除');

  await page.goto('/?core=v05&lab=blueprint&preset=costarica', { waitUntil: 'networkidle' });
  await expect(page.locator('input[value="哥斯达黎加 / 三步采集工作图"]')).toBeVisible();
  const hud = page.getByLabel('哥斯达黎加工作图训练');
  await expect(hud).toContainText('任务 1 / 3');
  await expect(hud).toContainText('数据线传递：采集对象');
  await expect(hud).toContainText('步骤线 = 制作顺序');

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

test('desktop Costa Rica work graph uses checkable field state and four readable relationship lines', async ({ page, isMobile }) => {
  test.skip(isMobile, 'port-connection training is locked on desktop in this regression');
  await page.goto('/?core=v05&lab=blueprint&preset=costarica', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.reload({ waitUntil: 'networkidle' });

  const hud = page.getByLabel('哥斯达黎加工作图训练');
  await expect(hud).toContainText('任务 1 / 3');
  await expect(hud).toContainText('采集对象：寄主植物');

  const fieldNode = page.locator('.be-node').filter({ hasText: '现场调查' }).first();
  await fieldNode.click();
  const subjectReady = page.getByRole('checkbox', { name: '采集对象已确认' });
  const conditionsReady = page.getByRole('checkbox', { name: '现场条件已记录' });
  const questionReady = page.getByRole('checkbox', { name: '观察问题已写下' });
  await expect(subjectReady).toBeVisible();
  await expect(conditionsReady).toBeVisible();
  await expect(questionReady).toBeVisible();
  await subjectReady.check();
  await conditionsReady.check();
  await questionReady.check();
  await expect(subjectReady).toBeChecked();
  await expect(conditionsReady).toBeChecked();
  await expect(questionReady).toBeChecked();

  await page.getByLabel('现场调查 输出 采集对象').click();
  await page.getByLabel('摄影测量采集 输入 要扫描的对象').click();
  await expect(hud).toContainText('任务 2 / 3');

  await page.waitForTimeout(80);
  const firstWirePath = page.locator('.be-wire-control .wire').first();
  await firstWirePath.click({ force: true });
  const edgeInspector = page.getByLabel('连线检查器');
  await expect(edgeInspector).toBeVisible();
  await expect(edgeInspector.getByRole('button', { name: '数据线' })).toBeVisible();
  await expect(edgeInspector.getByRole('button', { name: '步骤线' })).toBeVisible();
  await expect(edgeInspector.getByRole('button', { name: '条件线' })).toBeVisible();
  await expect(edgeInspector.getByRole('button', { name: '引用线' })).toBeVisible();
  await expect(edgeInspector).toContainText('连接不是一根万能线');

  await edgeInspector.getByRole('button', { name: '步骤线' }).click();
  await expect(edgeInspector.getByRole('button', { name: '步骤线' })).toHaveClass(/active/);
  const semanticWire = page.getByRole('button', { name: /步骤线 ·/ }).first();
  await semanticWire.evaluate((element) => element.focus());
  await page.keyboard.press('Enter');
  await expect(edgeInspector).toBeVisible();
  await edgeInspector.getByRole('button', { name: '数据线' }).click();

  await page.getByLabel('摄影测量采集 输出 照片序列').click();
  await page.getByLabel('离场前检查 输入 照片 / 扫描').click();
  await expect(hud).toContainText('任务 3 / 3');

  await page.getByLabel('离场前检查 输出 可继续的数据').click();
  await page.getByLabel('Metashape · 相机求解 输入 照片').click();
  await expect(hud).toContainText('三步完成');
  await expect(hud).toContainText(/点云 \/ Gaussian/);
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
