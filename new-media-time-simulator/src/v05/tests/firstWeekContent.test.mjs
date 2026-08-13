import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTransition, applyAction } from '../runState.ts';
import { evaluateSurface } from '../controlSystem.ts';
import { firstWeekProblems, firstWeekScene, firstWeekSurface, freshFirstWeekRun, sceneAsNarrativeNode } from '../firstWeekContent.ts';

const contexts = (run, scene) => ({
  reachedEventIds: run.eventIds,
  knownConceptIds: run.knownConceptIds,
  availableActionIds: [...scene.choices.map((choice) => choice.id), ...(scene.advance ? [scene.advance.id] : [])]
});

test('every first-week surface passes attention, redundancy, and traceability gates', () => {
  let run = freshFirstWeekRun('run-test');
  for (const actionId of ['read-first-error', 'send-to-awake-friend', 'add-one-line-instruction', 'send-link-now']) {
    const scene = firstWeekScene(run);
    assert.deepEqual(evaluateSurface(firstWeekSurface(scene), firstWeekProblems, [], contexts(run, scene)), [], scene.id);
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId, '2026-08-14T00:00:00.000Z');
  }
  const deliveryResult = firstWeekScene(run);
  assert.deepEqual(evaluateSurface(firstWeekSurface(deliveryResult), firstWeekProblems, [], contexts(run, deliveryResult)), [], deliveryResult.id);
  run = advanceTransition(run, sceneAsNarrativeNode(deliveryResult));
  for (const actionId of ['send-minimum-venue-test', 'make-controls-obvious']) {
    const scene = firstWeekScene(run);
    assert.deepEqual(evaluateSurface(firstWeekSurface(scene), firstWeekProblems, [], contexts(run, scene)), [], scene.id);
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId, '2026-08-14T00:00:00.000Z');
  }
  const ending = firstWeekScene(run);
  assert.deepEqual(evaluateSurface(firstWeekSurface(ending), firstWeekProblems, [], contexts(run, ending)), [], ending.id);
});

test('all 729 two-day paths keep one Work, feedback, decisions, and public outcome traceable', () => {
  let pathCount = 0;
  const start = freshFirstWeekRun('all-paths');
  for (const first of firstWeekScene(start).choices) {
    const afterFirst = applyAction(start, sceneAsNarrativeNode(firstWeekScene(start)), first.id);
    for (const check of firstWeekScene(afterFirst).choices) {
      const afterCheck = applyAction(afterFirst, sceneAsNarrativeNode(firstWeekScene(afterFirst)), check.id);
      for (const response of firstWeekScene(afterCheck).choices) {
        const afterResponse = applyAction(afterCheck, sceneAsNarrativeNode(firstWeekScene(afterCheck)), response.id);
        for (const delivery of firstWeekScene(afterResponse).choices) {
          const delivered = applyAction(afterResponse, sceneAsNarrativeNode(firstWeekScene(afterResponse)), delivery.id);
          const afterResult = advanceTransition(delivered, sceneAsNarrativeNode(firstWeekScene(delivered)));
          for (const setup of firstWeekScene(afterResult).choices) {
            const afterSetup = applyAction(afterResult, sceneAsNarrativeNode(firstWeekScene(afterResult)), setup.id);
            for (const publicChoice of firstWeekScene(afterSetup).choices) {
              const run = applyAction(afterSetup, sceneAsNarrativeNode(firstWeekScene(afterSetup)), publicChoice.id);
              pathCount += 1;
              assert.equal(run.works.length, 1);
              assert.equal(run.works[0].decisionIds.length, 6);
              assert.equal(run.works[0].status, 'public');
              assert.ok(run.works[0].versions.length >= 3);
              assert.ok(run.feedback.length >= 2);
              assert.ok(['used', 'ignored'].includes(run.feedback[0].status));
              assert.equal(run.feedback[0].versionId, 'version-01');
              assert.match(run.feedback.at(-1).versionId, /^version-04-/);
              assert.equal(run.history.length, 6);
              assert.equal(run.currentNodeId, 'venue-opened');
            }
          }
        }
      }
    }
  }
  assert.equal(pathCount, 729);
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

test('the focused two-day route contains no named person, optional chapter, or forced technical concept', () => {
  let run = freshFirstWeekRun('copy-audit');
  const visible = [];
  for (const actionId of ['cut-last-effect', 'open-on-phone', 'make-touch-version', 'send-link-now']) {
    const scene = firstWeekScene(run);
    visible.push(scene.title, ...scene.lines, ...scene.choices.flatMap((choice) => [choice.label, choice.note]));
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId);
  }
  const deliveryResult = firstWeekScene(run);
  visible.push(deliveryResult.title, ...deliveryResult.lines, deliveryResult.advance?.label || '');
  run = advanceTransition(run, sceneAsNarrativeNode(deliveryResult));
  for (const actionId of ['send-minimum-venue-test', 'add-idle-motion']) {
    const scene = firstWeekScene(run);
    visible.push(scene.title, ...scene.lines, ...scene.choices.flatMap((choice) => [choice.label, choice.note]));
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId);
  }
  visible.push(firstWeekScene(run).title, ...firstWeekScene(run).lines);
  const copy = visible.join('\n');
  for (const premature of ['哥斯达黎加', 'Inés', 'Rojas', '林', '点云', 'Gaussian', 'Asset', 'Evidence', 'Blueprint', '阶段', '系统']) {
    assert.equal(copy.includes(premature), false, premature);
  }
});
