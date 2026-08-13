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
  for (const actionId of ['read-first-error', 'send-to-awake-friend', 'declare-desktop-only']) {
    const scene = firstWeekScene(run);
    assert.deepEqual(evaluateSurface(firstWeekSurface(scene), firstWeekProblems, [], contexts(run, scene)), [], scene.id);
    run = applyAction(run, sceneAsNarrativeNode(scene), actionId, '2026-08-14T00:00:00.000Z');
  }
  const ending = firstWeekScene(run);
  assert.deepEqual(evaluateSurface(firstWeekSurface(ending), firstWeekProblems, [], contexts(run, ending)), [], ending.id);
});

test('all 27 first-week paths create one traceable work, feedback, and final version', () => {
  const first = ['cut-last-effect', 'read-first-error', 'restore-window-size'];
  const checks = ['open-on-phone', 'send-to-awake-friend', 'post-ten-second-clip'];
  const deliveries = ['make-touch-version', 'declare-desktop-only', 'send-video-first'];
  for (const a of first) for (const b of checks) for (const c of deliveries) {
    let run = freshFirstWeekRun(`${a}-${b}-${c}`);
    for (const actionId of [a, b, c]) {
      const scene = firstWeekScene(run);
      run = applyAction(run, sceneAsNarrativeNode(scene), actionId, '2026-08-14T00:00:00.000Z');
    }
    assert.equal(run.works.length, 1);
    assert.equal(run.works[0].decisionIds.length, 3);
    assert.equal(run.works[0].versions.length, 2);
    assert.equal(run.feedback.length, 1);
    assert.equal(run.history.length, 3);
    assert.match(run.currentNodeId, /^morning-/);
  }
});

test('first week contains no named person, optional chapter, or forced technical concept', () => {
  let run = freshFirstWeekRun('copy-audit');
  const visible = [];
  for (const actionId of ['cut-last-effect', 'open-on-phone', 'make-touch-version']) {
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
