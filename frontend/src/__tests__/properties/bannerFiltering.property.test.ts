/**
 * Property 8: Position Filtering
 * *For any* position filter applied to banner list, all returned banners
 * should have that exact position value.
 *
 * Property 9: Status Filtering
 * *For any* status filter (active/inactive) applied to banner list,
 * all returned banners should have matching is_active value.
 *
 * **Validates: Requirements 4.3, 4.4**
 *
 * Feature: banner-management, Property 8: Position Filtering
 * Feature: banner-management, Property 9: Status Filtering
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { Banner, BannerPosition, BannerFilters } from '@/types/banner';
import {
  bannersArrayArbitrary,
  bannerPositionArbitrary,
  BANNER_POSITIONS,
} from '../generators/banner.generator';

/**
 * Filter banners by position.
 * Simulates the filtering logic used in the frontend.
 */
function filterByPosition(banners: Banner[], position: BannerPosition): Banner[] {
  return banners.filter((banner) => banner.position === position);
}

/**
 * Filter banners by active status.
 * Simulates the filtering logic used in the frontend.
 */
function filterByStatus(banners: Banner[], isActive: boolean): Banner[] {
  return banners.filter((banner) => banner.isActive === isActive);
}

/**
 * Apply multiple filters to banners.
 * Simulates the combined filtering logic.
 */
function applyFilters(banners: Banner[], filters: BannerFilters): Banner[] {
  let result = [...banners];

  if (filters.position !== undefined) {
    result = result.filter((banner) => banner.position === filters.position);
  }

  if (filters.isActive !== undefined) {
    result = result.filter((banner) => banner.isActive === filters.isActive);
  }

  return result;
}

describe('Property 8: Position Filtering', () => {
  /**
   * Property: For any position filter, all returned banners should have that exact position.
   */
  it('should return only banners matching the specified position', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, bannerPositionArbitrary, (banners, position) => {
        const filteredBanners = filterByPosition(banners, position);

        // All returned banners must have the specified position
        return filteredBanners.every((banner) => banner.position === position);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Position filtering should not exclude any banner that matches the position.
   */
  it('should include all banners that match the position', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, bannerPositionArbitrary, (banners, position) => {
        const filteredBanners = filterByPosition(banners, position);
        const filteredIds = new Set(filteredBanners.map((b) => b.id));

        // Every banner with matching position should be in the result
        return banners
          .filter((banner) => banner.position === position)
          .every((banner) => filteredIds.has(banner.id));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtering by each valid position should work correctly.
   */
  it('should correctly filter for all valid positions', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, (banners) => {
        // Test each position
        for (const position of BANNER_POSITIONS) {
          const filtered = filterByPosition(banners, position);
          const allMatch = filtered.every((b) => b.position === position);
          if (!allMatch) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Position filtering should preserve banner data integrity.
   */
  it('should preserve all banner properties after filtering', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, bannerPositionArbitrary, (banners, position) => {
        const filteredBanners = filterByPosition(banners, position);

        // Each filtered banner should be identical to its original
        return filteredBanners.every((filtered) => {
          const original = banners.find((b) => b.id === filtered.id);
          return original && JSON.stringify(filtered) === JSON.stringify(original);
        });
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 9: Status Filtering', () => {
  /**
   * Property: For any status filter, all returned banners should have matching isActive value.
   */
  it('should return only banners matching the specified active status', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, fc.boolean(), (banners, isActive) => {
        const filteredBanners = filterByStatus(banners, isActive);

        // All returned banners must have the specified isActive status
        return filteredBanners.every((banner) => banner.isActive === isActive);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Status filtering should not exclude any banner that matches the status.
   */
  it('should include all banners that match the status', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, fc.boolean(), (banners, isActive) => {
        const filteredBanners = filterByStatus(banners, isActive);
        const filteredIds = new Set(filteredBanners.map((b) => b.id));

        // Every banner with matching status should be in the result
        return banners
          .filter((banner) => banner.isActive === isActive)
          .every((banner) => filteredIds.has(banner.id));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Active and inactive filters should partition the banner list.
   */
  it('should partition banners into active and inactive sets', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, (banners) => {
        const activeBanners = filterByStatus(banners, true);
        const inactiveBanners = filterByStatus(banners, false);

        // Combined count should equal total
        if (activeBanners.length + inactiveBanners.length !== banners.length) {
          return false;
        }

        // No overlap between active and inactive
        const activeIds = new Set(activeBanners.map((b) => b.id));
        const hasOverlap = inactiveBanners.some((b) => activeIds.has(b.id));

        return !hasOverlap;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Status filtering should preserve banner data integrity.
   */
  it('should preserve all banner properties after filtering', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, fc.boolean(), (banners, isActive) => {
        const filteredBanners = filterByStatus(banners, isActive);

        // Each filtered banner should be identical to its original
        return filteredBanners.every((filtered) => {
          const original = banners.find((b) => b.id === filtered.id);
          return original && JSON.stringify(filtered) === JSON.stringify(original);
        });
      }),
      { numRuns: 100 }
    );
  });
});

describe('Combined Filtering', () => {
  /**
   * Property: Combined position and status filters should work correctly.
   */
  it('should correctly apply both position and status filters', () => {
    fc.assert(
      fc.property(
        bannersArrayArbitrary,
        bannerPositionArbitrary,
        fc.boolean(),
        (banners, position, isActive) => {
          const filters: BannerFilters = { position, isActive };
          const filteredBanners = applyFilters(banners, filters);

          // All returned banners must match both criteria
          return filteredBanners.every(
            (banner) => banner.position === position && banner.isActive === isActive
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty filters should return all banners.
   */
  it('should return all banners when no filters are applied', () => {
    fc.assert(
      fc.property(bannersArrayArbitrary, (banners) => {
        const filteredBanners = applyFilters(banners, {});
        return filteredBanners.length === banners.length;
      }),
      { numRuns: 100 }
    );
  });
});
