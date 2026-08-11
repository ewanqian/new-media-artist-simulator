import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNarrativeChoice, createNarrativeState, narrativeKnownFacts } from '../narrativeEngine.ts';
import {
  butterflyResearchCards,
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyScholarTraining,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import { butterflyScholarNodeDefinitions } from '../butterflyScholarNodes.ts';
import { buildButterflyScholarTrainingPreset, BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';

test('Butterfly Scholar makes the player a new-media artist with butterfly and scanning practice', () => {
  assert.equal(butterflyScholarIdentity.title, '哥斯达黎加的蝴蝶学者');
  assert.equal(butterflyScholarIdentity.role, '新媒体艺术家 / 蝴蝶研究者');
  assert.ok(butterflyScholarIdentity.practice.includes('蝴蝶'));
  assert.ok(butterflyScholarIdentity.practice.includes('空间扫描'));
  assert.ok(!butterflyScholarIdentity.practice.includes('跟随一位'));
});

test('research cards explain the hard terms before asking the player to decide', () => {
  const ids = new Set(butterflyResearchCards.map((item) => item.id));
  for (const required of ['research-live-butterfly', 'research-overlap', 'research-camera-solve', 'research-representation', 'research-blender-motion', 'research-butterfly-authorship', 'research-specimen-ethics']) {
    assert.ok(ids.has(required), `missing research card ${required}`);
  }
  assert.ok(butterflyResearchCards.every((card) => card.short && card.plain && card.why));
});

test('training stays compact: subject, check, solve, then creation', () => {
  assert.equal(butterflyScholarTraining.length, 4);
  const nodeIds = new Set(butterflyScholarTraining.flatMap((step) => step.nodeIds));
  for (const required of [
    'butterfly-observation',
    'capture-motion-video',
    'capture-photo-sequence',
    'capture-quality-check',
    'process-metashape-align',
    'process-gaussian-splat',
    'process-blender-procedural',
    'process-butterfly-behavior'
  ]) assert.ok(nodeIds.has(required), `training missing ${required}`);
  assert.ok(butterflyScholarTraining.every((step) => step.plain && step.why && step.operation && step.failureSignals.length));
});

test('narrative route connects real butterfly capture, reconstruction, making, authorship, relationship and archive', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  assert.equal(state.currentNodeId, 'bs-01-invite');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-question');
  assert.equal(state.currentNodeId, 'bs-02-arrival');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-arrival-work');
  assert.equal(state.currentNodeId, 'bs-03-field');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-relation');
  assert.equal(state.currentNodeId, 'bs-03b-audit');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-live-not-static' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-recapture');
  assert.equal(state.currentNodeId, 'bs-04-process');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-diagnose');
  assert.equal(state.currentNodeId, 'bs-04a-represent');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-bad-solve' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-represent-gaussian');
  assert.equal(state.currentNodeId, 'bs-04e-compose');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-compose-noise');
  assert.equal(state.currentNodeId, 'bs-04f-authorship');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-authorship-source');
  assert.equal(state.currentNodeId, 'bs-04b-reveal');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-butterfly-authorship' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-reveal-listen');
  assert.equal(state.currentNodeId, 'bs-05-public');
  assert.ok(state.flags.includes('relationship-open'));
  assert.ok(state.trust.ines > 0);

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-archive-open');
  assert.equal(state.currentNodeId, 'bs-end');
  assert.ok(state.flags.includes('butterfly-route-complete'));
});

test('wrong technical decision remains playable and leaves real debt', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-open');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-arrival-prior');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-site');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-leave');
  assert.ok(state.flags.includes('capture-gap-debt'));
  assert.equal(state.currentNodeId, 'bs-04-process');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-force');
  assert.ok(state.flags.includes('forced-reconstruct-bad-solve'));
  assert.equal(state.currentNodeId, 'bs-04a-represent');
});

test('world effects connect choices to reusable nodes, methods, achievements and records', () => {
  assert.ok(butterflyWorldEffectsByChoice['bs-capture-relation'].unlockNodeIds.includes('capture-motion-video'));
  assert.ok(butterflyWorldEffectsByChoice['bs-audit-recapture'].achievementIds.includes('ach-field-check'));
  assert.ok(butterflyWorldEffectsByChoice['bs-align-diagnose'].unlockNodeIds.includes('process-metashape-align'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-gaussian'].unlockNodeIds.includes('process-gaussian-splat'));
  assert.ok(butterflyWorldEffectsByChoice['bs-compose-noise'].unlockNodeIds.includes('process-blender-procedural'));
  assert.ok(butterflyWorldEffectsByChoice['bs-authorship-source'].unlockNodeIds.includes('method-source-attribution'));
  assert.ok(butterflyWorldEffectsByChoice['bs-archive-open'].archiveEntryIds.includes('archive-butterfly-route'));
});

test('Butterfly Scholar nodes are registered in the real Blueprint editor catalog', () => {
  const ids = editorNodeDefinitions.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const node of butterflyScholarNodeDefinitions) assert.ok(ids.includes(node.id), `editor catalog missing ${node.id}`);
});

test('training blueprint is intentionally incomplete, small, and references valid nodes', () => {
  const preset = buildButterflyScholarTrainingPreset();
  const registered = new Set(editorNodeDefinitions.map((item) => item.id));
  const definitions = new Map(preset.nodes.map((node) => [node.id, node.definitionId]));
  assert.equal(preset.nodes.length, 6);
  assert.equal(BUTTERFLY_TRAINING_OBJECTIVES.length, 3);
  for (const node of preset.nodes) assert.ok(registered.has(node.definitionId), `unknown ${node.definitionId}`);
  for (const objective of BUTTERFLY_TRAINING_OBJECTIVES) {
    const alreadyDone = preset.edges.some((edge) => objective.from.includes(definitions.get(edge.from)) && objective.to.includes(definitions.get(edge.to)));
    assert.equal(alreadyDone, false, `${objective.id} should start disconnected`);
  }
});
