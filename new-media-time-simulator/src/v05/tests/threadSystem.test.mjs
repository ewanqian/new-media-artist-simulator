import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ageThreads,
  cloneStarterThreads,
  frictionFromThreads,
  resolveThreadsByAction,
  threadsFromResolvedCallbacks
} from '../threadSystem.ts';
import { scheduleOpportunityCallback } from '../consequenceLoop.ts';

test('starter problems persist instead of resetting every week', () => {
  const threads = cloneStarterThreads();
  assert.equal(threads.length, 2);
  assert.ok(threads.some((thread) => thread.kind === 'technical'));
  assert.ok(threads.some((thread) => thread.kind === 'material'));

  const aged = ageThreads(threads, 5);
  const technical = aged.find((thread) => thread.kind === 'technical');
  const material = aged.find((thread) => thread.kind === 'material');
  assert.ok(technical.pressure >= 2);
  assert.ok(material.pressure >= 1);
});

test('old unresolved threads create bounded weekly friction', () => {
  const threads = ageThreads([
    { id: 'a', kind: 'technical', title: 'a', text: 'a', createdWeek: 1, pressure: 1 },
    { id: 'b', kind: 'scope', title: 'b', text: 'b', createdWeek: 1, pressure: 1 },
    { id: 'c', kind: 'site', title: 'c', text: 'c', createdWeek: 1, pressure: 1 },
    { id: 'd', kind: 'technical', title: 'd', text: 'd', createdWeek: 1, pressure: 1 }
  ], 7);
  const friction = frictionFromThreads(threads, 700);
  assert.equal(friction.attentionTax, 2);
  assert.ok(friction.cashTax >= 150);
  assert.equal(friction.notes.length, 3);
});

test('concrete project actions clear the matching category of debt', () => {
  const threads = [
    { id: 'tech', kind: 'technical', title: 'tech', text: 'x', createdWeek: 1, pressure: 2 },
    { id: 'site', kind: 'site', title: 'site', text: 'x', createdWeek: 1, pressure: 2 },
    { id: 'scope', kind: 'scope', title: 'scope', text: 'x', createdWeek: 1, pressure: 2 },
    { id: 'material', kind: 'material', title: 'material', text: 'x', createdWeek: 1, pressure: 1 }
  ];
  const build = resolveThreadsByAction(threads, 'build');
  assert.deepEqual(build.resolved.map((thread) => thread.id), ['tech']);
  const site = resolveThreadsByAction(build.threads, 'site-test');
  assert.deepEqual(site.resolved.map((thread) => thread.id), ['site']);
  const document = resolveThreadsByAction(site.threads, 'document');
  assert.deepEqual(document.resolved.map((thread) => thread.id).sort(), ['material', 'scope']);
  assert.equal(document.threads.length, 0);
});

test('finished opportunities can leave new unresolved work behind', () => {
  const callback = scheduleOpportunityCallback('opp-emergency-live', 2);
  assert.ok(callback);
  const resolved = [{ ...callback, resolvedWeek: 3 }];
  const additions = threadsFromResolvedCallbacks(resolved, [], 3);
  assert.equal(additions.length, 1);
  assert.equal(additions[0].kind, 'technical');
  assert.match(additions[0].title, /输入信号中断/);

  const duplicate = threadsFromResolvedCallbacks(resolved, additions, 4);
  assert.equal(duplicate.length, 0);
});
