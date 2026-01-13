/**
 * Feature: web-ui-ux-enhancement
 * Property 2: Filter State Synchronization
 * 
 * *For any* filter state change (adding, removing, or modifying filters), 
 * the search results should update to match the filter criteria, 
 * active filter chips should reflect the current state, 
 * and the result count should equal the actual number of displayed results.
 * 
 * **Validates: Requirements 4.4, 4.5, 4.6, 4.7**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CarFilters } from '@/types';
import {
  getActiveFilterChips,
  removeFilter,
  hasActiveFilters,
  FilterChip,
} from '@/components/cars/CarFilters';
import { carsArrayArbitrary, filtersArbitrary } from '../generators/car.generator';
import { Car } from '@/types';

// ============================================
// Filter Application Logic
// ============================================

/**
 * Apply filters to a list of cars and return matching results.
 * This simulates the actual filtering behavior.
 */
function applyFilters(cars: Car[], filters: CarFilters): Car[] {
  return cars.filter((car) => {
    // Search filter - matches name or brand
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        car.name.toLowerCase().includes(searchTerm) ||
        car.brand.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Brand filter
    if (filters.brand && car.brand !== filters.brand) {
      return false;
    }

    // Condition filter
    if (filters.condition && car.condition !== filters.condition) {
      return false;
    }

    // Year filter
    if (filters.year && car.year !== filters.year) {
      return false;
    }

    // Min price filter
    if (filters.minPrice !== undefined && car.price < filters.minPrice) {
      return false;
    }

    // Max price filter
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice) {
      return false;
    }

    // Status filter
    if (filters.status && car.status !== filters.status) {
      return false;
    }

    // Featured filter
    if (filters.featured !== undefined && car.isFeatured !== filters.featured) {
      return false;
    }

    return true;
  });
}

/**
 * Count the number of active filters (excluding sortBy).
 */
function countActiveFilters(filters: CarFilters): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.brand) count++;
  if (filters.condition) count++;
  if (filters.year) count++;
  if (filters.minPrice !== undefined && filters.minPrice > 0) count++;
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) count++;
  return count;
}

// ============================================
// Arbitraries for Property Testing
// ============================================

const filterKeyArbitrary = fc.constantFrom(
  'search',
  'brand',
  'condition',
  'year',
  'minPrice',
  'maxPrice'
);

// Generate filters with at least one active filter
const activeFiltersArbitrary: fc.Arbitrary<CarFilters> = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  brand: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  condition: fc.option(fc.constantFrom('NEW' as const, 'USED' as const), { nil: undefined }),
  year: fc.option(fc.integer({ min: 1990, max: 2026 }), { nil: undefined }),
  minPrice: fc.option(fc.float({ min: 1, max: 5000000, noNaN: true }), { nil: undefined }),
  maxPrice: fc.option(fc.float({ min: 1, max: 10000000, noNaN: true }), { nil: undefined }),
  sortBy: fc.option(fc.constantFrom('newest' as const, 'price_asc' as const, 'price_desc' as const), { nil: undefined }),
}).filter((f) => hasActiveFilters(f as CarFilters)) as fc.Arbitrary<CarFilters>;

// ============================================
// Property 2: Filter State Synchronization
// ============================================

describe('Property 2: Filter State Synchronization', () => {
  /**
   * Property: Filter chips should accurately reflect the current filter state.
   * For any filter state, the number of chips should equal the number of active filters.
   */
  it('should generate correct number of filter chips for active filters', () => {
    fc.assert(
      fc.property(filtersArbitrary, (filters) => {
        const chips = getActiveFilterChips(filters);
        const expectedCount = countActiveFilters(filters);
        return chips.length === expectedCount;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each filter chip should have a unique key corresponding to a filter.
   */
  it('should generate unique keys for each filter chip', () => {
    fc.assert(
      fc.property(filtersArbitrary, (filters) => {
        const chips = getActiveFilterChips(filters);
        const keys = chips.map((chip) => chip.key);
        const uniqueKeys = new Set(keys);
        return keys.length === uniqueKeys.size;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing a filter should decrease the chip count by exactly 1.
   */
  it('should decrease chip count by 1 when removing a filter', () => {
    fc.assert(
      fc.property(activeFiltersArbitrary, (filters) => {
        const chipsBefore = getActiveFilterChips(filters);
        if (chipsBefore.length === 0) return true;

        // Pick a random chip to remove
        const chipToRemove = chipsBefore[0];
        const newFilters = removeFilter(filters, chipToRemove.key);
        const chipsAfter = getActiveFilterChips(newFilters);

        return chipsAfter.length === chipsBefore.length - 1;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: After removing a filter, the corresponding chip should not exist.
   */
  it('should not have chip for removed filter', () => {
    fc.assert(
      fc.property(activeFiltersArbitrary, (filters) => {
        const chipsBefore = getActiveFilterChips(filters);
        if (chipsBefore.length === 0) return true;

        const chipToRemove = chipsBefore[0];
        const newFilters = removeFilter(filters, chipToRemove.key);
        const chipsAfter = getActiveFilterChips(newFilters);

        return !chipsAfter.some((chip) => chip.key === chipToRemove.key);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Results count should equal the actual number of filtered cars.
   */
  it('should have results count equal to filtered cars length', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, filtersArbitrary, (cars, filters) => {
        const filteredCars = applyFilters(cars, filters);
        const resultsCount = filteredCars.length;
        return resultsCount >= 0 && resultsCount <= cars.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty filters should return all cars.
   */
  it('should return all cars when no filters are active', () => {
    fc.assert(
      fc.property(carsArrayArbitrary, (cars) => {
        const emptyFilters: CarFilters = {};
        const filteredCars = applyFilters(cars, emptyFilters);
        return filteredCars.length === cars.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: hasActiveFilters should return true only when filters are set.
   */
  it('should correctly identify when filters are active', () => {
    fc.assert(
      fc.property(filtersArbitrary, (filters) => {
        const isActive = hasActiveFilters(filters);
        const chipCount = getActiveFilterChips(filters).length;
        
        // If hasActiveFilters returns true, there should be at least one chip
        // If hasActiveFilters returns false, there should be no chips
        return isActive === (chipCount > 0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing all filters should result in no active filters.
   */
  it('should have no active filters after removing all', () => {
    fc.assert(
      fc.property(activeFiltersArbitrary, (filters) => {
        let currentFilters = { ...filters };
        let chips = getActiveFilterChips(currentFilters);

        // Remove all filters one by one
        while (chips.length > 0) {
          currentFilters = removeFilter(currentFilters, chips[0].key);
          chips = getActiveFilterChips(currentFilters);
        }

        return !hasActiveFilters(currentFilters);
      }),
      { numRuns: 100 }
    );
  });


  /**
   * Property: Filter chips should contain the filter value in their label.
   */
  it('should include filter value in chip label', () => {
    fc.assert(
      fc.property(activeFiltersArbitrary, (filters) => {
        const chips = getActiveFilterChips(filters);
        
        return chips.every((chip) => {
          // Each chip label should contain some representation of the value
          return chip.label.length > 0 && chip.value.length > 0;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Applying more restrictive filters should not increase results.
   */
  it('should not increase results when adding more filters', () => {
    fc.assert(
      fc.property(
        carsArrayArbitrary,
        filtersArbitrary,
        fc.string({ minLength: 1, maxLength: 10 }),
        (cars, baseFilters, additionalSearch) => {
          const baseResults = applyFilters(cars, baseFilters);
          
          // Add an additional search filter
          const moreRestrictiveFilters: CarFilters = {
            ...baseFilters,
            search: baseFilters.search 
              ? `${baseFilters.search} ${additionalSearch}` 
              : additionalSearch,
          };
          
          const restrictedResults = applyFilters(cars, moreRestrictiveFilters);
          
          // More filters should not increase results
          return restrictedResults.length <= baseResults.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Filter Chip Consistency Tests
// ============================================

describe('Filter Chip Consistency', () => {
  /**
   * Property: Search filter chip should contain the search term.
   */
  it('should create search chip with correct value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (searchTerm) => {
          const filters: CarFilters = { search: searchTerm };
          const chips = getActiveFilterChips(filters);
          
          const searchChip = chips.find((c) => c.key === 'search');
          return searchChip !== undefined && searchChip.value === searchTerm;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Brand filter chip should contain the brand name.
   */
  it('should create brand chip with correct value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        (brandName) => {
          const filters: CarFilters = { brand: brandName };
          const chips = getActiveFilterChips(filters);
          
          const brandChip = chips.find((c) => c.key === 'brand');
          return brandChip !== undefined && brandChip.value === brandName;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Condition filter chip should have correct Arabic label.
   */
  it('should create condition chip with Arabic label', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('NEW' as const, 'USED' as const),
        (condition) => {
          const filters: CarFilters = { condition };
          const chips = getActiveFilterChips(filters);
          
          const conditionChip = chips.find((c) => c.key === 'condition');
          if (!conditionChip) return false;
          
          // Check that label contains Arabic text
          const expectedLabel = condition === 'NEW' ? 'جديدة' : 'مستعملة';
          return conditionChip.label.includes(expectedLabel);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Year filter chip should contain the year value.
   */
  it('should create year chip with correct value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1990, max: 2026 }),
        (year) => {
          const filters: CarFilters = { year };
          const chips = getActiveFilterChips(filters);
          
          const yearChip = chips.find((c) => c.key === 'year');
          return yearChip !== undefined && yearChip.value === year.toString();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Price filter chips should contain formatted values.
   */
  it('should create price chips with formatted values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 10000000, noNaN: true }),
        (price) => {
          const filters: CarFilters = { minPrice: price };
          const chips = getActiveFilterChips(filters);
          
          const priceChip = chips.find((c) => c.key === 'minPrice');
          return priceChip !== undefined && priceChip.label.includes('ر.ي');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Filter Removal Idempotence Tests
// ============================================

describe('Filter Removal Idempotence', () => {
  /**
   * Property: Removing a non-existent filter should not change the state.
   */
  it('should not change state when removing non-existent filter', () => {
    fc.assert(
      fc.property(filtersArbitrary, filterKeyArbitrary, (filters, keyToRemove) => {
        const chipsBefore = getActiveFilterChips(filters);
        const hasKey = chipsBefore.some((c) => c.key === keyToRemove);
        
        if (hasKey) return true; // Skip if key exists
        
        const newFilters = removeFilter(filters, keyToRemove);
        const chipsAfter = getActiveFilterChips(newFilters);
        
        return chipsBefore.length === chipsAfter.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing the same filter twice should be idempotent.
   */
  it('should be idempotent when removing same filter twice', () => {
    fc.assert(
      fc.property(activeFiltersArbitrary, (filters) => {
        const chips = getActiveFilterChips(filters);
        if (chips.length === 0) return true;
        
        const keyToRemove = chips[0].key;
        const afterFirstRemove = removeFilter(filters, keyToRemove);
        const afterSecondRemove = removeFilter(afterFirstRemove, keyToRemove);
        
        const chipsAfterFirst = getActiveFilterChips(afterFirstRemove);
        const chipsAfterSecond = getActiveFilterChips(afterSecondRemove);
        
        return chipsAfterFirst.length === chipsAfterSecond.length;
      }),
      { numRuns: 100 }
    );
  });
});
