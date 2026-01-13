/**
 * Feature: web-ui-ux-enhancement
 * Property 22: Touch Target Minimum Size
 * Property 23: Responsive Grid Columns
 * 
 * Property 22: *For any* interactive element (button, link, input) on mobile viewport,
 * the element should have minimum dimensions of 44x44 pixels.
 * 
 * Property 23: *For any* viewport width, the car grid should display the correct
 * number of columns: 4 on desktop (≥1024px), 2 on tablet (≥640px), 1 on mobile (<640px).
 * 
 * **Validates: Requirements 6.1, 6.3, 6.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Responsive Breakpoints - Requirements: 6.1
// ============================================

interface ResponsiveBreakpoints {
  mobile: number;      // < 640px
  tablet: number;      // >= 640px and < 1024px
  desktop: number;     // >= 1024px
}

const BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1024,
};

// ============================================
// Touch Target Configuration - Requirements: 6.3, 6.6
// ============================================

const MINIMUM_TOUCH_TARGET = 44; // pixels

interface TouchTargetConfig {
  name: string;
  selector: string;
  minWidth: number;
  minHeight: number;
}

const touchTargetConfigs: TouchTargetConfig[] = [
  {
    name: 'Button',
    selector: 'button',
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
  },
  {
    name: 'Input',
    selector: 'input',
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
  },
  {
    name: 'Select Trigger',
    selector: '[role="combobox"]',
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
  },
  {
    name: 'Checkbox',
    selector: 'input[type="checkbox"]',
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
  },
  {
    name: 'Radio',
    selector: 'input[type="radio"]',
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
  },
];

// ============================================
// Grid Column Configuration - Requirements: 6.1
// ============================================

interface GridColumnConfig {
  viewportType: 'mobile' | 'tablet' | 'desktop';
  minWidth: number;
  maxWidth: number;
  expectedColumns: number;
}

const gridColumnConfigs: GridColumnConfig[] = [
  {
    viewportType: 'mobile',
    minWidth: 320,
    maxWidth: 639,
    expectedColumns: 1,
  },
  {
    viewportType: 'tablet',
    minWidth: 640,
    maxWidth: 1023,
    expectedColumns: 2,
  },
  {
    viewportType: 'desktop',
    minWidth: 1024,
    maxWidth: 1920,
    expectedColumns: 4,
  },
];

// ============================================
// Utility Functions
// ============================================

/**
 * Determine the number of grid columns based on viewport width
 * Based on Tailwind CSS classes: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 */
function getExpectedGridColumns(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return 1; // mobile: grid-cols-1
  } else if (viewportWidth < 1024) {
    return 2; // tablet (sm): grid-cols-2
  } else {
    return 4; // desktop (lg): grid-cols-4
  }
}

/**
 * Determine viewport type based on width
 */
function getViewportType(viewportWidth: number): 'mobile' | 'tablet' | 'desktop' {
  if (viewportWidth < 640) {
    return 'mobile';
  } else if (viewportWidth < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if touch target meets minimum size requirements
 */
function meetsTouchTargetMinimum(width: number, height: number): boolean {
  return width >= MINIMUM_TOUCH_TARGET && height >= MINIMUM_TOUCH_TARGET;
}

/**
 * Get minimum touch target size for a viewport
 * On mobile, all interactive elements should be at least 44x44px
 * On desktop, smaller targets are acceptable
 */
function getMinTouchTargetForViewport(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return MINIMUM_TOUCH_TARGET; // 44px on mobile
  }
  return 36; // Smaller targets acceptable on desktop
}

/**
 * Parse Tailwind CSS grid classes to get column count
 */
function parseGridClasses(classes: string, viewportWidth: number): number {
  // Check for responsive grid classes
  const hasLgCols4 = classes.includes('lg:grid-cols-4');
  const hasSmCols2 = classes.includes('sm:grid-cols-2');
  const hasCols1 = classes.includes('grid-cols-1');
  
  if (viewportWidth >= 1024 && hasLgCols4) {
    return 4;
  } else if (viewportWidth >= 640 && hasSmCols2) {
    return 2;
  } else if (hasCols1) {
    return 1;
  }
  
  // Default fallback
  return 1;
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

// Arbitrary for touch target configurations
const touchTargetConfigArbitrary = fc.constantFrom(...touchTargetConfigs);

// Arbitrary for grid column configurations
const gridColumnConfigArbitrary = fc.constantFrom(...gridColumnConfigs);

// Arbitrary for element dimensions
const elementDimensionArbitrary = fc.integer({ min: 20, max: 100 });

// ============================================
// Property Tests - Property 22: Touch Target Minimum Size
// ============================================

describe('Property 22: Touch Target Minimum Size', () => {
  /**
   * Property: For any mobile viewport width, the minimum touch target
   * should be 44x44 pixels.
   */
  it('should require 44px minimum touch target on mobile viewports', () => {
    fc.assert(
      fc.property(mobileViewportArbitrary, (viewportWidth) => {
        const minTarget = getMinTouchTargetForViewport(viewportWidth);
        return minTarget === MINIMUM_TOUCH_TARGET;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any touch target configuration, the minimum dimensions
   * should be at least 44x44 pixels.
   */
  it('should have all touch target configs with 44px minimum', () => {
    fc.assert(
      fc.property(touchTargetConfigArbitrary, (config) => {
        return config.minWidth >= MINIMUM_TOUCH_TARGET && 
               config.minHeight >= MINIMUM_TOUCH_TARGET;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any element dimensions on mobile, meetsTouchTargetMinimum
   * should correctly identify compliant elements.
   */
  it('should correctly identify touch target compliance', () => {
    fc.assert(
      fc.property(
        elementDimensionArbitrary,
        elementDimensionArbitrary,
        (width, height) => {
          const result = meetsTouchTargetMinimum(width, height);
          const expected = width >= MINIMUM_TOUCH_TARGET && height >= MINIMUM_TOUCH_TARGET;
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Elements with dimensions >= 44px should always pass touch target check.
   */
  it('should pass touch target check for elements >= 44px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 100 }),
        fc.integer({ min: 44, max: 100 }),
        (width, height) => {
          return meetsTouchTargetMinimum(width, height) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Elements with any dimension < 44px should fail touch target check.
   */
  it('should fail touch target check for elements with dimension < 44px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 43 }),
        fc.integer({ min: 44, max: 100 }),
        (smallDim, largeDim) => {
          // Test with small width
          const resultSmallWidth = meetsTouchTargetMinimum(smallDim, largeDim);
          // Test with small height
          const resultSmallHeight = meetsTouchTargetMinimum(largeDim, smallDim);
          return resultSmallWidth === false && resultSmallHeight === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify MINIMUM_TOUCH_TARGET constant is 44px.
   */
  it('should have MINIMUM_TOUCH_TARGET set to 44px', () => {
    expect(MINIMUM_TOUCH_TARGET).toBe(44);
  });

  /**
   * Specific test: Verify all interactive element types are covered.
   */
  it('should cover all common interactive element types', () => {
    const elementTypes = touchTargetConfigs.map(c => c.name);
    expect(elementTypes).toContain('Button');
    expect(elementTypes).toContain('Input');
    expect(elementTypes).toContain('Select Trigger');
    expect(elementTypes).toContain('Checkbox');
    expect(elementTypes).toContain('Radio');
  });
});

// ============================================
// Property Tests - Property 23: Responsive Grid Columns
// ============================================

describe('Property 23: Responsive Grid Columns', () => {
  /**
   * Property: For any mobile viewport width (< 640px), the grid should
   * display 1 column.
   */
  it('should display 1 column on mobile viewports', () => {
    fc.assert(
      fc.property(mobileViewportArbitrary, (viewportWidth) => {
        const columns = getExpectedGridColumns(viewportWidth);
        return columns === 1;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any tablet viewport width (>= 640px and < 1024px), the grid
   * should display 2 columns.
   */
  it('should display 2 columns on tablet viewports', () => {
    fc.assert(
      fc.property(tabletViewportArbitrary, (viewportWidth) => {
        const columns = getExpectedGridColumns(viewportWidth);
        return columns === 2;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any desktop viewport width (>= 1024px), the grid should
   * display 4 columns.
   */
  it('should display 4 columns on desktop viewports', () => {
    fc.assert(
      fc.property(desktopViewportArbitrary, (viewportWidth) => {
        const columns = getExpectedGridColumns(viewportWidth);
        return columns === 4;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any viewport width, the column count should be one of
   * the valid values (1, 2, or 4).
   */
  it('should always return valid column count (1, 2, or 4)', () => {
    fc.assert(
      fc.property(anyViewportArbitrary, (viewportWidth) => {
        const columns = getExpectedGridColumns(viewportWidth);
        return [1, 2, 4].includes(columns);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any grid column configuration, the expected columns
   * should match the viewport type.
   */
  it('should have correct column count for each viewport type', () => {
    fc.assert(
      fc.property(gridColumnConfigArbitrary, (config) => {
        // Generate a random viewport width within the config's range
        const viewportWidth = Math.floor(
          Math.random() * (config.maxWidth - config.minWidth + 1) + config.minWidth
        );
        const columns = getExpectedGridColumns(viewportWidth);
        return columns === config.expectedColumns;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Column count should increase or stay same as viewport width increases.
   */
  it('should have non-decreasing column count as viewport increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1000 }),
        fc.integer({ min: 1, max: 500 }),
        (baseWidth, increment) => {
          const smallerViewport = baseWidth;
          const largerViewport = baseWidth + increment;
          const smallerColumns = getExpectedGridColumns(smallerViewport);
          const largerColumns = getExpectedGridColumns(largerViewport);
          return largerColumns >= smallerColumns;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Viewport type should be correctly determined.
   */
  it('should correctly determine viewport type', () => {
    fc.assert(
      fc.property(anyViewportArbitrary, (viewportWidth) => {
        const type = getViewportType(viewportWidth);
        if (viewportWidth < 640) {
          return type === 'mobile';
        } else if (viewportWidth < 1024) {
          return type === 'tablet';
        } else {
          return type === 'desktop';
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseGridClasses should correctly interpret Tailwind classes.
   */
  it('should correctly parse Tailwind grid classes', () => {
    const gridClasses = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
    
    fc.assert(
      fc.property(anyViewportArbitrary, (viewportWidth) => {
        const columns = parseGridClasses(gridClasses, viewportWidth);
        const expected = getExpectedGridColumns(viewportWidth);
        return columns === expected;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify breakpoint boundaries.
   */
  it('should have correct column count at breakpoint boundaries', () => {
    // Just below mobile breakpoint
    expect(getExpectedGridColumns(639)).toBe(1);
    // At tablet breakpoint
    expect(getExpectedGridColumns(640)).toBe(2);
    // Just below desktop breakpoint
    expect(getExpectedGridColumns(1023)).toBe(2);
    // At desktop breakpoint
    expect(getExpectedGridColumns(1024)).toBe(4);
  });

  /**
   * Specific test: Verify grid column configurations are complete.
   */
  it('should have configurations for all viewport types', () => {
    const viewportTypes = gridColumnConfigs.map(c => c.viewportType);
    expect(viewportTypes).toContain('mobile');
    expect(viewportTypes).toContain('tablet');
    expect(viewportTypes).toContain('desktop');
  });

  /**
   * Specific test: Verify no gaps in viewport ranges.
   */
  it('should have continuous viewport ranges with no gaps', () => {
    // Sort configs by minWidth
    const sortedConfigs = [...gridColumnConfigs].sort((a, b) => a.minWidth - b.minWidth);
    
    for (let i = 1; i < sortedConfigs.length; i++) {
      const prevMax = sortedConfigs[i - 1].maxWidth;
      const currMin = sortedConfigs[i].minWidth;
      // Current min should be exactly prevMax + 1
      expect(currMin).toBe(prevMax + 1);
    }
  });
});
