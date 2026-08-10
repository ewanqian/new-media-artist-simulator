import { assertProjectState, createAssetInstance } from './state.ts';
import type { AssetTemplate, Effect, EngineContext, FactionState, GameStateV1 } from './types.ts';

const cloneState = (state: GameStateV1): GameStateV1 => structuredClone(state);
const addUnique = <T>(list: T[], value: T): T[] => (list.includes(value) ? list : [...list, value]);
const removeValue = <T>(list: T[], value: T): T[] => list.filter((item) => item !== value);

function ensureFaction(state: GameStateV1, factionId: string): FactionState {
  state.factions.byId[factionId] ??= {
    factionId,
    fame: 0,
    infamy: 0,
    membership: null,
    obligations: [],
    privileges: []
  };
  return state.factions.byId[factionId];
}

function requireAssetTemplate(context: EngineContext, templateId: string): AssetTemplate {
  const template = context.resolveAssetTemplate(templateId);
  if (!template) throw new Error(`Unknown asset template: ${templateId}`);
  return template;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled effect: ${JSON.stringify(value)}`);
}

export function applyEffect(inputState: GameStateV1, effect: Effect, context: EngineContext): GameStateV1 {
  const state = cloneState(inputState);

  switch (effect.type) {
    case 'stat.delta':
      state.stats[effect.key] += effect.value;
      break;

    case 'asset.spawn': {
      const template = requireAssetTemplate(context, effect.templateId);
      const instance = createAssetInstance(template, {
        instanceId: effect.instanceId ?? context.createId('asset'),
        createdAt: context.now(),
        persistence: effect.persistence,
        tags: effect.tags,
        customData: effect.customData
      });
      state.assets.byId[instance.instanceId] = instance;
      state.inventory.assetInstanceIds = addUnique(state.inventory.assetInstanceIds, instance.instanceId);
      break;
    }

    case 'asset.consume': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset || asset.destroyedAt) throw new Error(`Cannot consume missing asset: ${effect.instanceId}`);
      asset.destroyedAt = context.now();
      state.inventory.assetInstanceIds = removeValue(state.inventory.assetInstanceIds, effect.instanceId);
      for (const slot of Object.keys(state.loadout) as Array<keyof GameStateV1['loadout']>) {
        if (state.loadout[slot] === effect.instanceId) state.loadout[slot] = null;
      }
      break;
    }

    case 'asset.tag.add': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset) throw new Error(`Unknown asset: ${effect.instanceId}`);
      asset.tags = addUnique(asset.tags, effect.tag);
      break;
    }

    case 'asset.tag.remove': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset) throw new Error(`Unknown asset: ${effect.instanceId}`);
      asset.tags = removeValue(asset.tags, effect.tag);
      break;
    }

    case 'loadout.equip': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset || asset.destroyedAt) throw new Error(`Cannot equip missing asset: ${effect.instanceId}`);
      state.loadout[effect.slot] = effect.instanceId;
      break;
    }

    case 'loadout.unequip':
      state.loadout[effect.slot] = null;
      break;

    case 'player.tag.add':
      state.profile.identityTags = addUnique(state.profile.identityTags, effect.tag);
      break;

    case 'player.tag.remove':
      state.profile.identityTags = removeValue(state.profile.identityTags, effect.tag);
      break;

    case 'credential.issue':
      state.profile.credentials = addUnique(state.profile.credentials, effect.credentialId);
      break;

    case 'faction.reputation': {
      const faction = ensureFaction(state, effect.factionId);
      faction.fame += effect.fame ?? 0;
      faction.infamy += effect.infamy ?? 0;
      break;
    }

    case 'faction.membership':
      ensureFaction(state, effect.factionId).membership = effect.membership;
      break;

    case 'project.spawn': {
      if (state.projects.byId[effect.projectId]) throw new Error(`Project already exists: ${effect.projectId}`);
      const now = context.now();
      const projectState = assertProjectState(effect.state ?? 'idea');
      state.projects.byId[effect.projectId] = {
        projectId: effect.projectId,
        templateId: effect.templateId,
        state: projectState,
        createdAt: now,
        updatedAt: now,
        tags: [...new Set(effect.tags ?? [])],
        remainingTurns: effect.remainingTurns
      };
      if (projectState === 'archived') state.projects.archivedIds = addUnique(state.projects.archivedIds, effect.projectId);
      else state.projects.activeIds = addUnique(state.projects.activeIds, effect.projectId);
      break;
    }

    case 'project.transition': {
      const project = state.projects.byId[effect.projectId];
      if (!project) throw new Error(`Unknown project: ${effect.projectId}`);
      project.state = assertProjectState(effect.to);
      project.updatedAt = context.now();
      if (effect.to === 'archived' || effect.to === 'abandoned' || effect.to === 'repurposed' || effect.to === 'cancelled') {
        state.projects.activeIds = removeValue(state.projects.activeIds, effect.projectId);
      }
      if (effect.to === 'archived') state.projects.archivedIds = addUnique(state.projects.archivedIds, effect.projectId);
      break;
    }

    case 'project.tag.add': {
      const project = state.projects.byId[effect.projectId];
      if (!project) throw new Error(`Unknown project: ${effect.projectId}`);
      project.tags = addUnique(project.tags, effect.tag);
      break;
    }

    case 'event.schedule':
      state.scheduledEvents.push({
        eventId: effect.eventId,
        dueTurn: state.turn + effect.afterTurns,
        source: effect.source ?? null
      });
      break;

    case 'world.flag.add':
      state.world.flags = addUnique(state.world.flags, effect.flag);
      break;

    case 'world.flag.remove':
      state.world.flags = removeValue(state.world.flags, effect.flag);
      break;

    case 'world.condition.add':
      state.world.conditions = addUnique(state.world.conditions, effect.condition);
      break;

    case 'world.condition.remove':
      state.world.conditions = removeValue(state.world.conditions, effect.condition);
      break;

    case 'institution.spawn': {
      if (state.institutions.byId[effect.institutionId]) throw new Error(`Institution already exists: ${effect.institutionId}`);
      state.institutions.byId[effect.institutionId] = {
        institutionId: effect.institutionId,
        templateId: effect.templateId,
        name: effect.name,
        state: 'operating',
        metrics: { ...(effect.metrics ?? {}) },
        assetInstanceIds: [],
        tags: [...new Set(effect.tags ?? [])]
      };
      break;
    }

    case 'institution.metric': {
      const institution = state.institutions.byId[effect.institutionId];
      if (!institution) throw new Error(`Unknown institution: ${effect.institutionId}`);
      institution.metrics[effect.key] = (institution.metrics[effect.key] ?? 0) + effect.delta;
      break;
    }

    case 'institution.asset.attach': {
      const institution = state.institutions.byId[effect.institutionId];
      if (!institution) throw new Error(`Unknown institution: ${effect.institutionId}`);
      const asset = state.assets.byId[effect.instanceId];
      if (!asset || asset.destroyedAt) throw new Error(`Cannot attach missing asset: ${effect.instanceId}`);
      institution.assetInstanceIds = addUnique(institution.assetInstanceIds, effect.instanceId);
      asset.boundTo = effect.institutionId;
      break;
    }

    case 'media.collect':
      state.media.byId[effect.mediaId] = {
        mediaId: effect.mediaId,
        templateId: effect.templateId,
        collectedAt: context.now(),
        sourceEventId: effect.sourceEventId,
        tags: [...new Set(effect.tags ?? [])]
      };
      state.media.collectedIds = addUnique(state.media.collectedIds, effect.mediaId);
      break;

    case 'meta.unlock':
      state.meta.unlockedContent = addUnique(state.meta.unlockedContent, effect.unlockId);
      break;

    case 'meta.title.unlock':
      state.profile.metaTitles = addUnique(state.profile.metaTitles, effect.title);
      break;

    case 'wallet.credit': {
      state.wallet.credits += effect.delta;
      state.wallet.ledger.push({
        transactionId: effect.transactionId ?? context.createId('wallet'),
        delta: effect.delta,
        reason: effect.reason ?? 'unspecified',
        createdAt: context.now()
      });
      break;
    }

    default:
      assertNever(effect);
  }

  state.updatedAt = context.now();
  return state;
}

export function applyEffects(state: GameStateV1, effects: readonly Effect[], context: EngineContext): GameStateV1 {
  return effects.reduce((current, effect) => applyEffect(current, effect, context), state);
}
