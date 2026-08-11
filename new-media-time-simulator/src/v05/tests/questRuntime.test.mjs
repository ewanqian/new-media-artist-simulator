import test from 'node:test';
import assert from 'node:assert/strict';
import { openingQuestProgress } from '../questRuntime.ts';

function base() {
  return {
    completedCardIds: [],
    visitedPlaceIds: [],
    primaryProject: null,
    contactThreads: {},
    receivedFeedbackCount: 0,
    evidenceIds: [],
    contextActionIds: [],
    revealedIssueIds: [],
    resolvedIssueIds: [],
    methodIds: [],
    workbench: { output: 1, compute: 1, capture: 1, storage: 1 },
    scopeAdapted: false,
    publicOutputCount: 0
  };
}

test('episode stays runtime-only while quests are the visible progression', () => {
  const progress = openingQuestProgress(base());
  assert.equal(progress.runtime.playerFacing, false);
  assert.equal(progress.runtime.questLineIds[0], progress.line.id);
  assert.equal(progress.active.id, 'main-01-running');
});

test('first two quests require project formation then environment-conditioned action', () => {
  const state = base();
  state.completedCardIds.push('studio-minimum-system');
  state.primaryProject = { name: '最小反馈系统' };
  let progress = openingQuestProgress(state);
  assert.equal(progress.quests[0].done, true);
  assert.equal(progress.active.id, 'main-02-leave-desk');

  state.visitedPlaceIds.push('place-basic-studio');
  state.contextActionIds.push('place-basic-studio:run:1');
  progress = openingQuestProgress(state);
  assert.equal(progress.quests[1].done, true);
  assert.equal(progress.active.id, 'main-03-other-eyes');
});

test('feedback diagnosis and adapted public output finish the opening line', () => {
  const state = base();
  state.completedCardIds.push('studio-minimum-system');
  state.primaryProject = { name: '最小反馈系统' };
  state.visitedPlaceIds.push('place-basic-studio');
  state.contextActionIds.push('place-basic-studio:run:1');
  state.contactThreads['contact-lin'] = [{ from: 'you', text: '看一个当前版本' }];
  state.receivedFeedbackCount = 1;
  state.evidenceIds.push('feedback:contact-lin:2');
  state.revealedIssueIds.push('issue-context-friction');
  state.resolvedIssueIds.push('issue-context-friction');
  state.methodIds.push('method-diagnose-from-evidence');
  state.visitedPlaceIds.push('place-blackbox');
  state.scopeAdapted = true;
  state.publicOutputCount = 1;

  const progress = openingQuestProgress(state);
  assert.equal(progress.complete, true);
  assert.equal(progress.completed, 5);
});
