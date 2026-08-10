import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeById, knowledgeEntries } from '../knowledgeBase.ts';

test('archive is a readable knowledge graph rather than an activity log', () => {
  assert.ok(knowledgeEntries.length >= 15);
  assert.equal(new Set(knowledgeEntries.map((entry) => entry.id)).size, knowledgeEntries.length);
  assert.ok(knowledgeEntries.some((entry) => entry.title.includes('技术单')));
  assert.ok(knowledgeEntries.some((entry) => entry.title.includes('上海')));
  assert.ok(knowledgeEntries.some((entry) => entry.title.includes('Gaussian')));

  for (const entry of knowledgeEntries) {
    assert.ok(entry.summary.length > 12, `${entry.id} needs a real summary`);
    assert.ok(entry.body.length >= 2, `${entry.id} needs readable body copy`);
    assert.ok(entry.tags.length >= 2, `${entry.id} needs tags`);
    for (const relatedId of entry.relatedIds) {
      assert.ok(knowledgeById.has(relatedId), `${entry.id} references missing knowledge ${relatedId}`);
    }
  }
});
