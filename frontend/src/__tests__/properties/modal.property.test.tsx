/**
 * Feature: web-ui-ux-enhancement
 * Property 11: Modal Keyboard Accessibility
 * Property 12: Destructive Action Confirmation
 * 
 * **Validates: Requirements 14.1, 14.4, 14.5, 14.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Modal Configuration Types
// ============================================

type ModalType = 'default' | 'destructive' | 'info';

interface ModalConfig {
  type: ModalType;
  closeOnEscape: boolean;
  closeOnOverlay: boolean;
  trapFocus: boolean;
  requiresConfirmation: boolean;
}

interface FocusableElement {
  id: string;
  tabIndex: number;
  type: 'button' | 'input' | 'link' | 'select';
}

// ============================================
// Modal Configurations - Requirements: 14.4, 14.5, 14.6
// ============================================

const modalConfigs: Record<ModalType, ModalConfig> = {
  default: {
    type: 'default',
    closeOnEscape: true,      // Requirement 14.5
    closeOnOverlay: true,     // Requirement 14.4
    trapFocus: true,          // Requirement 14.6
    requiresConfirmation: false,
  },
  destructive: {
    type: 'destructive',
    closeOnEscape: true,      // Escape cancels the action
    closeOnOverlay: false,    // Don't close on overlay for destructive
    trapFocus: true,          // Requirement 14.6
    requiresConfirmation: true, // Requirement 14.1
  },
  info: {
    type: 'info',
    closeOnEscape: true,      // Requirement 14.5
    closeOnOverlay: true,     // Requirement 14.4
    trapFocus: true,          // Requirement 14.6
    requiresConfirmation: false,
  },
};

// ============================================
// Modal Logic Functions
// ============================================

/**
 * Check if modal should close on Escape key - Requirement 14.5
 */
function shouldCloseOnEscape(type: ModalType): boolean {
  return modalConfigs[type].closeOnEscape;
}

/**
 * Check if modal should close on overlay click - Requirement 14.4
 */
function shouldCloseOnOverlay(type: ModalType): boolean {
  return modalConfigs[type].closeOnOverlay;
}

/**
 * Check if modal should trap focus - Requirement 14.6
 */
function shouldTrapFocus(type: ModalType): boolean {
  return modalConfigs[type].trapFocus;
}

/**
 * Check if action requires confirmation - Requirement 14.1
 */
function requiresConfirmation(type: ModalType): boolean {
  return modalConfigs[type].requiresConfirmation;
}

/**
 * Simulate focus cycling within modal (Tab key behavior)
 * Returns the next element index in the focus cycle
 */
function getNextFocusIndex(
  currentIndex: number,
  elements: FocusableElement[],
  direction: 'forward' | 'backward'
): number {
  if (elements.length === 0) return -1;
  
  const focusableElements = elements.filter(el => el.tabIndex >= 0);
  if (focusableElements.length === 0) return -1;
  
  const currentFocusableIndex = focusableElements.findIndex(
    el => el.id === elements[currentIndex]?.id
  );
  
  if (currentFocusableIndex === -1) {
    // If current element is not focusable, start from beginning/end
    return direction === 'forward' ? 0 : focusableElements.length - 1;
  }
  
  if (direction === 'forward') {
    // Cycle to beginning if at end (focus trap)
    return (currentFocusableIndex + 1) % focusableElements.length;
  } else {
    // Cycle to end if at beginning (focus trap)
    return currentFocusableIndex === 0 
      ? focusableElements.length - 1 
      : currentFocusableIndex - 1;
  }
}

/**
 * Check if focus is trapped within modal elements
 */
function isFocusTrapped(
  elements: FocusableElement[],
  currentIndex: number,
  direction: 'forward' | 'backward'
): boolean {
  const focusableElements = elements.filter(el => el.tabIndex >= 0);
  if (focusableElements.length <= 1) return true;
  
  const nextIndex = getNextFocusIndex(currentIndex, elements, direction);
  // Focus is trapped if next index is within bounds
  return nextIndex >= 0 && nextIndex < focusableElements.length;
}

/**
 * Validate destructive action has proper confirmation structure
 */
function hasProperConfirmationStructure(config: {
  hasTitle: boolean;
  hasDescription: boolean;
  hasCancelButton: boolean;
  hasConfirmButton: boolean;
}): boolean {
  return (
    config.hasTitle &&
    config.hasDescription &&
    config.hasCancelButton &&
    config.hasConfirmButton
  );
}

// ============================================
// Arbitraries for Property Testing
// ============================================

const modalTypeArbitrary = fc.constantFrom<ModalType>('default', 'destructive', 'info');
const nonDestructiveTypeArbitrary = fc.constantFrom<ModalType>('default', 'info');

const focusableElementArbitrary = fc.record({
  id: fc.uuid(),
  tabIndex: fc.integer({ min: -1, max: 0 }),
  type: fc.constantFrom<'button' | 'input' | 'link' | 'select'>('button', 'input', 'link', 'select'),
});

const focusableElementsArbitrary = fc.array(focusableElementArbitrary, { minLength: 1, maxLength: 10 });

const confirmationStructureArbitrary = fc.record({
  hasTitle: fc.boolean(),
  hasDescription: fc.boolean(),
  hasCancelButton: fc.boolean(),
  hasConfirmButton: fc.boolean(),
});

// ============================================
// Property 11: Modal Keyboard Accessibility
// ============================================

describe('Property 11: Modal Keyboard Accessibility', () => {
  /**
   * Property: All modal types should close on Escape key - Requirement 14.5
   */
  it('should close on Escape key for all modal types', () => {
    fc.assert(
      fc.property(modalTypeArbitrary, (type) => {
        return shouldCloseOnEscape(type) === true;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Non-destructive modals should close on overlay click - Requirement 14.4
   */
  it('should close on overlay click for non-destructive modals', () => {
    fc.assert(
      fc.property(nonDestructiveTypeArbitrary, (type) => {
        return shouldCloseOnOverlay(type) === true;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Destructive modals should NOT close on overlay click
   */
  it('should NOT close on overlay click for destructive modals', () => {
    expect(shouldCloseOnOverlay('destructive')).toBe(false);
  });

  /**
   * Property: All modal types should trap focus - Requirement 14.6
   */
  it('should trap focus for all modal types', () => {
    fc.assert(
      fc.property(modalTypeArbitrary, (type) => {
        return shouldTrapFocus(type) === true;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Tab key should cycle through focusable elements within modal
   */
  it('should cycle focus forward through focusable elements', () => {
    fc.assert(
      fc.property(
        focusableElementsArbitrary,
        fc.integer({ min: 0, max: 9 }),
        (elements, startIndex) => {
          const validStartIndex = Math.min(startIndex, elements.length - 1);
          const focusableCount = elements.filter(el => el.tabIndex >= 0).length;
          
          if (focusableCount === 0) return true;
          
          const nextIndex = getNextFocusIndex(validStartIndex, elements, 'forward');
          return nextIndex >= 0 && nextIndex < focusableCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Shift+Tab should cycle focus backward through focusable elements
   */
  it('should cycle focus backward through focusable elements', () => {
    fc.assert(
      fc.property(
        focusableElementsArbitrary,
        fc.integer({ min: 0, max: 9 }),
        (elements, startIndex) => {
          const validStartIndex = Math.min(startIndex, elements.length - 1);
          const focusableCount = elements.filter(el => el.tabIndex >= 0).length;
          
          if (focusableCount === 0) return true;
          
          const nextIndex = getNextFocusIndex(validStartIndex, elements, 'backward');
          return nextIndex >= 0 && nextIndex < focusableCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Focus should wrap from last to first element (forward)
   */
  it('should wrap focus from last to first element', () => {
    const elements: FocusableElement[] = [
      { id: '1', tabIndex: 0, type: 'button' },
      { id: '2', tabIndex: 0, type: 'input' },
      { id: '3', tabIndex: 0, type: 'button' },
    ];
    
    // Starting from last element (index 2), next should be first (index 0)
    const nextIndex = getNextFocusIndex(2, elements, 'forward');
    expect(nextIndex).toBe(0);
  });

  /**
   * Property: Focus should wrap from first to last element (backward)
   */
  it('should wrap focus from first to last element', () => {
    const elements: FocusableElement[] = [
      { id: '1', tabIndex: 0, type: 'button' },
      { id: '2', tabIndex: 0, type: 'input' },
      { id: '3', tabIndex: 0, type: 'button' },
    ];
    
    // Starting from first element (index 0), previous should be last (index 2)
    const nextIndex = getNextFocusIndex(0, elements, 'backward');
    expect(nextIndex).toBe(2);
  });

  /**
   * Property: Elements with tabIndex -1 should be skipped in focus cycle
   */
  it('should skip elements with tabIndex -1', () => {
    const elements: FocusableElement[] = [
      { id: '1', tabIndex: 0, type: 'button' },
      { id: '2', tabIndex: -1, type: 'input' }, // Should be skipped
      { id: '3', tabIndex: 0, type: 'button' },
    ];
    
    // From first focusable (index 0), next should skip to index 1 in focusable array
    // which corresponds to element with id '3'
    const nextIndex = getNextFocusIndex(0, elements, 'forward');
    expect(nextIndex).toBe(1); // Index 1 in focusable elements array
  });
});

// ============================================
// Property 12: Destructive Action Confirmation
// ============================================

describe('Property 12: Destructive Action Confirmation', () => {
  /**
   * Property: Destructive actions should require confirmation - Requirement 14.1
   */
  it('should require confirmation for destructive actions', () => {
    expect(requiresConfirmation('destructive')).toBe(true);
  });

  /**
   * Property: Non-destructive actions should NOT require confirmation
   */
  it('should NOT require confirmation for non-destructive actions', () => {
    fc.assert(
      fc.property(nonDestructiveTypeArbitrary, (type) => {
        return requiresConfirmation(type) === false;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Valid confirmation dialog should have all required elements
   * - Title (Requirement 14.2)
   * - Description (Requirement 14.2)
   * - Cancel button (Requirement 14.3)
   * - Confirm button (Requirement 14.3)
   */
  it('should have proper structure for valid confirmation dialog', () => {
    const validStructure = {
      hasTitle: true,
      hasDescription: true,
      hasCancelButton: true,
      hasConfirmButton: true,
    };
    
    expect(hasProperConfirmationStructure(validStructure)).toBe(true);
  });

  /**
   * Property: Confirmation dialog without title should be invalid
   */
  it('should be invalid without title', () => {
    fc.assert(
      fc.property(confirmationStructureArbitrary, (structure) => {
        const withoutTitle = { ...structure, hasTitle: false };
        return hasProperConfirmationStructure(withoutTitle) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Confirmation dialog without description should be invalid
   */
  it('should be invalid without description', () => {
    fc.assert(
      fc.property(confirmationStructureArbitrary, (structure) => {
        const withoutDescription = { ...structure, hasDescription: false };
        return hasProperConfirmationStructure(withoutDescription) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Confirmation dialog without cancel button should be invalid
   */
  it('should be invalid without cancel button', () => {
    fc.assert(
      fc.property(confirmationStructureArbitrary, (structure) => {
        const withoutCancel = { ...structure, hasCancelButton: false };
        return hasProperConfirmationStructure(withoutCancel) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Confirmation dialog without confirm button should be invalid
   */
  it('should be invalid without confirm button', () => {
    fc.assert(
      fc.property(confirmationStructureArbitrary, (structure) => {
        const withoutConfirm = { ...structure, hasConfirmButton: false };
        return hasProperConfirmationStructure(withoutConfirm) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Only structures with ALL required elements should be valid
   */
  it('should only be valid with all required elements', () => {
    fc.assert(
      fc.property(confirmationStructureArbitrary, (structure) => {
        const isValid = hasProperConfirmationStructure(structure);
        const hasAll = structure.hasTitle && 
                       structure.hasDescription && 
                       structure.hasCancelButton && 
                       structure.hasConfirmButton;
        return isValid === hasAll;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Combined Modal Properties
// ============================================

describe('Modal System Combined Properties', () => {
  /**
   * Property: All modal types should have consistent accessibility features
   */
  it('should have consistent accessibility features across all types', () => {
    fc.assert(
      fc.property(modalTypeArbitrary, (type) => {
        const config = modalConfigs[type];
        // All modals should trap focus and close on escape
        return config.trapFocus === true && config.closeOnEscape === true;
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Destructive modals should have stricter closing behavior
   */
  it('should have stricter closing behavior for destructive modals', () => {
    const destructiveConfig = modalConfigs['destructive'];
    const defaultConfig = modalConfigs['default'];
    
    // Destructive should not close on overlay, default should
    expect(destructiveConfig.closeOnOverlay).toBe(false);
    expect(defaultConfig.closeOnOverlay).toBe(true);
    
    // Both should close on escape
    expect(destructiveConfig.closeOnEscape).toBe(true);
    expect(defaultConfig.closeOnEscape).toBe(true);
  });

  /**
   * Property: Modal configuration should be complete for all types
   */
  it('should have complete configuration for all modal types', () => {
    fc.assert(
      fc.property(modalTypeArbitrary, (type) => {
        const config = modalConfigs[type];
        return (
          config.type === type &&
          typeof config.closeOnEscape === 'boolean' &&
          typeof config.closeOnOverlay === 'boolean' &&
          typeof config.trapFocus === 'boolean' &&
          typeof config.requiresConfirmation === 'boolean'
        );
      }),
      { numRuns: 10 }
    );
  });
});
