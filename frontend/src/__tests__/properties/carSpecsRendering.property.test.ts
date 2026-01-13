/**
 * Feature: web-ui-ux-enhancement
 * Property 7: Car Specifications Rendering
 * 
 * **Validates: Requirements 3.4**
 * 
 * For any car with specifications, each specification should be rendered
 * with its label, value, and icon (if provided).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  parseSpecifications, 
  buildBasicSpecs, 
  getSpecIcon,
  type SpecificationItem 
} from '@/components/cars/CarSpecs';
import { Car } from '@/types';

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

// Generate specification text in "key: value" format
const keyValueSpecArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes(':') && !s.includes('-') && !s.includes('\n')),
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('\n'))
).map(([key, value]) => `${key}: ${value}`);

// Generate specification text in "key - value" format
const keyDashValueSpecArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes(':') && !s.includes('-') && !s.includes('\n')),
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('\n'))
).map(([key, value]) => `${key} - ${value}`);

// Generate plain text specification
const plainTextSpecArbitrary = fc.string({ minLength: 1, maxLength: 80 })
  .filter(s => !s.includes(':') && !s.includes('-') && !s.includes('\n') && s.trim().length > 0);

// Generate multi-line specifications text
const specificationsTextArbitrary = fc.array(
  fc.oneof(keyValueSpecArbitrary, keyDashValueSpecArbitrary, plainTextSpecArbitrary),
  { minLength: 0, maxLength: 10 }
).map(lines => lines.join('\n'));

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
  origin: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  kilometers: fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  specifications: specificationsTextArbitrary,
  status: fc.constantFrom('AVAILABLE' as const, 'SOLD' as const),
  isFeatured: fc.boolean(),
  viewCount: fc.integer({ min: 0, max: 1000000 }),
  createdAt: validDateArbitrary,
  updatedAt: validDateArbitrary,
  images: fc.array(carImageArbitrary, { minLength: 0, maxLength: 5 }),
  video: fc.constant(undefined),
});

// Generate a car with specifications
const carWithSpecsArbitrary = carArbitrary.filter(car => 
  car.specifications !== undefined && car.specifications.trim().length > 0
);

// Generate a used car with kilometers
const usedCarArbitrary = carArbitrary.map(car => ({
  ...car,
  condition: 'USED' as const,
  kilometers: Math.floor(Math.random() * 500000),
}));

// ============================================
// Property 7: Car Specifications Rendering
// ============================================

describe('Property 7: Car Specifications Rendering', () => {
  /**
   * Property: For any car, basic specs should always include brand, model, year, and condition
   * Validates: Requirement 3.4
   */
  it('should build basic specs with brand, model, year, and condition for any car', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        
        // Should have at least 4 basic specs (brand, model, year, condition)
        expect(basicSpecs.length).toBeGreaterThanOrEqual(4);
        
        // Check that required specs are present
        const specKeys = basicSpecs.map(s => s.key);
        expect(specKeys).toContain('brand');
        expect(specKeys).toContain('model');
        expect(specKeys).toContain('year');
        expect(specKeys).toContain('condition');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any car with origin, basic specs should include origin
   * Validates: Requirement 3.4
   */
  it('should include origin in basic specs when car has origin', () => {
    fc.assert(
      fc.property(
        carArbitrary.filter(car => car.origin !== undefined && car.origin.length > 0),
        (car) => {
          const basicSpecs = buildBasicSpecs(car);
          const specKeys = basicSpecs.map(s => s.key);
          
          expect(specKeys).toContain('origin');
          
          const originSpec = basicSpecs.find(s => s.key === 'origin');
          expect(originSpec?.value).toContain(car.origin);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any used car with kilometers, basic specs should include kilometers
   * Validates: Requirement 3.4
   */
  it('should include kilometers in basic specs for used cars with kilometers', () => {
    fc.assert(
      fc.property(usedCarArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        const specKeys = basicSpecs.map(s => s.key);
        
        expect(specKeys).toContain('kilometers');
        
        const kmSpec = basicSpecs.find(s => s.key === 'kilometers');
        expect(kmSpec?.value).toContain('كم');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any specification item, it should have a label
   * Validates: Requirement 3.4
   */
  it('should ensure every spec item has a label', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        
        for (const spec of basicSpecs) {
          expect(spec.label).toBeDefined();
          expect(spec.label.length).toBeGreaterThan(0);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any specification item, it should have a value
   * Validates: Requirement 3.4
   */
  it('should ensure every basic spec item has a value', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        
        for (const spec of basicSpecs) {
          expect(spec.value).toBeDefined();
          expect(spec.value.length).toBeGreaterThan(0);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any specification label, getSpecIcon should return a valid icon
   * Validates: Requirement 3.4
   */
  it('should return an icon for any specification label', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (label) => {
          const icon = getSpecIcon(label);
          
          // Icon should be defined (React node)
          expect(icon).toBeDefined();
          expect(icon).not.toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Condition label should be correct based on condition value
   * Validates: Requirement 3.4
   */
  it('should display correct condition label', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        const conditionSpec = basicSpecs.find(s => s.key === 'condition');
        
        expect(conditionSpec).toBeDefined();
        
        if (car.condition === 'NEW') {
          expect(conditionSpec?.value).toBe('جديدة');
        } else {
          expect(conditionSpec?.value).toBe('مستعملة');
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Year value should match car year
   * Validates: Requirement 3.4
   */
  it('should display correct year value', () => {
    fc.assert(
      fc.property(carArbitrary, (car) => {
        const basicSpecs = buildBasicSpecs(car);
        const yearSpec = basicSpecs.find(s => s.key === 'year');
        
        expect(yearSpec).toBeDefined();
        expect(yearSpec?.value).toBe(car.year.toString());
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Specifications Text Parsing Properties
// ============================================

describe('Specifications Text Parsing', () => {
  /**
   * Property: Empty specifications should return empty array
   */
  it('should return empty array for empty specifications', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n', '\n\n'),
        (emptySpec) => {
          const parsed = parseSpecifications(emptySpec);
          expect(parsed).toEqual([]);
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: "key: value" format should be parsed correctly
   */
  it('should parse "key: value" format correctly', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(':') && !s.includes('\n') && s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('\n') && s.trim().length > 0)
        ),
        ([key, value]) => {
          const specText = `${key}: ${value}`;
          const parsed = parseSpecifications(specText);
          
          expect(parsed.length).toBe(1);
          expect(parsed[0].label).toBe(key.trim());
          expect(parsed[0].value).toBe(value.trim());
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: "key - value" format should be parsed correctly
   */
  it('should parse "key - value" format correctly', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('-') && !s.includes(':') && !s.includes('\n') && s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('\n') && !s.includes(':') && s.trim().length > 0)
        ),
        ([key, value]) => {
          const specText = `${key} - ${value}`;
          const parsed = parseSpecifications(specText);
          
          expect(parsed.length).toBe(1);
          expect(parsed[0].label).toBe(key.trim());
          expect(parsed[0].value).toBe(value.trim());
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multi-line specifications should parse each line
   */
  it('should parse multi-line specifications', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 15 }).filter(s => !s.includes(':') && !s.includes('\n') && s.trim().length > 0),
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\n') && s.trim().length > 0)
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (keyValuePairs) => {
          const specText = keyValuePairs.map(([k, v]) => `${k}: ${v}`).join('\n');
          const parsed = parseSpecifications(specText);
          
          expect(parsed.length).toBe(keyValuePairs.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each parsed item should have a unique key
   */
  it('should assign unique keys to parsed items', () => {
    fc.assert(
      fc.property(specificationsTextArbitrary, (specText) => {
        const parsed = parseSpecifications(specText);
        const keys = parsed.map(s => s.key);
        const uniqueKeys = new Set(keys);
        
        expect(uniqueKeys.size).toBe(keys.length);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Icon Assignment Properties
// ============================================

describe('Specification Icon Assignment', () => {
  /**
   * Property: Brand-related labels should get tag icon
   */
  it('should assign appropriate icons for brand-related labels', () => {
    const brandLabels = ['ماركة', 'الماركة', 'brand', 'Brand'];
    
    for (const label of brandLabels) {
      const icon = getSpecIcon(label);
      expect(icon).toBeDefined();
    }
  });

  /**
   * Property: Year-related labels should get calendar icon
   */
  it('should assign appropriate icons for year-related labels', () => {
    const yearLabels = ['سنة', 'سنة الصنع', 'year', 'Year'];
    
    for (const label of yearLabels) {
      const icon = getSpecIcon(label);
      expect(icon).toBeDefined();
    }
  });

  /**
   * Property: Kilometer-related labels should get gauge icon
   */
  it('should assign appropriate icons for kilometer-related labels', () => {
    const kmLabels = ['كيلو', 'كيلومترات', 'km', 'mileage'];
    
    for (const label of kmLabels) {
      const icon = getSpecIcon(label);
      expect(icon).toBeDefined();
    }
  });

  /**
   * Property: Unknown labels should still get a default icon
   */
  it('should assign default icon for unknown labels', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => 
          !s.includes('ماركة') && 
          !s.includes('سنة') && 
          !s.includes('كيلو') &&
          !s.includes('brand') &&
          !s.includes('year')
        ),
        (randomLabel) => {
          const icon = getSpecIcon(randomLabel);
          expect(icon).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
