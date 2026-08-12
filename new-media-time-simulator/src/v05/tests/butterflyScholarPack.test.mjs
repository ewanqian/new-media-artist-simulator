import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNarrativeChoice, createNarrativeState, narrativeKnownFacts } from '../narrativeEngine.ts';
import {
  butterflyResearchCards,
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyScholarTraining,
  butterflyWorldEffectsByChoice,
  deriveButterflyWorldEffect,
  resolveButterflyNodeText
} from '../butterflyScholarPack.ts';
import { butterflyChoiceOutcomeHints, deriveButterflyOutcome } from '../butterflyScholarOutcome.ts';
import { butterflyScholarNodeDefinitions } from '../butterflyScholarNodes.ts';
import { buildButterflyScholarTrainingPreset, BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';

function mergeWorld(world, effect = {}) {
  const next = { ...world };
  for (const key of Object.keys(world)) next[key] = [...new Set([...(world[key] || []), ...(effect[key] || [])])];
  return next;
}

function playRoute(choiceIds) {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  let world = {
    unlockNodeIds: [], evidenceIds: [], methodIds: [], researchIds: [], threadIds: [], archiveEntryIds: [], achievementIds: [], qualitySignals: [], projectTags: []
  };
  for (const choiceId of choiceIds) {
    const beforeFlags = state.flags;
    state = applyNarrativeChoice(butterflyScholarNarrativePack, state, choiceId);
    world = mergeWorld(world, butterflyWorldEffectsByChoice[choiceId] || {});
    world = mergeWorld(world, deriveButterflyWorldEffect(beforeFlags, choiceId));
  }
  return { state, world };
}

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

test('narrative route connects capture, reconstruction, making, authorship, institution and archive', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  assert.equal(state.currentNodeId, 'bs-01-invite');

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-go-question');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-arrival-work');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-capture-relation');
  assert.equal(state.currentNodeId, 'bs-03b-audit');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-live-not-static' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-audit-recapture');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-align-diagnose');
  assert.equal(state.currentNodeId, 'bs-04a-represent');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-bad-solve' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-represent-gaussian');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-compose-noise');
  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-authorship-source');
  assert.equal(state.currentNodeId, 'bs-04b-reveal');
  assert.ok(narrativeKnownFacts(state).some((fact) => fact.id === 'fact-butterfly-authorship' && fact.state === 'verified'));

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-reveal-listen');
  assert.equal(state.currentNodeId, 'bs-05-public');
  assert.ok(state.flags.includes('institutional-boundary-written'));
  assert.ok(state.trust.ines > 0);

  state = applyNarrativeChoice(butterflyScholarNarrativePack, state, 'bs-archive-open');
  assert.equal(state.currentNodeId, 'bs-end');
  assert.ok(state.flags.includes('butterfly-route-complete'));
});

test('forcing reconstruction creates a visible failure state before representation', () => {
  let state = createNarrativeState(butterflyScholarNarrativePack);
  for (const choiceId of ['bs-go-open', 'bs-arrival-prior', 'bs-capture-site', 'bs-audit-leave', 'bs-align-force']) {
    state = applyNarrativeChoice(butterflyScholarNarrativePack, state, choiceId);
  }
  assert.ok(state.flags.includes('capture-gap-debt'));
  assert.ok(state.flags.includes('forced-reconstruct-bad-solve'));
  assert.equal(state.currentNodeId, 'bs-04x-failure');
});

test('a failed build can be preserved then repaired without erasing the evidence', () => {
  const route = playRoute([
    'bs-go-open', 'bs-arrival-prior', 'bs-capture-site', 'bs-audit-leave', 'bs-align-force', 'bs-failure-repair',
    'bs-represent-pointcloud', 'bs-compose-noise', 'bs-authorship-source', 'bs-reveal-listen', 'bs-archive-open'
  ]);
  assert.ok(route.state.flags.includes('failure-kept'));
  assert.ok(route.state.flags.includes('solve-repaired'));
  assert.ok(route.world.evidenceIds.includes('ev-failed-reconstruction-kept'));
  assert.ok(route.world.achievementIds.includes('ach-keep-the-failure'));
  const outcome = deriveButterflyOutcome(route.state, route.world);
  assert.ok(outcome.headline.includes('修回'));
  assert.ok(!outcome.unresolved.some((item) => item.includes('相机求解')));
  assert.ok(outcome.unresolved.some((item) => item.includes('覆盖缺口')));
});

test('world effects connect choices to reusable nodes, methods, contextual achievements and records', () => {
  assert.ok(butterflyWorldEffectsByChoice['bs-capture-relation'].unlockNodeIds.includes('capture-motion-video'));
  assert.ok(butterflyWorldEffectsByChoice['bs-audit-recapture'].achievementIds.includes('ach-field-check'));
  assert.ok(butterflyWorldEffectsByChoice['bs-failure-repair'].achievementIds.includes('ach-keep-the-failure'));
  assert.ok(butterflyWorldEffectsByChoice['bs-represent-gaussian'].unlockNodeIds.includes('process-gaussian-splat'));
  assert.ok(butterflyWorldEffectsByChoice['bs-compose-noise'].unlockNodeIds.includes('process-blender-procedural'));
  assert.ok(butterflyWorldEffectsByChoice['bs-authorship-source'].unlockNodeIds.includes('method-source-attribution'));
  assert.ok(butterflyWorldEffectsByChoice['bs-archive-open'].archiveEntryIds.includes('archive-butterfly-route'));
  assert.ok(deriveButterflyWorldEffect(['field-recapture'], 'bs-align-diagnose').achievementIds.includes('ach-clean-solve'));
  assert.ok(deriveButterflyWorldEffect(['capture-relation-route'], 'bs-compose-interactive').achievementIds.includes('ach-observation-to-system'));
});

test('every visible Butterfly decision has a readable non-spoiler consequence hint', () => {
  const choiceIds = butterflyScholarNarrativePack.nodes.flatMap((node) => node.choices.map((choice) => choice.id));
  for (const choiceId of choiceIds) assert.ok(butterflyChoiceOutcomeHints[choiceId], `missing outcome hint for ${choiceId}`);
  assert.ok(butterflyChoiceOutcomeHints['bs-audit-leave'].includes('缺口'));
  assert.ok(butterflyChoiceOutcomeHints['bs-failure-use'].includes('脆弱'));
  assert.ok(!butterflyChoiceOutcomeHints['bs-audit-leave'].includes('失败结局'));
});

test('field decisions change later technical text rather than only adding flags', () => {
  const base = butterflyScholarNarrativePack.nodes.find((node) => node.id === 'bs-04-process').text;
  const repaired = resolveButterflyNodeText('bs-04-process', ['field-recapture'], base).join(' ');
  const gap = resolveButterflyNodeText('bs-04-process', ['capture-gap-debt'], base).join(' ');
  assert.ok(repaired.includes('76 张'));
  assert.ok(gap.includes('61 张'));
  assert.notEqual(repaired, gap);
});

test('the same special chapter produces materially different public feedback, archive and public draft', () => {
  const disciplined = playRoute([
    'bs-go-question', 'bs-arrival-work', 'bs-capture-relation', 'bs-audit-recapture', 'bs-align-diagnose',
    'bs-represent-gaussian', 'bs-compose-interactive', 'bs-authorship-system', 'bs-reveal-listen', 'bs-archive-open'
  ]);
  const fragile = playRoute([
    'bs-go-open', 'bs-arrival-prior', 'bs-capture-site', 'bs-audit-leave', 'bs-align-force', 'bs-failure-use',
    'bs-represent-pointcloud', 'bs-compose-noise', 'bs-authorship-defend', 'bs-reveal-distance', 'bs-archive-open'
  ]);

  const cleanOutcome = deriveButterflyOutcome(disciplined.state, disciplined.world);
  const fragileOutcome = deriveButterflyOutcome(fragile.state, fragile.world);

  assert.ok(cleanOutcome.headline.includes('系统'));
  assert.ok(fragileOutcome.headline.includes('断裂'));
  assert.notEqual(cleanOutcome.headline, fragileOutcome.headline);
  assert.ok(cleanOutcome.publicNotes.some((note) => note.speaker.includes('Rojas') && note.text.includes('可信')));
  assert.ok(fragileOutcome.publicNotes.some((note) => note.speaker.includes('Rojas') && note.text.includes('采集缺口')));
  assert.ok(fragileOutcome.unresolved.some((item) => item.includes('覆盖缺口')));
  assert.ok(fragileOutcome.unresolved.some((item) => item.includes('相机求解')));
  assert.ok(fragileOutcome.unresolved.some((item) => item.includes('为什么一定是蝴蝶')));
  assert.notEqual(cleanOutcome.socialDraft, fragileOutcome.socialDraft);
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
