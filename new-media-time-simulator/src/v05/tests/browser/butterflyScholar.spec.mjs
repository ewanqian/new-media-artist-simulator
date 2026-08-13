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
      'nmas-costarica-training-complete-v1', 'nmas-v05.1-run:costa-rica'
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

test('Costa Rica stays inside one understandable situation from invitation through public test', async ({ page }) => {
  test.setTimeout(70000);
  await page.goto('/?core=v05&mode=costarica', { waitUntil: 'networkidle' });
  await clearRoute(page);
  await page.evaluate(() => localStorage.setItem('nmas-v05.1-run', JSON.stringify({ untouched: true })));
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.locator('.bs-topbar')).toContainText('哥斯达黎加 · 一周驻地');
  await expect(page.getByLabel('哥斯达黎加任务进度')).toHaveCount(0);
  await expect(page.getByLabel('临时记忆与已知信息')).toHaveCount(0);
  await expect(page.locator('.narrative-minor-actions')).toHaveCount(0);
  await expect(page.locator('.gf-layer')).toHaveCount(0);
  const firstChoice = page.getByRole('button', { name: /去。先写下自己想弄明白什么/ });
  await advanceUntil(page, firstChoice);
  const opening = await page.locator('body').innerText();
  expect(opening).toContain('看过你去年做的植物网页');
  expect(opening).toContain('住宿和机票他们出');
  expect(opening).not.toContain('Inés');
  expect(opening).not.toContain('Rojas');
  await firstChoice.click();

  const inesIntro = page.getByText(/我叫 Inés，负责这周的交通、场地和资料许可/);
  await advanceUntil(page, inesIntro);
  await expect(inesIntro).toBeVisible();
  const arrivalChoice = page.getByRole('button', { name: /先把明天的工作说清楚/ });
  await advanceUntil(page, arrivalChoice);
  await arrivalChoice.click();

  const route = [
    [/运动和空间分开采/, 'bs-capture-relation'],
    [/先回去，接受这个风险/, 'bs-audit-leave'],
    [/让软件继续算出一个坏版本/, 'bs-align-force'],
    [/把坏版本存下来，再回去修/, 'bs-failure-repair'],
    [/把缺口也给观众看/, 'bs-represent-pointcloud'],
    [/观众靠近时，让它逃开/, 'bs-compose-interactive']
  ];
  for (const [label] of route) {
    const action = page.getByRole('button', { name: label });
    await advanceUntil(page, action);
    await action.click();
  }

  const feedbackChoice = page.getByRole('button', { name: /发十秒录屏到社交平台/ });
  await advanceUntil(page, feedbackChoice);
  await expect(page.getByRole('button', { name: /先不发，直接带去现场试/ })).toBeVisible();
  await feedbackChoice.click();

  const sourceChoice = page.getByRole('button', { name: /把来源和差异写清楚/ });
  await advanceUntil(page, sourceChoice);
  await expect(page.getByText(/几个点赞很快到了/)).toBeVisible();
  await sourceChoice.click();

  const separateRoles = page.getByRole('button', { name: /要求把“协作”和“评估”两个角色拆开/ });
  await advanceUntil(page, separateRoles);
  await expect(page.getByText(/我除了帮你协调，也要替资助方判断/)).toBeVisible();
  await separateRoles.click();

  const finish = page.getByRole('button', { name: /关掉投影。收工/ });
  await advanceUntil(page, finish);
  await finish.click();
  await expect(page.getByText('你带回去的东西')).toBeVisible();
  await expect(page.getByText('现场的人怎么说')).toBeVisible();
  await expect(page.getByText(/节点|Assets|Evidence|Blueprint|KNOWLEDGE|点云|Gaussian|Noise|系统/)).toHaveCount(0);

  const stores = await page.evaluate(() => ({
    main: localStorage.getItem('nmas-v05.1-run'),
    costa: JSON.parse(localStorage.getItem('nmas-v05.1-run:costa-rica') || '{}')
  }));
  expect(stores.main).toBe(JSON.stringify({ untouched: true }));
  expect(stores.costa.chapterId).toBe('costa-rica');
  expect(stores.costa.works[0].status).toBe('public');
  expect(stores.costa.works[0].decisionIds).toHaveLength(12);
  expect(stores.costa.works[0].versions).toHaveLength(1);
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
  await expect(hud).toContainText('第一条采集链已经接通');
  await expect(hud.getByRole('link', { name: /返回章节选择/ })).toBeVisible();
});
