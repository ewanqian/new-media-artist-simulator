import assert from 'node:assert/strict';
import test from 'node:test';
import { actionCards, contactSeeds, placeCards, placeKinds, satiricalEvents, unlockSteps } from '../legacyDeck.ts';
import { knowledgeEntries } from '../knowledgeBase.ts';
import { archiveExpansion } from '../archiveExpansion.ts';

test('progressive onboarding opens systems in a small sequence', () => {
  assert.equal(unlockSteps[0].step, 0);
  assert.equal(unlockSteps.at(-1).step, 4);
  assert.match(unlockSteps[0].note, /工作室|档案/);
  assert.match(unlockSteps[4].note, /工作台/);
});

test('the opening card deck is intentionally small and readable', () => {
  const opening = actionCards.filter((card) => card.category === 'studio' && card.unlockAt === 0);
  assert.equal(opening.length, 3);
  assert.ok(opening.every((card) => card.summary.length > 8 && card.detail.length > card.summary.length));
  assert.ok(opening.some((card) => card.satire));
});

test('places are classified by use instead of city district', () => {
  assert.deepEqual(placeKinds, ['全部', '工作', '展示', '学习', '交流', '供应', '现场']);
  assert.ok(placeCards.length >= 8);
  assert.ok(placeCards.every((place) => place.transparent.length >= 3));
  assert.ok(placeCards.every((place) => !/浦东|普陀|徐汇|杨浦|黄浦/.test(place.title)));
});

test('contact discovery references real seeded contacts', () => {
  const ids = new Set(contactSeeds.map((contact) => contact.id));
  for (const card of actionCards) for (const id of card.discovers || []) assert.ok(ids.has(id));
  for (const place of placeCards) for (const id of place.discovers || []) assert.ok(ids.has(id));
  assert.ok(contactSeeds.every((contact) => contact.background && contact.howMet && contact.openingMessages.length >= 2));
});

test('archive inherits a much larger body of old research content', () => {
  const combined = [...knowledgeEntries, ...archiveExpansion];
  assert.ok(combined.length >= 30);
  assert.ok(archiveExpansion.some((entry) => entry.title.includes('媒体考古')));
  assert.ok(archiveExpansion.some((entry) => entry.title.includes('行动卡')));
});

test('satirical layer exists as a reusable event system', () => {
  assert.ok(satiricalEvents.length >= 4);
  assert.ok(satiricalEvents.every((event) => event.formal && event.plain && event.satire && event.choices.length >= 2));
});
