import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCostaRicaCarryover, mergeSpecialCarryoverIntoCareer } from '../specialCarryover.ts';

const completedState = {
  packId: 'narrative-butterfly-scholar-v4',
  currentNodeId: 'bs-end',
  visitedNodeIds: [],
  flags: [
    'accepted-field-trip', 'capture-relation-route', 'field-recapture',
    'diagnosed-camera-solve', 'representation-pointcloud', 'motion-interactive-butterfly',
    'authorship-system-shift', 'institutional-boundary-written', 'butterfly-route-complete'
  ],
  facts: [], memories: [], trust: {}, history: []
};

const world = {
  unlockNodeIds: ['capture-quality-check', 'process-metashape-align', 'process-butterfly-behavior'],
  evidenceIds: ['ev-butterfly-two-second', 'ev-field-recapture'],
  methodIds: ['method-check-before-leave', 'method-diagnose-before-reconstruct', 'method-motion-as-rule'],
  researchIds: ['research-overlap', 'research-camera-solve'],
  achievementIds: ['ach-special-butterfly-complete']
};

test('completed Costa Rica route packages knowledge nodes assets evidence and mementos for later career use', () => {
  const carryover = buildCostaRicaCarryover(completedState, world);
  assert.equal(carryover.sourceId, 'special-01-costa-rica');
  assert.equal(carryover.completed, true);
  assert.ok(carryover.assetIds.includes('CR-PHOTOSET-01'));
  assert.ok(carryover.assetIds.includes('CR-SOLVE-01'));
  assert.ok(carryover.methodIds.includes('method-check-before-leave'));
  assert.ok(carryover.knowledgeIds.includes('research-camera-solve'));
  assert.ok(carryover.nodeIds.includes('process-metashape-align'));
  assert.ok(carryover.mementos.some((item) => item.title.includes('行程单')));
});

test('Special carryover enriches an existing career without resetting its current project or week', () => {
  const carryover = buildCostaRicaCarryover(completedState, world);
  const career = {
    week: 7,
    primaryProject: { name: '现有项目', question: '不要重置我' },
    methodIds: ['method-old'],
    evidenceIds: ['ev-old'],
    unlockedNodeIds: [],
    specialKnowledgeIds: [],
    specialAssetIds: [],
    mementoIds: []
  };
  const next = mergeSpecialCarryoverIntoCareer(career, carryover);
  assert.equal(next.week, 7);
  assert.equal(next.primaryProject.name, '现有项目');
  assert.ok(next.methodIds.includes('method-old'));
  assert.ok(next.methodIds.includes('method-check-before-leave'));
  assert.ok(next.evidenceIds.includes('ev-old'));
  assert.ok(next.specialAssetIds.includes('CR-PHOTOSET-01'));
  assert.ok(next.mementoIds.includes('M-CR-TICKET'));
  assert.equal(next.specialCarryovers.length, 1);

  const twice = mergeSpecialCarryoverIntoCareer(next, carryover);
  assert.equal(twice.specialCarryovers.length, 1);
  assert.equal(twice.methodIds.filter((id) => id === 'method-check-before-leave').length, 1);
});
