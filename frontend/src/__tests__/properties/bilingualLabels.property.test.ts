/**
 * Property 10: Bilingual Label Availability
 * *For any* Part_Key and any Color_Mapping condition, both Arabic (ar) and English (en)
 * labels SHALL be available and non-empty.
 *
 * **Validates: Requirements 5.4, 9.1, 9.5**
 *
 * Feature: interactive-image-inspection, Property 10: Bilingual Label Availability
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { PartKey, PartCondition, DamageSeverity, ViewAngle, CarTemplate } from '@/types/vds';
import {
  PART_LABELS,
  CONDITION_LABELS,
  SEVERITY_LABELS,
  VIEW_ANGLE_LABELS,
  CAR_TEMPLATE_LABELS,
  ALL_PART_KEYS,
  ALL_PART_CONDITIONS,
  ALL_DAMAGE_SEVERITIES,
  ALL_VIEW_ANGLES,
  ALL_CAR_TEMPLATES,
  getPartLabel,
  getConditionLabel,
  getSeverityLabel,
  getViewAngleLabel,
} from '@/constants/vds';

// Arbitraries for generating random values
const partKeyArbitrary = fc.constantFrom<PartKey>(...ALL_PART_KEYS);
const partConditionArbitrary = fc.constantFrom<PartCondition>(...ALL_PART_CONDITIONS);
const damageSeverityArbitrary = fc.constantFrom<DamageSeverity>(...ALL_DAMAGE_SEVERITIES);
const viewAngleArbitrary = fc.constantFrom<ViewAngle>(...ALL_VIEW_ANGLES);
const carTemplateArbitrary = fc.constantFrom<CarTemplate>(...ALL_CAR_TEMPLATES);
const languageArbitrary = fc.constantFrom<'ar' | 'en'>('ar', 'en');

describe('Property 10: Bilingual Label Availability', () => {
  /**
   * Property: For any Part_Key, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all part keys', () => {
    fc.assert(
      fc.property(partKeyArbitrary, (partKey) => {
        const labels = PART_LABELS[partKey];
        if (!labels) return false;
        return (
          typeof labels.ar === 'string' &&
          labels.ar.trim().length > 0 &&
          typeof labels.en === 'string' &&
          labels.en.trim().length > 0
        );
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: For any Part_Condition, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all part conditions', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const labels = CONDITION_LABELS[condition];
        if (!labels) return false;
        return (
          typeof labels.ar === 'string' &&
          labels.ar.trim().length > 0 &&
          typeof labels.en === 'string' &&
          labels.en.trim().length > 0
        );
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any DamageSeverity, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all damage severities', () => {
    fc.assert(
      fc.property(damageSeverityArbitrary, (severity) => {
        const labels = SEVERITY_LABELS[severity];
        if (!labels) return false;
        return (
          typeof labels.ar === 'string' &&
          labels.ar.trim().length > 0 &&
          typeof labels.en === 'string' &&
          labels.en.trim().length > 0
        );
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any ViewAngle, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all view angles', () => {
    fc.assert(
      fc.property(viewAngleArbitrary, (angle) => {
        const labels = VIEW_ANGLE_LABELS[angle];
        if (!labels) return false;
        return (
          typeof labels.ar === 'string' &&
          labels.ar.trim().length > 0 &&
          typeof labels.en === 'string' &&
          labels.en.trim().length > 0
        );
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any CarTemplate, both Arabic and English labels should exist and be non-empty.
   */
  it('should have non-empty Arabic and English labels for all car templates', () => {
    fc.assert(
      fc.property(carTemplateArbitrary, (template) => {
        const labels = CAR_TEMPLATE_LABELS[template];
        if (!labels) return false;
        return (
          typeof labels.ar === 'string' &&
          labels.ar.trim().length > 0 &&
          typeof labels.en === 'string' &&
          labels.en.trim().length > 0
        );
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: getPartLabel helper should return consistent labels for both languages.
   */
  it('should have getPartLabel return consistent labels with PART_LABELS', () => {
    fc.assert(
      fc.property(partKeyArbitrary, languageArbitrary, (partKey, language) => {
        const helperLabel = getPartLabel(partKey, language);
        const configLabel = PART_LABELS[partKey][language];
        return helperLabel === configLabel;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: getConditionLabel helper should return consistent labels with CONDITION_LABELS.
   */
  it('should have getConditionLabel return consistent labels with CONDITION_LABELS', () => {
    fc.assert(
      fc.property(partConditionArbitrary, languageArbitrary, (condition, language) => {
        const helperLabel = getConditionLabel(condition, language);
        const configLabel = CONDITION_LABELS[condition][language];
        return helperLabel === configLabel;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: getSeverityLabel helper should return consistent labels for both languages.
   */
  it('should have getSeverityLabel return consistent labels with SEVERITY_LABELS', () => {
    fc.assert(
      fc.property(damageSeverityArbitrary, languageArbitrary, (severity, language) => {
        const helperLabel = getSeverityLabel(severity, language);
        const configLabel = SEVERITY_LABELS[severity][language];
        return helperLabel === configLabel;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: getViewAngleLabel helper should return consistent labels for both languages.
   */
  it('should have getViewAngleLabel return consistent labels with VIEW_ANGLE_LABELS', () => {
    fc.assert(
      fc.property(viewAngleArbitrary, languageArbitrary, (angle, language) => {
        const helperLabel = getViewAngleLabel(angle, language);
        const configLabel = VIEW_ANGLE_LABELS[angle][language];
        return helperLabel === configLabel;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: All part keys should have unique English labels (no duplicates).
   */
  it('should have unique English labels for all part keys', () => {
    const englishLabels = ALL_PART_KEYS.map((key) => PART_LABELS[key].en);
    const uniqueLabels = new Set(englishLabels);
    expect(uniqueLabels.size).toBe(ALL_PART_KEYS.length);
  });

  /**
   * Property: All part keys should have unique Arabic labels (no duplicates).
   */
  it('should have unique Arabic labels for all part keys', () => {
    const arabicLabels = ALL_PART_KEYS.map((key) => PART_LABELS[key].ar);
    const uniqueLabels = new Set(arabicLabels);
    expect(uniqueLabels.size).toBe(ALL_PART_KEYS.length);
  });

  /**
   * Property: All part conditions should have unique English labels (no duplicates).
   */
  it('should have unique English labels for all part conditions', () => {
    const englishLabels = ALL_PART_CONDITIONS.map((condition) => CONDITION_LABELS[condition].en);
    const uniqueLabels = new Set(englishLabels);
    expect(uniqueLabels.size).toBe(ALL_PART_CONDITIONS.length);
  });

  /**
   * Property: All part conditions should have unique Arabic labels (no duplicates).
   */
  it('should have unique Arabic labels for all part conditions', () => {
    const arabicLabels = ALL_PART_CONDITIONS.map((condition) => CONDITION_LABELS[condition].ar);
    const uniqueLabels = new Set(arabicLabels);
    expect(uniqueLabels.size).toBe(ALL_PART_CONDITIONS.length);
  });

  /**
   * Property: Part key identifiers should be valid (lowercase, underscores only).
   */
  it('should have valid part key identifiers (lowercase, underscores only)', () => {
    fc.assert(
      fc.property(partKeyArbitrary, (partKey) => {
        const validPattern = /^[a-z_]+$/;
        return validPattern.test(partKey);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Arabic labels should contain Arabic characters.
   */
  it('should have Arabic labels containing Arabic characters for part keys', () => {
    fc.assert(
      fc.property(partKeyArbitrary, (partKey) => {
        const arabicLabel = PART_LABELS[partKey].ar;
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(arabicLabel);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Arabic labels should contain Arabic characters for conditions.
   */
  it('should have Arabic labels containing Arabic characters for conditions', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const arabicLabel = CONDITION_LABELS[condition].ar;
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(arabicLabel);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: English labels should contain only ASCII characters.
   */
  it('should have English labels containing only ASCII characters for part keys', () => {
    fc.assert(
      fc.property(partKeyArbitrary, (partKey) => {
        const englishLabel = PART_LABELS[partKey].en;
        const asciiPattern = /^[\x20-\x7E]+$/;
        return asciiPattern.test(englishLabel);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: English labels should contain only ASCII characters for conditions.
   */
  it('should have English labels containing only ASCII characters for conditions', () => {
    fc.assert(
      fc.property(partConditionArbitrary, (condition) => {
        const englishLabel = CONDITION_LABELS[condition].en;
        const asciiPattern = /^[\x20-\x7E]+$/;
        return asciiPattern.test(englishLabel);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: PART_LABELS should have entries for all defined part keys.
   */
  it('should have PART_LABELS entries for all defined part keys', () => {
    ALL_PART_KEYS.forEach((partKey) => {
      expect(PART_LABELS[partKey]).toBeDefined();
      expect(PART_LABELS[partKey].ar).toBeDefined();
      expect(PART_LABELS[partKey].en).toBeDefined();
    });
  });

  /**
   * Property: CONDITION_LABELS should have entries for all defined conditions.
   */
  it('should have CONDITION_LABELS entries for all defined conditions', () => {
    ALL_PART_CONDITIONS.forEach((condition) => {
      expect(CONDITION_LABELS[condition]).toBeDefined();
      expect(CONDITION_LABELS[condition].ar).toBeDefined();
      expect(CONDITION_LABELS[condition].en).toBeDefined();
    });
  });
});
