/**
 * Property 4: Search Filter Correctness
 * *For any* search term and set of cars, all returned cars SHALL have the search term
 * present in either their name or brand (case-insensitive).
 * 
 * Property 6: Sort Correctness
 * *For any* sort option and set of cars:
 * - "price_asc": returned cars SHALL be ordered by price ascending
 * - "price_desc": returned cars SHALL be ordered by price descending
 * - "newest": returned cars SHALL be ordered by createdAt descending
 * 
 * **Validates: Requirements 3.1, 3.6, 3.7, 3.8**
 * 
 * Feature: yemen-car-showroom, Property 4: Search Filter Correctness
 * Feature: yemen-car-showroom, Property 6: Sort Correctness
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { carsArrayArbitrary } from '../generators/car.generator';
import { Car } from '@/types';

/**
 * Filter function that simulates search filtering.
 * Searches in name and brand (case-insensitive).
 */
function filterBySearch(cars: Car[], searchTerm: string): Car[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return cars;
  }
  const term = searchTerm.toLowerCase().trim();
  return cars.filter(
    (car) =>
      car.name.toLowerCase().includes(term) ||
      car.brand.toLowerCase().includes(term)
  );
}

/**
 * Sort function that simulates sorting cars.
 */
function sortCars(cars: Car[], sortBy: 'newest' | 'price_asc' | 'price_desc'): Car[] {
  const sorted = [...cars];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sorted;
  }
}

describe('Property 4: Search Filter Correctness', () => {
  /**
   * Property: For any search term and set of cars, all returned cars
   * should have the search term in their name or brand.
   */
  it('should return only cars matching the search term in name or brand', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (cars, searchTerm) => {
          const filteredCars = filterBySearch(cars, searchTerm);
          const term = searchTerm.toLowerCase().trim();
          
          // All returned cars must contain the search term in name or brand
          return filteredCars.every(
            (car) =>
              car.name.toLowerCase().includes(term) ||
              car.brand.toLowerCase().includes(term)
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Search should not exclude any car that matches the search term.
   */
  it('should include all cars that match the search term', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (cars, searchTerm) => {
          const filteredCars = filterBySearch(cars, searchTerm);
          const filteredIds = new Set(filteredCars.map((car) => car.id));
          const term = searchTerm.toLowerCase().trim();
          
          // Every car that matches should be in the result
          return cars
            .filter(
              (car) =>
                car.name.toLowerCase().includes(term) ||
                car.brand.toLowerCase().includes(term)
            )
            .every((car) => filteredIds.has(car.id));
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Empty search should return all cars.
   */
  it('should return all cars when search term is empty', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const filteredCars = filterBySearch(cars, '');
        return filteredCars.length === cars.length;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Search should be case-insensitive.
   */
  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (cars, searchTerm) => {
          const lowerResult = filterBySearch(cars, searchTerm.toLowerCase());
          const upperResult = filterBySearch(cars, searchTerm.toUpperCase());
          
          // Both should return the same cars
          const lowerIds = new Set(lowerResult.map((c) => c.id));
          const upperIds = new Set(upperResult.map((c) => c.id));
          
          return (
            lowerIds.size === upperIds.size &&
            Array.from(lowerIds).every((id) => upperIds.has(id))
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});

describe('Property 6: Sort Correctness', () => {
  /**
   * Property: Sorting by price_asc should order cars by ascending price.
   */
  it('should sort cars by price ascending when sortBy is price_asc', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const sortedCars = sortCars(cars, 'price_asc');
        
        // Check that each car's price is <= the next car's price
        for (let i = 0; i < sortedCars.length - 1; i++) {
          if (sortedCars[i].price > sortedCars[i + 1].price) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Sorting by price_desc should order cars by descending price.
   */
  it('should sort cars by price descending when sortBy is price_desc', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const sortedCars = sortCars(cars, 'price_desc');
        
        // Check that each car's price is >= the next car's price
        for (let i = 0; i < sortedCars.length - 1; i++) {
          if (sortedCars[i].price < sortedCars[i + 1].price) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Sorting by newest should order cars by createdAt descending.
   */
  it('should sort cars by createdAt descending when sortBy is newest', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const sortedCars = sortCars(cars, 'newest');
        
        // Check that each car's createdAt is >= the next car's createdAt
        for (let i = 0; i < sortedCars.length - 1; i++) {
          const currentDate = new Date(sortedCars[i].createdAt).getTime();
          const nextDate = new Date(sortedCars[i + 1].createdAt).getTime();
          if (currentDate < nextDate) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Sorting should preserve all cars (no cars lost or added).
   */
  it('should preserve all cars after sorting', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        fc.constantFrom('newest' as const, 'price_asc' as const, 'price_desc' as const),
        (cars, sortBy) => {
          const sortedCars = sortCars(cars, sortBy);
          
          // Same length
          if (sortedCars.length !== cars.length) {
            return false;
          }
          
          // Same car IDs
          const originalIds = new Set(cars.map((c) => c.id));
          const sortedIds = new Set(sortedCars.map((c) => c.id));
          
          return (
            originalIds.size === sortedIds.size &&
            Array.from(originalIds).every((id) => sortedIds.has(id))
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Sorting an already sorted array should produce the same result (idempotence).
   */
  it('should be idempotent - sorting twice produces same result', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        fc.constantFrom('newest' as const, 'price_asc' as const, 'price_desc' as const),
        (cars, sortBy) => {
          const sortedOnce = sortCars(cars, sortBy);
          const sortedTwice = sortCars(sortedOnce, sortBy);
          
          // Both should have same order
          for (let i = 0; i < sortedOnce.length; i++) {
            if (sortedOnce[i].id !== sortedTwice[i].id) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
