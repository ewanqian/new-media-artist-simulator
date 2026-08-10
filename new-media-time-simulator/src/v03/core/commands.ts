import { isChoiceAvailable, type EventChoiceTemplate } from './contentPack.ts';
import type { CommandHandler } from './turnEngine.ts';
import type { Effect, LoadoutSlot } from './types.ts';

export interface ContentRegistryLike {
  getEvent(id: string): {
    id: string;
    mediaTemplateIds?: string[];
    choices: EventChoiceTemplate[];
  } | null;
}

function payloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Command payload must be an object.');
  return payload as Record<string, unknown>;
}

export function createCoreCommandHandlers(registry: ContentRegistryLike): Record<string, CommandHandler> {
  return {
    'event.resolve': ({ state, command, sequence }) => {
      const payload = payloadObject(command.payload);
      const eventId = String(payload.eventId ?? '');
      const choiceId = String(payload.choiceId ?? '');
      const event = registry.getEvent(eventId);
      if (!event) return { accepted: false, reason: `unknown-event:${eventId}` };
      const choice = event.choices.find((item) => item.id === choiceId);
      if (!choice) return { accepted: false, reason: `unknown-choice:${choiceId}` };
      if (!isChoiceAvailable(state, choice)) return { accepted: false, reason: `choice-locked:${choiceId}` };

      const mediaEffects: Effect[] = (event.mediaTemplateIds ?? []).map((templateId, index) => ({
        type: 'media.collect',
        mediaId: `${event.id}:${templateId}:${sequence}:${index}`,
        templateId,
        sourceEventId: event.id,
        tags: ['event-evidence']
      }));

      return {
        accepted: true,
        consumesTurn: choice.consumesTurn,
        effects: [...choice.effects, ...mediaEffects],
        records: [{ kind: 'event-resolved', eventId, choiceId }]
      };
    },

    'loadout.equip': ({ state, command }) => {
      const payload = payloadObject(command.payload);
      const slot = String(payload.slot ?? '') as LoadoutSlot;
      const instanceId = String(payload.instanceId ?? '');
      const asset = state.assets.byId[instanceId];
      if (!asset || asset.destroyedAt) return { accepted: false, reason: `missing-asset:${instanceId}` };
      return {
        accepted: true,
        consumesTurn: false,
        effects: [{ type: 'loadout.equip', slot, instanceId }]
      };
    }
  };
}
