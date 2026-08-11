import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blueprintNodeDefinitions,
  blueprintPresets,
  createStarterCreativeProfile,
  createStressBlueprint,
  decodeBlueprintShareCode,
  encodeBlueprintShareCode,
  masteryLevelFromPoints,
  remixBlueprint,
  validateBlueprint
} from '../blueprintSystem.ts';
import { memorableMoments, questBooks, validateQuestBookShape } from '../questBookSystem.ts';

test('blueprint node library uses stable unique ids across extensible categories', () => {
  assert.ok(blueprintNodeDefinitions.length >= 30);
  const ids = blueprintNodeDefinitions.map((node) => node.id);
  assert.equal(new Set(ids).size, ids.length);
  const categories = new Set(blueprintNodeDefinitions.map((node) => node.category));
  for (const category of ['material', 'media', 'process', 'behavior', 'interface', 'spatial', 'lineage', 'constraint']) assert.ok(categories.has(category));
});

test('mastery stays four readable bands while points remain hidden under the hood', () => {
  assert.equal(masteryLevelFromPoints(0), 0);
  assert.equal(masteryLevelFromPoints(10), 1);
  assert.equal(masteryLevelFromPoints(30), 2);
  assert.equal(masteryLevelFromPoints(70), 3);
  assert.equal(masteryLevelFromPoints(999), 3);
});

test('starter blueprint produces explainable run build read diagnostics rather than one art score', () => {
  const profile = createStarterCreativeProfile();
  const result = validateBlueprint(blueprintPresets[0], profile);
  assert.equal(result.complexity.tier, 'medium');
  assert.deepEqual(Object.keys(result.diagnostics).sort(), ['build', 'read', 'run']);
  assert.equal('score' in result, false);
  assert.ok(result.diagnostics.run.reasons.length > 0);
  assert.ok(result.diagnostics.build.reasons.length > 0);
  assert.ok(result.diagnostics.read.reasons.length > 0);
});

test('locked mastery and resource shortages remain separate blockers', () => {
  const profile = createStarterCreativeProfile();
  const result = validateBlueprint(blueprintPresets[2], profile);
  assert.ok(result.lockedNodeIds.length > 0);
  assert.ok(result.masteryBlocks.length > 0);
  assert.ok(result.missingResources.length > 0);
});

test('blueprint share code round trips deterministically', () => {
  const source = blueprintPresets[1];
  const codeA = encodeBlueprintShareCode(source);
  const codeB = encodeBlueprintShareCode(source);
  assert.equal(codeA, codeB);
  assert.ok(codeA.startsWith('NMAS-BP1-'));
  const decoded = decodeBlueprintShareCode(codeA);
  assert.equal(decoded.id, source.id);
  assert.equal(decoded.title, source.title);
  assert.deepEqual(decoded.nodes.map((node) => node.id), [...source.nodes].sort((a, b) => a.id.localeCompare(b.id)).map((node) => node.id));
});

test('remix creates a genealogy branch without mutating its parent', () => {
  const parent = blueprintPresets[0];
  const remix = remixBlueprint(parent, 'bp-remix-test', '测试 Remix');
  assert.equal(remix.parentBlueprintId, parent.id);
  assert.equal(remix.revision, 1);
  remix.nodes[0].x += 100;
  assert.notEqual(remix.nodes[0].x, parent.nodes[0].x);
});

test('stress blueprint supports 28 nodes without dangling edges or identity collisions', () => {
  const stress = createStressBlueprint(28);
  assert.equal(stress.nodes.length, 28);
  assert.equal(stress.edges.length, 27);
  assert.equal(new Set(stress.nodes.map((node) => node.id)).size, 28);
  const result = validateBlueprint(stress, createStarterCreativeProfile());
  assert.equal(result.complexity.tier, 'stress');
  assert.equal(result.danglingEdges.length, 0);
  assert.ok(result.missingResources.length > 0 || result.masteryBlocks.length > 0 || result.lockedNodeIds.length > 0);
});

test('quest books use one repeatable six-stage lifecycle instead of bespoke minigames', () => {
  assert.equal(questBooks.filter((book) => book.kind === 'tutorial').length, 1);
  assert.ok(questBooks.filter((book) => book.kind !== 'tutorial').length >= 4);
  for (const book of questBooks) {
    assert.deepEqual(validateQuestBookShape(book), []);
    assert.deepEqual(book.stages.map((stage) => stage.kind), ['encounter', 'acquire', 'assemble', 'test', 'deploy', 'archive']);
  }
});

test('challenge content is data-driven and can reward nodes without changing the core loop', () => {
  const challenge = questBooks.find((book) => book.kind === 'challenge');
  assert.ok(challenge);
  assert.equal(challenge.repeatable, true);
  assert.ok(challenge.rewardNodeIds.length > 0);
  assert.ok(challenge.stages.some((stage) => stage.objectives.some((objective) => objective.signal === 'blueprint:stress-24')));
});

test('early framework contains deliberate memorable moments across multiple systems', () => {
  assert.ok(memorableMoments.length >= 8);
  const systems = new Set(memorableMoments.map((moment) => moment.system));
  for (const system of ['blueprint', 'field', 'pressure', 'records']) assert.ok(systems.has(system));
});
