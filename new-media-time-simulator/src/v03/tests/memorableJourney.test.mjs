import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameStateV1 } from '../core/state.ts';
import { createContentRegistry } from '../core/contentPack.ts';
import { createCoreCommandHandlers } from '../core/commands.ts';
import { createTurnEngine } from '../core/turnEngine.ts';
import { memorableJourneyPack } from '../content/memorableJourney.ts';

const FIXED_NOW = '2026-08-10T06:30:00.000Z';

function createHarness(seed = 'memorable-run-001') {
  const registry = createContentRegistry([memorableJourneyPack]);
  let idCounter = 0;
  const engine = createTurnEngine({
    commandHandlers: createCoreCommandHandlers(registry),
    resolveAssetTemplate: (id) => registry.getAsset(id),
    now: () => FIXED_NOW,
    createId: (prefix) => `${prefix}-generated-${++idCounter}`
  });
  return { registry, engine, state: createGameStateV1({ seed, saveId: 'save-test-001', createdAt: FIXED_NOW }) };
}

function resolve(engine, state, n, eventId, choiceId) {
  return engine.dispatch(state, {
    id: `cmd-event-${n}`,
    type: 'event.resolve',
    contentVersion: 'core.memorable-journey@0.3.0',
    payload: { eventId, choiceId }
  });
}

function equip(engine, state, n, slot, instanceId) {
  return engine.dispatch(state, {
    id: `cmd-equip-${n}`,
    type: 'loadout.equip',
    payload: { slot, instanceId }
  });
}

function runGoldenPath(seed = 'memorable-run-001') {
  const harness = createHarness(seed);
  let state = harness.state;

  state = resolve(harness.engine, state, 1, 'event.01-inheritance', 'keep-it').state;
  state = resolve(harness.engine, state, 2, 'event.02-frame-drop', 'keep-all-versions').state;
  state = resolve(harness.engine, state, 3, 'event.03-faction-invite', 'affiliate-with-friction').state;
  state = resolve(harness.engine, state, 4, 'event.04-budget-collapse', 'salvage-the-failure').state;

  const lockedAttempt = resolve(harness.engine, state, 5, 'event.05-combination', 'make-disaster-drivable');
  assert.equal(lockedAttempt.result.accepted, false);
  assert.equal(lockedAttempt.result.reason, 'choice-locked:make-disaster-drivable');
  assert.deepEqual(lockedAttempt.state, state, 'rejected command must not mutate state');

  state = equip(harness.engine, state, 1, 'methodology', 'asset-instance.failure-method-001').state;
  state = equip(harness.engine, state, 2, 'tool', 'asset-instance.hdmi-001').state;
  state = equip(harness.engine, state, 3, 'survival', 'asset-instance.budget-001').state;
  state = equip(harness.engine, state, 4, 'vehicle', 'asset-instance.cargo-001').state;

  state = resolve(harness.engine, state, 5, 'event.05-combination', 'make-disaster-drivable').state;
  state = resolve(harness.engine, state, 6, 'event.06-institution', 'found-office').state;
  state = resolve(harness.engine, state, 7, 'event.07-viral-post', 'do-not-explain').state;
  state = resolve(harness.engine, state, 8, 'event.08-ssd-rescue', 'keep-the-scar').state;
  state = resolve(harness.engine, state, 9, 'event.09-mech', 'build-mk1').state;
  state = resolve(harness.engine, state, 10, 'event.10-archive', 'archive-with-contradiction').state;

  return { ...harness, state };
}

test('10 memorable moments compose through the same core primitives', () => {
  const { state } = runGoldenPath();

  assert.equal(state.turn, 7, 'only six journey choices consume a work unit');
  assert.equal(state.phase, 2);
  assert.equal(state.history.length, 14, '10 events + 4 loadout changes');

  assert.equal(state.assets.byId['asset-instance.hdmi-001'].persistence, 'profile');
  assert.equal(state.assets.byId['asset-instance.ssd-001'].persistence, 'profile');
  assert.ok(state.assets.byId['asset-instance.ssd-001'].tags.includes('archive-anchor'));
  assert.ok(state.assets.byId['asset-instance.mech-001'].tags.includes('portable-infrastructure'));

  assert.equal(state.loadout.methodology, 'asset-instance.failure-method-001');
  assert.equal(state.loadout.tool, 'asset-instance.hdmi-001');
  assert.equal(state.loadout.survival, 'asset-instance.budget-001');
  assert.equal(state.loadout.vehicle, 'asset-instance.cargo-001');

  assert.equal(state.projects.byId['project.blackbox-001'].state, 'archived');
  assert.ok(state.projects.byId['project.blackbox-001'].tags.includes('emergent-combo'));

  const faction = state.factions.byId['faction.academic-new-media'];
  assert.equal(faction.membership, 'affiliate');
  assert.equal(faction.fame, 10);
  assert.equal(faction.infamy, 10);

  const institution = state.institutions.byId['institution.temp-office-001'];
  assert.equal(institution.name, '临时艺术基础设施办公室');
  assert.equal(institution.metrics.visibility, 7);
  assert.deepEqual(institution.assetInstanceIds, ['asset-instance.frame-001']);

  assert.equal(state.media.collectedIds.length, 3);
  assert.ok(state.world.conditions.includes('viral-micro-space'));
  assert.ok(state.meta.unlockedContent.includes('asset.logistics-mech-mk1'));
  assert.ok(state.profile.metaTitles.includes('制度欢迎的麻烦制造者'));
});

test('same seed + same commands produce a replayable state', () => {
  const first = runGoldenPath('fixed-seed').state;
  const second = runGoldenPath('fixed-seed').state;
  assert.deepEqual(second, first);
});

test('duplicate command id is idempotent', () => {
  const { engine, state: initial } = createHarness();
  const first = resolve(engine, initial, 1, 'event.01-inheritance', 'keep-it');
  const duplicate = resolve(engine, first.state, 1, 'event.01-inheritance', 'keep-it');
  assert.equal(duplicate.result.duplicate, true);
  assert.deepEqual(duplicate.state, first.state);
  assert.equal(duplicate.state.inventory.assetInstanceIds.length, 1);
});
