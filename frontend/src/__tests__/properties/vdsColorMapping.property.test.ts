/**
 * Property 3: Color Mapping Consistency
 * *For any* Part_Condition value, the Color_Mapping SHALL return a valid hex color,
 * and applying that condition to a Part_Region SHALL result in the region being
 * rendered with that exact color.
 *
 * **Validates: Requirements 2.4, 3.2, 4.1**
 *
 * Feature: interactive-image-inspection, Property 3: Color Mapping Consistency
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { PartCondition, PartKey } from '@/types/vds';
import {
  COLOR_BY_CONDITION,
  DEFAULT_COLOR_MAPPINGS,
  ALL_PART_CONDITIONS,
  ALL_PART_KEYS,
  getConditionColor,
  getConditionLabel,
  CONDITION_LABELS,
} from '@/constants/vds';

// Arbitrary for generating random PartCondition values
const partConditionArbitrary = fc.constantFrom<PartCondition>(...ALL_PART_CONDITIONS);

// Arbitrary for generating random PartKey values
const partKeyArbitrary = fc.constantFrom<PartKey>(...ALL_PART_KEYS);

// Expected color mapping as per Requirements 4.1
const EXPECTED_COLORS: Record<PartCondition, string> = {
  good: '#22c55e',         // Green - سليم
  scratch: '#eab308',      // Yellow - خدش
  bodywork: '#f97316',     // Orange - سمكرة
  broken: '#ef4444',       // Red - كسر
  painted: '#3b82f6',      // Blue - رش
  replaced: '#8b5cf6',     // Purple - تغيير
  not_inspected: '#9ca3af', // Gray - غير محدد
};

describe('Property 3: VDS Color Mapping Consistency', () => {
  /**
   * Property: For any part condition, COLOR_BY_CONDITION should return
   * the expected color defined in requirements 4.1.
   */
  it('should map each part condition to its correct predefined color', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const mappedColor = COLOR_BY_CONDITION[condition];
        const expectedColor = EXPECTED_COLORS[condition];
        return mappedColor === expectedColor;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any part condition, getConditionColor helper should return
   * the same color as COLOR_BY_CONDITION.
   */
  it('should have getConditionColor return consistent color with COLOR_BY_CONDITION', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const helperColor = getConditionColor(condition);
        const configColor = COLOR_BY_CONDITION[condition];
        return helperColor === configColor;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any part condition, the color should be a valid hex color code.
   */
  it('should have all colors as valid hex color codes (#RRGGBB format)', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const color = getConditionColor(condition);
        // Valid hex color pattern: #RRGGBB
        const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
        return hexColorPattern.test(color);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any part key and condition combination, the color mapping
   * should be deterministic (same condition always produces same color).
   */
  it('should produce deterministic color for any part key and condition combination', () => {
    fc.assert(
      fc.property(partKeyArbitrary, partConditionArbitrary, (partKey, condition) => {
        // Color should only depend on condition, not on partKey
        const color1 = getConditionColor(condition);
        const color2 = getConditionColor(condition);
        return color1 === color2;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: DEFAULT_COLOR_MAPPINGS should contain entries for all conditions
   * with matching colors.
   */
  it('should have DEFAULT_COLOR_MAPPINGS contain all conditions with correct colors', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const mapping = DEFAULT_COLOR_MAPPINGS.find((m) => m.condition === condition);
        if (!mapping) return false;
        return mapping.colorHex === EXPECTED_COLORS[condition];
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All 7 conditions should have unique colors (distinguishable).
   */
  it('should have unique colors for all conditions (distinguishable)', () => {
    const colors = ALL_PART_CONDITIONS.map((condition) => COLOR_BY_CONDITION[condition]);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(ALL_PART_CONDITIONS.length);
  });

  /**
   * Property: COLOR_BY_CONDITION should have exactly 7 conditions defined.
   */
  it('should have exactly 7 part conditions defined', () => {
    expect(Object.keys(COLOR_BY_CONDITION).length).toBe(7);
    expect(ALL_PART_CONDITIONS.length).toBe(7);
  });

  /**
   * Property: For any condition, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all conditions', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const labels = CONDITION_LABELS[condition];
        return labels.ar.length > 0 && labels.en.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getConditionLabel should return consistent labels with CONDITION_LABELS.
   */
  it('should have getConditionLabel return consistent labels with CONDITION_LABELS', () => {
    fc.assert(
      fc.property(
        partConditionArbitrary,
        fc.constantFrom<'ar' | 'en'>('ar', 'en'),
        (condition, language) => {
          const helperLabel = getConditionLabel(condition, language);
          const configLabel = CONDITION_LABELS[condition][language];
          return helperLabel === configLabel;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: DEFAULT_COLOR_MAPPINGS should have matching labels with CONDITION_LABELS.
   */
  it('should have DEFAULT_COLOR_MAPPINGS labels match CONDITION_LABELS', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const mapping = DEFAULT_COLOR_MAPPINGS.find((m) => m.condition === condition);
        if (!mapping) return false;
        const labels = CONDITION_LABELS[condition];
        return mapping.labelAr === labels.ar && mapping.labelEn === labels.en;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Color mapping should be idempotent - applying the same condition
   * multiple times should always yield the same color.
   */
  it('should be idempotent - same condition always yields same color', () => {
    fc.assert(
      fc.property(
        partConditionArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (condition, iterations) => {
          const colors: string[] = [];
          for (let i = 0; i < iterations; i++) {
            colors.push(getConditionColor(condition));
          }
          return colors.every((c) => c === colors[0]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
