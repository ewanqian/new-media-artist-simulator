import { test, expect } from '@playwright/test';

function seededProfile() {
  return {
    schema: 'nmas-career-profile-v1',
    id: 'automation-test-profile',
    title: '自动化测试档案',
    description: 'test',
    signalTags: ['systems'],
    resourcePackId: 'pack-desk',
    knownNpcIds: ['contact-lin'],
    firstProjectPrompt: '先让一个东西运行。',
    workMode: 'hybrid',
    createdAt: '2026-08-11T00:00:00.000Z',
    source: 'preset'
  };
}

function seededSave() {
  return {
    schema: 'triad-field-workbench-records-20260811',
    screen: 'play',
    careerProfileId: 'automation-test-profile',
    careerStageId: 'stage-1',
    careerEpisodeId: 'ep-02-first-witness',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    primaryLayer: 'workbench',
    fieldTab: 'places',
    workbenchTab: 'actions',
    recordsTab: 'quests',
    currentPlaceId: 'place-basic-studio',
    completedCardIds: ['studio-minimum-system'],
    visitedPlaceIds: ['place-basic-studio'],
    discoveredContactIds: ['contact-lin'],
    contactThreads: { 'contact-lin': [{ from: 'system', text: '你们在工作室认识。' }, { from: 'them', text: '要测就把能跑的版本带来。' }] },
    pendingReplies: [],
    receivedFeedbackCount: 0,
    evidenceIds: ['build:1:1'],
    contextActionIds: ['place-basic-studio:run:1'],
    revealedIssueIds: [],
    resolvedIssueIds: [],
    methodIds: [],
    readKnowledgeEntryIds: [],
    primaryProject: { name: '最小反馈系统', question: '一个输入改变规则以后会发生什么？', methods: ['实时图形'] },
    projectMetrics: { coherence: 2, stability: 2, siteFit: 0, documentation: 0 },
    workbench: { compute: 1, output: 1, capture: 1, storage: 1 },
    scopeAdapted: false,
    publicOutputCount: 0,
    seenEventIds: [],
    activeEventId: null,
    actionLog: []
  };
}

test('auto-run visibly navigates to a peer, sends a real request, then returns to Records', async ({ page }) => {
  await page.goto('/?core=v05', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ profile, save }) => {
    localStorage.setItem('nmas-v05-career-profile', JSON.stringify(profile));
    localStorage.setItem('nmas-v05-world-hub-preview', JSON.stringify(save));
    localStorage.setItem(`nmas-career-intro-seen:${profile.id}`, '1');
  }, { profile: seededProfile(), save: seededSave() });
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByRole('button', { name: '打开自动化操作' })).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: '打开自动化操作' }).click();
  const panel = page.getByRole('dialog', { name: '自动化操作' });
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: /让同行看一下当前版本/ }).click();

  await expect(panel.getByText('这段自动流程完成。不可逆选择、现金支出和承诺仍然留给你。')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.tri-primary-nav button.active')).toContainText('记录');
  await expect(page.locator('.tri-subnav button.active')).toContainText('档案');

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(state.attention).toBe(5);
  expect(state.pendingReplies).toHaveLength(1);
  expect(state.pendingReplies[0].contactId).toBe('contact-lin');
  expect(state.contactThreads['contact-lin'].at(-1).from).toBe('you');
});

test('auto-run panel keeps explicit contrast on white cards and dark system bubble', async ({ page }) => {
  await page.goto('/?core=v05', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ profile, save }) => {
    localStorage.setItem('nmas-v05-career-profile', JSON.stringify(profile));
    localStorage.setItem('nmas-v05-world-hub-preview', JSON.stringify(save));
    localStorage.setItem(`nmas-career-intro-seen:${profile.id}`, '1');
  }, { profile: seededProfile(), save: seededSave() });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '打开自动化操作' }).click();

  const heading = page.getByRole('dialog', { name: '自动化操作' }).getByRole('heading', { name: '自动化操作' });
  const headingColors = await heading.evaluate((node) => ({ color: getComputedStyle(node).color, background: getComputedStyle(node.parentElement.parentElement).backgroundColor }));
  expect(headingColors.color).not.toBe('rgb(255, 255, 255)');
  expect(headingColors.background).toBe('rgb(255, 255, 255)');
});
