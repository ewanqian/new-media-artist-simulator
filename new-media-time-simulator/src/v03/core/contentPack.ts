import type { AssetTemplate, Effect, GameStateV1 } from './types.ts';

export type Condition =
  | { type: 'player.tag'; tag: string }
  | { type: 'world.flag'; flag: string }
  | { type: 'world.condition'; condition: string }
  | { type: 'faction.membership'; factionId: string; membership: string }
  | { type: 'faction.fameAtLeast'; factionId: string; value: number }
  | { type: 'faction.infamyAtLeast'; factionId: string; value: number }
  | { type: 'asset.tag.equipped'; tag: string }
  | { type: 'asset.tag.owned'; tag: string }
  | { type: 'project.state'; projectId: string; state: string }
  | { type: 'institution.exists'; institutionId: string };

export interface MediaTemplate {
  id: string;
  kind: 'image' | 'mock-post' | 'audio' | 'video' | 'document';
  src?: string;
  alt?: string;
  aspectRatio?: string;
  sharePreset?: string;
  tags?: string[];
}

export interface EventChoiceTemplate {
  id: string;
  label: string;
  requires?: Condition[];
  consumesTurn: boolean;
  effects: Effect[];
}

export interface EventTemplate {
  id: string;
  title: string;
  category: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  lenses: {
    neutral: string;
    hype: string;
    satire: string;
  };
  mediaTemplateIds?: string[];
  choices: EventChoiceTemplate[];
  tags?: string[];
}

export interface ContentPack {
  manifest: {
    id: string;
    version: string;
    engine: string;
    kind: 'data';
    dependencies?: Record<string, string>;
  };
  assets: AssetTemplate[];
  media: MediaTemplate[];
  events: EventTemplate[];
}

const STABLE_ID = /^[a-z0-9][a-z0-9._-]*$/;
const VERSION = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i;

function assertStableId(value: string, label: string): void {
  if (!STABLE_ID.test(value)) throw new Error(`${label} must be a stable lowercase id: ${value}`);
}

function assertUnique(items: Array<{ id: string }>, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    assertStableId(item.id, `${label} id`);
    if (seen.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    seen.add(item.id);
  }
}

export function validateContentPack(pack: ContentPack): ContentPack {
  assertStableId(pack.manifest.id, 'pack id');
  if (!VERSION.test(pack.manifest.version)) throw new Error(`Invalid pack version: ${pack.manifest.version}`);
  if (pack.manifest.kind !== 'data') throw new Error('Remote content packs must be data-only.');
  assertUnique(pack.assets, 'asset');
  assertUnique(pack.media, 'media');
  assertUnique(pack.events, 'event');

  const mediaIds = new Set(pack.media.map((item) => item.id));
  for (const event of pack.events) {
    assertUnique(event.choices, `choice in ${event.id}`);
    for (const mediaId of event.mediaTemplateIds ?? []) {
      if (!mediaIds.has(mediaId)) throw new Error(`Event ${event.id} references missing media: ${mediaId}`);
    }
  }
  return pack;
}

export function createContentRegistry(packs: ContentPack[]) {
  const validated = packs.map(validateContentPack);
  const assets = new Map<string, AssetTemplate>();
  const media = new Map<string, MediaTemplate>();
  const events = new Map<string, EventTemplate>();

  for (const pack of validated) {
    for (const item of pack.assets) {
      if (assets.has(item.id)) throw new Error(`Asset id collision across packs: ${item.id}`);
      assets.set(item.id, item);
    }
    for (const item of pack.media) {
      if (media.has(item.id)) throw new Error(`Media id collision across packs: ${item.id}`);
      media.set(item.id, item);
    }
    for (const item of pack.events) {
      if (events.has(item.id)) throw new Error(`Event id collision across packs: ${item.id}`);
      events.set(item.id, item);
    }
  }

  return {
    packVersions: Object.fromEntries(validated.map((pack) => [pack.manifest.id, pack.manifest.version])),
    getAsset(id: string) { return assets.get(id) ?? null; },
    getMedia(id: string) { return media.get(id) ?? null; },
    getEvent(id: string) { return events.get(id) ?? null; },
    listEvents() { return [...events.values()]; }
  };
}

export function matchesCondition(state: GameStateV1, condition: Condition): boolean {
  switch (condition.type) {
    case 'player.tag': return state.profile.identityTags.includes(condition.tag);
    case 'world.flag': return state.world.flags.includes(condition.flag);
    case 'world.condition': return state.world.conditions.includes(condition.condition);
    case 'faction.membership': return state.factions.byId[condition.factionId]?.membership === condition.membership;
    case 'faction.fameAtLeast': return (state.factions.byId[condition.factionId]?.fame ?? 0) >= condition.value;
    case 'faction.infamyAtLeast': return (state.factions.byId[condition.factionId]?.infamy ?? 0) >= condition.value;
    case 'asset.tag.equipped':
      return Object.values(state.loadout).some((instanceId) => instanceId && state.assets.byId[instanceId]?.tags.includes(condition.tag));
    case 'asset.tag.owned':
      return state.inventory.assetInstanceIds.some((instanceId) => state.assets.byId[instanceId]?.tags.includes(condition.tag));
    case 'project.state': return state.projects.byId[condition.projectId]?.state === condition.state;
    case 'institution.exists': return Boolean(state.institutions.byId[condition.institutionId]);
  }
}

export function isChoiceAvailable(state: GameStateV1, choice: EventChoiceTemplate): boolean {
  return (choice.requires ?? []).every((condition) => matchesCondition(state, condition));
}
