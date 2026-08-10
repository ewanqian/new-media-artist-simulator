import type { AssetInstance, AssetTemplate, GameStateV1, LoadoutSlot, ProjectState } from './types.ts';

export const GAME_SCHEMA_VERSION = 1 as const;
export const ENGINE_VERSION = '0.3.0-dev';

export const LOADOUT_SLOTS: readonly LoadoutSlot[] = [
  'methodology',
  'tool',
  'interface',
  'survival',
  'wildcard',
  'vehicle',
  'companion'
];

export const PROJECT_STATES: readonly ProjectState[] = [
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
];

const defaultNow = () => new Date().toISOString();
const fallbackId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function createGameStateV1(options: {
  createdAt?: string;
  saveId?: string;
  playerId?: string;
  displayName?: string;
  seed?: string;
} = {}): GameStateV1 {
  const createdAt = options.createdAt ?? defaultNow();
  const saveId = options.saveId ?? fallbackId('save');

  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
    saveId,
    playerId: options.playerId ?? 'local',
    createdAt,
    updatedAt: createdAt,
    turn: 1,
    phase: 1,
    seed: options.seed ?? saveId,
    revision: 0,
    profile: {
      displayName: options.displayName ?? '',
      archetypeId: null,
      identityTags: [],
      credentials: [],
      metaTitles: []
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
    loadout: Object.fromEntries(LOADOUT_SLOTS.map((slot) => [slot, null])) as GameStateV1['loadout'],
    inventory: { assetInstanceIds: [] },
    assets: { byId: {} },
    projects: { byId: {}, activeIds: [], archivedIds: [] },
    factions: { byId: {} },
    institutions: { byId: {} },
    wallet: { credits: 0, vouchers: [], ledger: [] },
    media: { byId: {}, collectedIds: [] },
    world: { currentRegionId: null, currentSubmapId: null, flags: [], conditions: [] },
    scheduledEvents: [],
    history: [],
    meta: { contentVersions: {}, unlockedContent: [], achievements: [], seenEventIds: [] }
  };
}

export function createAssetInstance(
  template: AssetTemplate,
  options: {
    instanceId?: string;
    createdAt?: string;
    persistence?: AssetInstance['persistence'];
    tags?: string[];
    customData?: Record<string, unknown>;
    boundTo?: string | null;
  } = {}
): AssetInstance {
  if (!template.id) throw new Error('Asset template requires a stable id.');

  const createdAt = options.createdAt ?? defaultNow();
  return {
    instanceId: options.instanceId ?? fallbackId('asset'),
    templateId: template.id,
    createdAt,
    persistence: options.persistence ?? template.persistence ?? 'run',
    durability: template.initialDurability ?? null,
    tags: [...new Set([...(template.tags ?? []), ...(options.tags ?? [])])],
    boundTo: options.boundTo ?? null,
    customData: options.customData ?? {},
    destroyedAt: null
  };
}

export function assertProjectState(value: string): ProjectState {
  if (!(PROJECT_STATES as readonly string[]).includes(value)) {
    throw new Error(`Unsupported project state: ${value}`);
  }
  return value as ProjectState;
}
