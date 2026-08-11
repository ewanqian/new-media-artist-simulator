import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNarrativeChoice, createNarrativeState, narrativeContradictions, narrativeKnownFacts } from '../narrativeEngine.ts';
import { butterflyScholarIdentity, butterflyScholarNarrativePack, butterflyScholarTraining, butterflyWorldEffectsByChoice } from '../butterflyScholarPack.ts';
import { butterflyScholarNodeDefinitions } from '../butterflyScholarNodes.ts';
import { buildButterflyScholarTrainingPreset, BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';

test('Butterfly Scholar makes the player the artist, not a follower', () => {
  assert.equal(butterflyScholarIdentity.title, '哥斯达黎加的蝴蝶学者');
  assert.equal(butterflyScholarIdentity.role, '艺术家 / 蝴蝶研究者');
  assert.ok(butterflyScholarIdentity.practice.includes('蝴蝶'));
});

test('training compresses capture into seven understandable actions with operations', () => {
  assert.equal(butterflyScholarTraining.length, 7);
  const nodeIds = new Set(butterflyScholarTraining.flatMap((step) => step.nodeIds));
  for (const required of ['capture-photo-sequence','capture-quality-check','process-metashape-align','process-colmap-sfm','process-gaussian-splat','process-point-clean','compose-memory-garden']) assert.ok(nodeIds.has(required));
  assert.ok(butterflyScholarTraining.every((step) => step.plain && step.why && step.operation && step.failureSignals.length));
});

test('narrative route forces field check, solve diagnosis and representation choice before reveal', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-with-question');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-hold-question');
  assert.ok(narrativeContradictions(state).length >= 1);
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-absence');
  assert.equal(state.currentNodeId, 'bs-03b-audit');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-recapture');
  assert.equal(state.currentNodeId, 'bs-04-process');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-diagnose');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-bad-solve' && fact.state === 'verified'));
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-represent-gaussian');
  assert.equal(state.currentNodeId, 'bs-04c-browser');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-browser-supersplat');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-preserve-gaps');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-reveal-accept');
  assert.ok(state.flags.includes('relationship-open'));
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-archive-open');
  assert.equal(state.currentNodeId, 'bs-end');
  assert.ok(state.flags.includes('butterfly-route-complete'));
});

test('wrong technical decisions remain playable but leave debt', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-ask-now');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-path');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-leave');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-switch-gaussian');
  assert.ok(state.flags.includes('capture-gap-debt'));
  assert.ok(state.flags.includes('switched-representation-before-fix'));
  assert.equal(state.currentNodeId, 'bs-04a-represent');
});

test('world effects unlock reusable nodes, methods and records', () => {
  assert.ok(butterflyWorldEffectsByChoice['bs-audit-recapture'].methodIds.includes('method-check-before-leave'));
  assert.ok(butterflyWorldEffectsByChoice['bs-align-diagnose'].unlockNodeIds.includes('process-metashape-align'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-gaussian'].unlockNodeIds.includes('process-gaussian-splat'));
  assert.ok(butterflyWorldEffectsByChoice['bs-archive-open'].archiveEntryIds.includes('archive-butterfly-route'));
});

test('Butterfly Scholar nodes are registered in the real Blueprint editor catalog', () => {
  const ids = editorNodeDefinitions.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const node of butterflyScholarNodeDefinitions) assert.ok(ids.includes(node.id));
});

test('training blueprint is intentionally incomplete and references valid nodes', () => {
  const preset = buildButterflyScholarTrainingPreset();
  const registered = new Set(editorNodeDefinitions.map((item) => item.id));
  const definitions = new Map(preset.nodes.map((node) => [node.id, node.definitionId]));
  for (const node of preset.nodes) assert.ok(registered.has(node.definitionId), `unknown ${node.definitionId}`);
  for (const objective of BUTTERFLY_TRAINING_OBJECTIVES) {
    const alreadyDone = preset.edges.some((edge) => objective.from.includes(definitions.get(edge.from)) && objective.to.includes(definitions.get(edge.to)));
    assert.equal(alreadyDone, false, `${objective.id} should start disconnected`);
  }
});
