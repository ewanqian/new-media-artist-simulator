import test from 'node:test';
import assert from 'node:assert/strict';
import { lintAttention, lintRedundancy } from '../controlSystem.ts';

const concepts = [{ id: 'screen-size-bug', label: 'responsive layout', introducedBy: 'page-went-black', solvesProblem: 'fix-black-screen', enablesActions: ['find-the-bug'] }];

test('attention control follows provenance, relevance, and enabled action instead of a word blacklist', () => {
  const valid = lintAttention([{ id: 'help', text: '窗口尺寸', moment: 'active-problem', currentProblemId: 'fix-black-screen', concepts: ['screen-size-bug'], affects: ['find-the-bug'] }], concepts, ['page-went-black']);
  assert.equal(valid.length, 0);
  const early = lintAttention([{ id: 'early', text: '窗口尺寸', moment: 'default-start', currentProblemId: 'fix-black-screen', concepts: ['screen-size-bug'], affects: ['find-the-bug'] }], concepts, []);
  assert.equal(early.length, 1);
});
test('redundancy control rejects visible elements that alter nothing', () => {
  assert.equal(lintRedundancy([{ id: 'count', text: '4', moment: 'default-start', affects: [] }]).length, 1);
  assert.equal(lintRedundancy([{ id: 'choice', text: '修', moment: 'active-problem', affects: ['work'] }]).length, 0);
});