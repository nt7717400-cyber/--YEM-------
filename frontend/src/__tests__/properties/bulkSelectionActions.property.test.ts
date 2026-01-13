/**
 * Feature: web-ui-ux-enhancement
 * Property 14: Bulk Selection Actions
 *
 * *For any* data table with row selection, selecting one or more rows should
 * display bulk action options. Deselecting all rows should hide bulk actions.
 *
 * **Validates: Requirements 10.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  areAllSelected,
  areSomeSelected,
} from '@/components/admin/DataTable';

// ============================================
// Arbitraries for Property Testing
// ============================================

// Generate a simple data item with id
const dataItemArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
});

type DataItem = {
  id: number;
  name: string;
};

// Generate an array of data items with unique IDs
const dataArrayArbitrary = fc
  .array(dataItemArbitrary, { minLength: 1, maxLength: 50 })
  .map((items) => {
    // Ensure unique IDs
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  })
  .filter((items) => items.length > 0);

// Generate selected IDs from a data array
const selectedIdsArbitrary = (data: DataItem[]) =>
  fc.subarray(data.map((item) => item.id), { minLength: 0 });

// ============================================
// Property 14: Bulk Selection Actions
// ============================================

describe('Property 14: Bulk Selection Actions', () => {
  /**
   * Property: areAllSelected should return true only when all rows are selected.
   */
  it('should correctly identify when all rows are selected', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        const allIds = data.map((item) => item.id);

        // All selected
        expect(areAllSelected(data, allIds)).toBe(true);

        // None selected
        expect(areAllSelected(data, [])).toBe(false);

        // Partial selection (if more than 1 item)
        if (data.length > 1) {
          const partialIds = allIds.slice(0, Math.floor(allIds.length / 2));
          expect(areAllSelected(data, partialIds)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: areSomeSelected should return true only when some (but not all) rows are selected.
   */
  it('should correctly identify when some rows are selected', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true; // Need at least 2 items for partial selection

        const allIds = data.map((item) => item.id);
        const partialIds = allIds.slice(0, Math.floor(allIds.length / 2));

        // Some selected (partial)
        if (partialIds.length > 0 && partialIds.length < allIds.length) {
          expect(areSomeSelected(data, partialIds)).toBe(true);
        }

        // None selected
        expect(areSomeSelected(data, [])).toBe(false);

        // All selected
        expect(areSomeSelected(data, allIds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty data should always return false for both selection checks.
   */
  it('should return false for empty data', () => {
    const emptyData: DataItem[] = [];

    expect(areAllSelected(emptyData, [])).toBe(false);
    expect(areAllSelected(emptyData, [1, 2, 3])).toBe(false);
    expect(areSomeSelected(emptyData, [])).toBe(false);
    expect(areSomeSelected(emptyData, [1, 2, 3])).toBe(false);
  });

  /**
   * Property: Selection with IDs not in data should not affect results.
   */
  it('should ignore selected IDs not in data', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        const allIds = data.map((item) => item.id);
        const maxId = Math.max(...allIds);

        // Add some IDs that don't exist in data
        const extraIds = [maxId + 1, maxId + 2, maxId + 3];
        const selectedWithExtras = [...allIds, ...extraIds];

        // Should still be considered "all selected" for the actual data
        expect(areAllSelected(data, selectedWithExtras)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Selecting a single row should show some selected (not all, unless only 1 row).
   */
  it('should handle single row selection correctly', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        const firstId = data[0].id;
        const singleSelection = [firstId];

        if (data.length === 1) {
          // Single item: selecting it means all are selected
          expect(areAllSelected(data, singleSelection)).toBe(true);
          expect(areSomeSelected(data, singleSelection)).toBe(false);
        } else {
          // Multiple items: selecting one means some are selected
          expect(areAllSelected(data, singleSelection)).toBe(false);
          expect(areSomeSelected(data, singleSelection)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: areAllSelected and areSomeSelected should be mutually exclusive
   * (except when none are selected, both are false).
   */
  it('should have mutually exclusive selection states', () => {
    fc.assert(
      fc.property(
        dataArrayArbitrary.chain((data) =>
          selectedIdsArbitrary(data).map((selectedIds) => ({ data, selectedIds }))
        ),
        ({ data, selectedIds }) => {
          const allSelected = areAllSelected(data, selectedIds);
          const someSelected = areSomeSelected(data, selectedIds);

          // Cannot be both true at the same time
          expect(allSelected && someSelected).toBe(false);

          // If all selected, some should be false
          if (allSelected) {
            expect(someSelected).toBe(false);
          }

          // If some selected, all should be false
          if (someSelected) {
            expect(allSelected).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Custom getRowId function should work correctly.
   */
  it('should work with custom getRowId function', () => {
    type CustomItem = { id: string; customId: string; name: string };

    const customData: CustomItem[] = [
      { id: 'a', customId: 'a', name: 'Item A' },
      { id: 'b', customId: 'b', name: 'Item B' },
      { id: 'c', customId: 'c', name: 'Item C' },
    ];

    const getRowId = (row: CustomItem) => row.customId;

    // All selected
    expect(areAllSelected(customData, ['a', 'b', 'c'], getRowId)).toBe(true);

    // Some selected
    expect(areSomeSelected(customData, ['a', 'b'], getRowId)).toBe(true);

    // None selected
    expect(areAllSelected(customData, [], getRowId)).toBe(false);
    expect(areSomeSelected(customData, [], getRowId)).toBe(false);
  });

  /**
   * Property: Deselecting all rows should result in no selection.
   */
  it('should correctly handle deselecting all rows', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        // Start with all selected
        let selectedIds = data.map((item) => item.id);
        expect(areAllSelected(data, selectedIds)).toBe(true);

        // Deselect all
        selectedIds = [];
        expect(areAllSelected(data, selectedIds)).toBe(false);
        expect(areSomeSelected(data, selectedIds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Adding a selection should increase selected count.
   * Note: After adding, we verify the count increased, but we don't check
   * areSomeSelected because if all items are now selected, it returns false.
   */
  it('should increase selection count when adding', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        // Start with first item selected
        let selectedIds = [data[0].id];
        const initialCount = selectedIds.length;

        // Add second item
        selectedIds = [...selectedIds, data[1].id];
        expect(selectedIds.length).toBe(initialCount + 1);

        // Should have at least some selection (either some or all)
        // If only 2 items and both selected, areAllSelected is true
        // If more than 2 items and 2 selected, areSomeSelected is true
        const allSelected = areAllSelected(data, selectedIds);
        const someSelected = areSomeSelected(data, selectedIds);
        
        // At least one of these should be true (we have selections)
        expect(allSelected || someSelected).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Removing a selection should decrease selected count.
   */
  it('should decrease selection count when removing', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        // Start with all selected
        let selectedIds = data.map((item) => item.id);
        const initialCount = selectedIds.length;

        // Remove first item
        selectedIds = selectedIds.filter((id) => id !== data[0].id);
        expect(selectedIds.length).toBe(initialCount - 1);

        // Should now have some selected (not all)
        expect(areSomeSelected(data, selectedIds)).toBe(true);
        expect(areAllSelected(data, selectedIds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Selection State Transitions
// ============================================

describe('Selection State Transitions', () => {
  /**
   * Property: Toggling select all should alternate between all and none.
   */
  it('should toggle between all selected and none selected', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        const allIds = data.map((item) => item.id);

        // Start with none
        let selectedIds: number[] = [];
        expect(areAllSelected(data, selectedIds)).toBe(false);

        // Select all
        selectedIds = [...allIds];
        expect(areAllSelected(data, selectedIds)).toBe(true);

        // Deselect all
        selectedIds = [];
        expect(areAllSelected(data, selectedIds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Selecting remaining items should transition from some to all.
   */
  it('should transition from some to all when selecting remaining', () => {
    fc.assert(
      fc.property(dataArrayArbitrary, (data) => {
        if (data.length < 2) return true;

        const allIds = data.map((item) => item.id);
        const halfIds = allIds.slice(0, Math.floor(allIds.length / 2));
        const remainingIds = allIds.slice(Math.floor(allIds.length / 2));

        // Start with half selected
        let selectedIds = [...halfIds];
        if (halfIds.length > 0 && halfIds.length < allIds.length) {
          expect(areSomeSelected(data, selectedIds)).toBe(true);
        }

        // Add remaining
        selectedIds = [...selectedIds, ...remainingIds];
        expect(areAllSelected(data, selectedIds)).toBe(true);
        expect(areSomeSelected(data, selectedIds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
