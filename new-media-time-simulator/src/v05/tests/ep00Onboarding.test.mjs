import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEp00Archive,
  buildEp00CareerProfile,
  buildEp00CareerSave,
  createEp00State,
  ep00CaptureOptions
} from '../ep00Onboarding.ts';
import { buildEp00TrainingPreset, EP00_ALLOWED_NODES_BY_CAPTURE, ep00TrainingTasks } from '../ep00Nodes.ts';
import { editorNodeById } from '../blueprintEditorCatalog.ts';
import { learningEpisodes, learningEpisodeLegacyMigration } from '../learningEpisodeCatalog.ts';

function completedState(capture) {
  return {
    ...createEp00State(),
    phase: 'archive',
    identity: 'system',
    inspectedWorkbenchIds: ['computer', 'drive', 'archive'],
    capture
  };
}

test('EP00 offers three observation routes and each produces asset method knowledge and memory', () => {
  assert.deepEqual(ep00CaptureOptions.map((item) => item.id), ['photo', 'scan', 'audio']);
  for (const capture of ['photo', 'scan', 'audio']) {
    const state = completedState(capture);
    const archive = buildEp00Archive(state);
    assert.ok(archive.asset.id);
    assert.ok(archive.method.id.startsWith('method-'));
    assert.ok(archive.knowledge.id.startsWith('knowledge-'));
    assert.ok(archive.memory.length > 12);
  }
});

test('EP00 handoff seeds the existing career save instead of inventing a second progression system', () => {
  for (const capture of ['photo', 'scan', 'audio']) {
    const state = completedState(capture);
    const archive = buildEp00Archive(state);
    const profile = buildEp00CareerProfile(state);
    const save = buildEp00CareerSave(profile, state);
    assert.equal(save.careerStageId, 'stage-1');
    assert.equal(save.careerEpisodeId, 'ep-01-runnable');
    assert.ok(save.evidenceIds.includes(archive.id));
    assert.ok(save.methodIds.includes(archive.method.id));
    assert.ok(save.readKnowledgeEntryIds.includes(archive.knowledge.id));
    assert.equal(save.ep00Archive.id, archive.id);
    assert.equal('level' in save, false);
    assert.equal('skillPoints' in save, false);
  }
});

test('EP00 work graph is always exactly three nodes and two explicit tasks', () => {
  for (const capture of ['photo', 'scan', 'audio']) {
    const preset = buildEp00TrainingPreset(capture);
    assert.equal(preset.nodes.length, 3);
    assert.equal(preset.edges.length, 0);
    assert.equal(ep00TrainingTasks(capture).length, 2);
    assert.deepEqual(preset.nodes.map((node) => node.definitionId), EP00_ALLOWED_NODES_BY_CAPTURE[capture]);
    for (const id of EP00_ALLOWED_NODES_BY_CAPTURE[capture]) assert.ok(editorNodeById.has(id), `${id} must be registered in the shared editor catalog`);
  }
});

test('learning episodes reuse one shared reward grammar and preserve legacy research instead of recreating old simulators', () => {
  assert.ok(learningEpisodes.some((item) => item.id === 'ep00-first-workbench'));
  assert.ok(learningEpisodes.some((item) => item.id === 'special-01-costa-rica' && item.status === 'playable'));
  assert.ok(learningEpisodes.some((item) => item.title.includes('两台机器')));
  assert.ok(learningEpisodes.some((item) => item.title.includes('粒子') || item.title.includes('火')));
  assert.ok(learningEpisodes.some((item) => item.title.includes('图像')));
  assert.ok(learningEpisodes.some((item) => item.title.includes('身体')));
  assert.ok(learningEpisodes.some((item) => item.title.includes('浏览器')));
  assert.ok(learningEpisodes.some((item) => item.title.includes('放画面')));

  for (const episode of learningEpisodes) {
    assert.ok(Array.isArray(episode.unlocks.knowledgeIds));
    assert.ok(Array.isArray(episode.unlocks.methodIds));
    assert.ok(Array.isArray(episode.unlocks.nodeIds));
    assert.ok(Array.isArray(episode.unlocks.assetKinds));
    assert.ok(Array.isArray(episode.unlocks.mementoKinds));
    assert.ok(episode.careerReuse.length > 0);
    assert.ok(episode.researchBasis.length > 0);
  }
  assert.match(learningEpisodeLegacyMigration.oldWorkshopSystem, /Episode/);
  assert.match(learningEpisodeLegacyMigration.oldSkillSlots, /Knowledge/);
  assert.match(learningEpisodeLegacyMigration.oldSimulatorDlc, /Learning Episodes/);
});
