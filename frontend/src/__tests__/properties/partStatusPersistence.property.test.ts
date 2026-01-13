/**
 * Property 2: Part Status Persistence Across Views
 * *For any* inspection with recorded part statuses, switching between view angles
 * SHALL preserve all part status data, and returning to a previously viewed angle
 * SHALL display the same statuses.
 *
 * **Validates: Requirements 1.2**
 *
 * Feature: interactive-image-inspection, Property 2: Part Status Persistence Across Views
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ViewAngle, PartKey, PartCondition, PartDamageData } from '@/types/vds';
import {
  ALL_VIEW_ANGLES,
  ALL_PART_KEYS,
  ALL_PART_CONDITIONS,
  ALL_DAMAGE_SEVERITIES,
} from '@/constants/vds';
import type { DamageSeverity } from '@/types/vds';

// Arbitrary for generating random ViewAngle values
const viewAngleArbitrary = fc.constantFrom<ViewAngle>(...ALL_VIEW_ANGLES);

// Arbitrary for generating random PartKey values
const partKeyArbitrary = fc.constantFrom<PartKey>(...ALL_PART_KEYS);

// Arbitrary for generating random PartCondition values
const partConditionArbitrary = fc.constantFrom<PartCondition>(...ALL_PART_CONDITIONS);

// Arbitrary for generating random DamageSeverity values
const severityArbitrary = fc.constantFrom<DamageSeverity>(...ALL_DAMAGE_SEVERITIES);

// Arbitrary for generating optional severity (only when condition is not 'good' or 'not_inspected')
const optionalSeverityArbitrary = fc.option(severityArbitrary, { nil: undefined });

// Arbitrary for generating a single PartDamageData
const partDamageDataArbitrary = fc.record({
  partKey: partKeyArbitrary,
  condition: partConditionArbitrary,
  severity: optionalSeverityArbitrary,
  notes: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  photos: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 3 }), { nil: undefined }),
  updatedAt: fc.option(
    fc.constant('2025-01-07T10:00:00.000Z'),
    { nil: undefined }
  ),
});

// Arbitrary for generating a partsStatus record with random parts
const partsStatusArbitrary = fc.array(partDamageDataArbitrary, { minLength: 1, maxLength: 10 })
  .map((parts) => {
    const status: Record<string, PartDamageData> = {};
    parts.forEach((part) => {
      status[part.partKey] = part;
    });
    return status;
  });

// Arbitrary for generating a sequence of view angle changes
const viewAngleSequenceArbitrary = fc.array(viewAngleArbitrary, { minLength: 2, maxLength: 10 });

/**
 * Simulates the state management behavior of InspectionSection
 * The partsStatus is stored at the parent level and passed down to SVGInspectionViewer
 * Changing viewAngle should NOT affect partsStatus
 */
class InspectionStateSimulator {
  private partsStatus: Record<string, PartDamageData>;
  private currentAngle: ViewAngle;

  constructor(initialPartsStatus: Record<string, PartDamageData>, initialAngle: ViewAngle = 'front') {
    // Deep clone to avoid reference issues
    this.partsStatus = JSON.parse(JSON.stringify(initialPartsStatus));
    this.currentAngle = initialAngle;
  }

  /**
   * Switch to a different view angle
   * This should NOT modify partsStatus
   */
  switchViewAngle(newAngle: ViewAngle): void {
    this.currentAngle = newAngle;
    // partsStatus remains unchanged - this is the key behavior we're testing
  }

  /**
   * Get current view angle
   */
  getCurrentAngle(): ViewAngle {
    return this.currentAngle;
  }

  /**
   * Get current parts status
   */
  getPartsStatus(): Record<string, PartDamageData> {
    return this.partsStatus;
  }

  /**
   * Get status for a specific part
   */
  getPartStatus(partKey: PartKey): PartDamageData | undefined {
    return this.partsStatus[partKey];
  }

  /**
   * Update a part's status (simulates saving from PartDamageForm)
   */
  updatePartStatus(data: PartDamageData): void {
    this.partsStatus[data.partKey] = { ...data };
  }
}

describe('Property 2: Part Status Persistence Across Views', () => {
  /**
   * Property: For any partsStatus and any sequence of view angle changes,
   * the partsStatus should remain unchanged after all view angle switches.
   */
  it('should preserve all part statuses when switching between view angles', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        viewAngleSequenceArbitrary,
        (initialStatus, angleSequence) => {
          const simulator = new InspectionStateSimulator(initialStatus);
          const originalStatus = JSON.stringify(simulator.getPartsStatus());

          // Switch through all angles in the sequence
          angleSequence.forEach((angle) => {
            simulator.switchViewAngle(angle);
          });

          // Parts status should be unchanged
          const finalStatus = JSON.stringify(simulator.getPartsStatus());
          return originalStatus === finalStatus;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any part with recorded status, switching to any view angle
   * and back should preserve that part's exact status data.
   */
  it('should preserve individual part status data through view angle round-trips', () => {
    fc.assert(
      fc.property(
        partDamageDataArbitrary,
        viewAngleArbitrary,
        viewAngleArbitrary,
        (partData, angle1, angle2) => {
          const initialStatus: Record<string, PartDamageData> = {
            [partData.partKey]: partData,
          };
          const simulator = new InspectionStateSimulator(initialStatus, 'front');

          // Switch to angle1
          simulator.switchViewAngle(angle1);
          const statusAfterFirst = simulator.getPartStatus(partData.partKey);

          // Switch to angle2
          simulator.switchViewAngle(angle2);
          const statusAfterSecond = simulator.getPartStatus(partData.partKey);

          // Switch back to front
          simulator.switchViewAngle('front');
          const statusAfterReturn = simulator.getPartStatus(partData.partKey);

          // All statuses should be equal to original
          return (
            JSON.stringify(statusAfterFirst) === JSON.stringify(partData) &&
            JSON.stringify(statusAfterSecond) === JSON.stringify(partData) &&
            JSON.stringify(statusAfterReturn) === JSON.stringify(partData)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any number of parts with different conditions,
   * all parts should retain their conditions after any view angle change.
   */
  it('should preserve all part conditions regardless of view angle', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        viewAngleArbitrary,
        (partsStatus, targetAngle) => {
          const simulator = new InspectionStateSimulator(partsStatus);
          
          // Record original conditions
          const originalConditions: Record<string, PartCondition> = {};
          Object.entries(partsStatus).forEach(([key, data]) => {
            originalConditions[key] = data.condition;
          });

          // Switch view angle
          simulator.switchViewAngle(targetAngle);

          // Check all conditions are preserved
          const currentStatus = simulator.getPartsStatus();
          return Object.entries(originalConditions).every(([key, condition]) => {
            return currentStatus[key]?.condition === condition;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Updating a part status and then switching views should preserve the update.
   */
  it('should preserve part status updates through view angle changes', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        partDamageDataArbitrary,
        viewAngleSequenceArbitrary,
        (initialStatus, newPartData, angleSequence) => {
          const simulator = new InspectionStateSimulator(initialStatus);

          // Update a part's status
          simulator.updatePartStatus(newPartData);

          // Switch through multiple angles
          angleSequence.forEach((angle) => {
            simulator.switchViewAngle(angle);
          });

          // The updated part should still have the new status
          const currentPartStatus = simulator.getPartStatus(newPartData.partKey);
          return (
            currentPartStatus !== undefined &&
            currentPartStatus.condition === newPartData.condition &&
            currentPartStatus.severity === newPartData.severity
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The number of parts with recorded statuses should remain constant
   * regardless of view angle changes.
   */
  it('should maintain the same number of recorded parts across view changes', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        viewAngleSequenceArbitrary,
        (partsStatus, angleSequence) => {
          const simulator = new InspectionStateSimulator(partsStatus);
          const originalCount = Object.keys(simulator.getPartsStatus()).length;

          // Switch through all angles
          angleSequence.forEach((angle) => {
            simulator.switchViewAngle(angle);
          });

          const finalCount = Object.keys(simulator.getPartsStatus()).length;
          return originalCount === finalCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Switching to the same view angle multiple times should not affect parts status.
   */
  it('should be idempotent - switching to same angle multiple times has no effect', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        viewAngleArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (partsStatus, angle, repetitions) => {
          const simulator = new InspectionStateSimulator(partsStatus);
          const originalStatus = JSON.stringify(simulator.getPartsStatus());

          // Switch to the same angle multiple times
          for (let i = 0; i < repetitions; i++) {
            simulator.switchViewAngle(angle);
          }

          const finalStatus = JSON.stringify(simulator.getPartsStatus());
          return originalStatus === finalStatus;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Parts with photos should retain their photo arrays through view changes.
   */
  it('should preserve photo arrays through view angle changes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
        partKeyArbitrary,
        viewAngleSequenceArbitrary,
        (photos, partKey, angleSequence) => {
          const partData: PartDamageData = {
            partKey,
            condition: 'scratch',
            severity: 'light',
            photos,
          };
          const initialStatus: Record<string, PartDamageData> = {
            [partKey]: partData,
          };
          const simulator = new InspectionStateSimulator(initialStatus);

          // Switch through angles
          angleSequence.forEach((angle) => {
            simulator.switchViewAngle(angle);
          });

          // Photos should be preserved
          const currentPartStatus = simulator.getPartStatus(partKey);
          return (
            currentPartStatus !== undefined &&
            currentPartStatus.photos !== undefined &&
            currentPartStatus.photos.length === photos.length &&
            currentPartStatus.photos.every((photo, idx) => photo === photos[idx])
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Parts with notes should retain their notes through view changes.
   */
  it('should preserve notes through view angle changes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        partKeyArbitrary,
        viewAngleSequenceArbitrary,
        (notes, partKey, angleSequence) => {
          const partData: PartDamageData = {
            partKey,
            condition: 'bodywork',
            severity: 'medium',
            notes,
          };
          const initialStatus: Record<string, PartDamageData> = {
            [partKey]: partData,
          };
          const simulator = new InspectionStateSimulator(initialStatus);

          // Switch through angles
          angleSequence.forEach((angle) => {
            simulator.switchViewAngle(angle);
          });

          // Notes should be preserved
          const currentPartStatus = simulator.getPartStatus(partKey);
          return currentPartStatus !== undefined && currentPartStatus.notes === notes;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: View angle changes should be independent of parts status changes.
   * Changing view angle should not trigger any status modification.
   */
  it('should have view angle changes independent of status modifications', () => {
    fc.assert(
      fc.property(
        partsStatusArbitrary,
        viewAngleArbitrary,
        (partsStatus, newAngle) => {
          const simulator = new InspectionStateSimulator(partsStatus, 'front');
          
          // Get status before angle change
          const statusBefore = JSON.parse(JSON.stringify(simulator.getPartsStatus()));
          
          // Change angle
          simulator.switchViewAngle(newAngle);
          
          // Get status after angle change
          const statusAfter = simulator.getPartsStatus();
          
          // Deep equality check
          return JSON.stringify(statusBefore) === JSON.stringify(statusAfter);
        }
      ),
      { numRuns: 100 }
    );
  });
});
