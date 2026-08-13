import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSurface, validateChangeRecord } from '../controlSystem.ts';

const problem = { id: 'fix-black-screen', objectId: 'work-web-01', goal: 'make it open on another screen' };
const concept = { id: 'viewport', introducedByEventId: 'screen-went-black', relevantProblemIds: ['fix-black-screen'], enablesActionIds: ['debug-size'] };
const budget = { maxPrimaryItems: 2, maxActions: 3, maxNewConcepts: 1, maxCharacters: 180 };

test('surface passes when concept has provenance, current relevance, and action value', () => {
  const surface = { id: 'black-screen', moment: 'problem', currentProblemId: problem.id, budget, items: [
    { id: 'problem', role: 'problem', text: '网页缩小以后黑屏了。', priority: 'primary', problemId: problem.id, factId: 'screen-black' },
    { id: 'debug', role: 'action', text: '查第一条报错', priority: 'primary', problemId: problem.id, conceptIds: ['viewport'], enablesActionIds: ['debug-size'], effectRefs: ['work.version'] },
    { id: 'cut', role: 'action', text: '先关掉最容易坏的效果', priority: 'secondary', problemId: problem.id, enablesActionIds: ['cut-effect'], effectRefs: ['work.version'] }
  ] };
  assert.deepEqual(evaluateSurface(surface, [problem], [concept], {
    reachedEventIds: ['screen-went-black'], knownConceptIds: [], availableActionIds: ['debug-size', 'cut-effect']
  }), []);
});

test('surface rejects early irrelevant concepts, dead UI, duplicate facts, and missing action effects', () => {
  const surface = { id: 'bad', moment: 'problem', currentProblemId: problem.id, budget: { ...budget, maxNewConcepts: 0 }, items: [
    { id: 'problem', role: 'problem', text: '网页黑屏。', priority: 'primary', problemId: problem.id, factId: 'same' },
    { id: 'counter', role: 'status', text: '61 条证据', priority: 'secondary', factId: 'same' },
    { id: 'tech', role: 'action', text: '选一个技术', priority: 'primary', problemId: problem.id, conceptIds: ['viewport'], enablesActionIds: ['missing'], effectRefs: [] }
  ] };
  const issues = evaluateSurface(surface, [problem], [concept], { reachedEventIds: [], knownConceptIds: [], availableActionIds: [] });
  assert.ok(issues.some((issue) => issue.message.includes('before introduction')));
  assert.ok(issues.some((issue) => issue.message.includes('changes nothing')));
  assert.ok(issues.some((issue) => issue.message.includes('Same fact')));
  assert.ok(issues.some((issue) => issue.message.includes('no state effect')));
  assert.ok(issues.some((issue) => issue.message.includes('Too many new concepts')));
});

test('change record cannot pass without problem, state effect, checks, and rollback', () => {
  assert.deepEqual(validateChangeRecord({ id: 'wp', playerProblem: '', changedFiles: [], stateEffect: '', automatedChecks: [], humanReview: 'pending', rollbackCommit: '' }), [
    'playerProblem', 'changedFiles', 'stateEffect', 'automatedChecks', 'humanReview', 'rollbackCommit'
  ]);
});
