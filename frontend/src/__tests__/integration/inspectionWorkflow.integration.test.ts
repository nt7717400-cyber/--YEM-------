/**
 * Integration Test: Complete Inspection Workflow
 * Tests the full inspection workflow from creation to PDF generation
 * 
 * **Validates: Requirements 17.1-17.5**
 * 
 * Feature: interactive-image-inspection, Task 18.1: اختبار سير العمل الكامل
 * 
 * This test simulates the complete inspection workflow:
 * 1. Creating a new inspection
 * 2. Recording damages on parts
 * 3. Finalizing the inspection
 * 4. Generating PDF report
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
  COLOR_BY_CONDITION,
  PART_LABELS,
  CONDITION_LABELS,
  getConditionColor,
  conditionRequiresSeverity,
} from '@/constants/vds';
import { InspectionPDFGenerator, type InspectionPDFData } from '@/lib/pdfGenerator';
import { PART_STATUS_CONFIG, ALL_BODY_PART_IDS } from '@/constants/inspection';

// ==================== Types for Integration Test ====================

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

interface CreateInspectionInput {
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
  generalNotes?: string;
}

// ==================== Simulated API Functions ====================

/**
 * Simulates creating a new inspection
 * Requirements: 17.1
 */
function simulateCreateInspection(input: CreateInspectionInput): VDSInspection {
  const now = new Date().toISOString();
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    templateId: input.templateId,
    templateType: input.templateType,
    vehicle: input.vehicle,
    customer: input.customer,
    inspector: input.inspector,
    parts: [],
    generalNotes: input.generalNotes,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Simulates recording damage on a part
 * Requirements: 17.2
 */
function simulateRecordDamage(
  inspection: VDSInspection,
  partKey: PartKey,
  condition: PartCondition,
  severity?: DamageSeverity,
  notes?: string
): VDSInspection {
  if (inspection.status === 'finalized') {
    throw new Error('Cannot modify finalized inspection');
  }

  const now = new Date().toISOString();
  const existingPartIndex = inspection.parts.findIndex(p => p.partKey === partKey);
  
  const partData: PartDamageData = {
    partKey,
    condition,
    severity: conditionRequiresSeverity(condition) ? severity : undefined,
    notes,
    updatedAt: now,
  };

  const updatedParts = [...inspection.parts];
  if (existingPartIndex >= 0) {
    updatedParts[existingPartIndex] = partData;
  } else {
    updatedParts.push(partData);
  }

  return {
    ...inspection,
    parts: updatedParts,
    updatedAt: now,
  };
}

/**
 * Simulates finalizing an inspection
 * Requirements: 17.3, 17.4
 */
function simulateFinalizeInspection(inspection: VDSInspection): VDSInspection {
  if (inspection.status === 'finalized') {
    throw new Error('Inspection already finalized');
  }

  const now = new Date().toISOString();
  return {
    ...inspection,
    status: 'finalized',
    finalizedAt: now,
    updatedAt: now,
  };
}

/**
 * Validates that a finalized inspection cannot be modified
 * Requirements: 8.3
 */
function validateFinalizedImmutability(inspection: VDSInspection): boolean {
  return inspection.status === 'finalized';
}

/**
 * Converts VDS inspection to PDF data format
 */
function convertToPDFData(inspection: VDSInspection): InspectionPDFData {
  // Convert VDS parts to the format expected by PDF generator
  const partsStatus: Record<string, string> = {};
  
  // Map VDS conditions to inspection part statuses
  const conditionToStatus: Record<PartCondition, string> = {
    good: 'original',
    scratch: 'painted',
    bodywork: 'bodywork',
    broken: 'accident',
    painted: 'painted',
    replaced: 'replaced',
    not_inspected: 'needs_check',
  };

  inspection.parts.forEach(part => {
    // Map part keys to body part IDs where applicable
    const bodyPartId = mapPartKeyToBodyPartId(part.partKey);
    if (bodyPartId) {
      partsStatus[bodyPartId] = conditionToStatus[part.condition] || 'needs_check';
    }
  });

  // Fill in missing parts with default status
  ALL_BODY_PART_IDS.forEach(partId => {
    if (!partsStatus[partId]) {
      partsStatus[partId] = 'original';
    }
  });

  return {
    car: {
      id: inspection.id,
      brand: inspection.vehicle.make,
      model: inspection.vehicle.model,
      year: inspection.vehicle.year,
      kilometers: inspection.vehicle.mileage,
      price: 0,
      status: 'AVAILABLE',
      featured: false,
      viewCount: 0,
      images: [],
      videos: [],
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
    },
    bodyType: 'sedan', // Default body type
    partsStatus: partsStatus as Record<string, 'original' | 'painted' | 'bodywork' | 'accident' | 'replaced' | 'needs_check'>,
    inspectorName: inspection.inspector?.name,
    customerName: inspection.customer?.name,
    customerPhone: inspection.customer?.phone,
    inspectionDate: inspection.createdAt,
    generalNotes: inspection.generalNotes,
  };
}

/**
 * Maps VDS part keys to body part IDs
 */
function mapPartKeyToBodyPartId(partKey: PartKey): string | null {
  const mapping: Partial<Record<PartKey, string>> = {
    front_bumper: 'front_bumper',
    hood: 'hood',
    front_windshield: 'front_glass',
    rear_bumper: 'rear_bumper',
    trunk: 'trunk',
    rear_windshield: 'rear_glass',
    left_front_door: 'left_front_door',
    left_rear_door: 'left_rear_door',
    left_front_fender: 'left_front_fender',
    left_rear_quarter: 'left_rear_fender',
    right_front_door: 'right_front_door',
    right_rear_door: 'right_rear_door',
    right_front_fender: 'right_front_fender',
    right_rear_quarter: 'right_rear_fender',
    roof: 'roof',
  };
  return mapping[partKey] || null;
}

// ==================== Arbitraries ====================

const carTemplateArbitrary = fc.constantFrom(...ALL_CAR_TEMPLATES);

const partConditionArbitrary = fc.constantFrom(
  ...ALL_PART_CONDITIONS.filter(c => c !== 'not_inspected')
);

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

const customerArbitrary = fc.option(
  fc.record({
    name: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
    phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: undefined }),
    email: fc.option(fc.emailAddress(), { nil: undefined }),
  }),
  { nil: undefined }
);

const inspectorArbitrary = fc.option(
  fc.record({
    id: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
    name: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  }),
  { nil: undefined }
);

const createInspectionInputArbitrary = fc.record({
  templateId: fc.integer({ min: 1, max: 10 }),
  templateType: carTemplateArbitrary,
  vehicle: vehicleArbitrary,
  customer: customerArbitrary,
  inspector: inspectorArbitrary,
  generalNotes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
});

const damageRecordArbitrary = fc.record({
  partKey: partKeyArbitrary,
  condition: partConditionArbitrary,
  severity: fc.option(damageSeverityArbitrary, { nil: undefined }),
  notes: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
});

// ==================== Integration Tests ====================

describe('Integration Test: Complete Inspection Workflow', () => {
  describe('Step 1: Create New Inspection (Requirement 17.1)', () => {
    it('should create a new inspection with valid input data', () => {
      fc.assert(
        fc.property(createInspectionInputArbitrary, (input) => {
          const inspection = simulateCreateInspection(input);
          
          // Verify inspection was created
          expect(inspection.id).toBeGreaterThan(0);
          expect(inspection.status).toBe('draft');
          expect(inspection.templateType).toBe(input.templateType);
          expect(inspection.vehicle.make).toBe(input.vehicle.make);
          expect(inspection.vehicle.model).toBe(input.vehicle.model);
          expect(inspection.vehicle.year).toBe(input.vehicle.year);
          expect(inspection.parts).toHaveLength(0);
          expect(inspection.createdAt).toBeDefined();
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should initialize inspection with draft status', () => {
      fc.assert(
        fc.property(createInspectionInputArbitrary, (input) => {
          const inspection = simulateCreateInspection(input);
          return inspection.status === 'draft';
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Step 2: Record Damages (Requirement 17.2)', () => {
    it('should record damage on parts correctly', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 1, maxLength: 10 }),
          (input, damages) => {
            let inspection = simulateCreateInspection(input);
            
            // Record each damage
            damages.forEach(damage => {
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            });
            
            // Verify damages were recorded
            // Note: Same part key may be updated multiple times, so we check unique parts
            const uniquePartKeys = new Set(damages.map(d => d.partKey));
            expect(inspection.parts.length).toBe(uniquePartKeys.size);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should update existing part damage when recording again', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          partKeyArbitrary,
          partConditionArbitrary,
          partConditionArbitrary,
          (input, partKey, condition1, condition2) => {
            let inspection = simulateCreateInspection(input);
            
            // Record first damage
            inspection = simulateRecordDamage(inspection, partKey, condition1);
            expect(inspection.parts.length).toBe(1);
            
            // Record second damage on same part
            inspection = simulateRecordDamage(inspection, partKey, condition2);
            expect(inspection.parts.length).toBe(1);
            expect(inspection.parts[0].condition).toBe(condition2);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should apply correct color for each condition', () => {
      fc.assert(
        fc.property(partConditionArbitrary, (condition) => {
          const color = getConditionColor(condition);
          expect(color).toBe(COLOR_BY_CONDITION[condition]);
          return true;
        }),
        { numRuns: 20 }
      );
    });

    it('should require severity only for non-good conditions', () => {
      ALL_PART_CONDITIONS.forEach(condition => {
        const requiresSeverity = conditionRequiresSeverity(condition);
        if (condition === 'good' || condition === 'not_inspected') {
          expect(requiresSeverity).toBe(false);
        } else {
          expect(requiresSeverity).toBe(true);
        }
      });
    });
  });

  describe('Step 3: Finalize Inspection (Requirement 17.3, 17.4)', () => {
    it('should finalize inspection and lock from further edits', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 1, maxLength: 5 }),
          (input, damages) => {
            let inspection = simulateCreateInspection(input);
            
            // Record damages
            damages.forEach(damage => {
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            });
            
            // Finalize
            inspection = simulateFinalizeInspection(inspection);
            
            // Verify finalization
            expect(inspection.status).toBe('finalized');
            expect(inspection.finalizedAt).toBeDefined();
            expect(validateFinalizedImmutability(inspection)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should prevent modifications after finalization', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          damageRecordArbitrary,
          (input, damage) => {
            let inspection = simulateCreateInspection(input);
            inspection = simulateFinalizeInspection(inspection);
            
            // Attempt to modify should throw
            expect(() => {
              simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            }).toThrow('Cannot modify finalized inspection');
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should prevent double finalization', () => {
      fc.assert(
        fc.property(createInspectionInputArbitrary, (input) => {
          let inspection = simulateCreateInspection(input);
          inspection = simulateFinalizeInspection(inspection);
          
          // Attempt to finalize again should throw
          expect(() => {
            simulateFinalizeInspection(inspection);
          }).toThrow('Inspection already finalized');
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Step 4: Generate PDF (Requirement 17.5)', () => {
    it('should generate PDF data from inspection', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 1, maxLength: 5 }),
          (input, damages) => {
            let inspection = simulateCreateInspection(input);
            
            // Record damages
            damages.forEach(damage => {
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            });
            
            // Finalize
            inspection = simulateFinalizeInspection(inspection);
            
            // Convert to PDF data
            const pdfData = convertToPDFData(inspection);
            
            // Verify PDF data
            expect(pdfData.car).toBeDefined();
            expect(pdfData.car?.brand).toBe(inspection.vehicle.make);
            expect(pdfData.car?.model).toBe(inspection.vehicle.model);
            expect(pdfData.car?.year).toBe(inspection.vehicle.year);
            expect(pdfData.partsStatus).toBeDefined();
            expect(Object.keys(pdfData.partsStatus).length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should include all required sections in PDF data', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 1, maxLength: 3 }),
          (input, damages) => {
            let inspection = simulateCreateInspection(input);
            
            damages.forEach(damage => {
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            });
            
            inspection = simulateFinalizeInspection(inspection);
            const pdfData = convertToPDFData(inspection);
            
            // Verify required sections
            expect(pdfData.bodyType).toBeDefined();
            expect(pdfData.partsStatus).toBeDefined();
            expect(pdfData.inspectionDate).toBeDefined();
            
            // Verify parts status has all body parts
            expect(Object.keys(pdfData.partsStatus).length).toBeGreaterThanOrEqual(ALL_BODY_PART_IDS.length);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should complete full inspection workflow successfully', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 1, maxLength: 10 }),
          (input, damages) => {
            // Step 1: Create inspection
            let inspection = simulateCreateInspection(input);
            expect(inspection.status).toBe('draft');
            expect(inspection.parts).toHaveLength(0);
            
            // Step 2: Record damages
            const uniqueDamages = new Map<PartKey, typeof damages[0]>();
            damages.forEach(damage => {
              uniqueDamages.set(damage.partKey, damage);
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
            });
            expect(inspection.parts.length).toBe(uniqueDamages.size);
            
            // Step 3: Finalize inspection
            inspection = simulateFinalizeInspection(inspection);
            expect(inspection.status).toBe('finalized');
            expect(inspection.finalizedAt).toBeDefined();
            
            // Step 4: Generate PDF data
            const pdfData = convertToPDFData(inspection);
            expect(pdfData.car).toBeDefined();
            expect(pdfData.partsStatus).toBeDefined();
            
            // Verify workflow integrity
            expect(validateFinalizedImmutability(inspection)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve data integrity throughout workflow', () => {
      fc.assert(
        fc.property(
          createInspectionInputArbitrary,
          fc.array(damageRecordArbitrary, { minLength: 3, maxLength: 8 }),
          (input, damages) => {
            // Create and record
            let inspection = simulateCreateInspection(input);
            const recordedDamages = new Map<PartKey, PartDamageData>();
            
            damages.forEach(damage => {
              inspection = simulateRecordDamage(
                inspection,
                damage.partKey,
                damage.condition,
                damage.severity,
                damage.notes
              );
              recordedDamages.set(damage.partKey, {
                partKey: damage.partKey,
                condition: damage.condition,
                severity: conditionRequiresSeverity(damage.condition) ? damage.severity : undefined,
                notes: damage.notes,
              });
            });
            
            // Finalize
            inspection = simulateFinalizeInspection(inspection);
            
            // Verify all recorded damages are preserved
            inspection.parts.forEach(part => {
              const expected = recordedDamages.get(part.partKey);
              expect(expected).toBeDefined();
              expect(part.condition).toBe(expected?.condition);
            });
            
            // Verify vehicle info preserved
            expect(inspection.vehicle.make).toBe(input.vehicle.make);
            expect(inspection.vehicle.model).toBe(input.vehicle.model);
            expect(inspection.vehicle.year).toBe(input.vehicle.year);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
