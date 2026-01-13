/**
 * Feature: web-ui-ux-enhancement
 * Property 4: Navigation Active State
 * 
 * **Validates: Requirements 1.6**
 * 
 * For any current route path, exactly one menu item should have the active state,
 * and it should correspond to the current page.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isMenuItemActive, navLinks, MenuItem } from '@/components/layout/Header';

// ============================================
// Test Data
// ============================================

/**
 * Standard navigation menu items
 */
const standardMenuItems: MenuItem[] = navLinks;

/**
 * Test paths that should match specific menu items
 */
const testPaths = [
  { path: '/', expectedActiveHref: '/' },
  { path: '/cars', expectedActiveHref: '/cars' },
  { path: '/cars/123', expectedActiveHref: '/cars' },
  { path: '/cars/details/456', expectedActiveHref: '/cars' },
  { path: '/about', expectedActiveHref: '/about' },
  { path: '/about/', expectedActiveHref: '/about' },
];

// ============================================
// Arbitraries for Property Testing
// ============================================

/**
 * Generate valid route paths
 */
const validPathArbitrary = fc.constantFrom(
  '/',
  '/cars',
  '/cars/123',
  '/cars/details/456',
  '/about',
  '/about/'
);

/**
 * Generate menu item hrefs
 */
const menuHrefArbitrary = fc.constantFrom('/', '/cars', '/about');

/**
 * Generate random path segments
 */
const pathSegmentArbitrary = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-z0-9-_]+$/.test(s));

/**
 * Generate nested paths under a base path
 */
const nestedPathArbitrary = (basePath: string) =>
  fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)), { minLength: 1, maxLength: 3 })
    .map(segments => `${basePath}/${segments.join('/')}`);

// ============================================
// Property 4: Navigation Active State
// ============================================

describe('Property 4: Navigation Active State', () => {
  /**
   * Property: For any valid path, exactly one menu item should be active
   */
  it('should have exactly one active menu item for any valid path', () => {
    fc.assert(
      fc.property(validPathArbitrary, (currentPath) => {
        const activeItems = standardMenuItems.filter(item => 
          isMenuItemActive(item.href, currentPath)
        );
        
        // Exactly one item should be active
        return activeItems.length === 1;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Home page path should only activate home menu item
   */
  it('should only activate home menu item for root path', () => {
    const homePaths = ['/', ''];
    
    homePaths.forEach(path => {
      const activeItems = standardMenuItems.filter(item => 
        isMenuItemActive(item.href, path || '/')
      );
      
      expect(activeItems.length).toBe(1);
      expect(activeItems[0].href).toBe('/');
    });
  });

  /**
   * Property: Nested paths should activate their parent menu item
   */
  it('should activate parent menu item for nested paths', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/cars', '/about'),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)),
        (basePath, segment) => {
          const nestedPath = `${basePath}/${segment}`;
          const isActive = isMenuItemActive(basePath, nestedPath);
          return isActive === true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Exact path match should always be active
   */
  it('should always activate menu item for exact path match', () => {
    fc.assert(
      fc.property(menuHrefArbitrary, (href) => {
        return isMenuItemActive(href, href) === true;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Home path should not be active for non-home paths
   */
  it('should not activate home for non-home paths', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/cars', '/about', '/cars/123', '/about/team'),
        (path) => {
          return isMenuItemActive('/', path) === false;
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Trailing slashes should not affect active state
   */
  it('should handle trailing slashes consistently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/cars', '/about'),
        (basePath) => {
          const withSlash = `${basePath}/`;
          const withoutSlash = basePath;
          
          // Both should produce the same active state
          const activeWithSlash = isMenuItemActive(basePath, withSlash);
          const activeWithoutSlash = isMenuItemActive(basePath, withoutSlash);
          
          return activeWithSlash === activeWithoutSlash;
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Different menu items should not both be active for the same path
   */
  it('should not have multiple active items for any path', () => {
    fc.assert(
      fc.property(validPathArbitrary, (currentPath) => {
        const activeCount = standardMenuItems.reduce((count, item) => {
          return count + (isMenuItemActive(item.href, currentPath) ? 1 : 0);
        }, 0);
        
        // Should have exactly one active item
        return activeCount === 1;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Active state should be deterministic
   */
  it('should produce consistent results for the same inputs', () => {
    fc.assert(
      fc.property(
        menuHrefArbitrary,
        validPathArbitrary,
        (href, path) => {
          const result1 = isMenuItemActive(href, path);
          const result2 = isMenuItemActive(href, path);
          return result1 === result2;
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ============================================
// Specific Test Cases
// ============================================

describe('Navigation Active State - Specific Cases', () => {
  testPaths.forEach(({ path, expectedActiveHref }) => {
    it(`should activate "${expectedActiveHref}" for path "${path}"`, () => {
      const activeItems = standardMenuItems.filter(item => 
        isMenuItemActive(item.href, path)
      );
      
      expect(activeItems.length).toBe(1);
      expect(activeItems[0].href).toBe(expectedActiveHref);
    });
  });

  it('should handle deeply nested car paths', () => {
    const deepPaths = [
      '/cars/brand/toyota/model/camry',
      '/cars/123/details',
      '/cars/new/2024',
    ];

    deepPaths.forEach(path => {
      expect(isMenuItemActive('/cars', path)).toBe(true);
      expect(isMenuItemActive('/', path)).toBe(false);
      expect(isMenuItemActive('/about', path)).toBe(false);
    });
  });

  it('should not match partial path segments', () => {
    // /carsale should not match /cars
    expect(isMenuItemActive('/cars', '/carsale')).toBe(false);
    // /aboutus should not match /about
    expect(isMenuItemActive('/about', '/aboutus')).toBe(false);
  });
});
