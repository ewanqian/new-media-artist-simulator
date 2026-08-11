import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNarrativeChoice, createNarrativeState, narrativeKnownFacts } from '../narrativeEngine.ts';
import { butterflyScholarIdentity, butterflyScholarNarrativePack, butterflyScholarTraining, butterflyWorldEffectsByChoice } from '../butterflyScholarPack.ts';
import { butterflyScholarNodeDefinitions } from '../butterflyScholarNodes.ts';
import { buildButterflyScholarTrainingPreset, BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';

test('Butterfly Scholar makes the player the artist with a real capture and making practice', () => {
  assert.equal(butterflyScholarIdentity.title, '哥斯达黎加的蝴蝶学者');
  assert.equal(butterflyScholarIdentity.role, '艺术家 / 蝴蝶研究者');
  assert.ok(butterflyScholarIdentity.practice.includes('蝴蝶'));
  assert.ok(butterflyScholarIdentity.practice.includes('程序化动画'));
  assert.ok(!butterflyScholarIdentity.practice.includes('跟随一位'));
});

test('training compresses the route into six understandable actions with real operations', () => {
  assert.equal(butterflyScholarTraining.length, 6);
  const nodeIds = new Set(butterflyScholarTraining.flatMap((step) => step.nodeIds));
  for (const required of [
    'butterfly-observation',
    'capture-photo-sequence',
    'capture-quality-check',
    'process-metashape-align',
    'process-gaussian-splat',
    'process-blender-procedural',
    'method-source-attribution'
  ]) assert.ok(nodeIds.has(required), `training missing ${required}`);
  assert.ok(butterflyScholarTraining.every((step) => step.plain && step.why && step.operation && step.failureSignals.length));
});

test('narrative route connects butterfly observation, authorship, capture, reconstruction, public version and archive', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  assert.equal(state.currentNodeId, 'bs-01-invite');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-with-question');
  assert.equal(state.currentNodeId, 'bs-01b-self');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-preflight-camera');
  assert.equal(state.currentNodeId, 'bs-02-arrival');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-arrival-work');
  assert.equal(state.currentNodeId, 'bs-03-field');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-absence');
  assert.equal(state.currentNodeId, 'bs-03c-reference');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-source-note');
  assert.equal(state.currentNodeId, 'bs-03b-audit');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-authorship'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-recapture');
  assert.equal(state.currentNodeId, 'bs-04-process');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-diagnose');
  assert.equal(state.currentNodeId, 'bs-04a-represent');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-bad-solve' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-represent-gaussian');
  assert.equal(state.currentNodeId, 'bs-04c-browser');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-browser-supersplat');
  assert.equal(state.currentNodeId, 'bs-04d-gap');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-preserve-gaps');
  assert.equal(state.currentNodeId, 'bs-04b-reveal');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-reveal-talk');
  assert.equal(state.currentNodeId, 'bs-05-public');
  assert.ok(state.flags.includes('relationship-open'));
  assert.ok(state.trust.ines > 0);

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-public-derived');
  assert.equal(state.currentNodeId, 'bs-06-after');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-after-archive');
  assert.equal(state.currentNodeId, 'bs-end');
  assert.ok(state.flags.includes('butterfly-route-complete'));
});

test('wrong technical decisions remain playable and leave visible debt', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-preflight-depth');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-arrival-protocol');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-path');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-avoid-symbol');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-leave');
  assert.ok(state.flags.includes('capture-gap-debt'));
  assert.equal(state.currentNodeId, 'bs-04-process');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-switch-gaussian');
  assert.ok(state.flags.includes('switched-representation-before-fix'));
  assert.equal(state.currentNodeId, 'bs-04a-represent');
});

test('world effects unlock knowledge, reusable nodes, methods and final records', () => {
  assert.ok(butterflyWorldEffectsByChoice['bs-source-note'].unlockNodeIds.includes('method-source-attribution'));
  assert.ok(butterflyWorldEffectsByChoice['bs-source-note'].knowledgeIds.includes('know-butterfly-authorship'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-pointcloud'].unlockNodeIds.includes('process-blender-procedural'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-pointcloud'].methodIds.includes('method-procedural-motion'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-gaussian'].unlockNodeIds.includes('process-gaussian-splat'));
  assert.ok(butterflyWorldEffectsByChoice['bs-after-archive'].archiveEntryIds.includes('archive-butterfly-route'));
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
