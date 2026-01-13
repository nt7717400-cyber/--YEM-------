/**
 * Feature: web-ui-ux-enhancement
 * Property 16: Admin Page Title
 * 
 * For any admin page, the header should display the correct page title
 * based on the current route.
 * 
 * Validates: Requirements 8.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Page Title Mapping
// ============================================

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/cars': 'إدارة السيارات',
  '/admin/auctions': 'المزادات',
  '/admin/banners': 'البانرات',
  '/admin/templates': 'قوالب الفحص',
  '/admin/part-keys': 'قاموس الأجزاء',
  '/admin/color-mappings': 'خريطة الألوان',
  '/admin/archive': 'الأرشيف',
  '/admin/settings': 'الإعدادات',
};

// ============================================
// Pure Functions
// ============================================

/**
 * Get page title for a given pathname
 */
function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  
  // Check for nested routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + '/')) {
      return title;
    }
  }
  
  return 'لوحة التحكم';
}

/**
 * Check if a path is a valid admin path
 */
function isValidAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin/');
}

/**
 * Get the base admin path from a nested path
 */
function getBaseAdminPath(pathname: string): string {
  const parts = pathname.split('/');
  if (parts.length >= 3) {
    return `/${parts[1]}/${parts[2]}`;
  }
  return pathname;
}

// ============================================
// Arbitraries
// ============================================

const exactPathArb = fc.constantFrom(...Object.keys(pageTitles));

const nestedPathArb = fc.tuple(
  fc.constantFrom(...Object.keys(pageTitles)),
  fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0 && s.length < 20)
).map(([base, suffix]) => `${base}/${suffix}`);

const deepNestedPathArb = fc.tuple(
  fc.constantFrom(...Object.keys(pageTitles)),
  fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0 && s.length < 10),
  fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0 && s.length < 10)
).map(([base, s1, s2]) => `${base}/${s1}/${s2}`);

const allPathsArb = fc.oneof(exactPathArb, nestedPathArb, deepNestedPathArb);

const invalidPathArb = fc.constantFrom(
  '/other/page',
  '/user/profile',
  '/',
  '/admin',
  ''
);

// ============================================
// Property Tests
// ============================================

describe('Property 16: Admin Page Title', () => {
  describe('Exact Path Matching', () => {
    it('should return correct title for exact paths', () => {
      fc.assert(
        fc.property(exactPathArb, (path) => {
          const title = getPageTitle(path);
          expect(title).toBe(pageTitles[path]);
        })
      );
    });

    it('should have non-empty titles for all defined paths', () => {
      for (const [path, title] of Object.entries(pageTitles)) {
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Nested Path Matching', () => {
    it('should return parent title for nested paths', () => {
      fc.assert(
        fc.property(nestedPathArb, (path) => {
          const basePath = getBaseAdminPath(path);
          const title = getPageTitle(path);
          const expectedTitle = pageTitles[basePath];
          expect(title).toBe(expectedTitle);
        })
      );
    });

    it('should return parent title for deeply nested paths', () => {
      fc.assert(
        fc.property(deepNestedPathArb, (path) => {
          const basePath = getBaseAdminPath(path);
          const title = getPageTitle(path);
          const expectedTitle = pageTitles[basePath];
          expect(title).toBe(expectedTitle);
        })
      );
    });
  });

  describe('Default Fallback', () => {
    it('should return default title for unknown paths', () => {
      fc.assert(
        fc.property(invalidPathArb, (path) => {
          const title = getPageTitle(path);
          expect(title).toBe('لوحة التحكم');
        })
      );
    });
  });

  describe('Path Validation', () => {
    it('should identify valid admin paths', () => {
      fc.assert(
        fc.property(allPathsArb, (path) => {
          expect(isValidAdminPath(path)).toBe(true);
        })
      );
    });

    it('should reject non-admin paths', () => {
      fc.assert(
        fc.property(invalidPathArb, (path) => {
          // Empty string and paths not starting with /admin/ are invalid
          if (path === '' || !path.startsWith('/admin/')) {
            expect(isValidAdminPath(path)).toBe(false);
          }
        })
      );
    });
  });

  describe('Base Path Extraction', () => {
    it('should extract base path correctly', () => {
      fc.assert(
        fc.property(nestedPathArb, (path) => {
          const basePath = getBaseAdminPath(path);
          expect(Object.keys(pageTitles)).toContain(basePath);
        })
      );
    });

    it('should return same path for exact matches', () => {
      fc.assert(
        fc.property(exactPathArb, (path) => {
          const basePath = getBaseAdminPath(path);
          expect(basePath).toBe(path);
        })
      );
    });
  });

  describe('Title Consistency', () => {
    it('should return same title for path and its children', () => {
      fc.assert(
        fc.property(
          exactPathArb,
          fc.stringMatching(/^[a-z0-9]+$/).filter(s => s.length > 0 && s.length < 10),
          (basePath, suffix) => {
            const parentTitle = getPageTitle(basePath);
            const childTitle = getPageTitle(`${basePath}/${suffix}`);
            expect(childTitle).toBe(parentTitle);
          }
        )
      );
    });
  });

  describe('All Pages Covered', () => {
    it('should have titles for all main admin sections', () => {
      const expectedSections = [
        'dashboard',
        'cars',
        'auctions',
        'banners',
        'templates',
        'part-keys',
        'color-mappings',
        'archive',
        'settings',
      ];

      for (const section of expectedSections) {
        const path = `/admin/${section}`;
        expect(pageTitles[path]).toBeDefined();
        expect(pageTitles[path].length).toBeGreaterThan(0);
      }
    });
  });
});
