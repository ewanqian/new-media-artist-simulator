import test from 'node:test';
import assert from 'node:assert/strict';
import { v051ChangeRecords } from '../changeRecords.ts';
import { validateChangeRecord } from '../controlSystem.ts';

test('every accepted v05.1 package has a complete, human-reviewed rollback record', () => {
  assert.equal(new Set(v051ChangeRecords.map((record) => record.id)).size, v051ChangeRecords.length);
  for (const record of v051ChangeRecords) assert.deepEqual(validateChangeRecord(record), [], record.id);
});
