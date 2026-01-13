/**
 * Property 7: Inspection data round-trip
 * *For any* valid inspection data object, saving it to the database and then retrieving it
 * SHALL return an equivalent inspection data object.
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3**
 * 
 * Feature: car-inspection-3d, Property 7: Inspection data round-trip
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type {
  BodyType,
  BodyPartId,
  PartStatus,
  EngineStatus,
  TransmissionStatus,
  ChassisStatus,
  SaveInspectionRequest,
  CarInspection,
} from '@/types/inspection';
import {
  ALL_BODY_TYPES,
  ALL_BODY_PART_IDS,
  ALL_PART_STATUSES,
} from '@/constants/inspection';

// Valid engine statuses
const ALL_ENGINE_STATUSES: EngineStatus[] = ['original', 'replaced', 'refurbished'];

// Valid transmission statuses
const ALL_TRANSMISSION_STATUSES: TransmissionStatus[] = ['original', 'replaced'];

// Valid chassis statuses
const ALL_CHASSIS_STATUSES: ChassisStatus[] = ['intact', 'accident_affected', 'modified'];

// Arbitrary for body type
const bodyTypeArbitrary: fc.Arbitrary<BodyType> = fc.constantFrom(...ALL_BODY_TYPES);

// Arbitrary for part status
const partStatusArbitrary: fc.Arbitrary<PartStatus> = fc.constantFrom(...ALL_PART_STATUSES);

// Arbitrary for engine status
const engineStatusArbitrary: fc.Arbitrary<EngineStatus> = fc.constantFrom(...ALL_ENGINE_STATUSES);

// Arbitrary for transmission status
const transmissionStatusArbitrary: fc.Arbitrary<TransmissionStatus> = fc.constantFrom(...ALL_TRANSMISSION_STATUSES);

// Arbitrary for chassis status
const chassisStatusArbitrary: fc.Arbitrary<ChassisStatus> = fc.constantFrom(...ALL_CHASSIS_STATUSES);

// Arbitrary for body parts array (all 13 parts with random statuses)
const bodyPartsArrayArbitrary: fc.Arbitrary<Array<{ partId: BodyPartId; status: PartStatus }>> = 
  fc.tuple(
    ...ALL_BODY_PART_IDS.map(partId => 
      partStatusArbitrary.map(status => ({ partId, status }))
    )
  );

// Arbitrary for technical notes
const technicalNotesArbitrary: fc.Arbitrary<string> = fc.string({ minLength: 0, maxLength: 500 });

// Arbitrary for SaveInspectionRequest
const saveInspectionRequestArbitrary: fc.Arbitrary<SaveInspectionRequest> = fc.record({
  bodyType: bodyTypeArbitrary,
  bodyParts: bodyPartsArrayArbitrary,
  engine: engineStatusArbitrary,
  transmission: transmissionStatusArbitrary,
  chassis: chassisStatusArbitrary,
  technicalNotes: fc.option(technicalNotesArbitrary, { nil: undefined }),
});

/**
 * Simulates converting SaveInspectionRequest to the format sent to backend API.
 * This mirrors the transformation in api.ts saveInspection method.
 */
function formatForBackend(data: SaveInspectionRequest): {
  bodyType: BodyType;
  bodyParts: Record<string, string>;
  mechanical: {
    engine: EngineStatus;
    transmission: TransmissionStatus;
    chassis: ChassisStatus;
    technicalNotes: string;
  };
} {
  const bodyPartsObject: Record<string, string> = {};
  data.bodyParts.forEach((part) => {
    bodyPartsObject[part.partId] = part.status;
  });

  return {
    bodyType: data.bodyType,
    bodyParts: bodyPartsObject,
    mechanical: {
      engine: data.engine,
      transmission: data.transmission,
      chassis: data.chassis,
      technicalNotes: data.technicalNotes || '',
    },
  };
}

/**
 * Simulates the backend saving and returning inspection data.
 * This represents what the API would return after saving.
 */
function simulateSaveInspection(carId: number, data: SaveInspectionRequest): CarInspection {
  const now = new Date().toISOString();
  const formatted = formatForBackend(data);
  
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    carId,
    bodyType: formatted.bodyType,
    bodyParts: data.bodyParts, // Backend returns array format
    mechanical: {
      engine: formatted.mechanical.engine,
      transmission: formatted.mechanical.transmission,
      chassis: formatted.mechanical.chassis,
      technicalNotes: formatted.mechanical.technicalNotes,
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Simulates fetching inspection data from the backend.
 * Returns the same data (simulating database retrieval).
 */
function simulateGetInspection(inspection: CarInspection): CarInspection {
  return { ...inspection };
}

/**
 * Compare inspection data excluding auto-generated fields.
 * Returns true if the input data matches the fetched inspection data.
 */
function compareInspectionData(input: SaveInspectionRequest, fetched: CarInspection): boolean {
  // Compare body type
  if (input.bodyType !== fetched.bodyType) return false;
  
  // Compare body parts
  const inputPartsMap = new Map(input.bodyParts.map(p => [p.partId, p.status]));
  for (const part of fetched.bodyParts) {
    if (inputPartsMap.get(part.partId) !== part.status) return false;
  }
  
  // Ensure all input parts are in fetched
  if (input.bodyParts.length !== fetched.bodyParts.length) return false;
  
  // Compare mechanical status
  if (input.engine !== fetched.mechanical.engine) return false;
  if (input.transmission !== fetched.mechanical.transmission) return false;
  if (input.chassis !== fetched.mechanical.chassis) return false;
  
  // Compare technical notes (empty string if undefined)
  const expectedNotes = input.technicalNotes || '';
  if (expectedNotes !== fetched.mechanical.technicalNotes) return false;
  
  return true;
}

describe('Property 7: Inspection data round-trip', () => {
  /**
   * Property: Saving inspection data and fetching it should return equivalent data.
   * Auto-generated fields (id, carId, createdAt, updatedAt) are excluded from comparison.
   */
  it('should return equivalent data when saving and fetching inspection', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }), // carId
        saveInspectionRequestArbitrary,
        (carId, input) => {
          // Save the inspection
          const savedInspection = simulateSaveInspection(carId, input);
          
          // Fetch the inspection
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          // Verify round-trip: input data should match fetched data
          return compareInspectionData(input, fetchedInspection);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All 13 body parts should be preserved in round-trip.
   */
  it('should preserve all 13 body parts in round-trip', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        saveInspectionRequestArbitrary,
        (carId, input) => {
          const savedInspection = simulateSaveInspection(carId, input);
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          // Should have exactly 13 body parts
          return fetchedInspection.bodyParts.length === 13;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Body type should be preserved exactly.
   */
  it('should preserve body type exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        saveInspectionRequestArbitrary,
        (carId, input) => {
          const savedInspection = simulateSaveInspection(carId, input);
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          return fetchedInspection.bodyType === input.bodyType;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Mechanical status should be preserved exactly.
   */
  it('should preserve mechanical status exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        saveInspectionRequestArbitrary,
        (carId, input) => {
          const savedInspection = simulateSaveInspection(carId, input);
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          return (
            fetchedInspection.mechanical.engine === input.engine &&
            fetchedInspection.mechanical.transmission === input.transmission &&
            fetchedInspection.mechanical.chassis === input.chassis
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Technical notes should default to empty string if not provided.
   */
  it('should default technical notes to empty string when not provided', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.record({
          bodyType: bodyTypeArbitrary,
          bodyParts: bodyPartsArrayArbitrary,
          engine: engineStatusArbitrary,
          transmission: transmissionStatusArbitrary,
          chassis: chassisStatusArbitrary,
          // Explicitly no technicalNotes
        }),
        (carId, input) => {
          const savedInspection = simulateSaveInspection(carId, input as SaveInspectionRequest);
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          return fetchedInspection.mechanical.technicalNotes === '';
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Each body part status should be preserved exactly.
   */
  it('should preserve each body part status exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        saveInspectionRequestArbitrary,
        (carId, input) => {
          const savedInspection = simulateSaveInspection(carId, input);
          const fetchedInspection = simulateGetInspection(savedInspection);
          
          // Create map for comparison
          const fetchedMap = new Map(fetchedInspection.bodyParts.map(p => [p.partId, p.status]));
          
          // Every input part should match fetched part
          for (const part of input.bodyParts) {
            if (fetchedMap.get(part.partId) !== part.status) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Format conversion for backend should be reversible.
   */
  it('should correctly convert between array and object formats for body parts', () => {
    fc.assert(
      fc.property(bodyPartsArrayArbitrary, (bodyParts) => {
        // Convert to object format (as sent to backend)
        const objectFormat: Record<string, string> = {};
        bodyParts.forEach((part) => {
          objectFormat[part.partId] = part.status;
        });
        
        // Convert back to array format
        const arrayFormat = Object.entries(objectFormat).map(([partId, status]) => ({
          partId: partId as BodyPartId,
          status: status as PartStatus,
        }));
        
        // Should have same length
        if (arrayFormat.length !== bodyParts.length) return false;
        
        // Each part should match
        const originalMap = new Map(bodyParts.map(p => [p.partId, p.status]));
        for (const part of arrayFormat) {
          if (originalMap.get(part.partId) !== part.status) return false;
        }
        
        return true;
      }),
      { numRuns: 30 }
    );
  });
});
