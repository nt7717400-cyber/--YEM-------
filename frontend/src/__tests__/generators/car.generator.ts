import * as fc from 'fast-check';
import { Car, CarFilters } from '@/types';

// Generate a valid date string (constrained to valid range)
const validDateArbitrary = fc
  .integer({ min: 0, max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
  .map((timestamp) => new Date(timestamp).toISOString());

// Generate a valid car image
export const carImageArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  carId: fc.integer({ min: 1, max: 10000 }),
  url: fc.constant('/placeholder-car.svg'),
  order: fc.integer({ min: 0, max: 20 }),
  createdAt: validDateArbitrary,
});

// Generate a valid car video
export const carVideoArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  carId: fc.integer({ min: 1, max: 10000 }),
  type: fc.constantFrom('YOUTUBE' as const, 'UPLOAD' as const),
  url: fc.constant('https://www.youtube.com/watch?v=test'),
  createdAt: validDateArbitrary,
});

// Generate a valid car
export const carArbitrary: fc.Arbitrary<Car> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  brand: fc.string({ minLength: 1, maxLength: 50 }),
  model: fc.string({ minLength: 1, maxLength: 50 }),
  year: fc.integer({ min: 1990, max: 2026 }),
  price: fc.float({ min: 1000, max: 10000000, noNaN: true }),
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
  video: fc.option(carVideoArbitrary, { nil: undefined }),
});

// Generate an array of cars
export const carsArrayArbitrary = fc.array(carArbitrary, { minLength: 0, maxLength: 20 });

// Generate car filters
export const filtersArbitrary: fc.Arbitrary<CarFilters> = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  brand: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  condition: fc.option(fc.constantFrom('NEW' as const, 'USED' as const), { nil: undefined }),
  minPrice: fc.option(fc.float({ min: 0, max: 5000000, noNaN: true }), { nil: undefined }),
  maxPrice: fc.option(fc.float({ min: 0, max: 10000000, noNaN: true }), { nil: undefined }),
  year: fc.option(fc.integer({ min: 1990, max: 2026 }), { nil: undefined }),
  sortBy: fc.option(fc.constantFrom('newest' as const, 'price_asc' as const, 'price_desc' as const), { nil: undefined }),
  status: fc.option(fc.constantFrom('AVAILABLE' as const, 'SOLD' as const), { nil: undefined }),
  featured: fc.option(fc.boolean(), { nil: undefined }),
});
