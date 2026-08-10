import { applyEffects } from './effects.ts';
import { createDeterministicRng, type DeterministicRng } from './rng.ts';
import type { AssetTemplate, Command, CommandResolution, Effect, EngineContext, GameStateV1 } from './types.ts';

export interface CommandHandlerArgs {
  state: GameStateV1;
  command: Command;
  rng: DeterministicRng;
  roll: number;
  sequence: number;
}

export type CommandHandler = (args: CommandHandlerArgs) => CommandResolution;
export type SystemHook = (args: CommandHandlerArgs) => { effects?: Effect[]; records?: unknown[] };

export interface TurnEngineOptions {
  commandHandlers: Record<string, CommandHandler>;
  resolveAssetTemplate: (templateId: string) => AssetTemplate | null;
  advanceProjects?: SystemHook;
  evaluateScheduledEvents?: SystemHook;
  evaluateEventTriggers?: SystemHook;
  evaluateWorldRules?: SystemHook;
  now?: () => string;
  createId?: (prefix: string) => string;
}

function advanceClock(state: GameStateV1): GameStateV1 {
  const nextTurn = state.turn + 1;
  return {
    ...state,
    turn: nextTurn,
    phase: Math.min(4, Math.floor((nextTurn - 1) / 5) + 1)
  };
}

export function createTurnEngine(options: TurnEngineOptions) {
  const noOpHook: SystemHook = () => ({ effects: [], records: [] });
  const now = options.now ?? (() => new Date().toISOString());
  const createId = options.createId ?? ((prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`);

  const context: EngineContext = {
    now,
    createId,
    resolveAssetTemplate: options.resolveAssetTemplate
  };

  return {
    dispatch(inputState: GameStateV1, command: Command) {
      if (!command?.id || !command.type) throw new Error('Command requires id and type.');

      if (inputState.history.some((entry) => entry.commandId === command.id)) {
        return {
          state: inputState,
          result: { accepted: true, duplicate: true, consumesTurn: false, effects: [] as Effect[] }
        };
      }

      const handler = options.commandHandlers[command.type];
      if (!handler) throw new Error(`Unknown command type: ${command.type}`);

      const sequence = inputState.revision + 1;
      const rng = createDeterministicRng(inputState.seed);
      const rngNamespace = `${command.type}:${inputState.turn}`;
      const roll = rng.roll(rngNamespace, sequence);
      const args: CommandHandlerArgs = { state: inputState, command, rng, roll, sequence };
      const resolution = handler(args) ?? {};

      if (resolution.accepted === false) {
        return {
          state: inputState,
          result: { accepted: false, duplicate: false, reason: resolution.reason ?? 'rejected', consumesTurn: false, effects: [] as Effect[] }
        };
      }

      const directEffects = resolution.effects ?? [];
      const consumesTurn = Boolean(resolution.consumesTurn);
      let state = applyEffects(inputState, directEffects, context);
      const allEffects: Effect[] = [...directEffects];
      const systemRecords: unknown[] = [...(resolution.records ?? [])];

      if (consumesTurn) {
        const hooks: SystemHook[] = [
          options.advanceProjects ?? noOpHook,
          options.evaluateScheduledEvents ?? noOpHook,
          options.evaluateEventTriggers ?? noOpHook,
          options.evaluateWorldRules ?? noOpHook
        ];

        for (const hook of hooks) {
          const hookResult = hook({ ...args, state });
          const hookEffects = hookResult.effects ?? [];
          state = applyEffects(state, hookEffects, context);
          allEffects.push(...hookEffects);
          systemRecords.push(...(hookResult.records ?? []));
        }

        state = advanceClock(state);
      }

      const historyEntry = {
        sequence,
        commandId: command.id,
        commandType: command.type,
        turn: inputState.turn,
        input: command.payload ?? null,
        consumesTurn,
        effects: allEffects,
        rng: { namespace: rngNamespace, sequence, roll },
        contentVersion: command.contentVersion ?? null,
        systemRecords,
        createdAt: now()
      };

      state = {
        ...state,
        revision: sequence,
        history: [...state.history, historyEntry]
      };

      return {
        state,
        result: { accepted: true, duplicate: false, consumesTurn, effects: allEffects, systemRecords }
      };
    }
  };
}
