import test from 'node:test';
import assert from 'node:assert/strict';
import { RUN_STATE_SCHEMA_VERSION, applyAction, createRunState, loadRunState } from '../runState.ts';

function state() { return createRunState({ runId: 'run-test', identity: { id: 'artist', label: '新媒体艺术家' }, chapterId: 'career', currentNodeId: 'first-brief', objective: '完成第一件作品' }); }

test('a decision deterministically applies a result, work, and history', () => {
  const node = {
    id: 'first-brief', type: 'decision', text: '一个小委托来了。',
    actions: [{
      id: 'make-minimum', label: '做可运行版本', nextNodeId: 'first-result',
      result: { summary: '你完成了一个可运行版本。', delta: {
        resources: { cash: -200, energy: -1 },
        addWork: { id: 'work-001', workingTitle: '未完成系统', projectId: 'project-001', status: 'in-progress', originEventId: 'first-brief', decisionIds: ['make-minimum'] }
      } }
    }]
  };
  const next = applyAction(state(), node, 'make-minimum', '2026-08-13T00:00:00.000Z');
  assert.equal(next.currentNodeId, 'first-result'); assert.equal(next.resources.cash, 7800); assert.equal(next.works[0].id, 'work-001'); assert.equal(next.history[0].actionId, 'make-minimum');
});
test('work updates and feedback stay attached to the version and source action', () => {
  const initial = { ...state(), currentNodeId: 'test-link', works: [{ id: 'work-001', workingTitle: '网页', projectId: 'project-001', status: 'broken', originEventId: 'black-screen', decisionIds: [], versions: [] }] };
  const node = { id: 'test-link', type: 'decision', text: '测试', actions: [{ id: 'phone-test', label: '手机打开', nextNodeId: 'revise', result: { summary: '手机黑屏。', delta: {
    updateWork: { workId: 'work-001', status: 'draft', decisionId: 'phone-test', addVersion: { id: 'version-phone', label: '手机测试', state: 'rough', createdByActionId: 'phone-test' } },
    addFeedback: { id: 'feedback-phone', source: 'self-test', workId: 'work-001', versionId: 'version-phone', text: '手机黑屏。', createdByActionId: 'phone-test' },
    addEventIds: ['phone-test-failed']
  } } }] };
  const next = applyAction(initial, node, 'phone-test', '2026-08-13T00:00:00.000Z');
  assert.equal(next.works[0].versions[0].id, 'version-phone');
  assert.equal(next.feedback[0].versionId, 'version-phone');
  assert.ok(next.eventIds.includes('phone-test-failed'));
  const responseNode = { id: 'revise', type: 'decision', text: '处理反馈', actions: [{ id: 'use-feedback', label: '改', nextNodeId: 'done', result: { summary: '改了', delta: {
    updateFeedback: { feedbackId: 'feedback-phone', status: 'used', responseActionId: 'use-feedback' }
  } } }] };
  const responded = applyAction(next, responseNode, 'use-feedback');
  assert.equal(responded.feedback[0].status, 'used');
  assert.equal(responded.feedback[0].responseActionId, 'use-feedback');
});
test('bad saves reset and v1 saves migrate safely', () => {
  const fresh = state();
  assert.equal(loadRunState('{bad json', fresh), fresh);
  assert.equal(loadRunState(JSON.stringify({ schemaVersion: 0 }), fresh), fresh);
  const v1 = { ...fresh, schemaVersion: 1 };
  delete v1.feedback; delete v1.eventIds; delete v1.knownConceptIds;
  const migrated = loadRunState(JSON.stringify(v1), fresh);
  assert.equal(migrated.schemaVersion, RUN_STATE_SCHEMA_VERSION);
  assert.deepEqual(migrated.feedback, []);
  assert.equal(loadRunState(JSON.stringify({ ...fresh, feedback: [{ id: 'half-broken' }] }), fresh), fresh);
});
test('the same node action is idempotent and stale nodes cannot write state', () => {
  const start = state();
  const node = { id: 'first-brief', type: 'decision', text: '测试', actions: [{ id: 'go', label: '继续', nextNodeId: 'done', result: { summary: '完成', delta: { addFlags: ['done'] } } }] };
  const once = applyAction(start, node, 'go', '2026-08-13T00:00:00.000Z');
  assert.equal(applyAction(once, node, 'go'), once);
  assert.equal(applyAction(once, { ...node, id: 'stale-node' }, 'go'), once);
});
test('valid versioned saves resume unchanged', () => { const fresh = state(); const resumed = loadRunState(JSON.stringify(fresh), state()); assert.equal(resumed.schemaVersion, RUN_STATE_SCHEMA_VERSION); assert.equal(resumed.runId, fresh.runId); });
