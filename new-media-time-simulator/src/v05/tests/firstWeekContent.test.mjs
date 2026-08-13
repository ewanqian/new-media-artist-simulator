import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction } from '../runState.ts';
import { evaluateSurface } from '../controlSystem.ts';
import { firstWeekProblems, firstWeekScene, firstWeekSurface, freshFirstWeekRun, sceneAsNarrativeNode } from '../firstWeekContent.ts';

const contexts = (run, scene) => ({
  reachedEventIds: run.eventIds,
  knownConceptIds: run.knownConceptIds,
  availableActionIds: scene.choices.map((choice) => choice.id)
});

test('every first-week surface passes attention, redundancy, and traceability gates', () => {
  let run = freshFirstWeekRun('run-test');
  for (const actionId of ['read-first-error', 'send-to-awake-friend', 'add-one-line-instruction', 'send-link-now']) {
    const scene = firstWeekScene(run);
    assert.deepEqual(evaluateSurface(firstWeekSurface(scene), firstWeekProblems, [], contexts(run, scene)), [], scene.id);
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId, '2026-08-14T00:00:00.000Z');
  }
  const ending = firstWeekScene(run);
  assert.deepEqual(evaluateSurface(firstWeekSurface(ending), firstWeekProblems, [], contexts(run, ending)), [], ending.id);
});

test('all 81 first-week paths keep work, feedback, decisions, and outcomes traceable', () => {
  let pathCount = 0;
  const start = freshFirstWeekRun('all-paths');
  for (const first of firstWeekScene(start).choices) {
    const afterFirst = applyAction(start, sceneAsNarrativeNode(firstWeekScene(start)), first.id);
    for (const check of firstWeekScene(afterFirst).choices) {
      const afterCheck = applyAction(afterFirst, sceneAsNarrativeNode(firstWeekScene(afterFirst)), check.id);
      for (const response of firstWeekScene(afterCheck).choices) {
        const afterResponse = applyAction(afterCheck, sceneAsNarrativeNode(firstWeekScene(afterCheck)), response.id);
        for (const delivery of firstWeekScene(afterResponse).choices) {
          const run = applyAction(afterResponse, sceneAsNarrativeNode(firstWeekScene(afterResponse)), delivery.id);
          pathCount += 1;
          assert.equal(run.works.length, 1);
          assert.equal(run.works[0].decisionIds.length, 4);
          assert.ok(run.works[0].versions.length >= 1);
          assert.ok(run.feedback.length >= 1);
          assert.ok(['used', 'ignored'].includes(run.feedback[0].status));
          assert.equal(run.feedback[0].versionId, 'version-01');
          assert.equal(run.history.length, 4);
          assert.match(run.currentNodeId, /^morning-/);
        }
      }
    }
  }
  assert.equal(pathCount, 81);
});

test('phone, friend, and social feedback create different follow-up actions and all allow ignore', () => {
  const actionSets = [];
  for (const checkId of ['open-on-phone', 'send-to-awake-friend', 'post-ten-second-clip']) {
    let run = freshFirstWeekRun(checkId);
    for (const actionId of ['read-first-error', checkId]) {
      const scene = firstWeekScene(run);
      run = applyAction(run, sceneAsNarrativeNode(scene), actionId);
    }
    const ids = firstWeekScene(run).choices.map((choice) => choice.id);
    assert.ok(ids.includes('ignore-feedback'));
    actionSets.push(ids.join(','));
  }
  assert.equal(new Set(actionSets).size, 3);
});

test('first week contains no named person, optional chapter, or forced technical concept', () => {
  let run = freshFirstWeekRun('copy-audit');
  const visible = [];
  for (const actionId of ['cut-last-effect', 'open-on-phone', 'make-touch-version', 'send-link-now']) {
    const scene = firstWeekScene(run);
    visible.push(scene.title, ...scene.lines, ...scene.choices.flatMap((choice) => [choice.label, choice.note]));
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId);
  }
  visible.push(firstWeekScene(run).title, ...firstWeekScene(run).lines);
  const copy = visible.join('\n');
  for (const premature of ['哥斯达黎加', 'Inés', 'Rojas', '林', '点云', 'Gaussian', 'Asset', 'Evidence', 'Blueprint', '阶段']) {
    assert.equal(copy.includes(premature), false, premature);
  }
});
