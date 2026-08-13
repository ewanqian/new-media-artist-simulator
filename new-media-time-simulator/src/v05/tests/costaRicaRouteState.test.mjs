import test from 'node:test';
import assert from 'node:assert/strict';
import {
  costaRicaChoiceProgressNotice,
  deriveCostaRicaAssets,
  deriveCostaRicaMementos,
  deriveCostaRicaRouteStages,
  emphasizeChoiceHint
} from '../costaRicaRouteState.ts';

const state = (currentNodeId, flags = []) => ({
  packId: 'narrative-butterfly-scholar-v4',
  currentNodeId,
  visitedNodeIds: [],
  flags,
  facts: [],
  memories: [],
  trust: {},
  history: []
});

test('Costa Rica chapter exposes a visible residency progress chain instead of an invisible record state', () => {
  const before = deriveCostaRicaRouteStages(state('bs-01-invite'));
  assert.deepEqual(before.map((item) => item.id), ['invite', 'travel', 'field', 'workbench', 'public', 'archive']);
  assert.equal(before[0].state, 'current');
  assert.ok(before[0].detail.includes('等待确认'));

  const accepted = deriveCostaRicaRouteStages(state('bs-02-arrival', ['accepted-field-trip']));
  assert.equal(accepted[0].state, 'done');
  assert.equal(accepted[1].state, 'current');
  assert.ok(accepted[1].detail.includes('哥斯达黎加'));
});

test('field capture and studio processing generate reusable assets rather than disposable score changes', () => {
  const current = state('bs-04a-represent', [
    'accepted-field-trip', 'capture-relation-route', 'field-recapture',
    'forced-reconstruct-bad-solve', 'failure-kept', 'solve-repaired', 'representation-pointcloud'
  ]);
  const assets = deriveCostaRicaAssets(current, { evidenceIds: ['ev-butterfly-two-second'] });
  const ids = new Set(assets.map((item) => item.id));
  for (const expected of ['CR-BRIEF-01', 'CR-FIELD-1.8S', 'CR-PHOTOSET-01', 'CR-SOLVE-01', 'FAIL_01', 'CR-SPACE-PC01']) {
    assert.ok(ids.has(expected), `missing durable asset ${expected}`);
  }
  assert.ok(assets.every((item) => item.use));
});

test('triumph collection can contain travel objects failures and memory fragments', () => {
  const current = state('bs-end', [
    'accepted-field-trip', 'forced-reconstruct-bad-solve', 'institutional-boundary-written', 'butterfly-route-complete'
  ]);
  const mementos = deriveCostaRicaMementos(current, {
    evidenceIds: ['ev-butterfly-two-second'],
    achievementIds: ['ach-special-butterfly-complete']
  });
  const kinds = new Set(mementos.map((item) => item.kind));
  assert.ok(kinds.has('travel'));
  assert.ok(kinds.has('object'));
  assert.ok(kinds.has('memory'));
  assert.ok(kinds.has('failure'));
  assert.ok(kinds.has('people'));
  assert.ok(mementos.some((item) => item.title.includes('行程单')));
  assert.ok(mementos.some((item) => item.title.includes('坏版本')));
});

test('serious choices are visibly marked without declaring one answer correct', () => {
  assert.equal(costaRicaChoiceProgressNotice['bs-authorship-system'].serious, true);
  assert.equal(costaRicaChoiceProgressNotice['bs-reveal-distance'].serious, true);
  assert.ok(emphasizeChoiceHint('bs-authorship-system', '作者性：作品结构会改变').startsWith('重要选择'));
  assert.equal(emphasizeChoiceHint('bs-go-open', '项目方向：保持开放').startsWith('重要选择'), false);
});
