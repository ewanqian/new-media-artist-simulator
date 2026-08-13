import test from 'node:test';
import assert from 'node:assert/strict';
import { lintAttention, lintRedundancy } from '../controlSystem.ts';

test('attention control blocks premature jargon and unearned concepts', () => {
  const issues = lintAttention([
    { id: 'bad', text: '打开 Gaussian Asset', moment: 'default-start', introduces: ['Gaussian'] },
    { id: 'okay', text: '网页黑屏了。', moment: 'default-start', playerProblem: '网页黑屏' }
  ]);
  assert.equal(issues.length, 2);
});

test('redundancy control rejects visible elements that alter nothing', () => {
  assert.equal(lintRedundancy([{ id: 'count', affects: [] }]).length, 1);
  assert.equal(lintRedundancy([{ id: 'choice', affects: ['work'] }]).length, 0);
});
