import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyNarrativeChoice,
  createNarrativeState,
  narrativeContradictions,
  narrativeKnownFacts
} from '../narrativeEngine.ts';
import {
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyScholarTraining,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import {
  buildButterflyScholarPreset,
  butterflyScholarNodeDefinitions
} from '../butterflyScholarNodes.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';

test('Butterfly Scholar makes the player the artist, not a follower', () => {
  assert.equal(butterflyScholarIdentity.title, '哥斯达黎加的蝴蝶学者');
  assert.equal(butterflyScholarIdentity.role, '艺术家 / 蝴蝶研究者');
  assert.ok(butterflyScholarIdentity.practice.includes('蝴蝶'));
  assert.ok(!butterflyScholarIdentity.practice.includes('跟随一位'));
});

test('training compresses a real capture pipeline into seven understandable decisions', () => {
  assert.equal(butterflyScholarTraining.length, 7);
  const nodeIds = new Set(butterflyScholarTraining.flatMap((step) => step.nodeIds));
  for (const required of ['capture-photo-sequence', 'capture-quality-check', 'process-metashape-align', 'process-colmap-sfm', 'process-gaussian-splat', 'process-point-clean', 'compose-memory-garden']) {
    assert.ok(nodeIds.has(required), `missing training node ${required}`);
  }
  assert.ok(butterflyScholarTraining.every((step) => step.plain && step.why && step.failureSignals.length));
});

test('narrative route supports identity doubt, field choice, reveal and archive without separate minigame state', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  assert.equal(state.currentNodeId, 'bs-01-invite');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-with-question');
  assert.equal(state.currentNodeId, 'bs-02-arrival');
  assert.ok(state.flags.includes('question-before-trip'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-hold-question');
  assert.equal(state.currentNodeId, 'bs-03-field');
  assert.ok(narrativeContradictions(state).length >= 1);

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-absence');
  assert.equal(state.currentNodeId, 'bs-04-process');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-absence' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-preserve-gaps');
  assert.equal(state.currentNodeId, 'bs-04b-reveal');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-reveal-accept');
  assert.equal(state.currentNodeId, 'bs-05-public');
  assert.ok(state.flags.includes('relationship-open'));
  assert.ok(state.trust.ines > 0);

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-archive-open');
  assert.equal(state.currentNodeId, 'bs-end');
  assert.ok(state.flags.includes('butterfly-route-complete'));
  assert.ok(state.memories.some((memory) => memory.actorId === 'ines'));
});

test('narrative decisions emit reusable world effects for Blueprint and Records', () => {
  const capture = butterflyWorldEffectsByChoice['bs-capture-absence'];
  assert.ok(capture.unlockNodeIds.includes('butterfly-observation'));
  assert.ok(capture.methodIds.includes('method-record-absence'));

  const ending = butterflyWorldEffectsByChoice['bs-archive-open'];
  assert.ok(ending.archiveEntryIds.includes('archive-butterfly-route'));
  assert.ok(ending.evidenceIds.includes('ev-public-garden-version'));
});

test('Butterfly Scholar nodes are registered in the real Blueprint editor catalog', () => {
  const ids = editorNodeDefinitions.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, 'editor node ids must remain unique');
  for (const node of butterflyScholarNodeDefinitions) {
    assert.ok(ids.includes(node.id), `editor catalog missing ${node.id}`);
  }
});

test('Butterfly Scholar preset only references registered nodes and valid edges', () => {
  const preset = buildButterflyScholarPreset();
  const registered = new Set(editorNodeDefinitions.map((item) => item.id));
  const instanceIds = new Set(preset.nodes.map((node) => node.id));
  assert.ok(preset.nodes.length >= 12);
  for (const node of preset.nodes) assert.ok(registered.has(node.definitionId), `unknown node definition ${node.definitionId}`);
  for (const edge of preset.edges) {
    assert.ok(instanceIds.has(edge.from), `edge source missing ${edge.from}`);
    assert.ok(instanceIds.has(edge.to), `edge target missing ${edge.to}`);
  }
});
