import test from 'node:test';
import assert from 'node:assert/strict';
import {
  worldNodes,
  practices,
  skills,
  computeTiers,
  evaluationLenses,
  sampleOpportunities
} from '../model.ts';

test('world map uses stable unique ids and valid adjacency', () => {
  const ids = new Set(worldNodes.map((node) => node.id));
  assert.equal(ids.size, worldNodes.length);
  for (const node of worldNodes) {
    assert.ok(node.x >= 0 && node.x <= 100);
    assert.ok(node.y >= 0 && node.y <= 100);
    assert.ok(node.depth >= 0);
    for (const adjacentId of node.adjacentIds) {
      assert.ok(ids.has(adjacentId), `${node.id} points to missing ${adjacentId}`);
    }
  }
});

test('starting practices are biases, not isolated classes', () => {
  const skillIds = new Set(skills.map((skill) => skill.id));
  assert.equal(practices.length, 6);
  for (const practice of practices) {
    assert.equal(practice.starterSkills.length, 3);
    assert.ok(practice.vocabulary.length >= 5);
    for (const skillId of practice.starterSkills) {
      assert.ok(skillIds.has(skillId), `${practice.id} references missing ${skillId}`);
    }
  }
});

test('capability tiers are monotonic thresholds', () => {
  const ranks = computeTiers.map((tier) => tier.rank);
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.equal(new Set(ranks).size, ranks.length);
});

test('opportunities reference real locations and contextual evaluation lenses', () => {
  const locationIds = new Set(worldNodes.map((node) => node.id));
  const lensIds = new Set(evaluationLenses.map((lens) => lens.id));
  for (const opportunity of sampleOpportunities) {
    assert.ok(locationIds.has(opportunity.locationId));
    assert.ok(lensIds.has(opportunity.lensId));
    assert.ok(opportunity.publicFacts.length >= 3);
    assert.ok(opportunity.hiddenSignals.length >= 3);
  }
});

test('skill language spans all six universal verbs', () => {
  const verbs = new Set(skills.flatMap((skill) => skill.verbs));
  for (const required of ['MAKE', 'TEST', 'READ', 'TALK', 'SHOW', 'ARCHIVE']) {
    assert.ok(verbs.has(required), `missing universal verb ${required}`);
  }
});
