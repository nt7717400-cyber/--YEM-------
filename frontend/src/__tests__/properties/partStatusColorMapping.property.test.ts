/**
 * Property 4: Part status to color mapping
 * *For any* body part and status combination, the displayed color SHALL match
 * the predefined color in PART_STATUS_CONFIG for that status.
 * 
 * **Validates: Requirements 2.6, 4.3, 4.4**
 * 
 * Feature: car-inspection-3d, Property 4: Part status to color mapping
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { PartStatus, BodyPartId } from '@/types/inspection';
import {
  PART_STATUS_CONFIG,
  ALL_PART_STATUSES,
  ALL_BODY_PART_IDS,
  getPartStatusColor,
  getPartStatusLabel,
  getPartStatusIcon,
} from '@/constants/inspection';

// Arbitrary for generating random PartStatus values
const partStatusArbitrary = fc.constantFrom<PartStatus>(...ALL_PART_STATUSES);

// Arbitrary for generating random BodyPartId values
const bodyPartIdArbitrary = fc.constantFrom<BodyPartId>(...ALL_BODY_PART_IDS);

// Expected color mapping as per Requirements 4.4
const EXPECTED_COLORS: Record<PartStatus, string> = {
  original: '#22c55e',   // أخضر - سليم
  painted: '#eab308',    // أصفر - رش
  bodywork: '#f97316',   // برتقالي - سمكرة + رش
  accident: '#ef4444',   // أحمر - حادث
  replaced: '#3b82f6',   // أزرق - تم التغيير
  needs_check: '#6b7280', // رمادي - يحتاج فحص
};

describe('Property 4: Part status to color mapping', () => {
  /**
   * Property: For any part status, the color returned by PART_STATUS_CONFIG
   * should match the expected color defined in requirements.
   */
  it('should map each part status to its correct predefined color', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const configColor = PART_STATUS_CONFIG[status].color;
        const expectedColor = EXPECTED_COLORS[status];
        return configColor === expectedColor;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: For any part status, getPartStatusColor helper should return
   * the same color as PART_STATUS_CONFIG.
   */
  it('should have getPartStatusColor return consistent color with config', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const helperColor = getPartStatusColor(status);
        const configColor = PART_STATUS_CONFIG[status].color;
        return helperColor === configColor;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: For any body part and status combination, the color mapping
   * should be deterministic (same status always produces same color).
   */
  it('should produce deterministic color for any body part and status combination', () => {
    fc.assert(
      fc.property(bodyPartIdArbitrary, partStatusArbitrary, (partId, status) => {
        // Color should only depend on status, not on partId
        const color1 = getPartStatusColor(status);
        const color2 = getPartStatusColor(status);
        return color1 === color2;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All colors in PART_STATUS_CONFIG should be valid hex colors.
   */
  it('should have all colors as valid hex color codes', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const color = PART_STATUS_CONFIG[status].color;
        // Valid hex color pattern: #RRGGBB
        const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
        return hexColorPattern.test(color);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Each status should have a non-empty label.
   */
  it('should have non-empty labels for all statuses', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const label = PART_STATUS_CONFIG[status].label;
        return label.length > 0;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: getPartStatusLabel should return consistent label with config.
   */
  it('should have getPartStatusLabel return consistent label with config', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const helperLabel = getPartStatusLabel(status);
        const configLabel = PART_STATUS_CONFIG[status].label;
        return helperLabel === configLabel;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Each status should have a non-empty icon.
   */
  it('should have non-empty icons for all statuses', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const icon = PART_STATUS_CONFIG[status].icon;
        return icon.length > 0;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: getPartStatusIcon should return consistent icon with config.
   */
  it('should have getPartStatusIcon return consistent icon with config', () => {
    fc.assert(
      fc.property(partStatusArbitrary, (status) => {
        const helperIcon = getPartStatusIcon(status);
        const configIcon = PART_STATUS_CONFIG[status].icon;
        return helperIcon === configIcon;
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: All 6 statuses should have unique colors (distinguishable).
   */
  it('should have unique colors for all statuses (distinguishable)', () => {
    const colors = ALL_PART_STATUSES.map((status) => PART_STATUS_CONFIG[status].color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(ALL_PART_STATUSES.length);
  });

  /**
   * Property: PART_STATUS_CONFIG should have exactly 6 statuses.
   */
  it('should have exactly 6 part statuses defined', () => {
    expect(Object.keys(PART_STATUS_CONFIG).length).toBe(6);
    expect(ALL_PART_STATUSES.length).toBe(6);
  });
});
