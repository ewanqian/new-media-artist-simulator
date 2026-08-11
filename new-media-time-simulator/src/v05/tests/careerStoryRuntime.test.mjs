import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCareerStoryCommand } from '../careerStoryRuntime.ts';
import { careerStageOneScene } from '../careerStageOne.ts';
import { openingQuestProgress } from '../questRuntime.ts';

function startSave() {
  return {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 1,
    attention: 6, attentionMax: 6, cash: 3200,
    completedCardIds: [], visitedPlaceIds: [], discoveredContactIds: ['contact-lin'],
    contactThreads: {}, pendingReplies: [], receivedFeedbackCount: 0, evidenceIds: [], contextActionIds: [],
    revealedIssueIds: [], resolvedIssueIds: [], methodIds: [], readKnowledgeEntryIds: [],
    primaryProject: null, projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 },
    workbench: { capture: 1, compute: 1, output: 1, storage: 1 }, scopeAdapted: false, publicOutputCount: 0,
    actionLog: [], careerStageId: 'stage-1', careerEpisodeId: 'ep-01-runnable'
  };
}

function run(save, commandId) { return applyCareerStoryCommand(save, commandId).save; }

test('pure-story path completes the same five opening quests without node editor', () => {
  let save = startSave();
  assert.equal(careerStageOneScene(save, 'story').id, 'scene-first-run');

  save = run(save, 'story:prototype:minimal');
  assert.equal(openingQuestProgress(save).quests[0].done, true);
  assert.equal(careerStageOneScene(save, 'story').id, 'scene-leave-desk');

  save = run(save, 'story:context:studio');
  assert.equal(openingQuestProgress(save).quests[1].done, true);
  assert.ok(save.revealedIssueIds.includes('issue-context-friction'));

  save = run(save, 'story:witness:lin');
  assert.equal(save.pendingReplies.length, 1);
  assert.equal(careerStageOneScene(save, 'story').id, 'scene-wait-reply');

  save = run(save, 'story:time:wait');
  assert.equal(save.week, 2);
  assert.equal(save.receivedFeedbackCount, 1);
  assert.equal(openingQuestProgress(save).quests[2].done, true);

  save = run(save, 'story:diagnose:trace');
  assert.equal(openingQuestProgress(save).quests[3].done, true);
  assert.ok(save.methodIds.includes('method-diagnose-from-evidence'));

  save = run(save, 'story:public:blackbox-minimal');
  const progress = openingQuestProgress(save);
  assert.equal(progress.complete, true);
  assert.ok(save.evidenceIds.includes('career:stage-1:complete'));
  assert.equal(careerStageOneScene(save, 'story').id, 'stage1-complete');
});

test('archive-first story path can still force a real field failure before diagnosis', () => {
  let save = startSave();
  save = run(save, 'story:prototype:archive');
  save = run(save, 'story:context:archive');
  save = run(save, 'story:witness:m');
  save = run(save, 'story:time:wait');
  assert.equal(openingQuestProgress(save).quests[2].done, true);
  assert.equal(openingQuestProgress(save).quests[3].objectives[0].done, false);
  assert.equal(careerStageOneScene(save, 'story').id, 'scene-force-failure');

  save = run(save, 'story:test:blackbox');
  assert.ok(save.revealedIssueIds.length > 0);
  save = run(save, 'story:diagnose:degrade');
  assert.equal(save.scopeAdapted, true);
  assert.equal(openingQuestProgress(save).quests[3].done, true);
});

test('diagnostic approaches leave different durable state', () => {
  let base = startSave();
  base = run(base, 'story:prototype:minimal');
  base = run(base, 'story:context:studio');

  const traced = run(base, 'story:diagnose:trace');
  const bypassed = run(base, 'story:diagnose:bypass');
  const degraded = run(base, 'story:diagnose:degrade');

  assert.ok(traced.methodIds.includes('method-diagnose-from-evidence'));
  assert.ok(bypassed.methodIds.includes('method-temporary-bypass'));
  assert.ok(bypassed.revealedIssueIds.includes('issue-temporary-bypass-debt'));
  assert.equal(degraded.scopeAdapted, true);
  assert.ok(degraded.methodIds.includes('method-degrade-output'));
});
