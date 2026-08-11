import assert from 'node:assert/strict';
import test from 'node:test';
import {
  archiveCategories,
  capabilityFamilyGroups,
  hiddenMechanisms,
  openingEpisodeRuntime,
  openingQuestLine,
  peopleFamilyGroups,
  placeFamilyGroups,
  primaryLayers,
  signalFamilyGroups,
  triumphGroups,
  workActionGroups
} from '../playStructure.ts';

function values3x3(record, childKey) {
  const groups = Object.values(record);
  assert.equal(groups.length, 3);
  for (const group of groups) assert.equal(group[childKey].length, 3);
  return groups.flatMap((group) => group[childKey]);
}

test('game has exactly three first-level gameplay layers with three systems each', () => {
  assert.deepEqual(primaryLayers.map((layer) => layer.id), ['field', 'workbench', 'records']);
  for (const layer of primaryLayers) assert.equal(layer.systems.length, 3);
  const allIds = primaryLayers.flatMap((layer) => [layer.id, ...layer.systems.map((system) => system.id)]);
  assert.equal(new Set(allIds).size, allIds.length);
  assert.equal(allIds.includes('studio'), false);
  assert.equal(allIds.includes('episode'), false);
});

test('field uses three-by-three place people and signal indexes', () => {
  assert.equal(values3x3(placeFamilyGroups, 'families').length, 9);
  assert.equal(values3x3(peopleFamilyGroups, 'families').length, 9);
  assert.equal(values3x3(signalFamilyGroups, 'families').length, 9);
});

test('workbench uses three-by-three capability and action grammars', () => {
  assert.equal(values3x3(capabilityFamilyGroups, 'families').length, 9);
  assert.equal(values3x3(workActionGroups, 'verbs').length, 9);
  assert.ok(Object.values(workActionGroups).flatMap((group) => group.verbs).some((verb) => verb.id === 'preview'));
});

test('records expose quests archive and triumphs while episode stays internal', () => {
  const records = primaryLayers.find((layer) => layer.id === 'records');
  assert.deepEqual(records.systems.map((system) => system.id), ['quests', 'archive', 'triumphs']);
  assert.deepEqual(hiddenMechanisms, ['episode']);
  assert.equal(openingEpisodeRuntime.playerFacing, false);
  assert.equal(openingEpisodeRuntime.questLineIds.includes(openingQuestLine.id), true);
  assert.equal(openingEpisodeRuntime.replayPolicy, 'checkpoint');
});

test('archive starts with six durable top-level categories', () => {
  assert.deepEqual(archiveCategories.map((category) => category.id), ['people', 'places', 'projects', 'methods', 'media', 'ecology']);
  assert.equal(new Set(archiveCategories.map((category) => category.id)).size, 6);
});

test('opening main quest is visible as five quests rather than five episode menu chapters', () => {
  assert.equal(openingQuestLine.kind, 'main');
  assert.equal(openingQuestLine.quests.length, 5);
  assert.ok(openingQuestLine.quests.every((quest) => quest.objectives.length >= 2));
  assert.ok(openingQuestLine.quests.some((quest) => quest.objectives.some((objective) => objective.kind === 'dialogue')));
  assert.ok(openingQuestLine.quests.some((quest) => quest.objectives.some((objective) => objective.kind === 'time')));
  assert.ok(openingQuestLine.quests.some((quest) => quest.objectives.some((objective) => objective.kind === 'choice')));
});

test('triumphs are grouped as challenges sets and titles', () => {
  assert.deepEqual(triumphGroups.map((group) => group.id), ['challenges', 'sets', 'titles']);
});
