export const GAME_SCHEMA_VERSION = 1;
export const ENGINE_VERSION = '0.3.0-dev';

export const PROJECT_STATES = Object.freeze([
  'idea',
  'proposal',
  'accepted',
  'production',
  'blocked',
  'patched',
  'shown',
  'archived',
  'cancelled',
  'abandoned',
  'repurposed'
]);

export const EFFECT_TYPES = Object.freeze([
  'stat.delta',
  'asset.spawn',
  'asset.consume',
  'asset.tag.add',
  'asset.tag.remove',
  'loadout.equip',
  'loadout.unequip',
  'player.tag.add',
  'player.tag.remove',
  'faction.reputation',
  'faction.membership',
  'project.transition',
  'project.tag.add',
  'event.schedule',
  'world.flag.add',
  'world.flag.remove',
  'world.condition.add',
  'world.condition.remove',
  'institution.metric',
  'wallet.credit'
]);

export const LOADOUT_SLOTS = Object.freeze([
  'methodology',
  'tool',
  'interface',
  'survival',
  'wildcard',
  'vehicle',
  'companion'
]);

export const ASSET_PERSISTENCE = Object.freeze(['run', 'profile', 'account']);

const nowIso = () => new Date().toISOString();
const fallbackId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function createGameStateV1(options = {}) {
  const createdAt = options.createdAt || nowIso();
  const saveId = options.saveId || fallbackId('save');
  const playerId = options.playerId || 'local';

  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
    saveId,
    playerId,
    createdAt,
    updatedAt: createdAt,
    turn: 1,
    phase: 1,
    seed: options.seed || saveId,
    revision: 0,

    profile: {
      displayName: options.displayName || '',
      archetypeId: null,
      identityTags: [],
      credentials: []
    },

    stats: {
      insight: 0,
      funds: 0,
      reputation: 0,
      stamina: 0,
      anxiety: 0,
      archive: 0,
      network: 0,
      tech: 0
    },

    loadout: Object.fromEntries(LOADOUT_SLOTS.map((slot) => [slot, null])),

    inventory: {
      assetInstanceIds: []
    },

    assets: {
      byId: {}
    },

    projects: {
      byId: {},
      activeIds: [],
      archivedIds: []
    },

    factions: {
      byId: {}
    },

    institutions: {
      byId: {}
    },

    wallet: {
      credits: 0,
      vouchers: [],
      ledger: []
    },

    world: {
      currentRegionId: null,
      currentSubmapId: null,
      flags: [],
      conditions: []
    },

    scheduledEvents: [],
    history: [],

    meta: {
      contentVersions: {},
      unlockedContent: [],
      achievements: [],
      seenEventIds: []
    }
  };
}

export function createAssetInstance(template, options = {}) {
  if (!template?.id) throw new Error('Asset template requires a stable id.');

  const instanceId = options.instanceId || fallbackId('asset');
  const createdAt = options.createdAt || nowIso();

  return {
    instanceId,
    templateId: template.id,
    createdAt,
    persistence: options.persistence || template.persistence || 'run',
    durability: options.durability ?? template.initialDurability ?? null,
    tags: [...new Set([...(template.tags || []), ...(options.tags || [])])],
    boundTo: options.boundTo || null,
    customData: options.customData || {},
    destroyedAt: null
  };
}

export function assertEffect(effect) {
  if (!effect || typeof effect !== 'object') {
    throw new Error('Effect must be an object.');
  }
  if (!EFFECT_TYPES.includes(effect.type)) {
    throw new Error(`Unsupported effect type: ${effect.type}`);
  }
  return effect;
}

export function assertProjectState(state) {
  if (!PROJECT_STATES.includes(state)) {
    throw new Error(`Unsupported project state: ${state}`);
  }
  return state;
}
