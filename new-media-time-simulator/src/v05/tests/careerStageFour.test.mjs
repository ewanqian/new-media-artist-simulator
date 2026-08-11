import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCareerStageFourCommand, careerStageFourProgress, careerStageFourScene } from '../careerStageFour.ts';

function matureSave() {
  return {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 8,
    attention: 6, attentionMax: 6, cash: 3600,
    completedCardIds: ['studio-minimum-system'], visitedPlaceIds: ['place-basic-studio', 'place-blackbox'],
    discoveredContactIds: ['contact-lin', 'contact-li-tech', 'contact-m', 'contact-qiao', 'contact-chen', 'contact-dai'],
    contactThreads: {}, pendingReplies: [], receivedFeedbackCount: 1,
    evidenceIds: [
      'career:stage-1:complete', 'career:stage-2:complete', 'career:stage-3:complete',
      'stage2:ep6:version:rollback', 'stage2:ep6:recovery:evidence', 'stage3:ep8:result:shortlist',
      'stage3:ep9:misread:evidence-response'
    ],
    contextActionIds: ['place-blackbox:run:2'], revealedIssueIds: ['issue-context-friction'], resolvedIssueIds: ['issue-context-friction'],
    methodIds: [
      'method-evidence-led-recovery', 'method-recovery-rehearsal', 'method-scope-boundary', 'method-brief-verification',
      'method-one-page-project', 'method-interface-handoff', 'method-version-lock', 'method-source-evidence-response'
    ],
    readKnowledgeEntryIds: [], seenEventIds: ['evt-scope-plus-one', 'evt-final-final-v7', 'evt-social-misread'],
    primaryProject: { name: '最小反馈系统', question: '一个输入改变一个规则以后，观看关系会发生什么？', methods: ['实时图形', '反馈', '规则'] },
    projectMetrics: { coherence: 4, stability: 4, siteFit: 3, documentation: 4 },
    workbench: { capture: 1, compute: 1, output: 1, storage: 1 }, scopeAdapted: true, publicOutputCount: 1,
    actionLog: [], careerStageId: 'stage-3', careerEpisodeId: 'ep-09-how-they-describe-you',
    careerKnownFor: ['现场出了问题以后，能把系统带回来', '会把责任、Scope 和“不包含什么”说清楚', '能把复杂项目压成一页可传递版本']
  };
}

const run = (save, command) => applyCareerStageFourCommand(save, command).save;

test('method stage starts from existing failures and keeps network identity intact', () => {
  const before = matureSave();
  const next = run(before, 'story:stage4:enter');
  assert.equal(next.careerStageId, 'stage-4');
  assert.equal(next.careerEpisodeId, 'ep-10-failure-is-material');
  assert.deepEqual(next.careerKnownFor, before.careerKnownFor);
  assert.deepEqual(next.primaryProject, before.primaryProject);
  assert.ok(next.discoveredContactIds.includes('contact-m'));
  assert.ok(next.contactThreads['contact-m'].some((entry) => /最像废料/.test(entry.text)));
  assert.equal(careerStageFourScene(next).id, 'stage4-salvage-source');
});

test('salvage keeps source lineage and can become method fragment or archive without inventory scores', () => {
  let base = run(matureSave(), 'story:stage4:enter');
  base = run(base, 'story:stage4:source-recovery');
  const asMethod = run(base, 'story:stage4:salvage-method');
  assert.ok(asMethod.methodIds.includes('method-salvaged-recovery'));
  assert.equal(asMethod.salvagedAssets[0].source, 'recovery');
  assert.equal(asMethod.salvagedAssets[0].kind, 'method');
  assert.ok(asMethod.seenEventIds.includes('evt-project-salvage'));

  let archiveBase = run(matureSave(), 'story:stage4:enter');
  archiveBase = run(archiveBase, 'story:stage4:source-live-branch');
  const archived = run(archiveBase, 'story:stage4:salvage-archive');
  assert.ok(archived.evidenceIds.includes('stage4:ep10:salvage:archive'));
  assert.equal(Array.isArray(archived.salvagedAssets) ? archived.salvagedAssets.length : 0, 0);
  assert.equal('inventory' in archived, false);
  assert.equal('rarity' in archived, false);
});

test('remix branch records parent mutation and an internal test token instead of a generic version level', () => {
  let save = run(matureSave(), 'story:stage4:enter');
  save = run(save, 'story:stage4:source-recovery');
  save = run(save, 'story:stage4:salvage-method');
  save = run(save, 'story:stage4:parent-recovery');
  save = run(save, 'story:stage4:mutate-failure');
  save = run(save, 'story:stage4:remix-test-archive');
  assert.ok(save.evidenceIds.includes('stage4:ep11:complete'));
  assert.equal(save.careerRemixBranches.length, 1);
  assert.deepEqual(
    { parent: save.careerRemixBranches[0].parent, mutation: save.careerRemixBranches[0].mutation, test: save.careerRemixBranches[0].test },
    { parent: 'field-recovery', mutation: 'failure-as-trigger', test: 'remix-test-archive' }
  );
  assert.ok(save.methodIds.includes('method-explicit-project-lineage'));
  assert.equal('versionLevel' in save.careerRemixBranches[0], false);
});

test('full method arc exposes a hidden prerequisite and generates a compact career method set', () => {
  let save = run(matureSave(), 'story:stage4:enter');
  save = run(save, 'story:stage4:source-recovery');
  save = run(save, 'story:stage4:salvage-method');
  assert.equal(careerStageFourProgress(save).quests[0].done, true);

  save = run(save, 'story:stage4:parent-recovery');
  save = run(save, 'story:stage4:mutate-failure');
  save = run(save, 'story:stage4:remix-test-archive');
  assert.equal(careerStageFourProgress(save).quests[1].done, true);

  const teachScene = careerStageFourScene(save);
  assert.equal(teachScene.id, 'stage4-teach-pick');
  assert.ok(teachScene.choices.some((choice) => choice.id === 'story:stage4:teach-recovery'));
  assert.ok(teachScene.choices.some((choice) => choice.id === 'story:stage4:teach-scope'));

  save = run(save, 'story:stage4:teach-recovery');
  save = run(save, 'story:stage4:teach-prereq');
  const progress = careerStageFourProgress(save);
  assert.equal(progress.complete, true);
  assert.ok(save.evidenceIds.includes('career:stage-4:complete'));
  assert.ok(save.methodIds.includes('method-document-prerequisites'));
  assert.ok(save.careerMethodSet);
  assert.equal(save.careerMethodSet.title, '从现场回来以后');
  assert.ok(save.careerMethodSet.methods.length >= 3);
  assert.equal(careerStageFourScene(save).id, 'stage4-complete');
  assert.equal('level' in save, false);
  assert.equal('skillPoints' in save, false);
});

test('negative cash does not block a zero-cash method action', () => {
  let save = run(matureSave(), 'story:stage4:enter');
  save = { ...save, cash: -1200, attention: 6 };
  const beforeCash = save.cash;
  const next = run(save, 'story:stage4:source-recovery');
  assert.ok(next.evidenceIds.includes('stage4:ep10:source:recovery'));
  assert.equal(next.attention, 5);
  assert.equal(next.cash, beforeCash);
});
