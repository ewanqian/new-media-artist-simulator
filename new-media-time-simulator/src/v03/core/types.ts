export type StatKey =
  | 'insight'
  | 'funds'
  | 'reputation'
  | 'stamina'
  | 'anxiety'
  | 'archive'
  | 'network'
  | 'tech';

export type Stats = Record<StatKey, number>;

export type LoadoutSlot =
  | 'methodology'
  | 'tool'
  | 'interface'
  | 'survival'
  | 'wildcard'
  | 'vehicle'
  | 'companion';

export type AssetPersistence = 'run' | 'profile' | 'account';

export type ProjectState =
  | 'idea'
  | 'proposal'
  | 'accepted'
  | 'production'
  | 'blocked'
  | 'patched'
  | 'shown'
  | 'archived'
  | 'cancelled'
  | 'abandoned'
  | 'repurposed';

export interface AssetTemplate {
  id: string;
  name: string;
  kind: 'tool' | 'method' | 'document' | 'media' | 'vehicle' | 'module' | 'oddity';
  persistence?: AssetPersistence;
  initialDurability?: number | null;
  tags?: string[];
  slots?: LoadoutSlot[];
  mediaRef?: string;
}

export interface AssetInstance {
  instanceId: string;
  templateId: string;
  createdAt: string;
  persistence: AssetPersistence;
  durability: number | null;
  tags: string[];
  boundTo: string | null;
  customData: Record<string, unknown>;
  destroyedAt: string | null;
}

export interface ProjectInstance {
  projectId: string;
  templateId: string;
  state: ProjectState;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  remainingTurns?: number;
}

export interface FactionState {
  factionId: string;
  fame: number;
  infamy: number;
  membership: 'affiliate' | 'member' | 'core' | 'hostile' | null;
  obligations: string[];
  privileges: string[];
}

export interface InstitutionState {
  institutionId: string;
  templateId: string;
  name: string;
  state: 'inactive' | 'operating' | 'strained' | 'crisis' | 'recovered' | 'closed';
  metrics: Record<string, number>;
  assetInstanceIds: string[];
  tags: string[];
}

export interface MediaRecord {
  mediaId: string;
  templateId: string;
  collectedAt: string;
  sourceEventId?: string;
  tags: string[];
}

export interface ScheduledEvent {
  eventId: string;
  dueTurn: number;
  source: string | null;
}

export interface HistoryEntry {
  sequence: number;
  commandId: string;
  commandType: string;
  turn: number;
  input: unknown;
  consumesTurn: boolean;
  effects: Effect[];
  rng: { namespace: string; sequence: number; roll: number };
  contentVersion: string | null;
  systemRecords: unknown[];
  createdAt: string;
}

export interface GameStateV1 {
  schemaVersion: 1;
  engineVersion: string;
  saveId: string;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  turn: number;
  phase: number;
  seed: string;
  revision: number;
  profile: {
    displayName: string;
    archetypeId: string | null;
    identityTags: string[];
    credentials: string[];
    metaTitles: string[];
  };
  stats: Stats;
  loadout: Record<LoadoutSlot, string | null>;
  inventory: { assetInstanceIds: string[] };
  assets: { byId: Record<string, AssetInstance> };
  projects: {
    byId: Record<string, ProjectInstance>;
    activeIds: string[];
    archivedIds: string[];
  };
  factions: { byId: Record<string, FactionState> };
  institutions: { byId: Record<string, InstitutionState> };
  wallet: {
    credits: number;
    vouchers: string[];
    ledger: Array<{ transactionId: string; delta: number; reason: string; createdAt: string }>;
  };
  media: { byId: Record<string, MediaRecord>; collectedIds: string[] };
  world: {
    currentRegionId: string | null;
    currentSubmapId: string | null;
    flags: string[];
    conditions: string[];
  };
  scheduledEvents: ScheduledEvent[];
  history: HistoryEntry[];
  meta: {
    contentVersions: Record<string, string>;
    unlockedContent: string[];
    achievements: string[];
    seenEventIds: string[];
  };
}

export type Effect =
  | { type: 'stat.delta'; key: StatKey; value: number }
  | { type: 'asset.spawn'; templateId: string; instanceId?: string; persistence?: AssetPersistence; tags?: string[]; customData?: Record<string, unknown> }
  | { type: 'asset.consume'; instanceId: string }
  | { type: 'asset.tag.add'; instanceId: string; tag: string }
  | { type: 'asset.tag.remove'; instanceId: string; tag: string }
  | { type: 'loadout.equip'; slot: LoadoutSlot; instanceId: string }
  | { type: 'loadout.unequip'; slot: LoadoutSlot }
  | { type: 'player.tag.add'; tag: string }
  | { type: 'player.tag.remove'; tag: string }
  | { type: 'credential.issue'; credentialId: string }
  | { type: 'faction.reputation'; factionId: string; fame?: number; infamy?: number }
  | { type: 'faction.membership'; factionId: string; membership: FactionState['membership'] }
  | { type: 'project.spawn'; projectId: string; templateId: string; state?: ProjectState; tags?: string[]; remainingTurns?: number }
  | { type: 'project.transition'; projectId: string; to: ProjectState }
  | { type: 'project.tag.add'; projectId: string; tag: string }
  | { type: 'event.schedule'; eventId: string; afterTurns: number; source?: string }
  | { type: 'world.flag.add'; flag: string }
  | { type: 'world.flag.remove'; flag: string }
  | { type: 'world.condition.add'; condition: string }
  | { type: 'world.condition.remove'; condition: string }
  | { type: 'institution.spawn'; institutionId: string; templateId: string; name: string; tags?: string[]; metrics?: Record<string, number> }
  | { type: 'institution.metric'; institutionId: string; key: string; delta: number }
  | { type: 'institution.asset.attach'; institutionId: string; instanceId: string }
  | { type: 'media.collect'; mediaId: string; templateId: string; sourceEventId?: string; tags?: string[] }
  | { type: 'meta.unlock'; unlockId: string }
  | { type: 'meta.title.unlock'; title: string }
  | { type: 'wallet.credit'; delta: number; transactionId?: string; reason?: string };

export interface Command<TPayload = unknown> {
  id: string;
  type: string;
  payload?: TPayload;
  contentVersion?: string;
}

export interface CommandResolution {
  accepted?: boolean;
  reason?: string;
  consumesTurn?: boolean;
  effects?: Effect[];
  records?: unknown[];
}

export interface EngineContext {
  now: () => string;
  createId: (prefix: string) => string;
  resolveAssetTemplate: (templateId: string) => AssetTemplate | null;
}
