/**
 * Feature: web-ui-ux-enhancement
 * Property 5: Mobile Menu Toggle
 * 
 * **Validates: Requirements 1.5**
 * 
 * For any initial menu state (open or closed), clicking the hamburger menu button
 * should toggle the state to the opposite value.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { toggleMenuState, isMenuItemActive } from '@/components/layout/MobileMenu';

// ============================================
// Arbitraries for Property Testing
// ============================================

/**
 * Generate boolean states for menu open/closed
 */
const menuStateArbitrary = fc.boolean();

/**
 * Generate a sequence of toggle operations
 */
const toggleSequenceArbitrary = fc.array(fc.constant('toggle'), { minLength: 1, maxLength: 20 });

/**
 * Generate menu items for testing
 */
const menuItemArbitrary = fc.record({
  href: fc.constantFrom('/', '/cars', '/about', '/contact'),
  label: fc.string({ minLength: 1, maxLength: 50 }),
});

/**
 * Generate valid route paths
 */
const validPathArbitrary = fc.constantFrom(
  '/',
  '/cars',
  '/cars/123',
  '/about',
  '/contact'
);

// ============================================
// Property 5: Mobile Menu Toggle
// ============================================

describe('Property 5: Mobile Menu Toggle', () => {
  /**
   * Property: Toggle should always invert the current state
   * For any boolean state, toggleMenuState should return the opposite value
   */
  it('should toggle menu state from any initial state', () => {
    fc.assert(
      fc.property(menuStateArbitrary, (initialState) => {
        const newState = toggleMenuState(initialState);
        
        // New state should be the opposite of initial state
        return newState === !initialState;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Double toggle should return to original state (involution)
   * toggleMenuState(toggleMenuState(state)) === state
   */
  it('should return to original state after double toggle', () => {
    fc.assert(
      fc.property(menuStateArbitrary, (initialState) => {
        const afterFirstToggle = toggleMenuState(initialState);
        const afterSecondToggle = toggleMenuState(afterFirstToggle);
        
        // Should return to original state
        return afterSecondToggle === initialState;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggle is deterministic
   * Same input should always produce same output
   */
  it('should produce consistent results for the same input', () => {
    fc.assert(
      fc.property(menuStateArbitrary, (state) => {
        const result1 = toggleMenuState(state);
        const result2 = toggleMenuState(state);
        
        return result1 === result2;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Odd number of toggles should invert state
   * After an odd number of toggles, state should be opposite of initial
   */
  it('should invert state after odd number of toggles', () => {
    fc.assert(
      fc.property(
        menuStateArbitrary,
        fc.integer({ min: 1, max: 10 }).map(n => n * 2 - 1), // Odd numbers: 1, 3, 5, 7, ...
        (initialState, toggleCount) => {
          let currentState = initialState;
          
          for (let i = 0; i < toggleCount; i++) {
            currentState = toggleMenuState(currentState);
          }
          
          // After odd toggles, state should be inverted
          return currentState === !initialState;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Even number of toggles should preserve state
   * After an even number of toggles, state should equal initial
   */
  it('should preserve state after even number of toggles', () => {
    fc.assert(
      fc.property(
        menuStateArbitrary,
        fc.integer({ min: 1, max: 10 }).map(n => n * 2), // Even numbers: 2, 4, 6, 8, ...
        (initialState, toggleCount) => {
          let currentState = initialState;
          
          for (let i = 0; i < toggleCount; i++) {
            currentState = toggleMenuState(currentState);
          }
          
          // After even toggles, state should be same as initial
          return currentState === initialState;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggle from closed should open
   */
  it('should open menu when toggled from closed state', () => {
    const closedState = false;
    const newState = toggleMenuState(closedState);
    
    expect(newState).toBe(true);
  });

  /**
   * Property: Toggle from open should close
   */
  it('should close menu when toggled from open state', () => {
    const openState = true;
    const newState = toggleMenuState(openState);
    
    expect(newState).toBe(false);
  });
});

// ============================================
// Menu Item Active State Tests
// ============================================

describe('Mobile Menu Item Active State', () => {
  /**
   * Property: Active state should be deterministic
   */
  it('should produce consistent active state results', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/', '/cars', '/about'),
        validPathArbitrary,
        (href, path) => {
          const result1 = isMenuItemActive(href, path);
          const result2 = isMenuItemActive(href, path);
          
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Exact match should always be active
   */
  it('should always activate for exact path match', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/', '/cars', '/about', '/contact'),
        (path) => {
          return isMenuItemActive(path, path) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Home path should only be active for root
   */
  it('should only activate home for root path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/cars', '/about', '/contact', '/cars/123'),
        (nonRootPath) => {
          return isMenuItemActive('/', nonRootPath) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested paths should activate parent
   */
  it('should activate parent menu item for nested paths', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/cars', '/about'),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)),
        (basePath, segment) => {
          const nestedPath = `${basePath}/${segment}`;
          return isMenuItemActive(basePath, nestedPath) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Specific Test Cases
// ============================================

describe('Mobile Menu Toggle - Specific Cases', () => {
  it('should handle rapid toggle sequence', () => {
    let state = false;
    const toggleCount = 10;
    
    for (let i = 0; i < toggleCount; i++) {
      state = toggleMenuState(state);
    }
    
    // Even number of toggles should return to initial state
    expect(state).toBe(false);
  });

  it('should handle single toggle from each state', () => {
    expect(toggleMenuState(false)).toBe(true);
    expect(toggleMenuState(true)).toBe(false);
  });
});
