import test from 'node:test';
import assert from 'node:assert/strict';
import { lintContent } from '../contentLint.ts';

test('content lint catches a consequence-less decision and text overflow', () => {
  const issues = lintContent([{ id: 'x', type: 'decision', text: 'x'.repeat(281), actions: [
    { id: 'a', label: 'A', nextNodeId: 'next', result: { summary: 'No consequence', delta: {} } }
  ] }]);
  assert.equal(issues.length, 3);
});
