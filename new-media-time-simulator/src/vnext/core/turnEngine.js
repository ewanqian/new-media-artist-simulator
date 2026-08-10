import { applyEffects } from './applyEffects.js';
import { createDeterministicRng } from './rng.js';

function assertCommand(command) {
  if (!command || typeof command !== 'object') throw new Error('Command must be an object.');
  if (!command.id) throw new Error('Command requires a unique id.');
  if (!command.type) throw new Error('Command requires a type.');
  return command;
}

function appendHistory(state, entry) {
  return {
    ...state,
    revision: state.revision + 1,
    history: [
      ...state.history,
      {
        sequence: state.revision + 1,
        ...entry
      }
    ]
  };
}

function advanceClock(state) {
  const nextTurn = state.turn + 1;
  return {
    ...state,
    turn: nextTurn,
    phase: Math.min(4, Math.floor((nextTurn - 1) / 5) + 1)
  };
}

function defaultCreateId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid || Date.now()}`;
}

export function createTurnEngine(options = {}) {
  const handlers = options.commandHandlers || {};
  const resolveAssetTemplate = options.resolveAssetTemplate || (() => null);
  const evaluateScheduledEvents = options.evaluateScheduledEvents || (() => ({ effects: [], records: [] }));
  const evaluateEventTriggers = options.evaluateEventTriggers || (() => ({ effects: [], records: [] }));
  const evaluateWorldRules = options.evaluateWorldRules || (() => ({ effects: [], records: [] }));
  const advanceProjects = options.advanceProjects || (() => ({ effects: [], records: [] }));
  const now = options.now || (() => new Date().toISOString());
  const createId = options.createId || defaultCreateId;

  return {
    dispatch(inputState, rawCommand) {
      const command = assertCommand(rawCommand);

      if (inputState.history.some((entry) => entry.commandId === command.id)) {
        return {
          state: inputState,
          result: {
            accepted: true,
            duplicate: true,
            consumesTurn: false,
            effects: []
          }
        };
      }

      const handler = handlers[command.type];
      if (!handler) throw new Error(`Unknown command type: ${command.type}`);

      const sequence = inputState.revision + 1;
      const rng = createDeterministicRng(inputState.seed);
      const rngNamespace = `${command.type}:${inputState.turn}`;
      const roll = rng.roll(rngNamespace, sequence);

      const commandResult = handler({
        state: inputState,
        command,
        rng,
        roll,
        sequence
      }) || {};

      if (commandResult.accepted === false) {
        return {
          state: inputState,
          result: {
            accepted: false,
            reason: commandResult.reason || 'rejected',
            consumesTurn: false,
            effects: []
          }
        };
      }

      const directEffects = commandResult.effects || [];
      const consumesTurn = Boolean(commandResult.consumesTurn);
      const context = { resolveAssetTemplate, now, createId };

      let state = applyEffects(inputState, directEffects, context);
      const allEffects = [...directEffects];
      const systemRecords = [];

      if (consumesTurn) {
        const projectResult = advanceProjects({ state, command, rng, sequence }) || {};
        state = applyEffects(state, projectResult.effects || [], context);
        allEffects.push(...(projectResult.effects || []));
        systemRecords.push(...(projectResult.records || []));

        const scheduledResult = evaluateScheduledEvents({ state, command, rng, sequence }) || {};
        state = applyEffects(state, scheduledResult.effects || [], context);
        allEffects.push(...(scheduledResult.effects || []));
        systemRecords.push(...(scheduledResult.records || []));

        const triggerResult = evaluateEventTriggers({ state, command, rng, sequence }) || {};
        state = applyEffects(state, triggerResult.effects || [], context);
        allEffects.push(...(triggerResult.effects || []));
        systemRecords.push(...(triggerResult.records || []));

        const worldResult = evaluateWorldRules({ state, command, rng, sequence }) || {};
        state = applyEffects(state, worldResult.effects || [], context);
        allEffects.push(...(worldResult.effects || []));
        systemRecords.push(...(worldResult.records || []));

        state = advanceClock(state);
      }

      state = appendHistory(state, {
        commandId: command.id,
        commandType: command.type,
        turn: inputState.turn,
        input: command.payload || {},
        consumesTurn,
        effects: allEffects,
        rng: {
          namespace: rngNamespace,
          sequence,
          roll
        },
        contentVersion: command.contentVersion || null,
        systemRecords,
        createdAt: now()
      });

      return {
        state,
        result: {
          accepted: true,
          duplicate: false,
          consumesTurn,
          effects: allEffects,
          systemRecords
        }
      };
    }
  };
}
