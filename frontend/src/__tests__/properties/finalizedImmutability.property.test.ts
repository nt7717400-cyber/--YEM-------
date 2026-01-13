/**
 * Property 7: Finalized Inspection Immutability
 * *For any* inspection with status='finalized', attempting to modify part statuses,
 * notes, or photos SHALL be rejected, and the inspection data SHALL remain unchanged.
 *
 * **Validates: Requirements 8.3**
 *
 * Feature: interactive-image-inspection, Property 7: Finalized Inspection Immutability
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type {
  CarTemplate,
  PartCondition,
  DamageSeverity,
  PartKey,
  PartDamageData,
} from '@/types/vds';
import {
  ALL_CAR_TEMPLATES,
  ALL_PART_CONDITIONS,
  ALL_DAMAGE_SEVERITIES,
  ALL_PART_KEYS,
  conditionRequiresSeverity,
} from '@/constants/vds';

// ==================== Types ====================

interface VDSInspection {
  id: number;
  templateId: number;
  templateType: CarTemplate;
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    plate?: string;
    color?: string;
    mileage?: number;
  };
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  inspector?: {
    id?: number;
    name?: string;
  };
  parts: PartDamageData[];
  generalNotes?: string;
  status: 'draft' | 'finalized';
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

type ModificationAttempt =
  | { type: 'update_part'; partKey: PartKey; condition: PartCondition; severity?: DamageSeverity; notes?: string }
  | { type: 'add_part'; partKey: PartKey; condition: PartCondition; severity?: DamageSeverity; notes?: string }
  | { type: 'delete_part'; partKey: PartKey }
  | { type: 'add_photo'; partKey: PartKey; photoUrl: string }
  | { type: 'delete_photo'; partKey: PartKey; photoIndex: number }
  | { type: 'update_notes'; partKey: PartKey; notes: string }
  | { type: 'update_general_notes'; notes: string };

// ==================== Inspection Manager ====================

/**
 * Simulates the inspection management system with immutability enforcement
 * for finalized inspections.
 */
class InspectionManager {
  private inspection: VDSInspection;

  constructor(inspection: VDSInspection) {
    this.inspection = JSON.parse(JSON.stringify(inspection));
  }

  /**
   * Get a deep copy of the current inspection state
   */
  getInspection(): VDSInspection {
    return JSON.parse(JSON.stringify(this.inspection));
  }

  /**
   * Check if inspection is finalized
   */
  isFinalized(): boolean {
    return this.inspection.status === 'finalized';
  }

  /**
   * Finalize the inspection
   */
  finalize(): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Inspection already finalized' };
    }
    this.inspection.status = 'finalized';
    this.inspection.finalizedAt = new Date().toISOString();
    this.inspection.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Attempt to update a part's status
   */
  updatePartStatus(
    partKey: PartKey,
    condition: PartCondition,
    severity?: DamageSeverity,
    notes?: string
  ): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    const existingIndex = this.inspection.parts.findIndex(p => p.partKey === partKey);
    const partData: PartDamageData = {
      partKey,
      condition,
      severity: conditionRequiresSeverity(condition) ? severity : undefined,
      notes,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.inspection.parts[existingIndex] = partData;
    } else {
      this.inspection.parts.push(partData);
    }
    this.inspection.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Attempt to delete a part
   */
  deletePart(partKey: PartKey): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    const index = this.inspection.parts.findIndex(p => p.partKey === partKey);
    if (index >= 0) {
      this.inspection.parts.splice(index, 1);
      this.inspection.updatedAt = new Date().toISOString();
    }
    return { success: true };
  }

  /**
   * Attempt to add a photo to a part
   */
  addPhoto(partKey: PartKey, photoUrl: string): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    const part = this.inspection.parts.find(p => p.partKey === partKey);
    if (part) {
      if (!part.photos) {
        part.photos = [];
      }
      part.photos.push(photoUrl);
      part.updatedAt = new Date().toISOString();
      this.inspection.updatedAt = new Date().toISOString();
    }
    return { success: true };
  }

  /**
   * Attempt to delete a photo from a part
   */
  deletePhoto(partKey: PartKey, photoIndex: number): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    const part = this.inspection.parts.find(p => p.partKey === partKey);
    if (part && part.photos && photoIndex >= 0 && photoIndex < part.photos.length) {
      part.photos.splice(photoIndex, 1);
      part.updatedAt = new Date().toISOString();
      this.inspection.updatedAt = new Date().toISOString();
    }
    return { success: true };
  }

  /**
   * Attempt to update notes for a part
   */
  updatePartNotes(partKey: PartKey, notes: string): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    const part = this.inspection.parts.find(p => p.partKey === partKey);
    if (part) {
      part.notes = notes;
      part.updatedAt = new Date().toISOString();
      this.inspection.updatedAt = new Date().toISOString();
    }
    return { success: true };
  }

  /**
   * Attempt to update general notes
   */
  updateGeneralNotes(notes: string): { success: boolean; error?: string } {
    if (this.inspection.status === 'finalized') {
      return { success: false, error: 'Cannot modify finalized inspection' };
    }

    this.inspection.generalNotes = notes;
    this.inspection.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Apply a modification attempt and return result
   */
  applyModification(attempt: ModificationAttempt): { success: boolean; error?: string } {
    switch (attempt.type) {
      case 'update_part':
      case 'add_part':
        return this.updatePartStatus(
          attempt.partKey,
          attempt.condition,
          attempt.severity,
          attempt.notes
        );
      case 'delete_part':
        return this.deletePart(attempt.partKey);
      case 'add_photo':
        return this.addPhoto(attempt.partKey, attempt.photoUrl);
      case 'delete_photo':
        return this.deletePhoto(attempt.partKey, attempt.photoIndex);
      case 'update_notes':
        return this.updatePartNotes(attempt.partKey, attempt.notes);
      case 'update_general_notes':
        return this.updateGeneralNotes(attempt.notes);
    }
  }
}

// ==================== Arbitraries ====================

const carTemplateArbitrary = fc.constantFrom(...ALL_CAR_TEMPLATES);
const partConditionArbitrary = fc.constantFrom(...ALL_PART_CONDITIONS.filter(c => c !== 'not_inspected'));
const damageSeverityArbitrary = fc.constantFrom(...ALL_DAMAGE_SEVERITIES);
const partKeyArbitrary = fc.constantFrom(...ALL_PART_KEYS);

const vehicleArbitrary = fc.record({
  make: fc.constantFrom('Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'),
  model: fc.constantFrom('Camry', 'Accord', 'Altima', 'X5', 'C-Class'),
  year: fc.integer({ min: 2015, max: 2025 }),
  vin: fc.option(fc.string({ minLength: 17, maxLength: 17 }), { nil: undefined }),
  plate: fc.option(fc.string({ minLength: 3, maxLength: 10 }), { nil: undefined }),
  color: fc.option(fc.constantFrom('White', 'Black', 'Silver', 'Red', 'Blue'), { nil: undefined }),
  mileage: fc.option(fc.integer({ min: 0, max: 300000 }), { nil: undefined }),
});

const partDamageDataArbitrary = fc.record({
  partKey: partKeyArbitrary,
  condition: partConditionArbitrary,
  severity: fc.option(damageSeverityArbitrary, { nil: undefined }),
  notes: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  photos: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 3 }), { nil: undefined }),
  updatedAt: fc.option(fc.constant('2025-01-07T10:00:00.000Z'), { nil: undefined }),
});

const inspectionArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  templateId: fc.integer({ min: 1, max: 10 }),
  templateType: carTemplateArbitrary,
  vehicle: vehicleArbitrary,
  customer: fc.option(
    fc.record({
      name: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
      phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: undefined }),
      email: fc.option(fc.emailAddress(), { nil: undefined }),
    }),
    { nil: undefined }
  ),
  inspector: fc.option(
    fc.record({
      id: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
      name: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
    }),
    { nil: undefined }
  ),
  parts: fc.array(partDamageDataArbitrary, { minLength: 1, maxLength: 10 }).map(parts => {
    // Ensure unique part keys
    const uniqueParts = new Map<PartKey, PartDamageData>();
    parts.forEach(p => uniqueParts.set(p.partKey, p));
    return Array.from(uniqueParts.values());
  }),
  generalNotes: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  status: fc.constant('draft' as const),
  createdAt: fc.constant('2025-01-07T09:00:00.000Z'),
  updatedAt: fc.constant('2025-01-07T09:30:00.000Z'),
  finalizedAt: fc.constant(undefined),
});

// Modification attempt arbitraries
const updatePartAttemptArbitrary = fc.record({
  type: fc.constant('update_part' as const),
  partKey: partKeyArbitrary,
  condition: partConditionArbitrary,
  severity: fc.option(damageSeverityArbitrary, { nil: undefined }),
  notes: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
});

const addPartAttemptArbitrary = fc.record({
  type: fc.constant('add_part' as const),
  partKey: partKeyArbitrary,
  condition: partConditionArbitrary,
  severity: fc.option(damageSeverityArbitrary, { nil: undefined }),
  notes: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
});

const deletePartAttemptArbitrary = fc.record({
  type: fc.constant('delete_part' as const),
  partKey: partKeyArbitrary,
});

const addPhotoAttemptArbitrary = fc.record({
  type: fc.constant('add_photo' as const),
  partKey: partKeyArbitrary,
  photoUrl: fc.string({ minLength: 10, maxLength: 100 }),
});

const deletePhotoAttemptArbitrary = fc.record({
  type: fc.constant('delete_photo' as const),
  partKey: partKeyArbitrary,
  photoIndex: fc.integer({ min: 0, max: 5 }),
});

const updateNotesAttemptArbitrary = fc.record({
  type: fc.constant('update_notes' as const),
  partKey: partKeyArbitrary,
  notes: fc.string({ minLength: 0, maxLength: 200 }),
});

const updateGeneralNotesAttemptArbitrary = fc.record({
  type: fc.constant('update_general_notes' as const),
  notes: fc.string({ minLength: 0, maxLength: 500 }),
});

const modificationAttemptArbitrary: fc.Arbitrary<ModificationAttempt> = fc.oneof(
  updatePartAttemptArbitrary,
  addPartAttemptArbitrary,
  deletePartAttemptArbitrary,
  addPhotoAttemptArbitrary,
  deletePhotoAttemptArbitrary,
  updateNotesAttemptArbitrary,
  updateGeneralNotesAttemptArbitrary
);

// ==================== Property Tests ====================

describe('Property 7: Finalized Inspection Immutability', () => {
  /**
   * Property: For any finalized inspection and any modification attempt,
   * the modification SHALL be rejected.
   */
  it('should reject all modification attempts on finalized inspections', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        modificationAttemptArbitrary,
        (inspection, modification) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize the inspection
          manager.finalize();
          expect(manager.isFinalized()).toBe(true);
          
          // Attempt modification
          const result = manager.applyModification(modification);
          
          // Modification should be rejected
          expect(result.success).toBe(false);
          expect(result.error).toBe('Cannot modify finalized inspection');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection and any modification attempt,
   * the inspection data SHALL remain unchanged.
   */
  it('should preserve inspection data unchanged after rejected modifications', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        fc.array(modificationAttemptArbitrary, { minLength: 1, maxLength: 5 }),
        (inspection, modifications) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize the inspection
          manager.finalize();
          
          // Capture state after finalization (before modification attempts)
          const stateAfterFinalize = manager.getInspection();
          
          // Attempt multiple modifications
          modifications.forEach(mod => {
            manager.applyModification(mod);
          });
          
          // Get state after all modification attempts
          const stateAfterAttempts = manager.getInspection();
          
          // Compare parts (excluding timestamps which may differ)
          const partsAfterFinalize = stateAfterFinalize.parts.map(p => ({
            partKey: p.partKey,
            condition: p.condition,
            severity: p.severity,
            notes: p.notes,
            photos: p.photos,
          }));
          
          const partsAfterAttempts = stateAfterAttempts.parts.map(p => ({
            partKey: p.partKey,
            condition: p.condition,
            severity: p.severity,
            notes: p.notes,
            photos: p.photos,
          }));
          
          // Parts should be identical
          expect(JSON.stringify(partsAfterFinalize)).toBe(JSON.stringify(partsAfterAttempts));
          
          // General notes should be identical
          expect(stateAfterFinalize.generalNotes).toBe(stateAfterAttempts.generalNotes);
          
          // Status should still be finalized
          expect(stateAfterAttempts.status).toBe('finalized');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection, attempting to update any part's
   * condition SHALL be rejected and the condition SHALL remain unchanged.
   */
  it('should preserve part conditions after rejected update attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        partKeyArbitrary,
        partConditionArbitrary,
        (inspection, targetPartKey, newCondition) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize
          manager.finalize();
          
          // Get original part condition (if exists)
          const originalPart = manager.getInspection().parts.find(p => p.partKey === targetPartKey);
          const originalCondition = originalPart?.condition;
          
          // Attempt to update
          const result = manager.updatePartStatus(targetPartKey, newCondition);
          
          // Should be rejected
          expect(result.success).toBe(false);
          
          // Condition should be unchanged
          const currentPart = manager.getInspection().parts.find(p => p.partKey === targetPartKey);
          expect(currentPart?.condition).toBe(originalCondition);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection, attempting to add photos
   * SHALL be rejected and photos SHALL remain unchanged.
   */
  it('should preserve photos after rejected add photo attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        (inspection, newPhotoUrl) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize
          manager.finalize();
          
          // Get original photos for all parts
          const originalPhotos = manager.getInspection().parts.map(p => ({
            partKey: p.partKey,
            photos: p.photos ? [...p.photos] : undefined,
          }));
          
          // Attempt to add photo to each part
          inspection.parts.forEach(part => {
            manager.addPhoto(part.partKey, newPhotoUrl);
          });
          
          // Photos should be unchanged
          const currentPhotos = manager.getInspection().parts.map(p => ({
            partKey: p.partKey,
            photos: p.photos ? [...p.photos] : undefined,
          }));
          
          expect(JSON.stringify(originalPhotos)).toBe(JSON.stringify(currentPhotos));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection, attempting to delete parts
   * SHALL be rejected and parts count SHALL remain unchanged.
   */
  it('should preserve parts count after rejected delete attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        partKeyArbitrary,
        (inspection, targetPartKey) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize
          manager.finalize();
          
          const originalCount = manager.getInspection().parts.length;
          
          // Attempt to delete
          const result = manager.deletePart(targetPartKey);
          
          // Should be rejected
          expect(result.success).toBe(false);
          
          // Count should be unchanged
          expect(manager.getInspection().parts.length).toBe(originalCount);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection, attempting to update notes
   * SHALL be rejected and notes SHALL remain unchanged.
   */
  it('should preserve notes after rejected update attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        partKeyArbitrary,
        fc.string({ minLength: 1, maxLength: 200 }),
        (inspection, targetPartKey, newNotes) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize
          manager.finalize();
          
          // Get original notes
          const originalPart = manager.getInspection().parts.find(p => p.partKey === targetPartKey);
          const originalNotes = originalPart?.notes;
          
          // Attempt to update notes
          const result = manager.updatePartNotes(targetPartKey, newNotes);
          
          // Should be rejected
          expect(result.success).toBe(false);
          
          // Notes should be unchanged
          const currentPart = manager.getInspection().parts.find(p => p.partKey === targetPartKey);
          expect(currentPart?.notes).toBe(originalNotes);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any finalized inspection, attempting to update general notes
   * SHALL be rejected and general notes SHALL remain unchanged.
   */
  it('should preserve general notes after rejected update attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        fc.string({ minLength: 1, maxLength: 500 }),
        (inspection, newGeneralNotes) => {
          const manager = new InspectionManager(inspection);
          
          // Finalize
          manager.finalize();
          
          const originalGeneralNotes = manager.getInspection().generalNotes;
          
          // Attempt to update general notes
          const result = manager.updateGeneralNotes(newGeneralNotes);
          
          // Should be rejected
          expect(result.success).toBe(false);
          
          // General notes should be unchanged
          expect(manager.getInspection().generalNotes).toBe(originalGeneralNotes);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Draft inspections should allow modifications,
   * but once finalized, the same modifications should be rejected.
   */
  it('should allow modifications on draft but reject after finalization', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        modificationAttemptArbitrary,
        (inspection, modification) => {
          const manager = new InspectionManager(inspection);
          
          // Modification should succeed on draft
          const draftResult = manager.applyModification(modification);
          expect(draftResult.success).toBe(true);
          
          // Finalize
          manager.finalize();
          
          // Same modification should fail on finalized
          const finalizedResult = manager.applyModification(modification);
          expect(finalizedResult.success).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Finalization should be idempotent - attempting to finalize
   * an already finalized inspection should fail gracefully.
   */
  it('should reject double finalization attempts', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        fc.integer({ min: 1, max: 5 }),
        (inspection, attempts) => {
          const manager = new InspectionManager(inspection);
          
          // First finalization should succeed
          const firstResult = manager.finalize();
          expect(firstResult.success).toBe(true);
          
          // Subsequent attempts should fail
          for (let i = 0; i < attempts; i++) {
            const result = manager.finalize();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Inspection already finalized');
          }
          
          // Status should still be finalized
          expect(manager.isFinalized()).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: The finalized timestamp should be set exactly once
   * and remain unchanged after finalization.
   */
  it('should set finalizedAt timestamp exactly once', () => {
    fc.assert(
      fc.property(
        inspectionArbitrary,
        fc.array(modificationAttemptArbitrary, { minLength: 1, maxLength: 5 }),
        (inspection, modifications) => {
          const manager = new InspectionManager(inspection);
          
          // Before finalization, finalizedAt should be undefined
          expect(manager.getInspection().finalizedAt).toBeUndefined();
          
          // Finalize
          manager.finalize();
          
          // finalizedAt should now be set
          const finalizedAt = manager.getInspection().finalizedAt;
          expect(finalizedAt).toBeDefined();
          
          // Attempt modifications
          modifications.forEach(mod => {
            manager.applyModification(mod);
          });
          
          // finalizedAt should remain unchanged
          expect(manager.getInspection().finalizedAt).toBe(finalizedAt);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
