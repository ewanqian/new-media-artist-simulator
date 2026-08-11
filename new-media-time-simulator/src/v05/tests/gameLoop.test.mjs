import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyProjectAction,
  cashPressure,
  deriveProjectStage,
  opportunityReadiness,
  projectActions,
  projectStages,
  weeklyPulseFor
} from '../gameLoop.ts';

test('project stages move from clue to archive through concrete production dimensions', () => {
  assert.equal(deriveProjectStage({ coherence: 1, stability: 1, siteFit: 0, documentation: 0 }).id, 'clue');
  assert.equal(deriveProjectStage({ coherence: 2, stability: 1, siteFit: 0, documentation: 0 }).id, 'prototype');
  assert.equal(deriveProjectStage({ coherence: 2, stability: 2, siteFit: 0, documentation: 0 }).id, 'testable');
  assert.equal(deriveProjectStage({ coherence: 2, stability: 3, siteFit: 2, documentation: 1 }).id, 'production');
  assert.equal(deriveProjectStage({ coherence: 3, stability: 3, siteFit: 3, documentation: 2 }).id, 'public');
  assert.equal(deriveProjectStage({ coherence: 3, stability: 3, siteFit: 3, documentation: 3 }).id, 'archive');
  assert.deepEqual(projectStages.map((stage) => stage.label), ['线索', '原型', '可测试', '可制作', '可公开', '可归档']);
});

test('project actions change one legible dimension and remain bounded', () => {
  const base = { coherence: 1, stability: 1, siteFit: 0, documentation: 0 };
  assert.equal(projectActions.length, 4);
  assert.deepEqual(applyProjectAction(base, 'frame'), { coherence: 2, stability: 1, siteFit: 0, documentation: 0 });
  assert.deepEqual(applyProjectAction(base, 'build'), { coherence: 1, stability: 2, siteFit: 0, documentation: 0 });
  assert.deepEqual(applyProjectAction(base, 'site-test'), { coherence: 1, stability: 1, siteFit: 1, documentation: 0 });
  assert.deepEqual(applyProjectAction({ coherence: 4, stability: 4, siteFit: 4, documentation: 4 }, 'document'), {
    coherence: 4,
    stability: 4,
    siteFit: 4,
    documentation: 4
  });
});

test('opportunities are gated by readiness rather than one prestige score', () => {
  const early = { coherence: 1, stability: 1, siteFit: 0, documentation: 0 };
  assert.equal(opportunityReadiness('opp-blackbox-two-hours', early, 1, 3200).ready, false);
  assert.equal(opportunityReadiness('opp-brand-demo', early, 1, 3200).ready, false);

  const testable = { coherence: 2, stability: 2, siteFit: 1, documentation: 1 };
  assert.equal(opportunityReadiness('opp-blackbox-two-hours', testable, 2, 3200).ready, true);
  assert.equal(opportunityReadiness('opp-open-call-small-space', testable, 2, 3200).ready, true);
  assert.equal(opportunityReadiness('opp-public-screen', testable, 2, 3200).ready, false);

  const mature = { coherence: 3, stability: 3, siteFit: 3, documentation: 2 };
  assert.equal(opportunityReadiness('opp-public-screen', mature, 4, 3200).ready, true);
  assert.equal(opportunityReadiness('opp-hangzhou-week', mature, 2, 3200).ready, false);
  assert.equal(opportunityReadiness('opp-hangzhou-week', mature, 3, 3200).ready, true);
});

test('weekly pulse is deterministic and cash pressure stays simple', () => {
  assert.equal(weeklyPulseFor(1).label, '安静的一周');
  assert.equal(weeklyPulseFor(6).label, '旧东西回来');
  assert.equal(weeklyPulseFor(7).label, '安静的一周');
  assert.equal(cashPressure(3200), '安全');
  assert.equal(cashPressure(1800), '紧张');
  assert.equal(cashPressure(500), '危险');
});
