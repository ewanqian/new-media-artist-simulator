import test from 'node:test';
import assert from 'node:assert/strict';
import { butterflyScholarNarrativePack, resolveButterflyNodeText } from '../butterflyScholarPack.ts';
import { costaRicaConcepts, costaRicaProblems, costaRicaSurface } from '../costaRicaAttention.ts';
import { evaluateSurface } from '../controlSystem.ts';

test('every Costa Rica play surface passes the same generic attention and redundancy gate', () => {
  const visited = [];
  for (const node of butterflyScholarNarrativePack.nodes.filter((candidate) => candidate.choices.length)) {
    const surface = costaRicaSurface(node.id);
    const issues = evaluateSurface(surface, costaRicaProblems, costaRicaConcepts, {
      reachedEventIds: [...visited, node.id],
      knownConceptIds: [],
      availableActionIds: node.choices.map((choice) => choice.id)
    });
    assert.deepEqual(issues, [], node.id);
    visited.push(node.id);
  }
});

test('people are introduced by a reached scene before later use', () => {
  const reveal = butterflyScholarNarrativePack.nodes.find((node) => node.id === 'bs-04b-reveal');
  const context = { reachedEventIds: ['bs-04b-reveal'], knownConceptIds: [], availableActionIds: reveal.choices.map((choice) => choice.id) };
  assert.ok(evaluateSurface(costaRicaSurface(reveal.id), costaRicaProblems, costaRicaConcepts, context).some((issue) => issue.message.includes('before introduction')));
  context.reachedEventIds.push('bs-02-arrival');
  assert.deepEqual(evaluateSurface(costaRicaSurface(reveal.id), costaRicaProblems, costaRicaConcepts, context), []);
});

test('main route copy states player stakes without forcing specialist vocabulary', () => {
  const staticCopy = butterflyScholarNarrativePack.nodes.flatMap((node) => [
    ...node.text,
    ...node.choices.flatMap((choice) => [choice.label, choice.subtext || ''])
  ]).join('\n');
  const dynamicCopy = [
    resolveButterflyNodeText('bs-04-process', ['field-recapture'], []),
    resolveButterflyNodeText('bs-04-process', ['capture-gap-debt'], []),
    resolveButterflyNodeText('bs-04a-represent', ['failure-kept'], []),
    resolveButterflyNodeText('bs-04a-represent', ['failure-used-as-form'], []),
    resolveButterflyNodeText('bs-04f-authorship', ['feedback-from-social'], []),
    resolveButterflyNodeText('bs-04f-authorship', ['feedback-from-public-test'], []),
    resolveButterflyNodeText('bs-05-public', ['capture-relation-route', 'motion-interactive-butterfly'], [])
  ].flat().join('\n');
  const playerCopy = `${staticCopy}\n${dynamicCopy}`;
  for (const premature of ['Gaussian', 'Geometry Nodes', 'Noise /', 'Asset', 'Evidence', 'Blueprint', 'Camera Solve', '相机求解', '系统行为', '程序化形变']) {
    assert.equal(playerCopy.includes(premature), false, premature);
  }
  const good = resolveButterflyNodeText('bs-04-process', ['field-recapture'], []).join(' ');
  const bad = resolveButterflyNodeText('bs-04-process', ['capture-gap-debt'], []).join(' ');
  assert.match(good, /76 张/);
  assert.match(bad, /只对上 61 张/);
});
