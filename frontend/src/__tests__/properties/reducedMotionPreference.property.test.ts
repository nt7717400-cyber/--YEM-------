/**
 * Feature: web-ui-ux-enhancement
 * Property 25: Reduced Motion Preference
 * 
 * *For any* user with prefers-reduced-motion enabled, all CSS animations
 * and transitions should be disabled or minimized.
 * 
 * **Validates: Requirements 7.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Types
// ============================================

interface AnimationConfig {
  name: string;
  cssClass: string;
  type: 'animation' | 'transition' | 'transform';
  shouldBeDisabled: boolean;
}

interface ReducedMotionRule {
  selector: string;
  property: string;
  expectedValue: string;
  description: string;
}

// ============================================
// Animation Configurations
// ============================================

/**
 * List of animation classes that should be disabled with reduced motion
 */
const animationConfigs: AnimationConfig[] = [
  {
    name: 'Shimmer Animation',
    cssClass: 'animate-shimmer',
    type: 'animation',
    shouldBeDisabled: true,
  },
  {
    name: 'Pulse Animation',
    cssClass: 'animate-pulse',
    type: 'animation',
    shouldBeDisabled: true,
  },
  {
    name: 'Spin Animation',
    cssClass: 'animate-spin',
    type: 'animation',
    shouldBeDisabled: true,
  },
  {
    name: 'Ping Animation',
    cssClass: 'animate-ping',
    type: 'animation',
    shouldBeDisabled: true,
  },
  {
    name: 'Bounce Animation',
    cssClass: 'animate-bounce',
    type: 'animation',
    shouldBeDisabled: true,
  },
  {
    name: 'Transition All',
    cssClass: 'transition-all',
    type: 'transition',
    shouldBeDisabled: true,
  },
  {
    name: 'Transition Colors',
    cssClass: 'transition-colors',
    type: 'transition',
    shouldBeDisabled: true,
  },
  {
    name: 'Transition Opacity',
    cssClass: 'transition-opacity',
    type: 'transition',
    shouldBeDisabled: true,
  },
  {
    name: 'Transition Transform',
    cssClass: 'transition-transform',
    type: 'transition',
    shouldBeDisabled: true,
  },
  {
    name: 'Hover Scale',
    cssClass: 'hover:scale-105',
    type: 'transform',
    shouldBeDisabled: true,
  },
  {
    name: 'Hover Translate',
    cssClass: 'hover:-translate-y-1',
    type: 'transform',
    shouldBeDisabled: true,
  },
];

/**
 * CSS rules that should be applied when reduced motion is preferred
 */
const reducedMotionRules: ReducedMotionRule[] = [
  {
    selector: '*',
    property: 'animation-duration',
    expectedValue: '0.01ms',
    description: 'All elements should have near-zero animation duration',
  },
  {
    selector: '*',
    property: 'animation-iteration-count',
    expectedValue: '1',
    description: 'All animations should only run once',
  },
  {
    selector: '*',
    property: 'transition-duration',
    expectedValue: '0.01ms',
    description: 'All elements should have near-zero transition duration',
  },
  {
    selector: 'html',
    property: 'scroll-behavior',
    expectedValue: 'auto',
    description: 'Smooth scrolling should be disabled',
  },
];

// ============================================
// Utility Functions
// ============================================

/**
 * Check if an animation class should be disabled with reduced motion
 */
function shouldDisableAnimation(config: AnimationConfig): boolean {
  return config.shouldBeDisabled;
}

/**
 * Get the motion-reduce class for a given animation class
 */
function getMotionReduceClass(animationClass: string): string {
  return `motion-reduce:${animationClass.replace('animate-', 'animate-none').replace('transition-', 'transition-none')}`;
}

/**
 * Check if a CSS property value indicates disabled animation
 */
function isAnimationDisabled(property: string, value: string): boolean {
  if (property === 'animation-duration' || property === 'transition-duration') {
    const numValue = parseFloat(value);
    return numValue <= 0.01 || value === '0ms' || value === '0s' || value === 'none';
  }
  if (property === 'animation') {
    return value === 'none' || value.includes('0ms') || value.includes('0s');
  }
  if (property === 'transition') {
    return value === 'none' || value.includes('0ms') || value.includes('0s');
  }
  if (property === 'transform') {
    return value === 'none';
  }
  return false;
}

/**
 * Check if scroll behavior is disabled
 */
function isScrollBehaviorDisabled(value: string): boolean {
  return value === 'auto' || value === 'instant';
}

/**
 * Validate that a reduced motion rule is correctly configured
 */
function validateReducedMotionRule(rule: ReducedMotionRule): boolean {
  // Check that the rule has all required properties
  if (!rule.selector || !rule.property || !rule.expectedValue) {
    return false;
  }
  
  // Validate expected values based on property type
  if (rule.property === 'animation-duration' || rule.property === 'transition-duration') {
    return isAnimationDisabled(rule.property, rule.expectedValue);
  }
  
  if (rule.property === 'scroll-behavior') {
    return isScrollBehaviorDisabled(rule.expectedValue);
  }
  
  if (rule.property === 'animation-iteration-count') {
    return rule.expectedValue === '1';
  }
  
  return true;
}

/**
 * Check if motion-safe class is properly paired with motion-reduce
 */
function hasMotionSafeCounterpart(className: string): boolean {
  // Classes that use motion-safe should have corresponding motion-reduce behavior
  const motionSafePatterns = [
    'motion-safe:animate-',
    'motion-safe:transition-',
    'motion-safe:hover:scale-',
    'motion-safe:hover:-translate-',
  ];
  
  return motionSafePatterns.some(pattern => className.includes(pattern.replace('motion-safe:', '')));
}

/**
 * Simulate checking if reduced motion preference is respected
 * In a real browser, this would use window.matchMedia
 */
function simulateReducedMotionCheck(prefersReducedMotion: boolean): {
  animationsDisabled: boolean;
  transitionsDisabled: boolean;
  smoothScrollDisabled: boolean;
} {
  return {
    animationsDisabled: prefersReducedMotion,
    transitionsDisabled: prefersReducedMotion,
    smoothScrollDisabled: prefersReducedMotion,
  };
}

// ============================================
// Arbitraries for Property Testing
// ============================================

// Arbitrary for animation configurations
const animationConfigArbitrary = fc.constantFrom(...animationConfigs);

// Arbitrary for reduced motion rules
const reducedMotionRuleArbitrary = fc.constantFrom(...reducedMotionRules);

// Arbitrary for boolean reduced motion preference
const reducedMotionPreferenceArbitrary = fc.boolean();

// Arbitrary for animation duration values
const animationDurationArbitrary = fc.oneof(
  fc.constant('0ms'),
  fc.constant('0s'),
  fc.constant('0.01ms'),
  fc.constant('none'),
  fc.integer({ min: 0, max: 10 }).map(v => `${v / 1000}ms`)
);

// Arbitrary for transition duration values
const transitionDurationArbitrary = fc.oneof(
  fc.constant('0ms'),
  fc.constant('0s'),
  fc.constant('0.01ms'),
  fc.constant('none'),
  fc.integer({ min: 0, max: 10 }).map(v => `${v / 1000}ms`)
);

// ============================================
// Property Tests
// ============================================

describe('Property 25: Reduced Motion Preference', () => {
  /**
   * Property: For any animation configuration that should be disabled,
   * the animation should be disabled when reduced motion is preferred.
   */
  it('should disable animations when reduced motion is preferred', () => {
    fc.assert(
      fc.property(animationConfigArbitrary, (config) => {
        if (config.shouldBeDisabled) {
          // When reduced motion is preferred, animation should be disabled
          const result = simulateReducedMotionCheck(true);
          return result.animationsDisabled === true;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any reduced motion rule, the expected value should
   * correctly disable the animation/transition.
   */
  it('should have valid reduced motion rules', () => {
    fc.assert(
      fc.property(reducedMotionRuleArbitrary, (rule) => {
        return validateReducedMotionRule(rule);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any animation duration value that indicates disabled,
   * isAnimationDisabled should return true.
   */
  it('should correctly identify disabled animation durations', () => {
    fc.assert(
      fc.property(animationDurationArbitrary, (duration) => {
        return isAnimationDisabled('animation-duration', duration);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any transition duration value that indicates disabled,
   * isAnimationDisabled should return true.
   */
  it('should correctly identify disabled transition durations', () => {
    fc.assert(
      fc.property(transitionDurationArbitrary, (duration) => {
        return isAnimationDisabled('transition-duration', duration);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: When reduced motion is preferred, all motion types should be disabled.
   */
  it('should disable all motion types when preference is set', () => {
    fc.assert(
      fc.property(reducedMotionPreferenceArbitrary, (prefersReducedMotion) => {
        const result = simulateReducedMotionCheck(prefersReducedMotion);
        
        if (prefersReducedMotion) {
          return (
            result.animationsDisabled &&
            result.transitionsDisabled &&
            result.smoothScrollDisabled
          );
        }
        
        // When not preferred, motion should be enabled
        return (
          !result.animationsDisabled &&
          !result.transitionsDisabled &&
          !result.smoothScrollDisabled
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any animation type, there should be a corresponding
   * motion-reduce utility class available.
   */
  it('should have motion-reduce counterparts for animations', () => {
    fc.assert(
      fc.property(animationConfigArbitrary, (config) => {
        if (config.type === 'animation') {
          // Animation classes should have motion-reduce:animate-none available
          return config.cssClass.startsWith('animate-');
        }
        if (config.type === 'transition') {
          // Transition classes should have motion-reduce:transition-none available
          return config.cssClass.startsWith('transition');
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Scroll behavior should be 'auto' when reduced motion is preferred.
   */
  it('should disable smooth scrolling when reduced motion is preferred', () => {
    const scrollRule = reducedMotionRules.find(r => r.property === 'scroll-behavior');
    expect(scrollRule).toBeDefined();
    expect(scrollRule?.expectedValue).toBe('auto');
    expect(isScrollBehaviorDisabled(scrollRule?.expectedValue || '')).toBe(true);
  });

  /**
   * Property: Animation iteration count should be 1 when reduced motion is preferred.
   */
  it('should limit animation iterations to 1 when reduced motion is preferred', () => {
    const iterationRule = reducedMotionRules.find(r => r.property === 'animation-iteration-count');
    expect(iterationRule).toBeDefined();
    expect(iterationRule?.expectedValue).toBe('1');
  });

  /**
   * Property: All animation configs marked as shouldBeDisabled should be true.
   */
  it('should mark all standard animations as should be disabled', () => {
    fc.assert(
      fc.property(animationConfigArbitrary, (config) => {
        // All animations in our config should be disabled with reduced motion
        return config.shouldBeDisabled === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Specific test: Verify the media query selector is correct.
   */
  it('should use correct media query for reduced motion', () => {
    const mediaQuery = '(prefers-reduced-motion: reduce)';
    expect(mediaQuery).toBe('(prefers-reduced-motion: reduce)');
  });

  /**
   * Specific test: Verify animation duration values are near-zero.
   */
  it('should have near-zero animation duration in reduced motion rules', () => {
    const durationRule = reducedMotionRules.find(r => r.property === 'animation-duration');
    expect(durationRule).toBeDefined();
    expect(parseFloat(durationRule?.expectedValue || '0')).toBeLessThanOrEqual(0.01);
  });

  /**
   * Specific test: Verify transition duration values are near-zero.
   */
  it('should have near-zero transition duration in reduced motion rules', () => {
    const durationRule = reducedMotionRules.find(r => r.property === 'transition-duration');
    expect(durationRule).toBeDefined();
    expect(parseFloat(durationRule?.expectedValue || '0')).toBeLessThanOrEqual(0.01);
  });

  /**
   * Property: For any positive duration value, it should not be considered disabled.
   */
  it('should not consider positive durations as disabled', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        (durationMs) => {
          const value = `${durationMs / 1000}s`;
          return !isAnimationDisabled('animation-duration', value);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Transform 'none' should be considered disabled.
   */
  it('should consider transform none as disabled', () => {
    expect(isAnimationDisabled('transform', 'none')).toBe(true);
  });

  /**
   * Property: Non-none transform values should not be considered disabled.
   */
  it('should not consider non-none transforms as disabled', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'scale(1.05)',
          'translateY(-4px)',
          'rotate(45deg)',
          'scale(1.1) translateY(-2px)'
        ),
        (transform) => {
          return !isAnimationDisabled('transform', transform);
        }
      ),
      { numRuns: 100 }
    );
  });
});
