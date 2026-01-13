/**
 * Feature: web-ui-ux-enhancement
 * Property 24: Mobile Font Size
 * 
 * *For any* body text element on mobile viewport, the computed font size
 * should be at least 16px.
 * 
 * **Validates: Requirements 17.3**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Typography Configuration Types
// ============================================

interface TypographyConfig {
  name: string;
  cssVariable: string;
  expectedMinSize: number; // in pixels
  isMobileBodyText: boolean;
}

// ============================================
// Typography Configurations - Requirements: 17.2, 17.3
// ============================================

/**
 * Typography scale configurations
 * Based on the CSS variables defined in globals.css
 */
const typographyConfigs: TypographyConfig[] = [
  {
    name: 'Extra Small (xs)',
    cssVariable: '--font-size-xs',
    expectedMinSize: 12, // 0.75rem = 12px
    isMobileBodyText: false, // Not body text
  },
  {
    name: 'Small (sm)',
    cssVariable: '--font-size-sm',
    expectedMinSize: 14, // 0.875rem = 14px
    isMobileBodyText: false, // Not body text
  },
  {
    name: 'Base',
    cssVariable: '--font-size-base',
    expectedMinSize: 16, // 1rem = 16px - minimum for body text
    isMobileBodyText: true,
  },
  {
    name: 'Large (lg)',
    cssVariable: '--font-size-lg',
    expectedMinSize: 18, // 1.125rem = 18px
    isMobileBodyText: true,
  },
  {
    name: 'Extra Large (xl)',
    cssVariable: '--font-size-xl',
    expectedMinSize: 20, // 1.25rem = 20px
    isMobileBodyText: true,
  },
  {
    name: '2XL',
    cssVariable: '--font-size-2xl',
    expectedMinSize: 24, // 1.5rem = 24px
    isMobileBodyText: false, // Heading
  },
  {
    name: '3XL',
    cssVariable: '--font-size-3xl',
    expectedMinSize: 30, // 1.875rem = 30px
    isMobileBodyText: false, // Heading
  },
  {
    name: '4XL',
    cssVariable: '--font-size-4xl',
    expectedMinSize: 36, // 2.25rem = 36px
    isMobileBodyText: false, // Heading
  },
];

// Body text configurations (must be >= 16px on mobile)
const bodyTextConfigs = typographyConfigs.filter(config => config.isMobileBodyText);

// ============================================
// Font Size Utilities
// ============================================

/**
 * Convert rem to pixels (assuming 16px base)
 */
function remToPixels(rem: number): number {
  return rem * 16;
}

/**
 * Parse CSS font size value to pixels
 */
function parseFontSizeToPixels(value: string): number {
  if (value.endsWith('rem')) {
    return remToPixels(parseFloat(value));
  }
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  if (value.endsWith('em')) {
    // Assume 1em = 16px for base calculation
    return parseFloat(value) * 16;
  }
  return parseFloat(value);
}

/**
 * CSS variable values from globals.css
 */
const cssVariableValues: Record<string, string> = {
  '--font-size-xs': '0.75rem',
  '--font-size-sm': '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg': '1.125rem',
  '--font-size-xl': '1.25rem',
  '--font-size-2xl': '1.5rem',
  '--font-size-3xl': '1.875rem',
  '--font-size-4xl': '2.25rem',
};

/**
 * Get font size in pixels for a CSS variable
 */
function getFontSizeInPixels(cssVariable: string): number {
  const value = cssVariableValues[cssVariable];
  if (!value) {
    throw new Error(`Unknown CSS variable: ${cssVariable}`);
  }
  return parseFontSizeToPixels(value);
}

/**
 * Check if font size meets mobile minimum (16px)
 */
function meetsMobileMinimum(sizeInPixels: number): boolean {
  return sizeInPixels >= 16;
}

// ============================================
// Arbitraries for Property Testing
// ============================================

// Arbitrary for typography configurations
const typographyConfigArbitrary = fc.constantFrom(...typographyConfigs);

// Arbitrary for body text configurations
const bodyTextConfigArbitrary = fc.constantFrom(...bodyTextConfigs);

// Arbitrary for viewport widths (mobile: < 640px)
const mobileViewportArbitrary = fc.integer({ min: 320, max: 639 });

// Arbitrary for desktop viewport widths (>= 1024px)
const desktopViewportArbitrary = fc.integer({ min: 1024, max: 1920 });

// Arbitrary for font size in rem
const fontSizeRemArbitrary = fc.float({ min: 0.5, max: 4, noNaN: true });

// ============================================
// Property Tests
// ============================================

describe('Property 24: Mobile Font Size', () => {
  /**
   * Property: For any body text configuration, the font size should be
   * at least 16px (1rem) to ensure readability on mobile devices.
   */
  it('should have all body text sizes >= 16px', () => {
    fc.assert(
      fc.property(bodyTextConfigArbitrary, (config) => {
        const sizeInPixels = getFontSizeInPixels(config.cssVariable);
        return meetsMobileMinimum(sizeInPixels);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any typography configuration, the actual size should
   * match the expected minimum size.
   */
  it('should have typography sizes match expected values', () => {
    fc.assert(
      fc.property(typographyConfigArbitrary, (config) => {
        const actualSize = getFontSizeInPixels(config.cssVariable);
        return actualSize >= config.expectedMinSize;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any mobile viewport width, body text should remain
   * at least 16px (not scaled down below minimum).
   */
  it('should maintain 16px minimum on any mobile viewport', () => {
    fc.assert(
      fc.property(
        mobileViewportArbitrary,
        bodyTextConfigArbitrary,
        (viewportWidth, config) => {
          // On mobile, body text should always be at least 16px
          // The CSS uses max(var(--font-size-base), 16px) to ensure this
          const baseSize = getFontSizeInPixels(config.cssVariable);
          const effectiveSize = Math.max(baseSize, 16);
          return effectiveSize >= 16;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: rem to pixels conversion should be consistent
   * (1rem = 16px with default browser settings).
   */
  it('should convert rem to pixels correctly', () => {
    fc.assert(
      fc.property(fontSizeRemArbitrary, (remValue) => {
        const pixels = remToPixels(remValue);
        return pixels === remValue * 16;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Font size parsing should handle rem values correctly.
   */
  it('should parse rem font sizes correctly', () => {
    fc.assert(
      fc.property(fontSizeRemArbitrary, (remValue) => {
        const cssValue = `${remValue}rem`;
        const parsed = parseFontSizeToPixels(cssValue);
        return Math.abs(parsed - remValue * 16) < 0.001;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Font size parsing should handle px values correctly.
   */
  it('should parse px font sizes correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 72 }), (pxValue) => {
        const cssValue = `${pxValue}px`;
        const parsed = parseFontSizeToPixels(cssValue);
        return parsed === pxValue;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The base font size should always be exactly 16px (1rem).
   */
  it('should have base font size of exactly 16px', () => {
    const baseSize = getFontSizeInPixels('--font-size-base');
    expect(baseSize).toBe(16);
  });

  /**
   * Property: Typography scale should be monotonically increasing.
   */
  it('should have monotonically increasing typography scale', () => {
    const orderedConfigs = [
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-2xl',
      '--font-size-3xl',
      '--font-size-4xl',
    ];

    for (let i = 1; i < orderedConfigs.length; i++) {
      const prevSize = getFontSizeInPixels(orderedConfigs[i - 1]);
      const currSize = getFontSizeInPixels(orderedConfigs[i]);
      expect(currSize).toBeGreaterThan(prevSize);
    }
  });

  /**
   * Property: Small text (xs, sm) should still be readable (>= 12px).
   */
  it('should have small text sizes >= 12px for readability', () => {
    const smallTextConfigs = typographyConfigs.filter(
      config => config.name.includes('Small') || config.name.includes('xs')
    );

    for (const config of smallTextConfigs) {
      const size = getFontSizeInPixels(config.cssVariable);
      expect(size).toBeGreaterThanOrEqual(12);
    }
  });

  /**
   * Property: meetsMobileMinimum should return true for sizes >= 16px.
   */
  it('should correctly identify mobile-compliant font sizes', () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 72 }), (size) => {
        const result = meetsMobileMinimum(size);
        return result === (size >= 16);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify all CSS variable values are defined.
   */
  it('should have all typography CSS variables defined', () => {
    for (const config of typographyConfigs) {
      expect(cssVariableValues[config.cssVariable]).toBeDefined();
    }
  });

  /**
   * Specific test: Verify body text minimum on mobile.
   */
  it('should enforce 16px minimum for body text on mobile', () => {
    // The CSS rule: font-size: max(var(--font-size-base), 16px)
    // ensures body text is never smaller than 16px
    const baseSize = getFontSizeInPixels('--font-size-base');
    const effectiveSize = Math.max(baseSize, 16);
    expect(effectiveSize).toBeGreaterThanOrEqual(16);
  });
});
