import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCareerStoryCommand } from '../careerStoryRuntime.ts';
import { applyCareerStageTwoCommand, careerStageTwoProgress, careerStageTwoScene, stageTwoSetupEventId } from '../careerStageTwo.ts';

function startSave() {
  return {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 1,
    attention: 6, attentionMax: 6, cash: 3200,
    completedCardIds: [], visitedPlaceIds: [], discoveredContactIds: ['contact-lin'],
    contactThreads: {}, pendingReplies: [], receivedFeedbackCount: 0, evidenceIds: [], contextActionIds: [],
    revealedIssueIds: [], resolvedIssueIds: [], methodIds: [], readKnowledgeEntryIds: [], seenEventIds: [],
    primaryProject: null, projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 },
    workbench: { capture: 1, compute: 1, output: 1, storage: 1 }, scopeAdapted: false, publicOutputCount: 0,
    actionLog: [], careerStageId: 'stage-1', careerEpisodeId: 'ep-01-runnable'
  };
}

function stage1(save, command) { return applyCareerStoryCommand(save, command).save; }
function stage2(save, command) { return applyCareerStageTwoCommand(save, command).save; }

function finishStageOne() {
  let save = startSave();
  save = stage1(save, 'story:prototype:minimal');
  save = stage1(save, 'story:context:studio');
  save = stage1(save, 'story:witness:lin');
  save = stage1(save, 'story:time:wait');
  save = stage1(save, 'story:diagnose:trace');
  save = stage1(save, 'story:public:blackbox-minimal');
  assert.ok(save.evidenceIds.includes('career:stage-1:complete'));
  return save;
}

test('stage two enters from the completed opening line without resetting project history', () => {
  const before = finishStageOne();
  const project = before.primaryProject;
  const evidenceCount = before.evidenceIds.length;
  const next = stage2(before, 'story:stage2:enter');
  assert.equal(next.careerStageId, 'stage-2');
  assert.equal(next.careerEpisodeId, 'ep-04-two-hours');
  assert.equal(next.week, before.week + 1);
  assert.equal(next.attention, next.attentionMax);
  assert.deepEqual(next.primaryProject, project);
  assert.ok(next.evidenceIds.length > evidenceCount);
  assert.ok(next.discoveredContactIds.includes('contact-li-tech'));
  assert.ok(next.seenEventIds.includes('evt-two-hour-gap'));
  assert.equal(careerStageTwoScene(next).id, 'stage2-two-hour-goal');
});

test('full field arc completes all three stage-two episodes through shared evidence methods people and threads', () => {
  let save = stage2(finishStageOne(), 'story:stage2:enter');

  save = stage2(save, 'story:stage2:goal-recovery');
  save = stage2(save, 'story:stage2:kit-minimal');
  save = stage2(save, 'story:stage2:run-baseline');
  assert.equal(careerStageTwoProgress(save).quests[0].done, true);
  assert.equal(save.careerEpisodeId, 'ep-05-six-hours');
  assert.ok(save.methodIds.includes('method-minimal-test-kit'));
  assert.ok(save.methodIds.includes('method-recovery-rehearsal'));

  save = stage2(save, 'story:stage2:plan-interfaces');
  assert.equal(stageTwoSetupEventId(save), 'evt-scope-plus-one');
  save = stage2(save, 'story:stage2:event-scope-boundary');
  save = stage2(save, 'story:stage2:handoff-three');
  assert.equal(careerStageTwoProgress(save).quests[1].done, true);
  assert.ok(save.discoveredContactIds.includes('contact-dai'));
  assert.ok(save.discoveredContactIds.includes('contact-m'));
  assert.ok(save.seenEventIds.includes('evt-scope-plus-one'));
  assert.ok(save.methodIds.includes('method-interface-handoff'));

  save = stage2(save, 'story:stage2:version-rollback');
  save = stage2(save, 'story:stage2:recover-evidence');
  save = stage2(save, 'story:stage2:archive-full');
  const progress = careerStageTwoProgress(save);
  assert.equal(progress.complete, true);
  assert.ok(save.evidenceIds.includes('career:stage-2:complete'));
  assert.ok(save.seenEventIds.includes('evt-final-final-v7'));
  assert.ok(save.methodIds.includes('method-version-lock'));
  assert.ok(save.methodIds.includes('method-evidence-led-recovery'));
  assert.ok(save.methodIds.includes('method-field-history-set'));
  assert.equal(save.week, 5);
  assert.equal(save.cash, 1250);
  assert.equal(careerStageTwoScene(save).id, 'stage2-complete');
});

test('multi-output capability organically swaps the setup event pool to sync drift', () => {
  let save = finishStageOne();
  save = { ...save, workbench: { ...save.workbench, output: 2 } };
  save = stage2(save, 'story:stage2:enter');
  save = stage2(save, 'story:stage2:goal-space');
  save = stage2(save, 'story:stage2:kit-prestage');
  save = stage2(save, 'story:stage2:run-full');
  save = stage2(save, 'story:stage2:plan-interfaces');
  assert.equal(stageTwoSetupEventId(save), 'evt-multiscreen-drift');
  assert.equal(careerStageTwoScene(save).id, 'stage2-event-sync');
  save = stage2(save, 'story:stage2:event-sync-degrade');
  assert.ok(save.seenEventIds.includes('evt-multiscreen-drift'));
  assert.ok(save.methodIds.includes('method-asynchronous-secondary-output'));
  assert.equal(save.scopeAdapted, true);
});

test('universal scope event choices leave distinct durable consequences rather than one score', () => {
  let base = stage2(finishStageOne(), 'story:stage2:enter');
  base = stage2(base, 'story:stage2:goal-delivery');
  base = stage2(base, 'story:stage2:kit-minimal');
  base = stage2(base, 'story:stage2:run-risk');
  base = stage2(base, 'story:stage2:plan-interfaces');

  const swapped = stage2(base, 'story:stage2:event-scope-swap');
  const accepted = stage2(base, 'story:stage2:event-scope-accept');
  const bounded = stage2(base, 'story:stage2:event-scope-boundary');

  assert.equal(swapped.scopeAdapted, true);
  assert.ok(swapped.methodIds.includes('method-scope-swap'));
  assert.ok(accepted.revealedIssueIds.includes('issue-scope-creep'));
  assert.ok(bounded.methodIds.includes('method-scope-boundary'));
  assert.equal('prestige' in swapped, false);
  assert.equal('artQuality' in accepted, false);
});
