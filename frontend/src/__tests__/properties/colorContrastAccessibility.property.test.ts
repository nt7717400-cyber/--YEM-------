/**
 * Feature: web-ui-ux-enhancement
 * Property 27: Color Contrast Accessibility
 * 
 * *For any* text element and its background, the color contrast ratio should
 * meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
 * 
 * **Validates: Requirements 16.3**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  colorContrastValues,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  hslToRelativeLuminance,
} from '@/lib/theme';

// ============================================
// Color Pair Types
// ============================================

type ThemeMode = 'light' | 'dark';

interface ColorPair {
  name: string;
  foreground: { h: number; s: number; l: number };
  background: { h: number; s: number; l: number };
  isLargeText?: boolean;
}

// ============================================
// Color Pairs to Test - Requirements: 16.3
// ============================================

const getColorPairs = (mode: ThemeMode): ColorPair[] => {
  const colors = colorContrastValues[mode];
  
  return [
    // Primary on background
    {
      name: `${mode}: Primary foreground on Primary`,
      foreground: colors.primaryForeground,
      background: colors.primary,
    },
    // Success on background
    {
      name: `${mode}: Success foreground on Success`,
      foreground: colors.successForeground,
      background: colors.success,
    },
    // Warning on background
    {
      name: `${mode}: Warning foreground on Warning`,
      foreground: colors.warningForeground,
      background: colors.warning,
    },
    // Info on background
    {
      name: `${mode}: Info foreground on Info`,
      foreground: colors.infoForeground,
      background: colors.info,
    },
    // Destructive on background
    {
      name: `${mode}: Destructive foreground on Destructive`,
      foreground: colors.destructiveForeground,
      background: colors.destructive,
    },
    // Foreground on background (main text)
    {
      name: `${mode}: Foreground on Background`,
      foreground: colors.foreground,
      background: colors.background,
    },
  ];
};

// All color pairs for both themes
const allColorPairs: ColorPair[] = [
  ...getColorPairs('light'),
  ...getColorPairs('dark'),
];

// Arbitrary for generating color pairs
const colorPairArbitrary = fc.constantFrom(...allColorPairs);

// Arbitrary for generating theme modes
const themeModeArbitrary = fc.constantFrom<ThemeMode>('light', 'dark');

// ============================================
// Property Tests
// ============================================

describe('Property 27: Color Contrast Accessibility', () => {
  /**
   * Property: For any semantic color pair (foreground/background),
   * the contrast ratio should meet WCAG AA standard (4.5:1 for normal text).
   */
  it('should have all color pairs meet WCAG AA contrast ratio (4.5:1)', () => {
    fc.assert(
      fc.property(colorPairArbitrary, (pair) => {
        const ratio = calculateContrastRatio(pair.foreground, pair.background);
        const passes = meetsWCAGAA(ratio, pair.isLargeText ?? false);
        
        if (!passes) {
          console.log(`Failed: ${pair.name} - Ratio: ${ratio.toFixed(2)}`);
        }
        
        return passes;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any theme mode, the main text (foreground on background)
   * should have excellent contrast (>7:1 for AAA).
   */
  it('should have main text meet WCAG AAA contrast ratio (7:1)', () => {
    fc.assert(
      fc.property(themeModeArbitrary, (mode) => {
        const colors = colorContrastValues[mode];
        const ratio = calculateContrastRatio(colors.foreground, colors.background);
        return meetsWCAGAAA(ratio, false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Contrast ratio calculation should be symmetric
   * (swapping foreground and background should give same ratio).
   */
  it('should have symmetric contrast ratio calculation', () => {
    fc.assert(
      fc.property(colorPairArbitrary, (pair) => {
        const ratio1 = calculateContrastRatio(pair.foreground, pair.background);
        const ratio2 = calculateContrastRatio(pair.background, pair.foreground);
        // Allow small floating point differences
        return Math.abs(ratio1 - ratio2) < 0.001;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Contrast ratio should always be >= 1
   * (minimum ratio when colors are identical).
   */
  it('should have contrast ratio always >= 1', () => {
    fc.assert(
      fc.property(colorPairArbitrary, (pair) => {
        const ratio = calculateContrastRatio(pair.foreground, pair.background);
        return ratio >= 1;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Contrast ratio should be <= 21
   * (maximum ratio for black on white or vice versa).
   */
  it('should have contrast ratio always <= 21', () => {
    fc.assert(
      fc.property(colorPairArbitrary, (pair) => {
        const ratio = calculateContrastRatio(pair.foreground, pair.background);
        return ratio <= 21;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Relative luminance should be between 0 and 1.
   */
  it('should have relative luminance between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 360 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (h, s, l) => {
          const luminance = hslToRelativeLuminance(h, s, l);
          return luminance >= 0 && luminance <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pure white should have luminance close to 1.
   */
  it('should have pure white with luminance close to 1', () => {
    const whiteLuminance = hslToRelativeLuminance(0, 0, 100);
    expect(whiteLuminance).toBeCloseTo(1, 2);
  });

  /**
   * Property: Pure black should have luminance close to 0.
   */
  it('should have pure black with luminance close to 0', () => {
    const blackLuminance = hslToRelativeLuminance(0, 0, 0);
    expect(blackLuminance).toBeCloseTo(0, 2);
  });

  /**
   * Property: Black on white should have maximum contrast ratio (~21:1).
   */
  it('should have black on white with maximum contrast ratio', () => {
    const black = { h: 0, s: 0, l: 0 };
    const white = { h: 0, s: 0, l: 100 };
    const ratio = calculateContrastRatio(black, white);
    expect(ratio).toBeCloseTo(21, 0);
  });

  /**
   * Property: Same color should have contrast ratio of 1.
   */
  it('should have same color with contrast ratio of 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 360 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (h, s, l) => {
          const color = { h, s, l };
          const ratio = calculateContrastRatio(color, color);
          return Math.abs(ratio - 1) < 0.001;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: meetsWCAGAA should return true for ratios >= 4.5 (normal text).
   */
  it('should correctly identify WCAG AA compliance for normal text', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 21 }), (ratio) => {
        const passes = meetsWCAGAA(ratio, false);
        return passes === (ratio >= 4.5);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: meetsWCAGAA should return true for ratios >= 3 (large text).
   */
  it('should correctly identify WCAG AA compliance for large text', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 21 }), (ratio) => {
        const passes = meetsWCAGAA(ratio, true);
        return passes === (ratio >= 3);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: meetsWCAGAAA should return true for ratios >= 7 (normal text).
   */
  it('should correctly identify WCAG AAA compliance for normal text', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 21 }), (ratio) => {
        const passes = meetsWCAGAAA(ratio, false);
        return passes === (ratio >= 7);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: meetsWCAGAAA should return true for ratios >= 4.5 (large text).
   */
  it('should correctly identify WCAG AAA compliance for large text', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 21 }), (ratio) => {
        const passes = meetsWCAGAAA(ratio, true);
        return passes === (ratio >= 4.5);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify all defined semantic colors meet WCAG AA.
   */
  it('should have all semantic colors meet WCAG AA in light mode', () => {
    const lightPairs = getColorPairs('light');
    
    for (const pair of lightPairs) {
      const ratio = calculateContrastRatio(pair.foreground, pair.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  /**
   * Specific test: Verify all defined semantic colors meet WCAG AA in dark mode.
   */
  it('should have all semantic colors meet WCAG AA in dark mode', () => {
    const darkPairs = getColorPairs('dark');
    
    for (const pair of darkPairs) {
      const ratio = calculateContrastRatio(pair.foreground, pair.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
