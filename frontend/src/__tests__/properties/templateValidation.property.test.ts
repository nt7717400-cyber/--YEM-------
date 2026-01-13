/**
 * Property 9: Template CRUD Validation
 * *For any* new Car_Template creation, the system SHALL validate that:
 * - name (ar/en) is provided
 * - type is valid enum
 * - at least front/rear/left_side/right_side SVG content is provided
 *
 * **Validates: Requirements 14.1, 14.2**
 *
 * Feature: interactive-image-inspection, Property 9: Template CRUD Validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { CarTemplate, ViewAngle } from '@/types/vds';
import { ALL_CAR_TEMPLATES, ALL_VIEW_ANGLES } from '@/constants/vds';

// Valid template types as per Requirements 6.1
const VALID_TEMPLATE_TYPES: CarTemplate[] = ALL_CAR_TEMPLATES;

// Required SVG view angles for template creation (Requirements 14.1)
const REQUIRED_SVG_VIEWS: ViewAngle[] = ['front', 'rear', 'left_side', 'right_side'];

// Arbitrary for generating valid template types
const validTemplateTypeArbitrary = fc.constantFrom<CarTemplate>(...VALID_TEMPLATE_TYPES);

// Arbitrary for generating invalid template types
const invalidTemplateTypeArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter((s) => !VALID_TEMPLATE_TYPES.includes(s as CarTemplate));

// Arabic characters for name generation
const ARABIC_CHARS = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي ';

// Arbitrary for generating non-empty Arabic names
const arabicNameArbitrary = fc.array(
  fc.constantFrom(...ARABIC_CHARS.split('')),
  { minLength: 2, maxLength: 50 }
).map((chars) => chars.join(''))
  .filter((s) => s.trim().length > 0);

// Arbitrary for generating non-empty English names
const englishNameArbitrary = fc.array(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
  { minLength: 2, maxLength: 50 }
).map((chars) => chars.join(''))
  .filter((s) => s.trim().length > 0);

// Arbitrary for generating valid SVG content
const validSvgContentArbitrary = fc.record({
  width: fc.integer({ min: 100, max: 1000 }),
  height: fc.integer({ min: 100, max: 1000 }),
  content: fc.string({ minLength: 10, maxLength: 100 }),
}).map(({ width, height, content }) => 
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path id="test_part" d="M0 0 L${width} ${height}"/>${content}</svg>`
);

// Arbitrary for generating invalid SVG content (missing <svg tag)
const invalidSvgContentArbitrary = fc.string({ minLength: 5, maxLength: 100 })
  .filter((s) => !s.includes('<svg'));

// Interface for template creation input
interface TemplateCreateInput {
  nameAr?: string;
  nameEn?: string;
  type?: string;
  svgFront?: string;
  svgRear?: string;
  svgLeftSide?: string;
  svgRightSide?: string;
  svgTop?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Template validation function that mirrors the backend validation logic
 * from TemplatesController.php validateTemplateData()
 */
function validateTemplateCreate(data: TemplateCreateInput): ValidationResult {
  const errors: Record<string, string> = {};

  // Required fields for creation (Requirements 14.1)
  if (!data.nameAr || data.nameAr.trim() === '') {
    errors['nameAr'] = 'الاسم بالعربية مطلوب';
  }
  if (!data.nameEn || data.nameEn.trim() === '') {
    errors['nameEn'] = 'الاسم بالإنجليزية مطلوب';
  }
  if (!data.type || data.type.trim() === '') {
    errors['type'] = 'نوع القالب مطلوب';
  }
  if (!data.svgFront || data.svgFront.trim() === '') {
    errors['svgFront'] = 'SVG الواجهة الأمامية مطلوب';
  }
  if (!data.svgRear || data.svgRear.trim() === '') {
    errors['svgRear'] = 'SVG الواجهة الخلفية مطلوب';
  }
  if (!data.svgLeftSide || data.svgLeftSide.trim() === '') {
    errors['svgLeftSide'] = 'SVG الجانب الأيسر مطلوب';
  }
  if (!data.svgRightSide || data.svgRightSide.trim() === '') {
    errors['svgRightSide'] = 'SVG الجانب الأيمن مطلوب';
  }

  // Validate type if provided (Requirements 14.1)
  if (data.type && !VALID_TEMPLATE_TYPES.includes(data.type as CarTemplate)) {
    errors['type'] = 'نوع القالب غير صالح';
  }

  // Validate SVG content (Requirements 14.2)
  const svgFields: (keyof TemplateCreateInput)[] = ['svgFront', 'svgRear', 'svgLeftSide', 'svgRightSide', 'svgTop'];
  for (const field of svgFields) {
    const value = data[field];
    if (value && typeof value === 'string' && value.trim() !== '') {
      if (!value.includes('<svg')) {
        errors[field] = 'محتوى SVG غير صالح';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Template validation function for updates (partial data allowed)
 */
function validateTemplateUpdate(data: TemplateCreateInput): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate type if provided
  if (data.type !== undefined && data.type !== null) {
    if (!VALID_TEMPLATE_TYPES.includes(data.type as CarTemplate)) {
      errors['type'] = 'نوع القالب غير صالح';
    }
  }

  // Validate SVG content if provided
  const svgFields: (keyof TemplateCreateInput)[] = ['svgFront', 'svgRear', 'svgLeftSide', 'svgRightSide', 'svgTop'];
  for (const field of svgFields) {
    const value = data[field];
    if (value && typeof value === 'string' && value.trim() !== '') {
      if (!value.includes('<svg')) {
        errors[field] = 'محتوى SVG غير صالح';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Arbitrary for generating valid complete template input
const validTemplateInputArbitrary = fc.record({
  nameAr: arabicNameArbitrary,
  nameEn: englishNameArbitrary,
  type: validTemplateTypeArbitrary,
  svgFront: validSvgContentArbitrary,
  svgRear: validSvgContentArbitrary,
  svgLeftSide: validSvgContentArbitrary,
  svgRightSide: validSvgContentArbitrary,
  svgTop: fc.option(validSvgContentArbitrary, { nil: undefined }),
  isActive: fc.boolean(),
  isDefault: fc.boolean(),
});

describe('Property 9: Template CRUD Validation', () => {
  /**
   * Property: For any valid template input with all required fields,
   * validation should pass.
   */
  it('should pass validation for any complete valid template input', () => {
    fc.assert(
      fc.property(validTemplateInputArbitrary, (input) => {
        const result = validateTemplateCreate(input);
        return result.isValid === true && Object.keys(result.errors).length === 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing nameAr,
   * validation should fail with nameAr error.
   */
  it('should fail validation when nameAr is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, nameAr: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'nameAr' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing nameEn,
   * validation should fail with nameEn error.
   */
  it('should fail validation when nameEn is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, nameEn: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'nameEn' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing type,
   * validation should fail with type error.
   */
  it('should fail validation when type is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, type: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'type' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input with invalid type,
   * validation should fail with type error.
   */
  it('should fail validation when type is not a valid enum value', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        invalidTemplateTypeArbitrary,
        (input, invalidType) => {
          const invalidInput = { ...input, type: invalidType };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'type' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing svgFront,
   * validation should fail with svgFront error.
   */
  it('should fail validation when svgFront is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, svgFront: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'svgFront' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing svgRear,
   * validation should fail with svgRear error.
   */
  it('should fail validation when svgRear is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, svgRear: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'svgRear' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing svgLeftSide,
   * validation should fail with svgLeftSide error.
   */
  it('should fail validation when svgLeftSide is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, svgLeftSide: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'svgLeftSide' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input missing svgRightSide,
   * validation should fail with svgRightSide error.
   */
  it('should fail validation when svgRightSide is missing', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.constantFrom(undefined, '', '   '),
        (input, emptyValue) => {
          const invalidInput = { ...input, svgRightSide: emptyValue };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && 'svgRightSide' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any template input with invalid SVG content (missing <svg tag),
   * validation should fail with SVG error.
   */
  it('should fail validation when SVG content is invalid (missing <svg tag)', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        invalidSvgContentArbitrary,
        fc.constantFrom<keyof TemplateCreateInput>('svgFront', 'svgRear', 'svgLeftSide', 'svgRightSide'),
        (input, invalidSvg, svgField) => {
          const invalidInput = { ...input, [svgField]: invalidSvg };
          const result = validateTemplateCreate(invalidInput);
          return !result.isValid && svgField in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: svgTop is optional - validation should pass without it.
   */
  it('should pass validation when svgTop is not provided (optional field)', () => {
    fc.assert(
      fc.property(validTemplateInputArbitrary, (input) => {
        const inputWithoutTop = { ...input, svgTop: undefined };
        const result = validateTemplateCreate(inputWithoutTop);
        return result.isValid === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All 6 valid template types should be accepted.
   */
  it('should accept all 6 valid template types', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        validTemplateTypeArbitrary,
        (input, validType) => {
          const validInput = { ...input, type: validType };
          const result = validateTemplateCreate(validInput);
          return result.isValid === true || !('type' in result.errors);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Exactly 6 template types should be valid.
   */
  it('should have exactly 6 valid template types', () => {
    expect(VALID_TEMPLATE_TYPES.length).toBe(6);
    expect(VALID_TEMPLATE_TYPES).toContain('sedan');
    expect(VALID_TEMPLATE_TYPES).toContain('suv');
    expect(VALID_TEMPLATE_TYPES).toContain('hatchback');
    expect(VALID_TEMPLATE_TYPES).toContain('coupe');
    expect(VALID_TEMPLATE_TYPES).toContain('pickup');
    expect(VALID_TEMPLATE_TYPES).toContain('van');
  });

  /**
   * Property: Required SVG views should be exactly 4 (front, rear, left_side, right_side).
   */
  it('should require exactly 4 SVG views for template creation', () => {
    expect(REQUIRED_SVG_VIEWS.length).toBe(4);
    expect(REQUIRED_SVG_VIEWS).toContain('front');
    expect(REQUIRED_SVG_VIEWS).toContain('rear');
    expect(REQUIRED_SVG_VIEWS).toContain('left_side');
    expect(REQUIRED_SVG_VIEWS).toContain('right_side');
  });

  /**
   * Property: Update validation should be more lenient - partial data allowed.
   */
  it('should allow partial data for template updates', () => {
    fc.assert(
      fc.property(
        validTemplateTypeArbitrary,
        validSvgContentArbitrary,
        (validType, validSvg) => {
          // Only providing type should be valid for update
          const partialInput1: TemplateCreateInput = { type: validType };
          const result1 = validateTemplateUpdate(partialInput1);
          
          // Only providing SVG should be valid for update
          const partialInput2: TemplateCreateInput = { svgFront: validSvg };
          const result2 = validateTemplateUpdate(partialInput2);
          
          return result1.isValid && result2.isValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Update validation should still reject invalid type.
   */
  it('should reject invalid type in update validation', () => {
    fc.assert(
      fc.property(invalidTemplateTypeArbitrary, (invalidType) => {
        const input: TemplateCreateInput = { type: invalidType };
        const result = validateTemplateUpdate(input);
        return !result.isValid && 'type' in result.errors;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Update validation should still reject invalid SVG content.
   */
  it('should reject invalid SVG content in update validation', () => {
    fc.assert(
      fc.property(
        invalidSvgContentArbitrary,
        fc.constantFrom<keyof TemplateCreateInput>('svgFront', 'svgRear', 'svgLeftSide', 'svgRightSide'),
        (invalidSvg, svgField) => {
          const input: TemplateCreateInput = { [svgField]: invalidSvg };
          const result = validateTemplateUpdate(input);
          return !result.isValid && svgField in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Validation should be deterministic - same input always produces same result.
   */
  it('should produce deterministic validation results', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.integer({ min: 1, max: 5 }),
        (input, iterations) => {
          const results: ValidationResult[] = [];
          for (let i = 0; i < iterations; i++) {
            results.push(validateTemplateCreate(input));
          }
          // All results should be identical
          const firstResult = JSON.stringify(results[0]);
          return results.every((r) => JSON.stringify(r) === firstResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty object should fail validation with all required field errors.
   */
  it('should fail validation with all required field errors for empty input', () => {
    const emptyInput: TemplateCreateInput = {};
    const result = validateTemplateCreate(emptyInput);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('nameAr');
    expect(result.errors).toHaveProperty('nameEn');
    expect(result.errors).toHaveProperty('type');
    expect(result.errors).toHaveProperty('svgFront');
    expect(result.errors).toHaveProperty('svgRear');
    expect(result.errors).toHaveProperty('svgLeftSide');
    expect(result.errors).toHaveProperty('svgRightSide');
  });

  /**
   * Property: Boolean fields (isActive, isDefault) should not affect validation.
   */
  it('should not require boolean fields for validation', () => {
    fc.assert(
      fc.property(
        validTemplateInputArbitrary,
        fc.boolean(),
        fc.boolean(),
        (input, isActive, isDefault) => {
          const inputWithBooleans = { ...input, isActive, isDefault };
          const inputWithoutBooleans = { ...input, isActive: undefined, isDefault: undefined };
          
          const result1 = validateTemplateCreate(inputWithBooleans);
          const result2 = validateTemplateCreate(inputWithoutBooleans);
          
          // Both should have same validation outcome for required fields
          return result1.isValid === result2.isValid;
        }
      ),
      { numRuns: 100 }
    );
  });
});
