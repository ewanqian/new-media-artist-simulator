import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyResolvedProjectDelta,
  hasOpenSourceCallback,
  resolveDueCallbacks,
  scheduleContactCallback,
  scheduleOpportunityCallback
} from '../consequenceLoop.ts';
import {
  createAttentionTrace,
  decayAttention,
  describeAttention,
  opportunityAttentionScore,
  rankOpportunityIds,
  recordAttention
} from '../attentionTrace.ts';

test('contact actions create delayed consequences instead of instant relationship points', () => {
  const callback = scheduleContactCallback('contact-li-tech', 2);
  assert.ok(callback);
  assert.equal(callback.dueWeek, 3);
  assert.equal(callback.sourceType, 'contact');
  assert.match(callback.resultText, /信号链被确认/);
  assert.deepEqual(callback.effect.project, { stability: 1, documentation: 1 });
});

test('opportunities resolve later and generate reusable archive traces', () => {
  const callback = scheduleOpportunityCallback('opp-open-call-small-space', 2);
  assert.ok(callback);
  assert.equal(callback.dueWeek, 4);

  const initial = {
    scheduledCallbacks: [callback],
    resolvedCallbacks: [],
    generatedArchive: []
  };

  assert.equal(hasOpenSourceCallback(initial, 'opportunity', 'opp-open-call-small-space'), true);
  const early = resolveDueCallbacks(initial, 3);
  assert.equal(early.resolvedNow.length, 0);
  assert.equal(early.state.scheduledCallbacks.length, 1);

  const due = resolveDueCallbacks(initial, 4);
  assert.equal(due.resolvedNow.length, 1);
  assert.equal(due.state.scheduledCallbacks.length, 0);
  assert.equal(due.state.generatedArchive.length, 1);
  assert.match(due.state.generatedArchive[0].title, /失败申请/);
  assert.equal(due.projectDelta.documentation, 1);
});

test('callback project effects remain bounded at four', () => {
  const project = { coherence: 4, stability: 4, siteFit: 3, documentation: 4 };
  const next = applyResolvedProjectDelta(project, { coherence: 2, stability: 2, siteFit: 2, documentation: 1 });
  assert.deepEqual(next, { coherence: 4, stability: 4, siteFit: 4, documentation: 4 });
});

test('attention trace remembers what the player actually spends time on', () => {
  let trace = createAttentionTrace();
  trace = recordAttention(trace, 'making', 1, 2);
  trace = recordAttention(trace, 'making', 2, 1);
  trace = recordAttention(trace, 'site', 2, 1);
  const profile = describeAttention(trace);
  assert.deepEqual(profile.dominant, ['making']);
  assert.ok(profile.neglected.includes('archive'));
  assert.ok(profile.neglected.includes('network'));
});

test('opportunity ordering can adapt without hiding neglected domains forever', () => {
  let trace = createAttentionTrace();
  trace = recordAttention(trace, 'site', 2, 4);
  trace = recordAttention(trace, 'making', 2, 3);
  const ids = ['opp-open-call-small-space', 'opp-public-screen', 'opp-workshop'];
  const ranked = rankOpportunityIds(ids, trace);
  assert.equal(ranked[0], 'opp-public-screen');
  assert.ok(opportunityAttentionScore('opp-open-call-small-space', trace) > 0);

  const decayed = decayAttention(trace, 6);
  assert.ok(decayed.site.weight < trace.site.weight);
  assert.ok(decayed.making.weight < trace.making.weight);
});
