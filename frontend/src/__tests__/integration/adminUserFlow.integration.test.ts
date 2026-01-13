/**
 * Integration Test: Admin User Flow
 * Tests the complete admin journey through the dashboard
 * 
 * **Validates: Requirements 8.1-15.5 (Admin Dashboard)**
 * 
 * Feature: web-ui-ux-enhancement, Task 38.1: اختبار تدفق المستخدم الكامل
 * 
 * This test simulates the complete admin user flow:
 * 1. Dashboard with statistics
 * 2. Cars management with DataTable
 * 3. CRUD operations
 * 4. Filtering and sorting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { carArbitrary } from '../generators/car.generator';
import type { Car } from '@/types';

// ==================== Types for Integration Test ====================

interface AdminState {
  currentPage: string;
  cars: Car[];
  filteredCars: Car[];
  selectedIds: number[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  searchQuery: string;
  currentPage_: number;
  pageSize: number;
  sidebarCollapsed: boolean;
  pageTitle: string;
}

interface DashboardStats {
  totalCars: number;
  soldCars: number;
  featuredCars: number;
  totalViews: number;
}


// ==================== Simulated Admin Functions ====================

/**
 * Initialize admin state
 */
function initializeAdmin(cars: Car[]): AdminState {
  return {
    currentPage: 'dashboard',
    cars,
    filteredCars: cars,
    selectedIds: [],
    sortColumn: null,
    sortDirection: null,
    searchQuery: '',
    currentPage_: 1,
    pageSize: 10,
    sidebarCollapsed: false,
    pageTitle: 'لوحة التحكم',
  };
}

/**
 * Get dashboard statistics
 * Requirements: 9.1, 9.2
 */
function getDashboardStats(cars: Car[]): DashboardStats {
  return {
    totalCars: cars.length,
    soldCars: cars.filter(c => c.status === 'SOLD').length,
    featuredCars: cars.filter(c => c.isFeatured).length,
    totalViews: cars.reduce((sum, c) => sum + c.viewCount, 0),
  };
}

/**
 * Get trend indicator
 * Requirements: 9.2
 */
function getTrendIndicator(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Navigate to page
 * Requirements: 8.1, 8.7
 */
function navigateToPage(state: AdminState, page: string): AdminState {
  const pageTitles: Record<string, string> = {
    dashboard: 'لوحة التحكم',
    cars: 'إدارة السيارات',
    settings: 'الإعدادات',
    archive: 'الأرشيف',
  };
  
  return {
    ...state,
    currentPage: page,
    pageTitle: pageTitles[page] || page,
  };
}

/**
 * Toggle sidebar
 * Requirements: 8.1, 8.2, 8.6
 */
function toggleSidebar(state: AdminState): AdminState {
  return {
    ...state,
    sidebarCollapsed: !state.sidebarCollapsed,
  };
}

/**
 * Sort data table
 * Requirements: 10.1, 10.2
 */
function sortTable(state: AdminState, column: string): AdminState {
  let newDirection: 'asc' | 'desc' | null = 'asc';
  
  if (state.sortColumn === column) {
    if (state.sortDirection === 'asc') newDirection = 'desc';
    else if (state.sortDirection === 'desc') newDirection = null;
  }
  
  let sorted = [...state.filteredCars];
  
  if (newDirection) {
    sorted.sort((a, b) => {
      const aVal = a[column as keyof Car];
      const bVal = b[column as keyof Car];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'ar')
          : bVal.localeCompare(aVal, 'ar');
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }
  
  return {
    ...state,
    sortColumn: newDirection ? column : null,
    sortDirection: newDirection,
    filteredCars: sorted,
  };
}


/**
 * Search in data table
 * Requirements: 10.4
 */
function searchTable(state: AdminState, query: string): AdminState {
  const searchLower = query.toLowerCase().trim();
  
  if (!searchLower) {
    return {
      ...state,
      searchQuery: '',
      filteredCars: state.cars,
      currentPage_: 1,
    };
  }
  
  const filtered = state.cars.filter(car =>
    car.name.toLowerCase().includes(searchLower) ||
    car.brand.toLowerCase().includes(searchLower) ||
    car.model.toLowerCase().includes(searchLower)
  );
  
  return {
    ...state,
    searchQuery: query,
    filteredCars: filtered,
    currentPage_: 1,
  };
}

/**
 * Select rows
 * Requirements: 10.6
 */
function selectRows(state: AdminState, ids: number[]): AdminState {
  return {
    ...state,
    selectedIds: ids,
  };
}

/**
 * Toggle row selection
 */
function toggleRowSelection(state: AdminState, id: number): AdminState {
  const newSelected = state.selectedIds.includes(id)
    ? state.selectedIds.filter(i => i !== id)
    : [...state.selectedIds, id];
  
  return {
    ...state,
    selectedIds: newSelected,
  };
}

/**
 * Select all rows
 */
function selectAllRows(state: AdminState): AdminState {
  return {
    ...state,
    selectedIds: state.filteredCars.map(c => c.id),
  };
}

/**
 * Clear selection
 */
function clearSelection(state: AdminState): AdminState {
  return {
    ...state,
    selectedIds: [],
  };
}

/**
 * Get bulk actions availability
 * Requirements: 10.6
 */
function getBulkActionsAvailable(state: AdminState): boolean {
  return state.selectedIds.length > 0;
}

/**
 * Delete car
 * Requirements: 14.1
 */
function deleteCar(state: AdminState, carId: number): AdminState {
  const newCars = state.cars.filter(c => c.id !== carId);
  return {
    ...state,
    cars: newCars,
    filteredCars: state.filteredCars.filter(c => c.id !== carId),
    selectedIds: state.selectedIds.filter(id => id !== carId),
  };
}

/**
 * Bulk delete cars
 * Requirements: 10.6, 14.1
 */
function bulkDeleteCars(state: AdminState): AdminState {
  const newCars = state.cars.filter(c => !state.selectedIds.includes(c.id));
  return {
    ...state,
    cars: newCars,
    filteredCars: state.filteredCars.filter(c => !state.selectedIds.includes(c.id)),
    selectedIds: [],
  };
}


/**
 * Toggle featured status
 * Requirements: 2.3
 */
function toggleFeatured(state: AdminState, carId: number): AdminState {
  const updateCar = (car: Car) => 
    car.id === carId ? { ...car, isFeatured: !car.isFeatured } : car;
  
  return {
    ...state,
    cars: state.cars.map(updateCar),
    filteredCars: state.filteredCars.map(updateCar),
  };
}

/**
 * Archive car
 */
function archiveCar(state: AdminState, carId: number): AdminState {
  const updateCar = (car: Car) => 
    car.id === carId ? { ...car, status: 'SOLD' as const } : car;
  
  return {
    ...state,
    cars: state.cars.map(updateCar),
    filteredCars: state.filteredCars.map(updateCar),
  };
}

/**
 * Paginate table
 * Requirements: 10.3
 */
function paginateTable(state: AdminState): { cars: Car[]; totalPages: number } {
  const totalPages = Math.ceil(state.filteredCars.length / state.pageSize);
  const start = (state.currentPage_ - 1) * state.pageSize;
  return {
    cars: state.filteredCars.slice(start, start + state.pageSize),
    totalPages,
  };
}

/**
 * Change page
 */
function changePage(state: AdminState, page: number): AdminState {
  return {
    ...state,
    currentPage_: page,
  };
}

/**
 * Change page size
 * Requirements: 10.3
 */
function changePageSize(state: AdminState, size: number): AdminState {
  return {
    ...state,
    pageSize: size,
    currentPage_: 1,
  };
}

// ==================== Arbitraries ====================

// Generate cars with unique IDs to avoid duplicate ID issues
const carsArrayWithUniqueIdsArbitrary = fc.array(carArbitrary, { minLength: 1, maxLength: 50 })
  .map(cars => cars.map((car, index) => ({ ...car, id: index + 1 })));

const sortColumnArbitrary = fc.constantFrom('name', 'price', 'year', 'viewCount');
const pageNumberArbitrary = fc.integer({ min: 1, max: 10 });
const pageSizeArbitrary = fc.constantFrom(10, 20, 50);


// ==================== Integration Tests ====================

describe('Integration Test: Admin User Flow', () => {
  describe('Step 1: Dashboard Statistics (Requirements 9.1-9.7)', () => {
    it('should calculate dashboard statistics correctly', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          const stats = getDashboardStats(cars);
          
          expect(stats.totalCars).toBe(cars.length);
          expect(stats.soldCars).toBe(cars.filter(c => c.status === 'SOLD').length);
          expect(stats.featuredCars).toBe(cars.filter(c => c.isFeatured).length);
          expect(stats.totalViews).toBe(cars.reduce((sum, c) => sum + c.viewCount, 0));
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should display correct trend indicators', () => {
      fc.assert(
        fc.property(fc.integer({ min: -100, max: 100 }), (change) => {
          const indicator = getTrendIndicator(change);
          
          if (change > 0) expect(indicator).toBe('up');
          else if (change < 0) expect(indicator).toBe('down');
          else expect(indicator).toBe('neutral');
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Step 2: Sidebar Navigation (Requirements 8.1-8.7)', () => {
    it('should toggle sidebar state', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          let state = initializeAdmin(cars);
          expect(state.sidebarCollapsed).toBe(false);
          
          state = toggleSidebar(state);
          expect(state.sidebarCollapsed).toBe(true);
          
          state = toggleSidebar(state);
          expect(state.sidebarCollapsed).toBe(false);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('should update page title on navigation', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          let state = initializeAdmin(cars);
          
          state = navigateToPage(state, 'cars');
          expect(state.pageTitle).toBe('إدارة السيارات');
          expect(state.currentPage).toBe('cars');
          
          state = navigateToPage(state, 'settings');
          expect(state.pageTitle).toBe('الإعدادات');
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });


  describe('Step 3: Data Table Sorting (Requirements 10.1-10.2)', () => {
    it('should sort table by column', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, sortColumnArbitrary, (cars, column) => {
          let state = initializeAdmin(cars);
          state = navigateToPage(state, 'cars');
          
          // First click - ascending
          state = sortTable(state, column);
          expect(state.sortColumn).toBe(column);
          expect(state.sortDirection).toBe('asc');
          
          // Second click - descending
          state = sortTable(state, column);
          expect(state.sortColumn).toBe(column);
          expect(state.sortDirection).toBe('desc');
          
          // Third click - no sort
          state = sortTable(state, column);
          expect(state.sortColumn).toBeNull();
          expect(state.sortDirection).toBeNull();
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should maintain sort order after sorting', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length < 2) return true;
          
          let state = initializeAdmin(cars);
          state = sortTable(state, 'price');
          
          // Verify ascending order
          for (let i = 1; i < state.filteredCars.length; i++) {
            expect(state.filteredCars[i].price).toBeGreaterThanOrEqual(
              state.filteredCars[i - 1].price
            );
          }
          
          // Sort descending
          state = sortTable(state, 'price');
          
          // Verify descending order
          for (let i = 1; i < state.filteredCars.length; i++) {
            expect(state.filteredCars[i].price).toBeLessThanOrEqual(
              state.filteredCars[i - 1].price
            );
          }
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Step 4: Data Table Search (Requirements 10.4)', () => {
    it('should filter table by search query', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, fc.string({ minLength: 0, maxLength: 20 }), (cars, query) => {
          let state = initializeAdmin(cars);
          state = searchTable(state, query);
          
          const trimmedQuery = query.trim();
          if (!trimmedQuery) {
            expect(state.filteredCars.length).toBe(cars.length);
            return true;
          }
          
          // All filtered cars should match the search query (case-insensitive)
          const queryLower = trimmedQuery.toLowerCase();
          state.filteredCars.forEach(car => {
            const matches = 
              car.name.toLowerCase().includes(queryLower) ||
              car.brand.toLowerCase().includes(queryLower) ||
              car.model.toLowerCase().includes(queryLower);
            expect(matches).toBe(true);
          });
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });


  describe('Step 5: Row Selection and Bulk Actions (Requirements 10.6)', () => {
    it('should toggle row selection', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length === 0) return true;
          
          let state = initializeAdmin(cars);
          const carId = cars[0].id;
          
          // Select row
          state = toggleRowSelection(state, carId);
          expect(state.selectedIds).toContain(carId);
          expect(getBulkActionsAvailable(state)).toBe(true);
          
          // Deselect row
          state = toggleRowSelection(state, carId);
          expect(state.selectedIds).not.toContain(carId);
          expect(getBulkActionsAvailable(state)).toBe(false);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should select all rows', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          let state = initializeAdmin(cars);
          state = selectAllRows(state);
          
          expect(state.selectedIds.length).toBe(cars.length);
          cars.forEach(car => {
            expect(state.selectedIds).toContain(car.id);
          });
          
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('should show bulk actions when rows selected', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          let state = initializeAdmin(cars);
          
          // No selection - no bulk actions
          expect(getBulkActionsAvailable(state)).toBe(false);
          
          // With selection - bulk actions available
          if (cars.length > 0) {
            state = selectRows(state, [cars[0].id]);
            expect(getBulkActionsAvailable(state)).toBe(true);
          }
          
          // Clear selection - no bulk actions
          state = clearSelection(state);
          expect(getBulkActionsAvailable(state)).toBe(false);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Step 6: CRUD Operations (Requirements 10.5, 14.1)', () => {
    it('should delete single car', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length === 0) return true;
          
          let state = initializeAdmin(cars);
          const carToDelete = cars[0];
          const initialCount = state.cars.length;
          
          state = deleteCar(state, carToDelete.id);
          
          expect(state.cars.length).toBe(initialCount - 1);
          expect(state.cars.find(c => c.id === carToDelete.id)).toBeUndefined();
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should bulk delete selected cars', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length < 2) return true;
          
          let state = initializeAdmin(cars);
          const idsToDelete = [cars[0].id, cars[1].id];
          
          state = selectRows(state, idsToDelete);
          state = bulkDeleteCars(state);
          
          expect(state.cars.length).toBe(cars.length - 2);
          expect(state.selectedIds).toHaveLength(0);
          idsToDelete.forEach(id => {
            expect(state.cars.find(c => c.id === id)).toBeUndefined();
          });
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should toggle featured status', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length === 0) return true;
          
          let state = initializeAdmin(cars);
          const car = cars[0];
          const initialFeatured = car.isFeatured;
          
          state = toggleFeatured(state, car.id);
          const updatedCar = state.cars.find(c => c.id === car.id);
          
          expect(updatedCar?.isFeatured).toBe(!initialFeatured);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });


  describe('Step 7: Pagination (Requirements 10.3)', () => {
    it('should paginate table correctly', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, pageSizeArbitrary, (cars, pageSize) => {
          let state = initializeAdmin(cars);
          state = changePageSize(state, pageSize);
          
          const { cars: paginatedCars, totalPages } = paginateTable(state);
          
          expect(totalPages).toBe(Math.ceil(cars.length / pageSize));
          expect(paginatedCars.length).toBeLessThanOrEqual(pageSize);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should change page correctly', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, pageNumberArbitrary, (cars, page) => {
          let state = initializeAdmin(cars);
          state = changePage(state, page);
          
          expect(state.currentPage_).toBe(page);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('should reset to page 1 when changing page size', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, pageSizeArbitrary, (cars, pageSize) => {
          let state = initializeAdmin(cars);
          state = changePage(state, 3);
          state = changePageSize(state, pageSize);
          
          expect(state.currentPage_).toBe(1);
          expect(state.pageSize).toBe(pageSize);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Complete Admin Flow Integration', () => {
    it('should complete full admin user journey', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, fc.string({ minLength: 1, maxLength: 10 }), (cars, searchQuery) => {
          // Step 1: Initialize admin dashboard
          let state = initializeAdmin(cars);
          expect(state.currentPage).toBe('dashboard');
          
          // Step 2: View statistics
          const stats = getDashboardStats(cars);
          expect(stats.totalCars).toBe(cars.length);
          
          // Step 3: Navigate to cars management
          state = navigateToPage(state, 'cars');
          expect(state.pageTitle).toBe('إدارة السيارات');
          
          // Step 4: Search for cars (use trimmed query to avoid whitespace-only issues)
          const trimmedQuery = searchQuery.trim();
          state = searchTable(state, trimmedQuery);
          expect(state.searchQuery).toBe(trimmedQuery);
          
          // Step 5: Sort by price
          state = sortTable(state, 'price');
          expect(state.sortColumn).toBe('price');
          
          // Step 6: Select some rows
          if (state.filteredCars.length > 0) {
            state = toggleRowSelection(state, state.filteredCars[0].id);
            expect(getBulkActionsAvailable(state)).toBe(true);
          }
          
          // Step 7: Toggle sidebar
          state = toggleSidebar(state);
          expect(state.sidebarCollapsed).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain data integrity throughout admin operations', () => {
      fc.assert(
        fc.property(carsArrayWithUniqueIdsArbitrary, (cars) => {
          if (cars.length < 3) return true;
          
          let state = initializeAdmin(cars);
          const initialCount = state.cars.length;
          
          // Delete one car
          state = deleteCar(state, cars[0].id);
          expect(state.cars.length).toBe(initialCount - 1);
          
          // Toggle featured on another
          const carToFeature = state.cars[0];
          const wasFeatured = carToFeature.isFeatured;
          state = toggleFeatured(state, carToFeature.id);
          expect(state.cars.find(c => c.id === carToFeature.id)?.isFeatured).toBe(!wasFeatured);
          
          // Search should still work (use a non-empty substring)
          const searchTerm = carToFeature.name.trim().substring(0, 3) || 'a';
          state = searchTable(state, searchTerm);
          expect(state.filteredCars.length).toBeLessThanOrEqual(state.cars.length);
          
          // Sort should still work
          state = sortTable(state, 'year');
          expect(state.sortColumn).toBe('year');
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });
});
