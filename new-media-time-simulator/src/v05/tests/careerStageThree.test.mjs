import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCareerStoryCommand } from '../careerStoryRuntime.ts';
import { applyCareerStageTwoCommand } from '../careerStageTwo.ts';
import { applyCareerStageThreeCommand, careerStageThreeProgress, careerStageThreeScene } from '../careerStageThree.ts';

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

const s1 = (save, command) => applyCareerStoryCommand(save, command).save;
const s2 = (save, command) => applyCareerStageTwoCommand(save, command).save;
const s3 = (save, command) => applyCareerStageThreeCommand(save, command).save;

function finishStageTwo() {
  let save = startSave();
  save = s1(save, 'story:prototype:minimal');
  save = s1(save, 'story:context:studio');
  save = s1(save, 'story:witness:lin');
  save = s1(save, 'story:time:wait');
  save = s1(save, 'story:diagnose:trace');
  save = s1(save, 'story:public:blackbox-minimal');
  save = s2(save, 'story:stage2:enter');
  save = s2(save, 'story:stage2:goal-recovery');
  save = s2(save, 'story:stage2:kit-minimal');
  save = s2(save, 'story:stage2:run-baseline');
  save = s2(save, 'story:stage2:plan-interfaces');
  save = s2(save, 'story:stage2:event-scope-boundary');
  save = s2(save, 'story:stage2:handoff-three');
  save = s2(save, 'story:stage2:version-rollback');
  save = s2(save, 'story:stage2:recover-evidence');
  save = s2(save, 'story:stage2:archive-full');
  assert.ok(save.evidenceIds.includes('career:stage-2:complete'));
  return save;
}

test('network stage begins because existing field history is being passed between people', () => {
  const before = finishStageTwo();
  const project = before.primaryProject;
  const next = s3(before, 'story:stage3:enter');
  assert.equal(next.careerStageId, 'stage-3');
  assert.equal(next.careerEpisodeId, 'ep-07-first-commission');
  assert.deepEqual(next.primaryProject, project);
  assert.ok(next.discoveredContactIds.includes('contact-qiao'));
  const qiao = next.contactThreads['contact-qiao'];
  assert.ok(qiao.some((item) => /现场历史|测试目标|Scope/.test(item.text)));
  assert.equal(careerStageThreeScene(next).id, 'stage3-commission-verify');
});

test('old scope method changes the commission callback instead of replaying a tutorial', () => {
  let save = s3(finishStageTwo(), 'story:stage3:enter');
  save = s3(save, 'story:stage3:verify-matrix');
  save = s3(save, 'story:stage3:commit-package');
  const scene = careerStageThreeScene(save);
  assert.equal(scene.id, 'stage3-commission-callback');
  assert.match(scene.title, /这次你认识它/);
  save = s3(save, 'story:stage3:deliver-reuse-boundary');
  assert.ok(save.evidenceIds.includes('stage3:ep7:complete'));
  assert.ok(save.evidenceIds.includes('relationship:qiao:commitment-matched-delivery'));
  assert.ok(save.cash > 0);
});

test('open-call result is deterministic from evidence and one-page structure rather than random prestige', () => {
  let strong = s3(finishStageTwo(), 'story:stage3:enter');
  strong = s3(strong, 'story:stage3:verify-matrix');
  strong = s3(strong, 'story:stage3:commit-package');
  strong = s3(strong, 'story:stage3:deliver-reuse-boundary');
  strong = s3(strong, 'story:stage3:open-lead-field');
  strong = s3(strong, 'story:stage3:page-concrete');
  strong = s3(strong, 'story:stage3:open-submit');
  assert.ok(strong.evidenceIds.includes('stage3:ep8:result:shortlist'));

  let thin = s3(finishStageTwo(), 'story:stage3:enter');
  thin = s3(thin, 'story:stage3:verify-matrix');
  thin = s3(thin, 'story:stage3:commit-package');
  thin = s3(thin, 'story:stage3:deliver-reuse-boundary');
  thin = s3(thin, 'story:stage3:open-lead-question');
  thin = s3(thin, 'story:stage3:page-image-first');
  thin = s3(thin, 'story:stage3:open-submit');
  assert.ok(thin.evidenceIds.includes('stage3:ep8:result:not-selected'));
  assert.equal('fame' in strong, false);
  assert.equal('prestige' in strong, false);
});

test('full network arc archives traceable known-for descriptions instead of a reputation score', () => {
  let save = s3(finishStageTwo(), 'story:stage3:enter');
  save = s3(save, 'story:stage3:verify-matrix');
  save = s3(save, 'story:stage3:commit-package');
  save = s3(save, 'story:stage3:deliver-reuse-boundary');
  assert.equal(careerStageThreeProgress(save).quests[0].done, true);

  save = s3(save, 'story:stage3:open-lead-field');
  save = s3(save, 'story:stage3:page-concrete');
  save = s3(save, 'story:stage3:open-ask-submit');
  assert.equal(careerStageThreeProgress(save).quests[1].done, true);
  assert.ok(save.evidenceIds.includes('stage3:ep8:result:shortlist'));

  save = s3(save, 'story:stage3:misread-evidence');
  assert.ok(save.seenEventIds.includes('evt-social-misread'));
  save = s3(save, 'story:stage3:invite-constraints');
  const progress = careerStageThreeProgress(save);
  assert.equal(progress.complete, true);
  assert.ok(save.evidenceIds.includes('career:stage-3:complete'));
  assert.ok(save.seenEventIds.includes('evt-institution-cautious-invite'));
  assert.ok(save.methodIds.includes('method-source-evidence-response'));
  assert.ok(save.methodIds.includes('method-institution-constraint-verification'));
  assert.ok(Array.isArray(save.careerKnownFor));
  assert.ok(save.careerKnownFor.length >= 2);
  assert.ok(save.careerKnownFor.every((item) => typeof item === 'string' && item.length > 8));
  assert.equal('reputation' in save, false);
  assert.equal('affection' in save, false);
  assert.equal(careerStageThreeScene(save).id, 'stage3-complete');
});

test('social misread responses leave different durable records', () => {
  const base = {
    ...finishStageTwo(),
    careerStageId: 'stage-3',
    evidenceIds: [...finishStageTwo().evidenceIds, 'stage3:ep7:complete', 'stage3:ep8:complete']
  };
  const ignored = s3(base, 'story:stage3:misread-ignore');
  const sourced = s3(base, 'story:stage3:misread-evidence');
  const short = s3(base, 'story:stage3:misread-short');
  assert.ok(ignored.evidenceIds.includes('public-reading:external-misread'));
  assert.ok(sourced.methodIds.includes('method-source-evidence-response'));
  assert.match(short.publicDescription, /实时系统|真实空间/);
});
