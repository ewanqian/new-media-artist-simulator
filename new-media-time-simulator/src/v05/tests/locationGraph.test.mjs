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

test('spatial map contains regions and facilities, not global system tools', () => {
  assert.equal(spatialRegions.length, 5);
  assert.equal(spatialFacilities.length, 15);
  assert.equal(globalSystems.length, 5);
  assert.equal(legacyResearchSpaceTemplates.length, 13);
  assert.equal(specialistServices.length, 3);
  assert.equal(new Set(spatialFacilities.map((facility) => facility.kind)).size, 8);

  const spatialIds = new Set(spatialRegions.map((region) => region.id));
  for (const system of globalSystems) assert.equal(spatialIds.has(system.id), false);
  assert.equal([...spatialIds].some((id) => id.includes('renderfarm')), false);
});

test('every region and nested facility has valid symmetric spatial relationships', () => {
  const regionById = new Map(spatialRegions.map((region) => [region.id, region]));
  for (const region of spatialRegions) {
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

test('specialist compute services appear only for practices that need them', () => {
  assert.equal(relevantSpecialistServices('research-critique').length, 0);
  assert.ok(relevantSpecialistServices('image-capture').some((service) => service.id === 'compute-rack'));
  assert.ok(relevantSpecialistServices('systems-generative').some((service) => service.id === 'preview-node'));
});
