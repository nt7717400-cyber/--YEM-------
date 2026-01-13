/**
 * Feature: web-ui-ux-enhancement
 * Property 17: Statistics Trend Indicators
 * 
 * For any metric with a change value, if the change is positive, an up arrow
 * should be displayed. If negative, a down arrow should be displayed.
 * If zero, a neutral indicator should be displayed.
 * 
 * Validates: Requirements 9.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getTrendDirection,
  getTrendIcon,
  getTrendColorClass,
  formatChangeValue,
  getValueColorClass,
} from '@/components/admin/StatsCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================
// Arbitraries
// ============================================

// Positive change values
const positiveChangeArb = fc.integer({ min: 1, max: 1000 });

// Negative change values
const negativeChangeArb = fc.integer({ min: -1000, max: -1 });

// Zero change
const zeroChangeArb = fc.constant(0);

// Any change value
const anyChangeArb = fc.integer({ min: -1000, max: 1000 });

// Decimal change values
const decimalChangeArb = fc.double({ min: -100, max: 100, noNaN: true });

// Variant types
const variantArb = fc.constantFrom('default', 'success', 'warning', 'danger', 'info') as fc.Arbitrary<'default' | 'success' | 'warning' | 'danger' | 'info'>;

// ============================================
// Property Tests
// ============================================

describe('Property 17: Statistics Trend Indicators', () => {
  describe('Trend Direction Detection', () => {
    it('should return "up" for all positive change values', () => {
      fc.assert(
        fc.property(positiveChangeArb, (change) => {
          const direction = getTrendDirection(change);
          expect(direction).toBe('up');
        }),
        { numRuns: 100 }
      );
    });

    it('should return "down" for all negative change values', () => {
      fc.assert(
        fc.property(negativeChangeArb, (change) => {
          const direction = getTrendDirection(change);
          expect(direction).toBe('down');
        }),
        { numRuns: 100 }
      );
    });

    it('should return "neutral" for zero change', () => {
      fc.assert(
        fc.property(zeroChangeArb, (change) => {
          const direction = getTrendDirection(change);
          expect(direction).toBe('neutral');
        }),
        { numRuns: 1 }
      );
    });

    it('should always return a valid direction for any change value', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getTrendDirection(change);
          expect(['up', 'down', 'neutral']).toContain(direction);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Trend Icon Selection', () => {
    it('should return TrendingUp icon for "up" direction', () => {
      const icon = getTrendIcon('up');
      expect(icon).toBe(TrendingUp);
    });

    it('should return TrendingDown icon for "down" direction', () => {
      const icon = getTrendIcon('down');
      expect(icon).toBe(TrendingDown);
    });

    it('should return Minus icon for "neutral" direction', () => {
      const icon = getTrendIcon('neutral');
      expect(icon).toBe(Minus);
    });

    it('should return correct icon for any change value', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getTrendDirection(change);
          const icon = getTrendIcon(direction);
          
          if (change > 0) {
            expect(icon).toBe(TrendingUp);
          } else if (change < 0) {
            expect(icon).toBe(TrendingDown);
          } else {
            expect(icon).toBe(Minus);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Trend Color Classes', () => {
    it('should return green color class for "up" direction', () => {
      const colorClass = getTrendColorClass('up');
      expect(colorClass).toContain('green');
    });

    it('should return red color class for "down" direction', () => {
      const colorClass = getTrendColorClass('down');
      expect(colorClass).toContain('red');
    });

    it('should return gray color class for "neutral" direction', () => {
      const colorClass = getTrendColorClass('neutral');
      expect(colorClass).toContain('gray');
    });

    it('should return appropriate color for any change value', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getTrendDirection(change);
          const colorClass = getTrendColorClass(direction);
          
          if (change > 0) {
            expect(colorClass).toContain('green');
          } else if (change < 0) {
            expect(colorClass).toContain('red');
          } else {
            expect(colorClass).toContain('gray');
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Change Value Formatting', () => {
    it('should format positive changes with + sign', () => {
      fc.assert(
        fc.property(positiveChangeArb, (change) => {
          const formatted = formatChangeValue(change);
          expect(formatted).toMatch(/^\+\d+%$/);
        }),
        { numRuns: 100 }
      );
    });

    it('should format negative changes with - sign', () => {
      fc.assert(
        fc.property(negativeChangeArb, (change) => {
          const formatted = formatChangeValue(change);
          expect(formatted).toMatch(/^-\d+%$/);
        }),
        { numRuns: 100 }
      );
    });

    it('should format zero change without sign', () => {
      const formatted = formatChangeValue(0);
      expect(formatted).toBe('0%');
    });

    it('should always include percentage symbol', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const formatted = formatChangeValue(change);
          expect(formatted).toContain('%');
        }),
        { numRuns: 100 }
      );
    });

    it('should use absolute value for the number', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const formatted = formatChangeValue(change);
          const numericPart = parseInt(formatted.replace(/[^0-9]/g, ''), 10);
          expect(numericPart).toBe(Math.abs(change));
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Value Color Classes by Variant', () => {
    it('should return correct color class for each variant', () => {
      fc.assert(
        fc.property(variantArb, (variant) => {
          const colorClass = getValueColorClass(variant);
          
          switch (variant) {
            case 'success':
              expect(colorClass).toContain('green');
              break;
            case 'warning':
              expect(colorClass).toContain('yellow');
              break;
            case 'danger':
              expect(colorClass).toContain('red');
              break;
            case 'info':
              expect(colorClass).toContain('blue');
              break;
            case 'default':
              expect(colorClass).toContain('foreground');
              break;
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Consistency Properties', () => {
    it('should maintain consistency between direction and icon', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getTrendDirection(change);
          const icon = getTrendIcon(direction);
          
          // Icon should match direction semantically
          if (direction === 'up') {
            expect(icon.displayName || icon.name).toContain('TrendingUp');
          } else if (direction === 'down') {
            expect(icon.displayName || icon.name).toContain('TrendingDown');
          } else {
            expect(icon.displayName || icon.name).toContain('Minus');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency between direction and color', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getTrendDirection(change);
          const colorClass = getTrendColorClass(direction);
          
          // Positive = green (good), Negative = red (bad), Neutral = gray
          if (direction === 'up') {
            expect(colorClass).not.toContain('red');
            expect(colorClass).not.toContain('gray');
          } else if (direction === 'down') {
            expect(colorClass).not.toContain('green');
            expect(colorClass).not.toContain('gray');
          } else {
            expect(colorClass).not.toContain('green');
            expect(colorClass).not.toContain('red');
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large positive numbers', () => {
      const largePositive = Number.MAX_SAFE_INTEGER;
      const direction = getTrendDirection(largePositive);
      expect(direction).toBe('up');
    });

    it('should handle very large negative numbers', () => {
      const largeNegative = Number.MIN_SAFE_INTEGER;
      const direction = getTrendDirection(largeNegative);
      expect(direction).toBe('down');
    });

    it('should handle decimal values correctly', () => {
      fc.assert(
        fc.property(decimalChangeArb, (change) => {
          const direction = getTrendDirection(change);
          
          if (change > 0) {
            expect(direction).toBe('up');
          } else if (change < 0) {
            expect(direction).toBe('down');
          } else {
            expect(direction).toBe('neutral');
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
