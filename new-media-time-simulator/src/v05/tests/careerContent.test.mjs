import test from 'node:test';
import assert from 'node:assert/strict';
import {
  careerAssessmentQuestions,
  careerEpisodes,
  careerNpcArcs,
  careerPresets,
  careerResourcePacks,
  careerSpecialEvents,
  careerStages,
  profileFromPreset
} from '../careerContent.ts';
import { buildAssessmentCareerProfile } from '../careerProfileRuntime.ts';

test('career has exactly five ordered stages with three episodes each', () => {
  assert.equal(careerStages.length, 5);
  assert.deepEqual(careerStages.map((stage) => stage.index), [1, 2, 3, 4, 5]);
  for (const stage of careerStages) {
    const episodes = careerEpisodes.filter((episode) => episode.stageId === stage.id);
    assert.equal(episodes.length, 3, `${stage.id} should have three episodes`);
    assert.deepEqual(episodes.map((episode) => episode.order), [1, 2, 3]);
  }
});

test('episode content uses the existing decision grammar instead of bespoke minigames', () => {
  const allowed = new Set(['route', 'build', 'commitment']);
  for (const episode of careerEpisodes) {
    assert.ok(episode.goals.length >= 2);
    assert.ok(episode.eventTags.length >= 2);
    assert.ok(episode.decisionTypes.length >= 1);
    for (const type of episode.decisionTypes) assert.ok(allowed.has(type));
  }
});

test('special events are split into universal contextual and signature pools', () => {
  const scopes = new Set(careerSpecialEvents.map((event) => event.scope));
  assert.deepEqual(scopes, new Set(['universal', 'contextual', 'signature']));
  assert.ok(careerSpecialEvents.filter((event) => event.scope === 'universal').length >= 6);
  assert.ok(careerSpecialEvents.filter((event) => event.scope === 'contextual').every((event) => event.requires?.length));
  assert.ok(careerSpecialEvents.filter((event) => event.scope === 'signature').every((event) => event.stageIds?.length || event.episodeIds?.length));
});

test('career reuses a small strong NPC cast instead of inflating contacts', () => {
  assert.equal(careerNpcArcs.length, 6);
  assert.equal(new Set(careerNpcArcs.map((npc) => npc.id)).size, careerNpcArcs.length);
  const referenced = new Set(careerEpisodes.flatMap((episode) => episode.primaryNpcIds));
  for (const id of referenced) assert.ok(careerNpcArcs.some((npc) => npc.id === id), `missing career NPC arc for ${id}`);
});

test('role modeling creates starting conditions rather than a permanent class', () => {
  assert.equal(careerAssessmentQuestions.length, 5);
  assert.ok(careerPresets.length >= 4);
  assert.ok(careerResourcePacks.length >= 4);
  const preset = profileFromPreset('preset-desk', 'hybrid');
  assert.equal(preset.workMode, 'hybrid');
  assert.ok(preset.resourcePackId);
  assert.ok(preset.signalTags.length > 0);
  assert.equal('classId' in preset, false);
  assert.equal('level' in preset, false);
});

test('assessment selection is resolved by question position even when option ids repeat', () => {
  const now = new Date('2026-08-11T10:00:00.000Z');
  const profile = buildAssessmentCareerProfile(['archive', 'system', 'black', 'live', 'run'], 'story', now);
  assert.equal(profile.workMode, 'story');
  assert.equal(profile.source, 'assessment');
  assert.equal(profile.createdAt, now.toISOString());
  assert.ok(profile.knownNpcIds.includes('contact-m'));
  assert.ok(profile.knownNpcIds.includes('contact-li-tech'));
  assert.equal('classId' in profile, false);
});
