/**
 * Property 14: Response Format Completeness
 * *For any* banner returned from the API, it should contain all required fields:
 * id, title, imageUrl, position, isActive, startDate, endDate, clickCount, viewCount.
 *
 * **Validates: Requirements 4.2**
 *
 * Feature: banner-management, Property 14: Response Format Completeness
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { Banner } from '@/types/banner';
import { bannersArrayArbitrary, bannerArbitrary } from '../generators/banner.generator';

/**
 * Required fields that must be present in every banner response.
 * Based on Requirements 4.2: id, title, imageUrl, position, isActive,
 * startDate, endDate, clickCount, viewCount
 */
const REQUIRED_BANNER_FIELDS: (keyof Banner)[] = [
  'id',
  'title',
  'imageUrl',
  'position',
  'isActive',
  'startDate',
  'endDate',
  'clickCount',
  'viewCount',
];

/**
 * All fields that should be present in a complete banner response.
 */
const ALL_BANNER_FIELDS: (keyof Banner)[] = [
  'id',
  'title',
  'imageUrl',
  'imageMobileUrl',
  'linkUrl',
  'linkTarget',
  'position',
  'displayOrder',
  'isActive',
  'startDate',
  'endDate',
  'clickCount',
  'viewCount',
  'createdAt',
  'updatedAt',
];

/**
 * Validates that a banner object contains all required fields.
 */
function hasRequiredFields(banner: Banner): boolean {
  return REQUIRED_BANNER_FIELDS.every((field) => field in banner);
}

/**
 * Validates that a banner object contains all expected fields.
 */
function hasAllFields(banner: Banner): boolean {
  return ALL_BANNER_FIELDS.every((field) => field in banner);
}

/**
 * Validates field types for a banner object.
 */
function validateFieldTypes(banner: Banner): boolean {
  // id must be a number
  if (typeof banner.id !== 'number') return false;

  // title must be a string
  if (typeof banner.title !== 'string') return false;

  // imageUrl must be a string
  if (typeof banner.imageUrl !== 'string') return false;

  // position must be a valid position string
  const validPositions = [
    'hero_top',
    'hero_bottom',
    'sidebar',
    'cars_between',
    'car_detail',
    'footer_above',
    'popup',
  ];
  if (!validPositions.includes(banner.position)) return false;

  // isActive must be a boolean
  if (typeof banner.isActive !== 'boolean') return false;

  // clickCount must be a non-negative number
  if (typeof banner.clickCount !== 'number' || banner.clickCount < 0) return false;

  // viewCount must be a non-negative number
  if (typeof banner.viewCount !== 'number' || banner.viewCount < 0) return false;

  // startDate must be null or a string
  if (banner.startDate !== null && typeof banner.startDate !== 'string') return false;

  // endDate must be null or a string
  if (banner.endDate !== null && typeof banner.endDate !== 'string') return false;

  return true;
}

describe('Property 14: Response Format Completeness', () => {
  /**
   * Property: Every banner should contain all required fields.
   */
  it('should contain all required fields (id, title, imageUrl, position, isActive, startDate, endDate, clickCount, viewCount)', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return hasRequiredFields(banner);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Every banner should contain all expected fields for complete response.
   */
  it('should contain all expected fields for a complete banner response', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return hasAllFields(banner);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All banners in an array should have required fields.
   */
  it('should ensure all banners in a list have required fields', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, (banners) => {
        return banners.every((banner) => hasRequiredFields(banner));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Field types should be correct for all banners.
   */
  it('should have correct field types for all banner properties', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return validateFieldTypes(banner);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: id field should be a positive integer.
   */
  it('should have a positive integer id', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return Number.isInteger(banner.id) && banner.id > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: title field should be a non-empty string.
   */
  it('should have a non-empty title string', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return typeof banner.title === 'string' && banner.title.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: imageUrl field should be a non-empty string.
   */
  it('should have a non-empty imageUrl string', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return typeof banner.imageUrl === 'string' && banner.imageUrl.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: position field should be one of the valid positions.
   */
  it('should have a valid position value', () => {
    const validPositions = [
      'hero_top',
      'hero_bottom',
      'sidebar',
      'cars_between',
      'car_detail',
      'footer_above',
      'popup',
    ];

    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return validPositions.includes(banner.position);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: clickCount and viewCount should be non-negative integers.
   */
  it('should have non-negative clickCount and viewCount', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return (
          Number.isInteger(banner.clickCount) &&
          banner.clickCount >= 0 &&
          Number.isInteger(banner.viewCount) &&
          banner.viewCount >= 0
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: displayOrder should be a non-negative integer.
   */
  it('should have a non-negative displayOrder', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return Number.isInteger(banner.displayOrder) && banner.displayOrder >= 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: linkTarget should be either '_self' or '_blank'.
   */
  it('should have a valid linkTarget value', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        return banner.linkTarget === '_self' || banner.linkTarget === '_blank';
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Date fields should be valid ISO strings or null.
   */
  it('should have valid date formats for startDate, endDate, createdAt, updatedAt', () => {
    fc.assert(
      fc.property(bannerArbitrary, (banner) => {
        // Helper to check if a string is a valid ISO date
        const isValidISODate = (dateStr: string | null): boolean => {
          if (dateStr === null) return true;
          const date = new Date(dateStr);
          return !isNaN(date.getTime());
        };

        return (
          isValidISODate(banner.startDate) &&
          isValidISODate(banner.endDate) &&
          isValidISODate(banner.createdAt) &&
          isValidISODate(banner.updatedAt)
        );
      }),
      { numRuns: 100 }
    );
  });
});
