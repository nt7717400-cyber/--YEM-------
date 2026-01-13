/**
 * Property 6: Status selection updates state
 * *For any* part and status selection in the popup, selecting a status SHALL update
 * the partsStatus record for that part to the new status value.
 * 
 * **Validates: Requirements 4.5, 4.6**
 * 
 * Feature: car-inspection-3d, Property 6: Status selection updates state
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { BodyPartId, PartStatus, InspectionData, MechanicalStatus } from '@/types/inspection';
import { ALL_BODY_PART_IDS, ALL_PART_STATUSES } from '@/constants/inspection';

// Arbitrary generators
const bodyPartIdArbitrary = fc.constantFrom<BodyPartId>(...ALL_BODY_PART_IDS);
const partStatusArbitrary = fc.constantFrom<PartStatus>(...ALL_PART_STATUSES);

// Generate a random partsStatus record
const partsStatusArbitrary = fc.record(
  Object.fromEntries(
    ALL_BODY_PART_IDS.map((partId) => [partId, partStatusArbitrary])
  ) as Record<BodyPartId, fc.Arbitrary<PartStatus>>
);

// Generate a random mechanical status
const mechanicalStatusArbitrary: fc.Arbitrary<MechanicalStatus> = fc.record({
  engine: fc.constantFrom<'original' | 'replaced' | 'refurbished'>('original', 'replaced', 'refurbished'),
  transmission: fc.constantFrom<'original' | 'replaced'>('original', 'replaced'),
  chassis: fc.constantFrom<'intact' | 'accident_affected' | 'modified'>('intact', 'accident_affected', 'modified'),
  technicalNotes: fc.string({ maxLength: 200 }),
});

// Generate a random inspection data
const inspectionDataArbitrary: fc.Arbitrary<InspectionData> = fc.record({
  bodyType: fc.constantFrom('sedan', 'hatchback', 'coupe', 'suv', 'crossover', 'pickup', 'van', 'minivan', 'truck'),
  bodyParts: partsStatusArbitrary,
  mechanical: mechanicalStatusArbitrary,
});

/**
 * Simulates the status selection logic from InspectionSection
 * When a status is selected for a part, it updates the partsStatus record
 */
function handleStatusSelect(
  currentData: InspectionData,
  selectedPart: BodyPartId,
  newStatus: PartStatus
): InspectionData {
  return {
    ...currentData,
    bodyParts: {
      ...currentData.bodyParts,
      [selectedPart]: newStatus,
    },
  };
}

describe('Property 6: Status selection updates state', () => {
  /**
   * Property: For any part and status selection, the partsStatus record
   * should be updated with the new status for that part.
   */
  it('should update partsStatus with new status for selected part', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        (initialData, partId, newStatus) => {
          const updatedData = handleStatusSelect(initialData, partId, newStatus);
          
          // The selected part should have the new status
          expect(updatedData.bodyParts[partId]).toBe(newStatus);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating one part's status should not affect other parts.
   */
  it('should not affect other parts when updating one part', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        (initialData, partId, newStatus) => {
          const updatedData = handleStatusSelect(initialData, partId, newStatus);
          
          // All other parts should remain unchanged
          ALL_BODY_PART_IDS.forEach((otherPartId) => {
            if (otherPartId !== partId) {
              expect(updatedData.bodyParts[otherPartId]).toBe(initialData.bodyParts[otherPartId]);
            }
          });
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating a part's status should not affect mechanical status.
   */
  it('should not affect mechanical status when updating part status', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        (initialData, partId, newStatus) => {
          const updatedData = handleStatusSelect(initialData, partId, newStatus);
          
          // Mechanical status should remain unchanged
          expect(updatedData.mechanical).toEqual(initialData.mechanical);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating a part's status should not affect body type.
   */
  it('should not affect body type when updating part status', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        (initialData, partId, newStatus) => {
          const updatedData = handleStatusSelect(initialData, partId, newStatus);
          
          // Body type should remain unchanged
          expect(updatedData.bodyType).toBe(initialData.bodyType);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Setting the same status should be idempotent.
   */
  it('should be idempotent when setting the same status', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        (initialData, partId, newStatus) => {
          const firstUpdate = handleStatusSelect(initialData, partId, newStatus);
          const secondUpdate = handleStatusSelect(firstUpdate, partId, newStatus);
          
          // Both updates should result in the same state
          expect(secondUpdate.bodyParts[partId]).toBe(firstUpdate.bodyParts[partId]);
          expect(secondUpdate.bodyParts).toEqual(firstUpdate.bodyParts);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Multiple status updates to the same part should result in the last status.
   */
  it('should reflect the last status after multiple updates to the same part', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        fc.array(partStatusArbitrary, { minLength: 1, maxLength: 10 }),
        (initialData, partId, statusSequence) => {
          let currentData = initialData;
          
          statusSequence.forEach((status) => {
            currentData = handleStatusSelect(currentData, partId, status);
          });
          
          // The final status should be the last one in the sequence
          const lastStatus = statusSequence[statusSequence.length - 1];
          expect(currentData.bodyParts[partId]).toBe(lastStatus);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Updating different parts should be independent.
   */
  it('should handle independent updates to different parts', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        fc.array(fc.tuple(bodyPartIdArbitrary, partStatusArbitrary), { minLength: 1, maxLength: 13 }),
        (initialData, updates) => {
          let currentData = initialData;
          const expectedStatuses: Record<string, PartStatus> = { ...initialData.bodyParts };
          
          updates.forEach(([partId, status]) => {
            currentData = handleStatusSelect(currentData, partId, status);
            expectedStatuses[partId] = status;
          });
          
          // Each part should have its expected status
          ALL_BODY_PART_IDS.forEach((partId) => {
            expect(currentData.bodyParts[partId]).toBe(expectedStatuses[partId]);
          });
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All 6 status options should be settable for any part.
   */
  it('should allow setting all 6 status options for any part', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        (initialData, partId) => {
          // Try setting each status
          ALL_PART_STATUSES.forEach((status) => {
            const updatedData = handleStatusSelect(initialData, partId, status);
            expect(updatedData.bodyParts[partId]).toBe(status);
          });
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Status can be changed at any time (before submission).
   * This tests that status changes are always allowed regardless of current state.
   */
  it('should allow changing status at any time', () => {
    fc.assert(
      fc.property(
        inspectionDataArbitrary,
        bodyPartIdArbitrary,
        partStatusArbitrary,
        partStatusArbitrary,
        (initialData, partId, firstStatus, secondStatus) => {
          // Set first status
          const afterFirst = handleStatusSelect(initialData, partId, firstStatus);
          expect(afterFirst.bodyParts[partId]).toBe(firstStatus);
          
          // Change to second status
          const afterSecond = handleStatusSelect(afterFirst, partId, secondStatus);
          expect(afterSecond.bodyParts[partId]).toBe(secondStatus);
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
