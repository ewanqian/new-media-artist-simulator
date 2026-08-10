import test from 'node:test';
import assert from 'node:assert/strict';
import {
  facilityById,
  globalSystems,
  legacyResearchSpaceTemplates,
  relevantSpecialistServices,
  spatialFacilities,
  spatialRegions,
  specialistServices
} from '../locationGraph.ts';

test('spatial map is a rich place graph and global tools stay outside it', () => {
  assert.equal(spatialRegions.length, 9);
  assert.equal(spatialFacilities.length, 27);
  assert.equal(globalSystems.length, 5);
  assert.equal(legacyResearchSpaceTemplates.length, 13);
  assert.equal(specialistServices.length, 4);
  assert.ok(new Set(spatialFacilities.map((facility) => facility.kind)).size >= 8);

  const labels = globalSystems.map((system) => system.label);
  assert.deepEqual(labels, ['地点', '项目', '工作台', '联络', '档案库']);
  assert.ok(spatialRegions.some((region) => region.name === '苏河 / 普陀'));
  assert.ok(spatialRegions.some((region) => region.name === '西岸 / 徐汇滨江'));
  assert.ok(spatialRegions.some((region) => region.name === '杭州'));

  const spatialIds = new Set(spatialRegions.map((region) => region.id));
  for (const system of globalSystems) assert.equal(spatialIds.has(system.id), false);
  assert.equal([...spatialIds].some((id) => id.includes('renderfarm')), false);
});

test('every region and nested facility has valid symmetric spatial relationships', () => {
  const regionById = new Map(spatialRegions.map((region) => [region.id, region]));
  for (const region of spatialRegions) {
    assert.equal(region.facilityIds.length, 3);
    for (const facilityId of region.facilityIds) {
      const facility = facilityById.get(facilityId);
      assert.ok(facility, `${region.id} references missing facility ${facilityId}`);
      assert.equal(facility.regionId, region.id);
      assert.ok(facility.x >= 0 && facility.x <= 100);
      assert.ok(facility.y >= 0 && facility.y <= 100);
      for (const adjacentId of facility.adjacentIds) {
        const adjacent = facilityById.get(adjacentId);
        assert.ok(adjacent, `${facility.id} references missing facility ${adjacentId}`);
        assert.equal(adjacent.regionId, region.id, 'facility adjacency stays inside its region');
        assert.ok(adjacent.adjacentIds.includes(facility.id), `${facility.id} -> ${adjacentId} must be symmetric`);
      }
    }
    for (const adjacentId of region.adjacentIds) {
      const adjacent = regionById.get(adjacentId);
      assert.ok(adjacent, `${region.id} references missing region ${adjacentId}`);
      assert.ok(adjacent.adjacentIds.includes(region.id), `${region.id} -> ${adjacentId} must be symmetric`);
    }
  }
});

test('specialist services stay conditional instead of becoming universal map locations', () => {
  assert.equal(relevantSpecialistServices('research-critique').length, 0);
  assert.ok(relevantSpecialistServices('image-capture').some((service) => service.id === 'compute-rack'));
  assert.ok(relevantSpecialistServices('systems-generative').some((service) => service.id === 'preview-node'));
  assert.ok(relevantSpecialistServices('live-performance').some((service) => service.id === 'mapping-support'));
});
