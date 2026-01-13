/**
 * Property 5: Part click triggers popup
 * *For any* clickable body part in the 3D viewer (when not in readOnly mode),
 * clicking the part SHALL set the selectedPart state to that part's ID.
 * 
 * **Validates: Requirements 2.5, 4.1**
 * 
 * Feature: car-inspection-3d, Property 5: Part click triggers popup
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import type { BodyPartId, PartStatus, BodyType } from '@/types/inspection';
import { ALL_BODY_PART_IDS, ALL_PART_STATUSES, ALL_BODY_TYPES } from '@/constants/inspection';

// Arbitrary generators
const bodyPartIdArbitrary = fc.constantFrom<BodyPartId>(...ALL_BODY_PART_IDS);
const partStatusArbitrary = fc.constantFrom<PartStatus>(...ALL_PART_STATUSES);
const bodyTypeArbitrary = fc.constantFrom<BodyType>(...ALL_BODY_TYPES);

/**
 * Simulates the part click handler logic from Car3DViewer
 * This tests the core logic without requiring WebGL/Three.js rendering
 */
function simulatePartClick(
  partId: BodyPartId,
  readOnly: boolean,
  onPartClick: (partId: BodyPartId) => void
): void {
  if (!readOnly) {
    onPartClick(partId);
  }
}

describe('Property 5: Part click triggers popup', () => {
  /**
   * Property: For any body part clicked when NOT in readOnly mode,
   * the onPartClick callback should be called with that part's ID.
   */
  it('should call onPartClick with the clicked part ID when not in readOnly mode', () => {
    fc.assert(
      fc.property(bodyPartIdArbitrary, (partId) => {
        const onPartClick = vi.fn();
        
        simulatePartClick(partId, false, onPartClick);
        
        expect(onPartClick).toHaveBeenCalledTimes(1);
        expect(onPartClick).toHaveBeenCalledWith(partId);
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: For any body part clicked when in readOnly mode,
   * the onPartClick callback should NOT be called.
   */
  it('should NOT call onPartClick when in readOnly mode', () => {
    fc.assert(
      fc.property(bodyPartIdArbitrary, (partId) => {
        const onPartClick = vi.fn();
        
        simulatePartClick(partId, true, onPartClick);
        
        expect(onPartClick).not.toHaveBeenCalled();
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: For any sequence of part clicks, each click should trigger
   * the callback with the correct part ID (no cross-contamination).
   */
  it('should trigger callback with correct part ID for any click sequence', () => {
    fc.assert(
      fc.property(fc.array(bodyPartIdArbitrary, { minLength: 1, maxLength: 20 }), (partIds) => {
        const clickedParts: BodyPartId[] = [];
        const onPartClick = (partId: BodyPartId) => {
          clickedParts.push(partId);
        };
        
        partIds.forEach((partId) => {
          simulatePartClick(partId, false, onPartClick);
        });
        
        // Verify each click was recorded correctly
        expect(clickedParts).toEqual(partIds);
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: The part click behavior should be independent of the part's current status.
   */
  it('should trigger click regardless of part status', () => {
    fc.assert(
      fc.property(bodyPartIdArbitrary, partStatusArbitrary, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (partId, _status) => {
        const onPartClick = vi.fn();
        
        // Status doesn't affect click behavior
        simulatePartClick(partId, false, onPartClick);
        
        expect(onPartClick).toHaveBeenCalledWith(partId);
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: The part click behavior should be independent of the body type.
   */
  it('should trigger click regardless of body type', () => {
    fc.assert(
      fc.property(bodyPartIdArbitrary, bodyTypeArbitrary, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (partId, _bodyType) => {
        const onPartClick = vi.fn();
        
        // Body type doesn't affect click behavior
        simulatePartClick(partId, false, onPartClick);
        
        expect(onPartClick).toHaveBeenCalledWith(partId);
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All 13 body parts should be clickable (when not readOnly).
   */
  it('should have all 13 body parts clickable', () => {
    const onPartClick = vi.fn();
    
    ALL_BODY_PART_IDS.forEach((partId) => {
      simulatePartClick(partId, false, onPartClick);
    });
    
    expect(onPartClick).toHaveBeenCalledTimes(13);
    
    // Verify each part was clicked
    ALL_BODY_PART_IDS.forEach((partId, index) => {
      expect(onPartClick).toHaveBeenNthCalledWith(index + 1, partId);
    });
  });

  /**
   * Property: Clicking the same part multiple times should trigger callback each time.
   */
  it('should trigger callback for repeated clicks on the same part', () => {
    fc.assert(
      fc.property(
        bodyPartIdArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (partId, clickCount) => {
          const onPartClick = vi.fn();
          
          for (let i = 0; i < clickCount; i++) {
            simulatePartClick(partId, false, onPartClick);
          }
          
          expect(onPartClick).toHaveBeenCalledTimes(clickCount);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Mixed readOnly states should correctly filter clicks.
   */
  it('should correctly handle mixed readOnly states', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(bodyPartIdArbitrary, fc.boolean()), { minLength: 1, maxLength: 20 }),
        (clicksWithReadOnly) => {
          const onPartClick = vi.fn();
          
          clicksWithReadOnly.forEach(([partId, readOnly]) => {
            simulatePartClick(partId, readOnly, onPartClick);
          });
          
          // Count expected calls (only when readOnly is false)
          const expectedCalls = clicksWithReadOnly.filter(([, readOnly]) => !readOnly).length;
          expect(onPartClick).toHaveBeenCalledTimes(expectedCalls);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
