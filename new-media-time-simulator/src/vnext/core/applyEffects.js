import { assertEffect, assertProjectState, createAssetInstance } from './contracts.js';

const cloneState = (state) => {
  if (typeof structuredClone === 'function') return structuredClone(state);
  return JSON.parse(JSON.stringify(state));
};

const addUnique = (list, value) => (list.includes(value) ? list : [...list, value]);
const removeValue = (list, value) => list.filter((item) => item !== value);

function ensureFaction(state, factionId) {
  if (!state.factions.byId[factionId]) {
    state.factions.byId[factionId] = {
      factionId,
      fame: 0,
      infamy: 0,
      membership: null,
      obligations: [],
      privileges: []
    };
  }
  return state.factions.byId[factionId];
}

export function applyEffect(inputState, rawEffect, context = {}) {
  const effect = assertEffect(rawEffect);
  const state = cloneState(inputState);

  switch (effect.type) {
    case 'stat.delta': {
      const current = Number(state.stats[effect.key] || 0);
      state.stats[effect.key] = current + Number(effect.value || 0);
      break;
    }

    case 'asset.spawn': {
      const template = context.resolveAssetTemplate?.(effect.templateId);
      if (!template) throw new Error(`Unknown asset template: ${effect.templateId}`);
      const instance = createAssetInstance(template, {
        instanceId: effect.instanceId || context.createId?.('asset'),
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
      asset.destroyedAt = context.now?.() || new Date().toISOString();
      state.inventory.assetInstanceIds = removeValue(state.inventory.assetInstanceIds, effect.instanceId);
      Object.entries(state.loadout).forEach(([slot, instanceId]) => {
        if (instanceId === effect.instanceId) state.loadout[slot] = null;
      });
      break;
    }

    case 'asset.tag.add': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset) throw new Error(`Unknown asset: ${effect.instanceId}`);
      asset.tags = addUnique(asset.tags || [], effect.tag);
      break;
    }

    case 'asset.tag.remove': {
      const asset = state.assets.byId[effect.instanceId];
      if (!asset) throw new Error(`Unknown asset: ${effect.instanceId}`);
      asset.tags = removeValue(asset.tags || [], effect.tag);
      break;
    }

    case 'loadout.equip': {
      if (!(effect.slot in state.loadout)) throw new Error(`Unknown loadout slot: ${effect.slot}`);
      const asset = state.assets.byId[effect.instanceId];
      if (!asset || asset.destroyedAt) throw new Error(`Cannot equip missing asset: ${effect.instanceId}`);
      state.loadout[effect.slot] = effect.instanceId;
      break;
    }

    case 'loadout.unequip': {
      if (!(effect.slot in state.loadout)) throw new Error(`Unknown loadout slot: ${effect.slot}`);
      state.loadout[effect.slot] = null;
      break;
    }

    case 'player.tag.add':
      state.profile.identityTags = addUnique(state.profile.identityTags, effect.tag);
      break;

    case 'player.tag.remove':
      state.profile.identityTags = removeValue(state.profile.identityTags, effect.tag);
      break;

    case 'faction.reputation': {
      const faction = ensureFaction(state, effect.factionId);
      faction.fame += Number(effect.fame || 0);
      faction.infamy += Number(effect.infamy || 0);
      break;
    }

    case 'faction.membership': {
      const faction = ensureFaction(state, effect.factionId);
      faction.membership = effect.membership || null;
      break;
    }

    case 'project.transition': {
      const project = state.projects.byId[effect.projectId];
      if (!project) throw new Error(`Unknown project: ${effect.projectId}`);
      project.state = assertProjectState(effect.to);
      project.updatedAt = context.now?.() || new Date().toISOString();
      if (effect.to === 'archived') {
        state.projects.activeIds = removeValue(state.projects.activeIds, effect.projectId);
        state.projects.archivedIds = addUnique(state.projects.archivedIds, effect.projectId);
      }
      break;
    }

    case 'project.tag.add': {
      const project = state.projects.byId[effect.projectId];
      if (!project) throw new Error(`Unknown project: ${effect.projectId}`);
      project.tags = addUnique(project.tags || [], effect.tag);
      break;
    }

    case 'event.schedule':
      state.scheduledEvents.push({
        eventId: effect.eventId,
        dueTurn: state.turn + Number(effect.afterTurns || 0),
        source: effect.source || null
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

    case 'institution.metric': {
      const institution = state.institutions.byId[effect.institutionId];
      if (!institution) throw new Error(`Unknown institution: ${effect.institutionId}`);
      institution.metrics ||= {};
      institution.metrics[effect.key] = Number(institution.metrics[effect.key] || 0) + Number(effect.delta || 0);
      break;
    }

    case 'wallet.credit': {
      const delta = Number(effect.delta || 0);
      state.wallet.credits += delta;
      state.wallet.ledger.push({
        transactionId: effect.transactionId || context.createId?.('wallet') || `wallet-${state.revision + 1}`,
        delta,
        reason: effect.reason || 'unspecified',
        createdAt: context.now?.() || new Date().toISOString()
      });
      break;
    }

    default:
      throw new Error(`Unhandled effect type: ${effect.type}`);
  }

  state.updatedAt = context.now?.() || new Date().toISOString();
  return state;
}

export function applyEffects(state, effects = [], context = {}) {
  return effects.reduce((current, effect) => applyEffect(current, effect, context), state);
}
