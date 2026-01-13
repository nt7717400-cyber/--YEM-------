/**
 * Integration Test: Storefront User Flow
 * Tests the complete user journey through the customer-facing storefront
 * 
 * **Validates: Requirements 1.1-7.5 (Customer Storefront)**
 * 
 * Feature: web-ui-ux-enhancement, Task 38.1: اختبار تدفق المستخدم الكامل
 * 
 * This test simulates the complete storefront user flow:
 * 1. Homepage with featured cars and search
 * 2. Cars listing with filtering and pagination
 * 3. Car details with gallery and specifications
 * 4. Navigation and breadcrumb functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { carArbitrary, filtersArbitrary } from '../generators/car.generator';
import type { Car, CarFilters } from '@/types';

// ==================== Types for Integration Test ====================

interface StorefrontState {
  currentPage: 'home' | 'cars' | 'car-details';
  featuredCars: Car[];
  allCars: Car[];
  filteredCars: Car[];
  selectedCar: Car | null;
  filters: CarFilters;
  searchQuery: string;
  currentListPage: number;
  isLoading: boolean;
  breadcrumb: string[];
}

interface SearchSuggestion {
  type: 'car' | 'brand' | 'category';
  label: string;
  value: string;
}

// ==================== Simulated Storefront Functions ====================

/**
 * Initialize storefront state
 */
function initializeStorefront(cars: Car[]): StorefrontState {
  const featuredCars = cars.filter(car => car.isFeatured && car.status === 'AVAILABLE');
  const availableCars = cars.filter(car => car.status === 'AVAILABLE');
  
  return {
    currentPage: 'home',
    featuredCars,
    allCars: availableCars,
    filteredCars: availableCars,
    selectedCar: null,
    filters: { status: 'AVAILABLE' },
    searchQuery: '',
    currentListPage: 1,
    isLoading: false,
    breadcrumb: ['الرئيسية'],
  };
}

/**
 * Navigate to cars listing page
 * Requirements: 1.1, 1.6
 */
function navigateToCarsPage(state: StorefrontState): StorefrontState {
  return {
    ...state,
    currentPage: 'cars',
    breadcrumb: ['الرئيسية', 'السيارات'],
    currentListPage: 1,
  };
}

/**
 * Navigate to car details page
 * Requirements: 3.6
 */
function navigateToCarDetails(state: StorefrontState, car: Car): StorefrontState {
  return {
    ...state,
    currentPage: 'car-details',
    selectedCar: car,
    breadcrumb: ['الرئيسية', 'السيارات', car.name],
  };
}

/**
 * Apply search query
 * Requirements: 4.1
 */
function applySearch(state: StorefrontState, query: string): StorefrontState {
  const searchLower = query.toLowerCase().trim();
  
  if (!searchLower) {
    return {
      ...state,
      searchQuery: query.trim(),
      filteredCars: applyFiltersToList(state.allCars, state.filters),
      currentListPage: 1,
    };
  }
  
  const filtered = state.allCars.filter(car =>
    car.name.toLowerCase().includes(searchLower) ||
    car.brand.toLowerCase().includes(searchLower) ||
    car.model.toLowerCase().includes(searchLower)
  );
  
  return {
    ...state,
    searchQuery: query.trim(),
    filteredCars: applyFiltersToList(filtered, state.filters),
    currentListPage: 1,
  };
}

/**
 * Get search suggestions
 * Requirements: 4.1
 */
function getSearchSuggestions(state: StorefrontState, query: string): SearchSuggestion[] {
  if (!query || query.trim().length < 2) return [];
  
  const queryLower = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];
  
  // Get unique brands that match
  const matchingBrands = [...new Set(state.allCars.map(c => c.brand))]
    .filter(brand => brand.toLowerCase().includes(queryLower))
    .slice(0, 3)
    .map(brand => ({ type: 'brand' as const, label: brand, value: brand }));
  
  // Get matching cars
  const matchingCars = state.allCars
    .filter(car => 
      car.name.toLowerCase().includes(queryLower) ||
      car.brand.toLowerCase().includes(queryLower)
    )
    .slice(0, 5)
    .map(car => ({ type: 'car' as const, label: car.name, value: car.name }));
  
  return [...matchingBrands, ...matchingCars];
}

/**
 * Apply filters to car list
 * Requirements: 4.2, 4.3, 4.4
 */
function applyFiltersToList(cars: Car[], filters: CarFilters): Car[] {
  return cars.filter(car => {
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.condition && car.condition !== filters.condition) return false;
    if (filters.minPrice !== undefined && car.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && car.price > filters.maxPrice) return false;
    if (filters.year !== undefined && car.year !== filters.year) return false;
    if (filters.status && car.status !== filters.status) return false;
    return true;
  });
}

/**
 * Apply filters
 * Requirements: 4.4
 */
function applyFilters(state: StorefrontState, filters: CarFilters): StorefrontState {
  const newFilters = { ...state.filters, ...filters };
  let filtered = state.allCars;
  
  // Apply search first if exists
  if (state.searchQuery) {
    const searchLower = state.searchQuery.toLowerCase();
    filtered = filtered.filter(car =>
      car.name.toLowerCase().includes(searchLower) ||
      car.brand.toLowerCase().includes(searchLower) ||
      car.model.toLowerCase().includes(searchLower)
    );
  }
  
  // Then apply filters
  filtered = applyFiltersToList(filtered, newFilters);
  
  // Apply sorting
  if (newFilters.sortBy) {
    filtered = [...filtered].sort((a, b) => {
      switch (newFilters.sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });
  }
  
  return {
    ...state,
    filters: newFilters,
    filteredCars: filtered,
    currentListPage: 1,
  };
}

/**
 * Remove a filter
 * Requirements: 4.5, 4.6
 */
function removeFilter(state: StorefrontState, filterKey: keyof CarFilters): StorefrontState {
  const newFilters = { ...state.filters };
  delete newFilters[filterKey];
  return applyFilters({ ...state, filters: {} }, newFilters);
}

/**
 * Get active filter chips
 * Requirements: 4.5
 */
function getActiveFilterChips(filters: CarFilters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  
  if (filters.brand) chips.push({ key: 'brand', label: `الماركة: ${filters.brand}` });
  if (filters.condition) chips.push({ key: 'condition', label: filters.condition === 'NEW' ? 'جديدة' : 'مستعملة' });
  if (filters.minPrice !== undefined) chips.push({ key: 'minPrice', label: `من: ${filters.minPrice.toLocaleString()} ر.ي` });
  if (filters.maxPrice !== undefined) chips.push({ key: 'maxPrice', label: `إلى: ${filters.maxPrice.toLocaleString()} ر.ي` });
  if (filters.year !== undefined) chips.push({ key: 'year', label: `السنة: ${filters.year}` });
  
  return chips;
}

/**
 * Check if filters are active
 */
function hasActiveFilters(filters: CarFilters): boolean {
  return !!(filters.brand || filters.condition || filters.minPrice !== undefined || 
            filters.maxPrice !== undefined || filters.year !== undefined);
}

/**
 * Paginate results
 * Requirements: 6.1
 */
function paginateResults(cars: Car[], page: number, pageSize: number = 12): { cars: Car[]; totalPages: number } {
  const totalPages = Math.ceil(cars.length / pageSize);
  const start = (page - 1) * pageSize;
  return {
    cars: cars.slice(start, start + pageSize),
    totalPages,
  };
}

/**
 * Change page
 */
function changePage(state: StorefrontState, page: number): StorefrontState {
  return {
    ...state,
    currentListPage: page,
  };
}

/**
 * Format price for display
 * Requirements: 2.6
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-YE', {
    style: 'currency',
    currency: 'YER',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get car card display info
 * Requirements: 2.1, 2.3, 2.4, 2.6
 */
function getCarCardInfo(car: Car): {
  name: string;
  price: string;
  year: number;
  condition: string;
  showFeaturedBadge: boolean;
  showSoldBadge: boolean;
} {
  return {
    name: car.name,
    price: formatPrice(car.price),
    year: car.year,
    condition: car.condition === 'NEW' ? 'جديدة' : 'مستعملة',
    showFeaturedBadge: car.isFeatured,
    showSoldBadge: car.status === 'SOLD',
  };
}

/**
 * Get car specifications
 * Requirements: 3.4
 */
function getCarSpecifications(car: Car): { label: string; value: string; icon: string }[] {
  const specs: { label: string; value: string; icon: string }[] = [
    { label: 'الماركة', value: car.brand, icon: '🏷️' },
    { label: 'الموديل', value: car.model, icon: '📋' },
    { label: 'السنة', value: car.year.toString(), icon: '📅' },
    { label: 'الحالة', value: car.condition === 'NEW' ? 'جديدة' : 'مستعملة', icon: '✨' },
  ];
  
  if (car.kilometers !== undefined) {
    specs.push({ label: 'الكيلومترات', value: `${car.kilometers.toLocaleString()} كم`, icon: '🛣️' });
  }
  
  return specs;
}

// ==================== Arbitraries ====================

const carsArrayArbitrary = fc.array(carArbitrary, { minLength: 1, maxLength: 30 });

const searchQueryArbitrary = fc.string({ minLength: 0, maxLength: 50 });

const pageNumberArbitrary = fc.integer({ min: 1, max: 10 });

// ==================== Integration Tests ====================

describe('Integration Test: Storefront User Flow', () => {
  describe('Step 1: Homepage (Requirements 1.1-1.7, 2.1-2.7)', () => {
    it('should initialize storefront with featured cars', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, (cars) => {
          const state = initializeStorefront(cars);
          
          // Verify initial state
          expect(state.currentPage).toBe('home');
          expect(state.breadcrumb).toEqual(['الرئيسية']);
          
          // Featured cars should only include featured and available cars
          const expectedFeatured = cars.filter(c => c.isFeatured && c.status === 'AVAILABLE');
          expect(state.featuredCars.length).toBe(expectedFeatured.length);
          state.featuredCars.forEach(car => {
            expect(car.isFeatured).toBe(true);
            expect(car.status).toBe('AVAILABLE');
          });
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should display correct car card information', () => {
      fc.assert(
        fc.property(carArbitrary, (car) => {
          const cardInfo = getCarCardInfo(car);
          
          // Verify all required info is present
          expect(cardInfo.name).toBe(car.name);
          expect(cardInfo.price).toContain('ر.ي'); // Currency symbol
          expect(cardInfo.year).toBe(car.year);
          expect(cardInfo.condition).toBe(car.condition === 'NEW' ? 'جديدة' : 'مستعملة');
          expect(cardInfo.showFeaturedBadge).toBe(car.isFeatured);
          expect(cardInfo.showSoldBadge).toBe(car.status === 'SOLD');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Step 2: Navigation (Requirements 1.4-1.6, 3.6)', () => {
    it('should navigate to cars page with correct breadcrumb', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, (cars) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          
          expect(state.currentPage).toBe('cars');
          expect(state.breadcrumb).toEqual(['الرئيسية', 'السيارات']);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('should navigate to car details with correct breadcrumb', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, (cars) => {
          if (cars.length === 0) return true;
          
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          
          const selectedCar = state.allCars[0];
          if (!selectedCar) return true;
          
          state = navigateToCarDetails(state, selectedCar);
          
          expect(state.currentPage).toBe('car-details');
          expect(state.selectedCar).toBe(selectedCar);
          expect(state.breadcrumb).toEqual(['الرئيسية', 'السيارات', selectedCar.name]);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Step 3: Search Functionality (Requirements 4.1)', () => {
    it('should return relevant search suggestions', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, searchQueryArbitrary, (cars, query) => {
          const state = initializeStorefront(cars);
          const suggestions = getSearchSuggestions(state, query);
          
          if (query.trim().length < 2) {
            expect(suggestions).toHaveLength(0);
            return true;
          }
          
          // All suggestions should contain the query (case-insensitive)
          const queryLower = query.toLowerCase();
          suggestions.forEach(suggestion => {
            expect(suggestion.label.toLowerCase()).toContain(queryLower);
          });
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should filter cars based on search query', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, searchQueryArbitrary, (cars, query) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          state = applySearch(state, query);
          
          const trimmedQuery = query.trim();
          if (!trimmedQuery) {
            // Empty search should show all available cars
            expect(state.filteredCars.length).toBe(state.allCars.length);
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

  describe('Step 4: Filtering (Requirements 4.2-4.8)', () => {
    it('should apply filters and update results', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, filtersArbitrary, (cars, filters) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          state = applyFilters(state, filters);
          
          // Verify all filtered cars match the filter criteria
          state.filteredCars.forEach(car => {
            if (filters.brand) expect(car.brand).toBe(filters.brand);
            if (filters.condition) expect(car.condition).toBe(filters.condition);
            if (filters.minPrice !== undefined) expect(car.price).toBeGreaterThanOrEqual(filters.minPrice);
            if (filters.maxPrice !== undefined) expect(car.price).toBeLessThanOrEqual(filters.maxPrice);
            if (filters.year !== undefined) expect(car.year).toBe(filters.year);
          });
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should display active filter chips', () => {
      fc.assert(
        fc.property(filtersArbitrary, (filters) => {
          const chips = getActiveFilterChips(filters);
          
          // Verify chips match active filters
          if (filters.brand) expect(chips.some(c => c.key === 'brand')).toBe(true);
          if (filters.condition) expect(chips.some(c => c.key === 'condition')).toBe(true);
          if (filters.minPrice !== undefined) expect(chips.some(c => c.key === 'minPrice')).toBe(true);
          if (filters.maxPrice !== undefined) expect(chips.some(c => c.key === 'maxPrice')).toBe(true);
          if (filters.year !== undefined) expect(chips.some(c => c.key === 'year')).toBe(true);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should remove filter and update results', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, (cars) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          
          // Apply a brand filter
          const brands = [...new Set(cars.map(c => c.brand))];
          if (brands.length === 0) return true;
          
          state = applyFilters(state, { brand: brands[0] });
          const filteredCount = state.filteredCars.length;
          
          // Remove the filter
          state = removeFilter(state, 'brand');
          
          // Results should be >= previous (removing filter expands results)
          expect(state.filteredCars.length).toBeGreaterThanOrEqual(filteredCount);
          expect(state.filters.brand).toBeUndefined();
          
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('should show results count', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, filtersArbitrary, (cars, filters) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          state = applyFilters(state, filters);
          
          // Results count should match filtered cars length
          const resultsCount = state.filteredCars.length;
          expect(resultsCount).toBeGreaterThanOrEqual(0);
          expect(resultsCount).toBeLessThanOrEqual(state.allCars.length);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Step 5: Pagination (Requirements 6.1)', () => {
    it('should paginate results correctly', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, pageNumberArbitrary, (cars, page) => {
          const state = initializeStorefront(cars);
          const pageSize = 12;
          const { cars: paginatedCars, totalPages } = paginateResults(state.allCars, page, pageSize);
          
          // Verify pagination
          expect(totalPages).toBe(Math.ceil(state.allCars.length / pageSize));
          
          if (page <= totalPages) {
            expect(paginatedCars.length).toBeLessThanOrEqual(pageSize);
          } else {
            expect(paginatedCars.length).toBe(0);
          }
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('should change page and update displayed cars', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, pageNumberArbitrary, (cars, targetPage) => {
          let state = initializeStorefront(cars);
          state = navigateToCarsPage(state);
          state = changePage(state, targetPage);
          
          expect(state.currentListPage).toBe(targetPage);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Step 6: Car Details (Requirements 3.1-3.8)', () => {
    it('should display car specifications correctly', () => {
      fc.assert(
        fc.property(carArbitrary, (car) => {
          const specs = getCarSpecifications(car);
          
          // Verify required specs are present
          expect(specs.some(s => s.label === 'الماركة' && s.value === car.brand)).toBe(true);
          expect(specs.some(s => s.label === 'الموديل' && s.value === car.model)).toBe(true);
          expect(specs.some(s => s.label === 'السنة' && s.value === car.year.toString())).toBe(true);
          expect(specs.some(s => s.label === 'الحالة')).toBe(true);
          
          // Kilometers should be present only if defined
          if (car.kilometers !== undefined) {
            expect(specs.some(s => s.label === 'الكيلومترات')).toBe(true);
          }
          
          // Each spec should have an icon
          specs.forEach(spec => {
            expect(spec.icon).toBeDefined();
            expect(spec.icon.length).toBeGreaterThan(0);
          });
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should format price correctly', () => {
      fc.assert(
        fc.property(fc.float({ min: 1000, max: 10000000, noNaN: true }), (price) => {
          const formatted = formatPrice(price);
          
          // Should contain currency symbol
          expect(formatted).toContain('ر.ي');
          
          // Should be a valid formatted string
          expect(formatted.length).toBeGreaterThan(0);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Complete User Flow Integration', () => {
    it('should complete full storefront user journey', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, searchQueryArbitrary, (cars, searchQuery) => {
          // Step 1: Initialize and view homepage
          let state = initializeStorefront(cars);
          expect(state.currentPage).toBe('home');
          expect(state.breadcrumb).toContain('الرئيسية');
          
          // Step 2: Navigate to cars listing
          state = navigateToCarsPage(state);
          expect(state.currentPage).toBe('cars');
          
          // Step 3: Search for cars (use trimmed query)
          const trimmedQuery = searchQuery.trim();
          state = applySearch(state, trimmedQuery);
          expect(state.searchQuery).toBe(trimmedQuery);
          
          // Step 4: Apply filters
          const brands = [...new Set(state.allCars.map(c => c.brand))];
          if (brands.length > 0) {
            state = applyFilters(state, { brand: brands[0] });
            expect(state.filters.brand).toBe(brands[0]);
          }
          
          // Step 5: View car details
          if (state.filteredCars.length > 0) {
            const selectedCar = state.filteredCars[0];
            state = navigateToCarDetails(state, selectedCar);
            expect(state.currentPage).toBe('car-details');
            expect(state.selectedCar).toBe(selectedCar);
            expect(state.breadcrumb).toContain(selectedCar.name);
            
            // Verify car info is accessible
            const cardInfo = getCarCardInfo(selectedCar);
            expect(cardInfo.name).toBe(selectedCar.name);
            
            const specs = getCarSpecifications(selectedCar);
            expect(specs.length).toBeGreaterThan(0);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain data integrity throughout user journey', () => {
      fc.assert(
        fc.property(carsArrayArbitrary, (cars) => {
          // Initialize
          let state = initializeStorefront(cars);
          const initialAvailableCount = state.allCars.length;
          
          // Navigate and filter
          state = navigateToCarsPage(state);
          state = applyFilters(state, { condition: 'NEW' });
          
          // Verify data integrity
          expect(state.allCars.length).toBe(initialAvailableCount);
          state.filteredCars.forEach(car => {
            expect(car.condition).toBe('NEW');
            expect(state.allCars).toContain(car);
          });
          
          // Clear filters
          state = removeFilter(state, 'condition');
          expect(state.filteredCars.length).toBe(initialAvailableCount);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });
});
