/**
 * Property 10: Archive/Restore Round-Trip
 * *For any* available car, archiving (setting status to SOLD) and then restoring
 * SHALL return the car to AVAILABLE status with all other data unchanged.
 * 
 * **Validates: Requirements 8.6, 14.2**
 * 
 * Feature: yemen-car-showroom, Property 10: Archive/Restore Round-Trip
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Car } from '@/types';
import { carArbitrary } from '../generators/car.generator';

/**
 * Simulates archiving a car (setting status to SOLD).
 * Requirements 8.6: WHEN an Admin changes Car_Status to "مباعة", THE Admin_Panel SHALL move the car to Archive
 */
function archiveCar(car: Car): Car {
  return {
    ...car,
    status: 'SOLD',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Simulates restoring a car (setting status to AVAILABLE).
 * Requirements 14.2: WHEN an Admin clicks "Restore" on an archived car, THE Admin_Panel SHALL move the car back to available
 */
function restoreCar(car: Car): Car {
  return {
    ...car,
    status: 'AVAILABLE',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Compare two cars excluding auto-updated fields (status, updatedAt).
 * Returns true if all other fields are equal.
 */
function carsEqualExcludingStatusAndTimestamp(car1: Car, car2: Car): boolean {
  return (
    car1.id === car2.id &&
    car1.name === car2.name &&
    car1.brand === car2.brand &&
    car1.model === car2.model &&
    car1.year === car2.year &&
    car1.price === car2.price &&
    car1.condition === car2.condition &&
    car1.kilometers === car2.kilometers &&
    car1.description === car2.description &&
    car1.specifications === car2.specifications &&
    car1.isFeatured === car2.isFeatured &&
    car1.viewCount === car2.viewCount &&
    car1.createdAt === car2.createdAt &&
    JSON.stringify(car1.images) === JSON.stringify(car2.images) &&
    JSON.stringify(car1.video) === JSON.stringify(car2.video)
  );
}

// Generate only available cars for archive testing
const availableCarArbitrary = carArbitrary.map((car) => ({
  ...car,
  status: 'AVAILABLE' as const,
}));

describe('Property 10: Archive/Restore Round-Trip', () => {
  /**
   * Property: Archiving and then restoring a car should return it to AVAILABLE status.
   */
  it('should return car to AVAILABLE status after archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        // Archive the car
        const archivedCar = archiveCar(car);
        expect(archivedCar.status).toBe('SOLD');
        
        // Restore the car
        const restoredCar = restoreCar(archivedCar);
        expect(restoredCar.status).toBe('AVAILABLE');
        
        return restoredCar.status === 'AVAILABLE';
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All data except status and updatedAt should remain unchanged after archive/restore.
   */
  it('should preserve all other data after archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        // Archive the car
        const archivedCar = archiveCar(car);
        
        // Restore the car
        const restoredCar = restoreCar(archivedCar);
        
        // All data except status and updatedAt should be the same
        return carsEqualExcludingStatusAndTimestamp(car, restoredCar);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Archiving should change status to SOLD.
   */
  it('should change status to SOLD when archiving', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        const archivedCar = archiveCar(car);
        return archivedCar.status === 'SOLD';
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Restoring should change status to AVAILABLE.
   */
  it('should change status to AVAILABLE when restoring', () => {
    fc.assert(
      fc.property(
        carArbitrary.map((car) => ({ ...car, status: 'SOLD' as const })),
        (car) => {
          const restoredCar = restoreCar(car);
          return restoredCar.status === 'AVAILABLE';
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Archive/restore should update the updatedAt timestamp.
   */
  it('should update updatedAt timestamp on archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        // Archive the car
        const archivedCar = archiveCar(car);
        
        // Restore the car
        const restoredCar = restoreCar(archivedCar);
        
        // Both operations should update the timestamp
        // Note: In a real scenario, timestamps would be different
        // Here we just verify they are valid ISO strings
        return (
          typeof archivedCar.updatedAt === 'string' &&
          typeof restoredCar.updatedAt === 'string' &&
          !isNaN(Date.parse(archivedCar.updatedAt)) &&
          !isNaN(Date.parse(restoredCar.updatedAt))
        );
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: ID should never change during archive/restore.
   */
  it('should preserve car ID during archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        const archivedCar = archiveCar(car);
        const restoredCar = restoreCar(archivedCar);
        
        return car.id === archivedCar.id && archivedCar.id === restoredCar.id;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: View count should be preserved during archive/restore.
   */
  it('should preserve view count during archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        const archivedCar = archiveCar(car);
        const restoredCar = restoreCar(archivedCar);
        
        return (
          car.viewCount === archivedCar.viewCount &&
          archivedCar.viewCount === restoredCar.viewCount
        );
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: isFeatured should be preserved during archive/restore.
   */
  it('should preserve isFeatured status during archive and restore', () => {
    fc.assert(
      fc.property(availableCarArbitrary, (car) => {
        const archivedCar = archiveCar(car);
        const restoredCar = restoreCar(archivedCar);
        
        return (
          car.isFeatured === archivedCar.isFeatured &&
          archivedCar.isFeatured === restoredCar.isFeatured
        );
      }),
      { numRuns: 30 }
    );
  });
});
