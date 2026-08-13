import test from 'node:test';
import assert from 'node:assert/strict';
import { RUN_STATE_SCHEMA_VERSION, applyAction, createRunState, loadRunState } from '../runState.ts';

function state() {
  return createRunState({
    runId: 'run-test', identity: { id: 'artist', label: '新媒体艺术家' },
    chapterId: 'career', currentNodeId: 'first-brief', objective: '完成第一件作品'
  });
}

test('a decision deterministically applies a result, work, and history', () => {
  const node = {
    id: 'first-brief', type: 'decision', text: '一个小委托来了。',
    actions: [{
      id: 'make-minimum', label: '做可运行版本', nextNodeId: 'first-result',
      result: { summary: '你完成了一个可运行版本。', delta: {
        resources: { cash: -200, energy: -1 },
        addWork: { id: 'work-001', workingTitle: '未完成系统', projectId: 'project-001', status: 'in-progress', originEventId: 'first-brief', decisionIds: ['make-minimum'] }
      }}
    }]
  } as const;
  const next = applyAction(state(), node, 'make-minimum', '2026-08-13T00:00:00.000Z');
  assert.equal(next.currentNodeId, 'first-result');
  assert.equal(next.resources.cash, 7800);
  assert.equal(next.works[0].id, 'work-001');
  assert.equal(next.history[0].actionId, 'make-minimum');
});

test('bad and legacy saves reset safely to the supplied fresh run', () => {
  const fresh = state();
  assert.equal(loadRunState('{bad json', fresh), fresh);
  assert.equal(loadRunState(JSON.stringify({ schemaVersion: 0 }), fresh), fresh);
});

test('valid versioned saves resume unchanged', () => {
  const fresh = state();
  const resumed = loadRunState(JSON.stringify(fresh), state());
  assert.equal(resumed.schemaVersion, RUN_STATE_SCHEMA_VERSION);
  assert.equal(resumed.runId, fresh.runId);
});
