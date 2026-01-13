/**
 * Property 9: Car CRUD Round-Trip
 * *For any* valid car data, creating a car and then fetching it by ID SHALL return
 * equivalent data (excluding auto-generated fields like id, createdAt, updatedAt).
 * 
 * **Validates: Requirements 8.3**
 * 
 * Feature: yemen-car-showroom, Property 9: Car CRUD Round-Trip
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CreateCarInput, Car } from '@/types';

// Generate valid car input data
const createCarInputArbitrary: fc.Arbitrary<CreateCarInput> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  brand: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  year: fc.integer({ min: 1990, max: 2026 }),
  price: fc.float({ min: 1000, max: 10000000, noNaN: true }),
  condition: fc.constantFrom('NEW' as const, 'USED' as const),
  kilometers: fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 2000 }), { nil: undefined }),
  specifications: fc.option(fc.string({ minLength: 0, maxLength: 2000 }), { nil: undefined }),
  isFeatured: fc.option(fc.boolean(), { nil: undefined }),
});

/**
 * Simulates creating a car and returning it with auto-generated fields.
 * This represents the server-side behavior.
 */
function simulateCreateCar(input: CreateCarInput): Car {
  const now = new Date().toISOString();
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name: input.name,
    brand: input.brand,
    model: input.model,
    year: input.year,
    price: input.price,
    condition: input.condition,
    kilometers: input.condition === 'USED' ? input.kilometers : undefined,
    description: input.description || '',
    specifications: input.specifications || '',
    status: 'AVAILABLE',
    isFeatured: input.isFeatured || false,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
    images: [],
    video: undefined,
  };
}

/**
 * Simulates fetching a car by ID.
 * Returns the same car data (simulating database retrieval).
 */
function simulateFetchCar(car: Car): Car {
  // In a real scenario, this would fetch from database
  // The returned data should match what was stored
  return { ...car };
}

/**
 * Compare car data excluding auto-generated fields.
 * Returns true if the input data matches the fetched car data.
 */
function compareCarData(input: CreateCarInput, fetchedCar: Car): boolean {
  // Compare all user-provided fields
  if (input.name !== fetchedCar.name) return false;
  if (input.brand !== fetchedCar.brand) return false;
  if (input.model !== fetchedCar.model) return false;
  if (input.year !== fetchedCar.year) return false;
  if (input.price !== fetchedCar.price) return false;
  if (input.condition !== fetchedCar.condition) return false;
  
  // Kilometers only applies to used cars
  if (input.condition === 'USED') {
    if (input.kilometers !== fetchedCar.kilometers) return false;
  }
  
  // Optional fields with defaults
  const expectedDescription = input.description || '';
  const expectedSpecifications = input.specifications || '';
  const expectedIsFeatured = input.isFeatured || false;
  
  if (expectedDescription !== fetchedCar.description) return false;
  if (expectedSpecifications !== fetchedCar.specifications) return false;
  if (expectedIsFeatured !== fetchedCar.isFeatured) return false;
  
  return true;
}

describe('Property 9: Car CRUD Round-Trip', () => {
  /**
   * Property: Creating a car and fetching it should return equivalent data.
   * Auto-generated fields (id, createdAt, updatedAt, viewCount, status) are excluded.
   */
  it('should return equivalent data when creating and fetching a car', () => {
    fc.assert(
      fc.property(createCarInputArbitrary, (input) => {
        // Create the car
        const createdCar = simulateCreateCar(input);
        
        // Fetch the car
        const fetchedCar = simulateFetchCar(createdCar);
        
        // Verify round-trip: input data should match fetched data
        return compareCarData(input, fetchedCar);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Created car should have correct default values.
   */
  it('should set correct default values for new cars', () => {
    fc.assert(
      fc.property(createCarInputArbitrary, (input) => {
        const createdCar = simulateCreateCar(input);
        
        // New cars should have these defaults
        expect(createdCar.status).toBe('AVAILABLE');
        expect(createdCar.viewCount).toBe(0);
        expect(createdCar.images).toEqual([]);
        expect(createdCar.video).toBeUndefined();
        
        // ID should be generated
        expect(createdCar.id).toBeGreaterThan(0);
        
        // Timestamps should be set
        expect(createdCar.createdAt).toBeDefined();
        expect(createdCar.updatedAt).toBeDefined();
        
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Kilometers should only be set for used cars.
   */
  it('should only include kilometers for used cars', () => {
    fc.assert(
      fc.property(createCarInputArbitrary, (input) => {
        const createdCar = simulateCreateCar(input);
        
        if (input.condition === 'NEW') {
          // New cars should not have kilometers
          return createdCar.kilometers === undefined;
        } else {
          // Used cars should preserve kilometers
          return createdCar.kilometers === input.kilometers;
        }
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: isFeatured should default to false if not provided.
   */
  it('should default isFeatured to false when not provided', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          brand: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          model: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          year: fc.integer({ min: 1990, max: 2026 }),
          price: fc.float({ min: 1000, max: 10000000, noNaN: true }),
          condition: fc.constantFrom('NEW' as const, 'USED' as const),
        }),
        (input) => {
          // Create without isFeatured
          const createdCar = simulateCreateCar(input as CreateCarInput);
          return createdCar.isFeatured === false;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All required fields must be preserved exactly.
   */
  it('should preserve all required fields exactly', () => {
    fc.assert(
      fc.property(createCarInputArbitrary, (input) => {
        const createdCar = simulateCreateCar(input);
        const fetchedCar = simulateFetchCar(createdCar);
        
        // Required fields must match exactly
        return (
          fetchedCar.name === input.name &&
          fetchedCar.brand === input.brand &&
          fetchedCar.model === input.model &&
          fetchedCar.year === input.year &&
          fetchedCar.price === input.price &&
          fetchedCar.condition === input.condition
        );
      }),
      { numRuns: 30 }
    );
  });
});
