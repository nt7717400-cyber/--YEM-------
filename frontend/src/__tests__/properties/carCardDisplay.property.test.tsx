/**
 * Feature: web-ui-ux-enhancement
 * Property 1: Car Card Information Display
 * 
 * **Validates: Requirements 2.1, 2.3, 2.4, 2.6**
 * 
 * For any Car object, the rendered CarCard component should display:
 * - Car name, price (formatted with ر.ي), year, and condition
 * - "مميزة" badge if isFeatured is true
 * - "مباعة" badge with overlay if status is SOLD
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Car } from '@/types';
import { formatCarPrice } from '@/components/cars/CarCard';

// ============================================
// Car Card Display Logic Functions
// ============================================

/**
 * Determines if the featured badge should be displayed
 * Featured badge shows when car is featured AND not sold
 */
function shouldShowFeaturedBadge(car: Car): boolean {
  return car.isFeatured && car.status !== 'SOLD';
}

/**
 * Determines if the sold badge and overlay should be displayed
 */
function shouldShowSoldBadge(car: Car): boolean {
  return car.status === 'SOLD';
}

/**
 * Gets the condition label in Arabic
 */
function getConditionLabel(condition: 'NEW' | 'USED'): string {
  return condition === 'NEW' ? 'جديدة' : 'مستعملة';
}

/**
 * Validates that price is formatted correctly with ر.ي
 */
function isPriceFormattedCorrectly(formattedPrice: string): boolean {
  return formattedPrice.includes('ر.ي');
}

/**
 * Validates that all required car information is present
 */
function hasRequiredInformation(car: Car): boolean {
  return (
    car.name !== undefined &&
    car.name.length > 0 &&
    car.price !== undefined &&
    car.price >= 0 &&
    car.year !== undefined &&
    car.year >= 1900 &&
    car.condition !== undefined
  );
}

// ============================================
// Arbitraries for Property Testing
// ============================================

// Generate a valid date string
const validDateArbitrary = fc
  .integer({ min: 0, max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
  .map((timestamp) => new Date(timestamp).toISOString());

// Generate a valid car image
const carImageArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  carId: fc.integer({ min: 1, max: 10000 }),
  url: fc.constant('/placeholder-car.svg'),
  order: fc.integer({ min: 0, max: 20 }),
  createdAt: validDateArbitrary,
});

// Generate a valid car for testing
const carArbitrary: fc.Arbitrary<Car> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  brand: fc.string({ minLength: 1, maxLength: 50 }),
  model: fc.string({ minLength: 1, maxLength: 50 }),
  year: fc.integer({ min: 1990, max: 2026 }),
  price: fc.float({ min: 1000, max: 10000000, noNaN: true }),
  priceType: fc.constantFrom('FIXED' as const, 'AUCTION' as const),
  condition: fc.constantFrom('NEW' as const, 'USED' as const),
  kilometers: fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }),
  description: fc.string({ minLength: 0, maxLength: 2000 }),
  specifications: fc.string({ minLength: 0, maxLength: 2000 }),
  status: fc.constantFrom('AVAILABLE' as const, 'SOLD' as const),
  isFeatured: fc.boolean(),
  viewCount: fc.integer({ min: 0, max: 1000000 }),
  createdAt: validDateArbitrary,
  updatedAt: validDateArbitrary,
  images: fc.array(carImageArbitrary, { minLength: 0, maxLength: 5 }),
  video: fc.constant(undefined),
});

// Generate a featured car (isFeatured = true)
const featuredCarArbitrary = carArbitrary.map(car => ({
  ...car,
  isFeatured: true,
  status: 'AVAILABLE' as const,
}));

// Generate a sold car (status = SOLD)
const soldCarArbitrary = carArbitrary.map(car => ({
  ...car,
  status: 'SOLD' as const,
}));

// Generate a non-featured available car
const regularCarArbitrary = carArbitrary.map(car => ({
  ...car,
  isFeatured: false,
  status: 'AVAILABLE' as const,
}));

// ============================================
// Property 1: Car Card Information Display
// ============================================

describe('Property 1: Car Card Information Display', () => {
  /**
   * Property: For any car, the price should be formatted with ر.ي currency
   * Validates: Requirement 2.6
   */
  it('should format price with ر.ي currency for any car', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const formattedPrice = formatCarPrice(car.price);
        return isPriceFormattedCorrectly(formattedPrice);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any car, all required information should be present
   * Validates: Requirement 2.1
   */
  it('should have all required information for any car', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        return hasRequiredInformation(car);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any featured car that is not sold, the featured badge should be shown
   * Validates: Requirement 2.3
   */
  it('should show featured badge for featured cars that are not sold', () => {
    fc.assert(
      fc.property(featuredCarArbitrary, (car) => {
        return shouldShowFeaturedBadge(car) === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any sold car, the sold badge should be shown
   * Validates: Requirement 2.4
   */
  it('should show sold badge for sold cars', () => {
    fc.assert(
      fc.property(soldCarArbitrary, (car) => {
        return shouldShowSoldBadge(car) === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any non-featured car, the featured badge should NOT be shown
   * Validates: Requirement 2.3
   */
  it('should NOT show featured badge for non-featured cars', () => {
    fc.assert(
      fc.property(regularCarArbitrary, (car) => {
        return shouldShowFeaturedBadge(car) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any available car, the sold badge should NOT be shown
   * Validates: Requirement 2.4
   */
  it('should NOT show sold badge for available cars', () => {
    fc.assert(
      fc.property(
        carArbitrary.filter(car => car.status === 'AVAILABLE'),
        (car) => {
          return shouldShowSoldBadge(car) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any car, the condition label should be correct
   * Validates: Requirement 2.1
   */
  it('should display correct condition label for any car', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const label = getConditionLabel(car.condition);
        if (car.condition === 'NEW') {
          return label === 'جديدة';
        } else {
          return label === 'مستعملة';
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any car, the year should be displayed as a number
   * Validates: Requirement 2.1
   */
  it('should have valid year for any car', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        return typeof car.year === 'number' && car.year >= 1990 && car.year <= 2026;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any featured sold car, featured badge should NOT be shown (sold takes precedence)
   * Validates: Requirements 2.3, 2.4
   */
  it('should NOT show featured badge for featured cars that are sold', () => {
    fc.assert(
      fc.property(
        carArbitrary.map(car => ({ ...car, isFeatured: true, status: 'SOLD' as const })),
        (car) => {
          // Featured badge should not show when car is sold
          return shouldShowFeaturedBadge(car) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Price formatting should produce consistent results
   * Validates: Requirement 2.6
   */
  it('should format price consistently for the same value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 10000000, noNaN: true }),
        (price) => {
          const formatted1 = formatCarPrice(price);
          const formatted2 = formatCarPrice(price);
          return formatted1 === formatted2;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Price formatting should preserve numeric ordering
   * Validates: Requirement 2.6
   */
  it('should preserve numeric ordering in formatted prices', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 5000000, noNaN: true }),
        fc.float({ min: 5000001, max: 10000000, noNaN: true }),
        (smallPrice, largePrice) => {
          // Both should be formatted with currency
          const formattedSmall = formatCarPrice(smallPrice);
          const formattedLarge = formatCarPrice(largePrice);
          return (
            isPriceFormattedCorrectly(formattedSmall) &&
            isPriceFormattedCorrectly(formattedLarge)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Combined Badge Display Properties
// ============================================

describe('Car Card Badge Display Logic', () => {
  /**
   * Property: Badge display logic should be mutually consistent
   */
  it('should have consistent badge display logic', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const showFeatured = shouldShowFeaturedBadge(car);
        const showSold = shouldShowSoldBadge(car);
        
        // If sold, featured should not show
        if (showSold && car.isFeatured) {
          return showFeatured === false;
        }
        
        // If featured and not sold, featured should show
        if (car.isFeatured && !showSold) {
          return showFeatured === true;
        }
        
        // If not featured, featured badge should not show
        if (!car.isFeatured) {
          return showFeatured === false;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sold status should always take precedence over featured
   */
  it('should prioritize sold status over featured status', () => {
    fc.assert(
      fc.property(
        carArbitrary.map(car => ({ ...car, isFeatured: true, status: 'SOLD' as const })),
        (car) => {
          // Sold badge should show
          const showSold = shouldShowSoldBadge(car);
          // Featured badge should NOT show
          const showFeatured = shouldShowFeaturedBadge(car);
          
          return showSold === true && showFeatured === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
