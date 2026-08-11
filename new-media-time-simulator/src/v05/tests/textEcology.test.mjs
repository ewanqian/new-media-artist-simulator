import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeById } from '../knowledgeBase.ts';
import { spatialFacilities, spatialRegions } from '../locationGraph.ts';
import { contactSeeds, placeCards } from '../legacyDeck.ts';
import {
  contextualFragments,
  relationshipEdges,
  relationshipEdgesFor,
  worldTextFragments
} from '../textEcology.ts';
import {
  experienceStream,
  fragmentsForPlaceCard,
  placeCardHasEcology
} from '../textEcologyExperience.ts';

const regionIds = new Set(spatialRegions.map((item) => item.id));
const facilityIds = new Set(spatialFacilities.map((item) => item.id));
const contactIds = new Set(contactSeeds.map((item) => item.id));

test('text ecology uses stable ids and valid world references', () => {
  assert.equal(new Set(worldTextFragments.map((item) => item.id)).size, worldTextFragments.length);
  assert.ok(worldTextFragments.length >= 24);
  for (const fragment of worldTextFragments) {
    for (const id of fragment.regionIds || []) assert.ok(regionIds.has(id), `${fragment.id} references missing region ${id}`);
    for (const id of fragment.facilityIds || []) assert.ok(facilityIds.has(id), `${fragment.id} references missing facility ${id}`);
    for (const id of fragment.contactIds || []) assert.ok(contactIds.has(id), `${fragment.id} references missing contact ${id}`);
    for (const id of fragment.relatedKnowledgeIds || []) assert.ok(knowledgeById.has(id), `${fragment.id} references missing knowledge ${id}`);
    if (fragment.kind === 'rumor') assert.equal(fragment.layer, 'rumor');
  }
});

test('current card-first places can resolve into the deeper text world', () => {
  for (const place of placeCards) {
    assert.equal(placeCardHasEcology(place.id), true, `${place.id} has no text-ecology context`);
    assert.ok(fragmentsForPlaceCard(place.id, 2, 3).length > 0, `${place.id} produces no fragments`);
  }
});

test('context selection is deterministic while mixing source layers', () => {
  const context = { week: 3, regionId: 'region-westbund', facilityId: 'westbund-blackbox', projectStageId: 'testable', limit: 3 };
  const first = contextualFragments(context).map((item) => item.id);
  const second = contextualFragments(context).map((item) => item.id);
  assert.deepEqual(first, second);
  assert.ok(first.length >= 2);
  const layers = new Set(contextualFragments(context).map((item) => item.layer));
  assert.ok(layers.size >= 2);
});

test('contact graph connects existing people instead of adding affection bars', () => {
  assert.ok(relationshipEdges.length >= 6);
  assert.equal(new Set(relationshipEdges.map((item) => item.id)).size, relationshipEdges.length);
  for (const edge of relationshipEdges) {
    assert.ok(contactIds.has(edge.fromContactId));
    assert.ok(contactIds.has(edge.toContactId));
    assert.notEqual(edge.fromContactId, edge.toContactId);
  }
  assert.ok(relationshipEdgesFor('contact-lin').length > 0);
});

test('experience stream responds to what the player just did', () => {
  const fresh = experienceStream(1, [], [], 'clue', 3).map((item) => item.id);
  const afterStudio = experienceStream(1, ['studio-media-archaeology'], [], 'prototype', 3).map((item) => item.id);
  const afterPlace = experienceStream(2, ['studio-minimum-system'], ['place-blackbox'], 'testable', 3).map((item) => item.id);
  assert.notDeepEqual(afterStudio, fresh);
  assert.notDeepEqual(afterPlace, afterStudio);
});
