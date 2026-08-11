import test from 'node:test';
import assert from 'node:assert/strict';
import { openingEpisode, openingEpisodeProgress } from '../episodeSystem.ts';

function baseState() {
  return {
    completedCardIds: [],
    visitedPlaceIds: [],
    discoveredContactIds: [],
    contactThreads: {},
    readKnowledgeEntryIds: [],
    workbench: { compute: 1, output: 1, capture: 0, storage: 1 }
  };
}

test('opening episode has exactly five sequential chapters', () => {
  assert.equal(openingEpisode.code, 'EP.01');
  assert.equal(openingEpisode.chapters.length, 5);
  assert.deepEqual(openingEpisode.chapters.map((chapter) => chapter.index), [1, 2, 3, 4, 5]);
  assert.deepEqual(openingEpisode.chapters.map((chapter) => chapter.title), ['开机', '离开桌面', '形成项目', '建立协作', '第一次现场']);
});

test('episode advances through action, place, project plus learning, contact, then upgrade plus live place', () => {
  let state = baseState();
  let progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 0);
  assert.equal(progress.active.id, 'ep01-01');

  state = { ...state, completedCardIds: ['studio-minimum-system'] };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 1);
  assert.equal(progress.active.id, 'ep01-02');

  state = { ...state, visitedPlaceIds: ['place-basic-studio'] };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 2);
  assert.equal(progress.active.id, 'ep01-03');

  state = { ...state, completedCardIds: ['studio-minimum-system', 'project-one-page'] };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 2, 'reading is still required');
  state = { ...state, readKnowledgeEntryIds: ['realtime-system'] };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 3);
  assert.equal(progress.active.id, 'ep01-04');

  state = { ...state, contactThreads: { 'contact-lin': [{ from: 'you', text: '看一个当前版本' }] } };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 4);
  assert.equal(progress.active.id, 'ep01-05');

  state = { ...state, workbench: { ...state.workbench, output: 2 } };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 4, 'real venue is still required');
  state = { ...state, visitedPlaceIds: ['place-basic-studio', 'place-blackbox'] };
  progress = openingEpisodeProgress(state);
  assert.equal(progress.completed, 5);
  assert.equal(progress.complete, true);
});
