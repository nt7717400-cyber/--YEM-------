/**
 * Feature: web-ui-ux-enhancement
 * Property 13: Data Table Sorting
 *
 * *For any* sortable column in a data table, clicking the column header should
 * sort the data by that column. Clicking again should reverse the sort order.
 *
 * **Validates: Requirements 10.1, 10.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sortData,
  toggleSortDirection,
  SortDirection,
} from '@/components/admin/DataTable';

// ============================================
// Arbitraries for Property Testing
// ============================================

// Generate a simple data item with id and sortable fields
const dataItemArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.float({ min: 0, max: 10000000, noNaN: true }),
  year: fc.integer({ min: 1990, max: 2026 }),
  status: fc.constantFrom('active', 'inactive', 'pending'),
});

// Generate data items with unique IDs (for tests that require unique identification)
const uniqueDataArrayArbitrary = fc
  .array(dataItemArbitrary, { minLength: 0, maxLength: 50 })
  .map((items) => {
    // Ensure unique IDs
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  });

type DataItem = {
  id: number;
  name: string;
  price: number;
  year: number;
  status: string;
};

// Generate an array of data items
const dataArrayArbitrary = fc.array(dataItemArbitrary, {
  minLength: 0,
  maxLength: 50,
});

// Generate a sort direction
const sortDirectionArbitrary: fc.Arbitrary<SortDirection> = fc.constantFrom(
  'asc' as const,
  'desc' as const,
  null
);

// Generate a sortable column key
const columnKeyArbitrary = fc.constantFrom('name', 'price', 'year', 'status');

// ============================================
// Property 13: Data Table Sorting
// ============================================

describe('Property 13: Data Table Sorting', () => {
  /**
   * Property: Sorting should preserve all original items (no data loss).
   */
  it('should preserve all items after sorting', () => {
    fc.assert(
      fc.property(
        dataArrayArbitrary,
        columnKeyArbitrary,
        sortDirectionArbitrary,
        (data, column, direction) => {
          const sorted = sortData(data, column, direction);

          // Same length
          expect(sorted.length).toBe(data.length);

          // All original IDs should be present
          const originalIds = data.map((item) => item.id).sort();
          const sortedIds = sorted.map((item) => item.id).sort();
          expect(sortedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting with null direction should return data in original order.
   */
  it('should return original order when direction is null', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, columnKeyArbitrary, (data, column) => {
        const sorted = sortData(data, column, null);

        // Should be same reference or equal array
        expect(sorted).toEqual(data);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Ascending sort should order items from smallest to largest.
   */
  it('should order numeric values ascending correctly', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        const sorted = sortData(data, 'price', 'asc');

        // Each item should be <= the next item
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Descending sort should order items from largest to smallest.
   */
  it('should order numeric values descending correctly', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        const sorted = sortData(data, 'price', 'desc');

        // Each item should be >= the next item
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting ascending then descending should reverse the order.
   * Note: This only holds when the first and last values after sorting are distinct.
   */
  it('should reverse order when toggling between asc and desc', () => {
    fc.assert(
      fc.property(uniqueDataArrayArbitrary, columnKeyArbitrary, (data, column) => {
        if (data.length < 2) return true;

        const sortedAsc = sortData(data, column, 'asc');
        const sortedDesc = sortData(data, column, 'desc');

        // Both sorted arrays should have the same items (just in different order)
        const ascIds = sortedAsc.map((item) => item.id).sort();
        const descIds = sortedDesc.map((item) => item.id).sort();
        expect(ascIds).toEqual(descIds);

        // If there are items with distinct values at the extremes, they should swap
        if (sortedAsc.length > 0) {
          const firstAsc = sortedAsc[0];
          const lastAsc = sortedAsc[sortedAsc.length - 1];
          const firstDesc = sortedDesc[0];
          const lastDesc = sortedDesc[sortedDesc.length - 1];

          // Get the values being compared
          const firstAscValue = (firstAsc as Record<string, unknown>)[column];
          const lastAscValue = (lastAsc as Record<string, unknown>)[column];
          const firstDescValue = (firstDesc as Record<string, unknown>)[column];
          const lastDescValue = (lastDesc as Record<string, unknown>)[column];

          // The smallest value in asc should be the largest in desc (at the end)
          // The largest value in asc should be the smallest in desc (at the start)
          expect(firstAscValue).toEqual(lastDescValue);
          expect(lastAscValue).toEqual(firstDescValue);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting should be idempotent (sorting twice gives same result).
   */
  it('should be idempotent - sorting twice gives same result', () => {
    fc.assert(
      fc.property(
        dataArrayArbitrary,
        columnKeyArbitrary,
        fc.constantFrom('asc' as const, 'desc' as const),
        (data, column, direction) => {
          const sortedOnce = sortData(data, column, direction);
          const sortedTwice = sortData(sortedOnce, column, direction);

          // IDs should be in same order
          const onceIds = sortedOnce.map((item) => item.id);
          const twiceIds = sortedTwice.map((item) => item.id);
          expect(twiceIds).toEqual(onceIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting should not mutate the original array.
   */
  it('should not mutate the original array', () => {
    fc.assert(
      fc.property(
        dataArrayArbitrary,
        columnKeyArbitrary,
        sortDirectionArbitrary,
        (data, column, direction) => {
          const originalIds = data.map((item) => item.id);
          sortData(data, column, direction);
          const afterSortIds = data.map((item) => item.id);

          expect(afterSortIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Toggle Sort Direction Tests
// ============================================

describe('Toggle Sort Direction', () => {
  /**
   * Property: Toggle should cycle through null -> asc -> desc -> null.
   */
  it('should cycle through sort directions correctly', () => {
    // null -> asc
    expect(toggleSortDirection(null)).toBe('asc');
    // asc -> desc
    expect(toggleSortDirection('asc')).toBe('desc');
    // desc -> null
    expect(toggleSortDirection('desc')).toBe(null);
  });

  /**
   * Property: Three toggles should return to original state.
   */
  it('should return to original state after three toggles', () => {
    fc.assert(
      fc.property(sortDirectionArbitrary, (direction) => {
        const after1 = toggleSortDirection(direction);
        const after2 = toggleSortDirection(after1);
        const after3 = toggleSortDirection(after2);

        expect(after3).toBe(direction);
      }),
      { numRuns: 10 }
    );
  });
});

// ============================================
// String Sorting Tests
// ============================================

describe('String Column Sorting', () => {
  /**
   * Property: String sorting should use locale-aware comparison.
   */
  it('should sort strings in locale-aware order', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        const sorted = sortData(data, 'name', 'asc');

        // Each name should be <= the next name (locale comparison)
        for (let i = 0; i < sorted.length - 1; i++) {
          const comparison = sorted[i].name.localeCompare(
            sorted[i + 1].name,
            'ar'
          );
          expect(comparison).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
