import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCareerStageFiveCommand, careerStageFiveProgress, careerStageFiveScene } from '../careerStageFive.ts';

function matureSave() {
  return {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 11,
    attention: 6, attentionMax: 6, cash: 4200,
    completedCardIds: ['studio-minimum-system'],
    visitedPlaceIds: ['place-basic-studio', 'place-blackbox', 'place-project-space'],
    discoveredContactIds: ['contact-lin', 'contact-li-tech', 'contact-m', 'contact-qiao', 'contact-chen', 'contact-dai'],
    contactThreads: {
      'contact-lin': [{ from: 'them', text: '先发能跑版本。' }],
      'contact-li-tech': [{ from: 'them', text: '先给分辨率、刷新率、接口和备份。' }],
      'contact-m': [{ from: 'them', text: '别只拍最终效果。' }],
      'contact-qiao': [{ from: 'them', text: 'Scope 先拆开。' }],
      'contact-chen': [{ from: 'them', text: '先发一页版本。' }],
      'contact-dai': [{ from: 'them', text: '尺寸重量先发。' }]
    },
    pendingReplies: [], receivedFeedbackCount: 1,
    evidenceIds: [
      'career:stage-1:complete', 'career:stage-2:complete', 'career:stage-3:complete', 'career:stage-4:complete',
      'stage2:ep6:version:rollback', 'stage2:ep6:recovery:evidence', 'stage3:ep8:result:shortlist',
      'stage3:ep9:misread:evidence-response', 'stage4:ep10:salvage:method', 'stage4:ep11:test:archive',
      'stage4:ep12:assumption:prerequisite'
    ],
    contextActionIds: ['place-blackbox:run:2'],
    revealedIssueIds: ['issue-context-friction', 'issue-live-hotfix-debt'], resolvedIssueIds: ['issue-context-friction'],
    methodIds: [
      'method-evidence-led-recovery', 'method-scope-boundary', 'method-one-page-project', 'method-interface-handoff',
      'method-explicit-project-lineage', 'method-document-prerequisites'
    ],
    seenEventIds: ['evt-scope-plus-one', 'evt-final-final-v7', 'evt-social-misread', 'evt-project-salvage'],
    primaryProject: { name: '最小反馈系统', question: '一个输入改变一个规则以后，观看关系会发生什么？', methods: ['实时图形', '反馈', '规则'] },
    projectMetrics: { coherence: 4, stability: 4, siteFit: 4, documentation: 4 },
    workbench: { capture: 1, compute: 1, output: 1, storage: 1 }, scopeAdapted: true, publicOutputCount: 1,
    actionLog: [], careerStageId: 'stage-4', careerEpisodeId: 'ep-12-teach-a-method',
    careerKnownFor: ['现场出了问题以后，能把系统带回来', '会把责任、Scope 和“不包含什么”说清楚'],
    careerMethodSet: { id: 'method-set-11', title: '从现场回来以后', methods: ['method-evidence-led-recovery', 'method-scope-boundary', 'method-one-page-project', 'method-document-prerequisites'] },
    salvagedAssets: [{ id: 'salvage-9-method', source: 'recovery', kind: 'method', lineage: true }],
    careerRemixBranches: [{ id: 'career-branch-10-1', parent: 'field-recovery', mutation: 'failure-as-trigger', test: 'remix-test-archive', createdWeek: 10 }]
  };
}

const run = (save, command) => applyCareerStageFiveCommand(save, command).save;

test('infrastructure stage begins as a maintenance responsibility, not a management metagame', () => {
  const before = matureSave();
  const next = run(before, 'story:stage5:enter');
  assert.equal(next.careerStageId, 'stage-5');
  assert.equal(next.careerEpisodeId, 'ep-13-28sqm');
  assert.deepEqual(next.careerMethodSet, before.careerMethodSet);
  assert.deepEqual(next.careerKnownFor, before.careerKnownFor);
  assert.ok(next.seenEventIds.includes('evt-28sqm-offer'));
  assert.ok(next.contactThreads['contact-chen'].some((entry) => /28㎡/.test(entry.text)));
  assert.equal(careerStageFiveScene(next).id, 'stage5-space-offer');
  assert.equal('institutionLevel' in next, false);
});

test('declining permanent space responsibility still creates a valid infrastructure path', () => {
  let save = run(matureSave(), 'story:stage5:enter');
  save = run(save, 'story:stage5:mode-popup');
  save = run(save, 'story:stage5:purpose-archive');
  save = run(save, 'story:stage5:minimum-booking');
  assert.equal(careerStageFiveProgress(save).quests[0].done, true);
  assert.equal(save.careerInfrastructure.mode, 'pop-up');
  assert.equal(save.careerInfrastructure.purpose, 'archive-repair');
  assert.deepEqual(save.careerInfrastructure.conditions, ['booking', 'cost', 'owner', 'reset-rule']);
  assert.equal(save.careerInfrastructure.monthlyCost, 0);
});

test('key-person absence validates shared handoff rather than affection or team score', () => {
  let save = run(matureSave(), 'story:stage5:enter');
  save = run(save, 'story:stage5:mode-shared');
  save = run(save, 'story:stage5:purpose-test');
  save = run(save, 'story:stage5:minimum-access');
  save = run(save, 'story:stage5:roles-four');
  assert.equal(careerStageFiveScene(save).id, 'stage5-team-absence');
  save = run(save, 'story:stage5:absence-runbook');
  save = run(save, 'story:stage5:handoff-runbook');
  assert.equal(careerStageFiveProgress(save).quests[1].done, true);
  assert.ok(save.methodIds.includes('method-absence-tested-runbook'));
  assert.ok(save.methodIds.includes('method-infrastructure-runbook'));
  assert.deepEqual(save.careerInfrastructure.handoff, ['power-on', 'test', 'recover', 'reset']);
  assert.equal('teamAffection' in save, false);
  assert.equal('teamLevel' in save, false);
});

test('final career archive contains six records categories and normalizes remix lineage for long-term use', () => {
  let save = run(matureSave(), 'story:stage5:enter');
  save = run(save, 'story:stage5:mode-popup');
  save = run(save, 'story:stage5:purpose-archive');
  save = run(save, 'story:stage5:minimum-booking');
  save = run(save, 'story:stage5:roles-four');
  save = run(save, 'story:stage5:absence-runbook');
  save = run(save, 'story:stage5:handoff-state');
  save = run(save, 'story:stage5:lens-method');
  save = run(save, 'story:stage5:continue-collective');

  const progress = careerStageFiveProgress(save);
  assert.equal(progress.complete, true);
  assert.ok(save.evidenceIds.includes('career:stage-5:complete'));
  assert.equal(save.continuationStructure, '小型协作体 + 共享基础设施');
  assert.ok(save.careerArchive);
  assert.equal(save.careerArchive.schema, 'nmas-career-archive-v1');
  assert.deepEqual(Object.keys(save.careerArchive.categories).sort(), ['ecology', 'media', 'methods', 'people', 'places', 'projects']);
  assert.equal(save.careerArchive.categories.projects[0].lineage[0].test, 'archive');
  assert.equal(save.careerArchive.categories.projects[0].lineage[0].parent, 'field-recovery');
  assert.ok(save.careerArchive.categories.people.length >= 6);
  assert.ok(save.careerArchive.categories.methods.length >= 6);
  assert.ok(save.careerArchive.evidenceCount > 10);
  assert.ok(save.careerArchive.summary.stages.every((stage) => stage.complete));
  assert.equal(careerStageFiveScene(save).id, 'career-complete');
  assert.equal('classId' in save, false);
  assert.equal('fame' in save, false);
  assert.equal('level' in save, false);
});
