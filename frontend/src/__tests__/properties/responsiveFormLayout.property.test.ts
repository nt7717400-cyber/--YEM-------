/**
 * Feature: web-ui-ux-enhancement
 * Property 29: Responsive Form Layout
 * 
 * *For any* form on mobile viewport, form fields should be displayed
 * in a single-column layout.
 * 
 * **Validates: Requirements 15.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Responsive Breakpoints - Requirements: 15.2
// ============================================

const BREAKPOINTS = {
  mobile: 640,      // sm breakpoint
  tablet: 768,      // md breakpoint
  desktop: 1024,    // lg breakpoint
};

// ============================================
// Form Layout Configuration
// ============================================

interface FormLayoutConfig {
  viewportWidth: number;
  maxColumns: number;
  expectedColumns: number;
}

// ============================================
// Utility Functions - Matching responsiveUtils.ts
// ============================================

/**
 * Get the number of form columns based on viewport width
 * Forms should be single-column on mobile for better usability
 */
function getFormLayoutColumns(viewportWidth: number, maxColumns: number = 2): number {
  // Mobile (< 640px): Always single column
  if (viewportWidth < BREAKPOINTS.mobile) {
    return 1;
  }
  
  // Tablet (640px - 1023px): 2 columns max
  if (viewportWidth < BREAKPOINTS.desktop) {
    return Math.min(2, maxColumns);
  }
  
  // Desktop (>= 1024px): Use maxColumns
  return maxColumns;
}

/**
 * Check if form should be in single-column layout
 */
function isFormSingleColumn(viewportWidth: number): boolean {
  return viewportWidth < BREAKPOINTS.mobile;
}

/**
 * Parse Tailwind CSS grid classes to determine column count at a given viewport
 * Based on the ResponsiveFormGrid component classes
 */
function parseFormGridClasses(
  viewportWidth: number,
  tabletColumns: number = 2,
  desktopColumns: number = 2
): number {
  // Mobile (< 640px): Always 1 column (grid-cols-1)
  if (viewportWidth < BREAKPOINTS.mobile) {
    return 1;
  }
  
  // Tablet (640px - 1023px): Use tabletColumns (sm:grid-cols-X)
  if (viewportWidth < BREAKPOINTS.desktop) {
    return tabletColumns;
  }
  
  // Desktop (>= 1024px): Use desktopColumns (lg:grid-cols-X)
  return desktopColumns;
}

/**
 * Validate that a form layout configuration is correct
 */
function validateFormLayout(config: FormLayoutConfig): boolean {
  const actualColumns = getFormLayoutColumns(config.viewportWidth, config.maxColumns);
  return actualColumns === config.expectedColumns;
}

// ============================================
// Arbitraries for Property Testing
// ============================================

// Arbitrary for mobile viewport widths (< 640px)
const mobileViewportArbitrary = fc.integer({ min: 320, max: 639 });

// Arbitrary for tablet viewport widths (>= 640px and < 1024px)
const tabletViewportArbitrary = fc.integer({ min: 640, max: 1023 });

// Arbitrary for desktop viewport widths (>= 1024px)
const desktopViewportArbitrary = fc.integer({ min: 1024, max: 1920 });

// Arbitrary for any viewport width
const anyViewportArbitrary = fc.integer({ min: 320, max: 1920 });

// Arbitrary for max columns configuration
const maxColumnsArbitrary = fc.integer({ min: 1, max: 4 });

// Arbitrary for tablet columns (1 or 2)
const tabletColumnsArbitrary = fc.constantFrom(1, 2);

// Arbitrary for desktop columns (2, 3, or 4)
const desktopColumnsArbitrary = fc.constantFrom(2, 3, 4);

// ============================================
// Property Tests - Property 29: Responsive Form Layout
// ============================================

describe('Property 29: Responsive Form Layout', () => {
  /**
   * Property: For any mobile viewport width (< 640px), forms should
   * always display in single-column layout regardless of maxColumns setting.
   */
  it('should display single column on mobile viewports regardless of maxColumns', () => {
    fc.assert(
      fc.property(
        mobileViewportArbitrary,
        maxColumnsArbitrary,
        (viewportWidth, maxColumns) => {
          const columns = getFormLayoutColumns(viewportWidth, maxColumns);
          return columns === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any mobile viewport width, isFormSingleColumn should return true.
   */
  it('should identify mobile viewports as single-column', () => {
    fc.assert(
      fc.property(mobileViewportArbitrary, (viewportWidth) => {
        return isFormSingleColumn(viewportWidth) === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any non-mobile viewport width, isFormSingleColumn should return false.
   */
  it('should identify non-mobile viewports as multi-column capable', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 640, max: 1920 }),
        (viewportWidth) => {
          return isFormSingleColumn(viewportWidth) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any tablet viewport width (640px - 1023px), forms should
   * display at most 2 columns, even if maxColumns is higher.
   */
  it('should cap columns at 2 on tablet viewports', () => {
    fc.assert(
      fc.property(
        tabletViewportArbitrary,
        maxColumnsArbitrary,
        (viewportWidth, maxColumns) => {
          const columns = getFormLayoutColumns(viewportWidth, maxColumns);
          return columns <= 2 && columns >= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any desktop viewport width (>= 1024px), forms should
   * display the requested maxColumns.
   */
  it('should use maxColumns on desktop viewports', () => {
    fc.assert(
      fc.property(
        desktopViewportArbitrary,
        maxColumnsArbitrary,
        (viewportWidth, maxColumns) => {
          const columns = getFormLayoutColumns(viewportWidth, maxColumns);
          return columns === maxColumns;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any viewport width and configuration, the column count
   * should be a positive integer between 1 and maxColumns.
   */
  it('should always return valid column count between 1 and maxColumns', () => {
    fc.assert(
      fc.property(
        anyViewportArbitrary,
        maxColumnsArbitrary,
        (viewportWidth, maxColumns) => {
          const columns = getFormLayoutColumns(viewportWidth, maxColumns);
          return columns >= 1 && columns <= maxColumns;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Column count should be non-decreasing as viewport width increases
   * (for the same maxColumns setting).
   */
  it('should have non-decreasing column count as viewport increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1500 }),
        fc.integer({ min: 1, max: 400 }),
        maxColumnsArbitrary,
        (baseWidth, increment, maxColumns) => {
          const smallerViewport = baseWidth;
          const largerViewport = baseWidth + increment;
          const smallerColumns = getFormLayoutColumns(smallerViewport, maxColumns);
          const largerColumns = getFormLayoutColumns(largerViewport, maxColumns);
          return largerColumns >= smallerColumns;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseFormGridClasses should return 1 column for any mobile viewport.
   */
  it('should parse grid classes as single column on mobile', () => {
    fc.assert(
      fc.property(
        mobileViewportArbitrary,
        tabletColumnsArbitrary,
        desktopColumnsArbitrary,
        (viewportWidth, tabletCols, desktopCols) => {
          const columns = parseFormGridClasses(viewportWidth, tabletCols, desktopCols);
          return columns === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseFormGridClasses should return tabletColumns for tablet viewports.
   */
  it('should parse grid classes correctly for tablet viewports', () => {
    fc.assert(
      fc.property(
        tabletViewportArbitrary,
        tabletColumnsArbitrary,
        desktopColumnsArbitrary,
        (viewportWidth, tabletCols, desktopCols) => {
          const columns = parseFormGridClasses(viewportWidth, tabletCols, desktopCols);
          return columns === tabletCols;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseFormGridClasses should return desktopColumns for desktop viewports.
   */
  it('should parse grid classes correctly for desktop viewports', () => {
    fc.assert(
      fc.property(
        desktopViewportArbitrary,
        tabletColumnsArbitrary,
        desktopColumnsArbitrary,
        (viewportWidth, tabletCols, desktopCols) => {
          const columns = parseFormGridClasses(viewportWidth, tabletCols, desktopCols);
          return columns === desktopCols;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify breakpoint boundaries for form layout.
   */
  it('should have correct column count at breakpoint boundaries', () => {
    // Just below mobile breakpoint - should be 1 column
    expect(getFormLayoutColumns(639, 4)).toBe(1);
    
    // At tablet breakpoint - should be capped at 2
    expect(getFormLayoutColumns(640, 4)).toBe(2);
    expect(getFormLayoutColumns(640, 1)).toBe(1);
    
    // Just below desktop breakpoint - should be capped at 2
    expect(getFormLayoutColumns(1023, 4)).toBe(2);
    
    // At desktop breakpoint - should use maxColumns
    expect(getFormLayoutColumns(1024, 4)).toBe(4);
    expect(getFormLayoutColumns(1024, 2)).toBe(2);
  });

  /**
   * Specific test: Verify single column is enforced on common mobile widths.
   */
  it('should enforce single column on common mobile device widths', () => {
    const mobileWidths = [320, 375, 390, 414, 428, 480, 540, 600, 639];
    
    mobileWidths.forEach(width => {
      expect(getFormLayoutColumns(width, 2)).toBe(1);
      expect(getFormLayoutColumns(width, 3)).toBe(1);
      expect(getFormLayoutColumns(width, 4)).toBe(1);
      expect(isFormSingleColumn(width)).toBe(true);
    });
  });

  /**
   * Specific test: Verify multi-column is allowed on tablet and desktop.
   */
  it('should allow multi-column on tablet and desktop widths', () => {
    const nonMobileWidths = [640, 768, 834, 1024, 1280, 1440, 1920];
    
    nonMobileWidths.forEach(width => {
      expect(isFormSingleColumn(width)).toBe(false);
      expect(getFormLayoutColumns(width, 2)).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * Specific test: Verify FormLayoutConfig validation works correctly.
   */
  it('should validate form layout configurations correctly', () => {
    // Valid mobile configuration
    expect(validateFormLayout({
      viewportWidth: 400,
      maxColumns: 4,
      expectedColumns: 1,
    })).toBe(true);

    // Valid tablet configuration
    expect(validateFormLayout({
      viewportWidth: 800,
      maxColumns: 4,
      expectedColumns: 2,
    })).toBe(true);

    // Valid desktop configuration
    expect(validateFormLayout({
      viewportWidth: 1200,
      maxColumns: 3,
      expectedColumns: 3,
    })).toBe(true);

    // Invalid configuration (wrong expected columns)
    expect(validateFormLayout({
      viewportWidth: 400,
      maxColumns: 4,
      expectedColumns: 4, // Should be 1 on mobile
    })).toBe(false);
  });
});
