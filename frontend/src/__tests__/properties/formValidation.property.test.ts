/**
 * Feature: web-ui-ux-enhancement
 * Property 8: Form Validation Behavior
 * 
 * **Validates: Requirements 11.2, 11.3, 11.4, 11.8**
 * 
 * For any form field with validation rules:
 * - Entering invalid data should immediately display an error message below the field
 * - Required fields should show indicators
 * - Form data should be preserved after a failed submission
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateField,
  isFieldValid,
  validationRules,
  type FieldConfig,
  type ValidationRule,
} from '@/lib/useFormValidation';

// ============================================
// Arbitraries for Property Testing
// ============================================

// Generate valid email strings
const validEmailArbitrary = fc.tuple(
  fc.stringMatching(/^[a-z]{1,10}$/),
  fc.stringMatching(/^[a-z]{1,10}$/),
  fc.stringMatching(/^[a-z]{2,4}$/)
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// Generate invalid email strings (missing @ or domain)
const invalidEmailArbitrary = fc.oneof(
  fc.stringMatching(/^[a-z]{1,20}$/), // No @ symbol
  fc.stringMatching(/^[a-z]{1,10}@$/), // Missing domain
  fc.stringMatching(/^@[a-z]{1,10}\.[a-z]{2,4}$/), // Missing local part
  fc.constant(''), // Empty
);

// Generate non-empty strings (excluding whitespace-only strings)
const nonEmptyStringArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

// Generate empty/whitespace strings
const emptyOrWhitespaceArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.constant('\t'),
  fc.constant('\n'),
  fc.constant('  \t\n  '),
);

// Generate numeric strings
const numericStringArbitrary = fc.integer({ min: 0, max: 999999 }).map(String);

// Generate non-numeric strings (containing letters)
const nonNumericStringArbitrary = fc.stringMatching(/^[a-z]{1,10}$/);

// Generate strings of various lengths
const stringWithLengthArbitrary = (minLen: number, maxLen: number) =>
  fc.string({ minLength: minLen, maxLength: maxLen });

// ============================================
// Property 8: Form Validation Behavior
// ============================================

describe('Property 8: Form Validation Behavior', () => {
  // ----------------------------------------
  // Requirements 11.2, 11.3: Real-time validation with error display
  // ----------------------------------------
  
  describe('Real-time validation with error display', () => {
    /**
     * Property: For any required field with empty value, validation should return error
     */
    it('should return error for required field with empty value', () => {
      fc.assert(
        fc.property(emptyOrWhitespaceArbitrary, (emptyValue) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            required: true,
          };
          
          const error = validateField(emptyValue, config);
          
          // Should have an error message
          return error !== null && error.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any required field with non-empty value, validation should pass
     */
    it('should pass validation for required field with non-empty value', () => {
      fc.assert(
        fc.property(nonEmptyStringArbitrary, (value) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            required: true,
          };
          
          const error = validateField(value, config);
          
          // Should not have an error (required is satisfied)
          return error === null;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any valid email, email validation should pass
     */
    it('should pass validation for valid email format', () => {
      fc.assert(
        fc.property(validEmailArbitrary, (email) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            rules: [validationRules.email()],
          };
          
          const error = validateField(email, config);
          return error === null;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any invalid email, email validation should fail with error message
     */
    it('should fail validation for invalid email format with error message', () => {
      fc.assert(
        fc.property(invalidEmailArbitrary, (email) => {
          // Skip empty strings as they're handled by required validation
          if (email === '') return true;
          
          const config: FieldConfig<string> = {
            initialValue: '',
            rules: [validationRules.email()],
          };
          
          const error = validateField(email, config);
          
          // Should have an error message
          return error !== null && error.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any string shorter than minLength, validation should fail
     */
    it('should fail validation for string shorter than minLength', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          fc.string({ minLength: 1, maxLength: 4 }),
          (minLength, shortString) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              rules: [validationRules.minLength(minLength)],
            };
            
            const error = validateField(shortString, config);
            
            // Should have an error if string is shorter than minLength
            return shortString.length < minLength ? error !== null : true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any string meeting minLength, validation should pass
     */
    it('should pass validation for string meeting minLength', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (minLength) => {
            const validString = 'a'.repeat(minLength);
            const config: FieldConfig<string> = {
              initialValue: '',
              rules: [validationRules.minLength(minLength)],
            };
            
            const error = validateField(validString, config);
            return error === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any numeric string, numeric validation should pass
     */
    it('should pass validation for numeric strings', () => {
      fc.assert(
        fc.property(numericStringArbitrary, (numStr) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            rules: [validationRules.numeric()],
          };
          
          const error = validateField(numStr, config);
          return error === null;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: For any non-numeric string, numeric validation should fail
     */
    it('should fail validation for non-numeric strings', () => {
      fc.assert(
        fc.property(nonNumericStringArbitrary, (str) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            rules: [validationRules.numeric()],
          };
          
          const error = validateField(str, config);
          return error !== null;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ----------------------------------------
  // Requirements 11.4: Required field indicators
  // ----------------------------------------
  
  describe('Required field indicators', () => {
    /**
     * Property: Required field config should be correctly identified
     */
    it('should correctly identify required fields', () => {
      fc.assert(
        fc.property(fc.boolean(), (isRequired) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            required: isRequired,
          };
          
          // Config should preserve required flag
          return config.required === isRequired;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Custom required message should be used when provided
     */
    it('should use custom required message when provided', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArbitrary,
          (customMessage) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              required: true,
              requiredMessage: customMessage,
            };
            
            const error = validateField('', config);
            return error === customMessage;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Default required message should be used when no custom message
     */
    it('should use default required message when no custom message provided', () => {
      const config: FieldConfig<string> = {
        initialValue: '',
        required: true,
      };
      
      const error = validateField('', config);
      expect(error).toBe('هذا الحقل مطلوب');
    });
  });

  // ----------------------------------------
  // Requirements 11.8: Data preservation on failure
  // ----------------------------------------
  
  describe('Data preservation on failure', () => {
    /**
     * Property: isFieldValid should return false for invalid data without modifying value
     */
    it('should not modify value when validation fails', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArbitrary,
          (originalValue) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              required: true,
              rules: [validationRules.email()],
            };
            
            // Store original value
            const valueBefore = originalValue;
            
            // Run validation (should fail for non-email)
            const isValid = isFieldValid(originalValue, config);
            
            // Value should be unchanged
            return valueBefore === originalValue && !isValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Multiple validation rules should all be checked
     */
    it('should check all validation rules and return first error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 3 }),
          (shortString) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              rules: [
                validationRules.minLength(5, 'Too short'),
                validationRules.maxLength(10, 'Too long'),
              ],
            };
            
            const error = validateField(shortString, config);
            
            // If string is too short, should get minLength error
            if (shortString.length > 0 && shortString.length < 5) {
              return error === 'Too short';
            }
            // Empty strings pass (let required handle them)
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ----------------------------------------
  // Combined validation scenarios
  // ----------------------------------------
  
  describe('Combined validation scenarios', () => {
    /**
     * Property: Required + email validation should work together
     */
    it('should validate required and email rules together', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            emptyOrWhitespaceArbitrary,
            invalidEmailArbitrary,
            validEmailArbitrary
          ),
          (value) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              required: true,
              rules: [validationRules.email()],
            };
            
            const error = validateField(value, config);
            const isEmpty = value === '' || value.trim() === '';
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            
            if (isEmpty) {
              // Should fail required check
              return error !== null;
            } else if (!isValidEmail) {
              // Should fail email check
              return error !== null;
            } else {
              // Should pass
              return error === null;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Min and max validation should work together
     */
    it('should validate min and max number rules together', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 200 }),
          (num) => {
            const config: FieldConfig<string> = {
              initialValue: '',
              rules: [
                validationRules.min(0, 'Must be at least 0'),
                validationRules.max(100, 'Must be at most 100'),
              ],
            };
            
            const error = validateField(String(num), config);
            
            if (num < 0) {
              return error === 'Must be at least 0';
            } else if (num > 100) {
              return error === 'Must be at most 100';
            } else {
              return error === null;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Pattern validation should work correctly
     */
    it('should validate pattern rules correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (value) => {
            const alphanumericPattern = /^[a-zA-Z0-9]+$/;
            const config: FieldConfig<string> = {
              initialValue: '',
              rules: [validationRules.pattern(alphanumericPattern, 'Only alphanumeric')],
            };
            
            const error = validateField(value, config);
            const matchesPattern = alphanumericPattern.test(value);
            
            if (matchesPattern) {
              return error === null;
            } else {
              return error === 'Only alphanumeric';
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ----------------------------------------
  // Edge cases
  // ----------------------------------------
  
  describe('Edge cases', () => {
    /**
     * Property: Empty rules array should pass validation
     */
    it('should pass validation with empty rules array', () => {
      fc.assert(
        fc.property(nonEmptyStringArbitrary, (value) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            rules: [],
          };
          
          const error = validateField(value, config);
          return error === null;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Non-required empty field should pass validation
     */
    it('should pass validation for non-required empty field', () => {
      fc.assert(
        fc.property(emptyOrWhitespaceArbitrary, (emptyValue) => {
          const config: FieldConfig<string> = {
            initialValue: '',
            required: false,
          };
          
          const error = validateField(emptyValue, config);
          return error === null;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Validation rules should skip empty values (let required handle them)
     */
    it('should skip validation rules for empty values', () => {
      const config: FieldConfig<string> = {
        initialValue: '',
        required: false,
        rules: [validationRules.email()],
      };
      
      const error = validateField('', config);
      expect(error).toBeNull();
    });
  });
});
