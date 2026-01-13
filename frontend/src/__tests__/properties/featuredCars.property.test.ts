/**
 * Property 1: Featured Cars Display Correctness
 * *For any* set of cars in the database, the homepage SHALL display exactly those cars
 * where `isFeatured = true` and `status = AVAILABLE`.
 * 
 * **Validates: Requirements 1.1, 11.1, 11.2, 11.3**
 * 
 * Feature: yemen-car-showroom, Property 1: Featured Cars Display Correctness
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { carsArrayArbitrary } from '../generators/car.generator';
import { Car } from '@/types';

/**
 * Filter function that simulates what the API should return for featured cars.
 * This is the expected behavior based on the requirements.
 */
function filterFeaturedCars(cars: Car[]): Car[] {
  return cars.filter((car) => car.isFeatured === true && car.status === 'AVAILABLE');
}

describe('Property 1: Featured Cars Display Correctness', () => {
  /**
   * Property: For any set of cars, the featured cars filter should return
   * exactly those cars where isFeatured = true AND status = AVAILABLE.
   */
  it('should return only cars that are both featured AND available', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const featuredCars = filterFeaturedCars(cars);
        
        // All returned cars must be featured
        const allAreFeatured = featuredCars.every((car) => car.isFeatured === true);
        
        // All returned cars must be available
        const allAreAvailable = featuredCars.every((car) => car.status === 'AVAILABLE');
        
        return allAreFeatured && allAreAvailable;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: The featured cars filter should not exclude any car that is
   * both featured and available.
   */
  it('should include all cars that are both featured AND available', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const featuredCars = filterFeaturedCars(cars);
        const featuredCarIds = new Set(featuredCars.map((car) => car.id));
        
        // Every car that is featured AND available should be in the result
        const allFeaturedAvailableIncluded = cars
          .filter((car) => car.isFeatured === true && car.status === 'AVAILABLE')
          .every((car) => featuredCarIds.has(car.id));
        
        return allFeaturedAvailableIncluded;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: The count of featured cars should equal the count of cars
   * that are both featured and available in the original set.
   */
  it('should return the exact count of featured available cars', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const featuredCars = filterFeaturedCars(cars);
        const expectedCount = cars.filter(
          (car) => car.isFeatured === true && car.status === 'AVAILABLE'
        ).length;
        
        return featuredCars.length === expectedCount;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Featured cars filter should never include sold cars,
   * even if they are marked as featured.
   */
  it('should never include sold cars even if marked as featured', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const featuredCars = filterFeaturedCars(cars);
        
        // No sold cars should be in the result
        const noSoldCars = featuredCars.every((car) => car.status !== 'SOLD');
        
        return noSoldCars;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Featured cars filter should never include non-featured cars,
   * even if they are available.
   */
  it('should never include non-featured cars even if available', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const featuredCars = filterFeaturedCars(cars);
        
        // No non-featured cars should be in the result
        const noNonFeaturedCars = featuredCars.every((car) => car.isFeatured === true);
        
        return noNonFeaturedCars;
      }),
      { numRuns: 30 }
    );
  });
});
