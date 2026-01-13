/**
 * Feature: web-ui-ux-enhancement
 * Property 28: Component Keyboard Navigation
 * 
 * *For any* UI component (Button, Input, Select, Modal, etc.), it should be
 * focusable via Tab key and operable via keyboard.
 * 
 * **Validates: Requirements 18.8**
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Button } from '@/components/ui/button';

// ============================================
// Types
// ============================================

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonConfig {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  isLoading: boolean;
  label: string;
}

// ============================================
// Arbitraries (Generators)
// ============================================

const buttonVariantArbitrary = fc.constantFrom<ButtonVariant>(
  'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
);

const buttonSizeArbitrary = fc.constantFrom<ButtonSize>(
  'default', 'sm', 'lg', 'icon'
);

const buttonLabelArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0);

const buttonConfigArbitrary: fc.Arbitrary<ButtonConfig> = fc.record({
  variant: buttonVariantArbitrary,
  size: buttonSizeArbitrary,
  disabled: fc.boolean(),
  isLoading: fc.boolean(),
  label: buttonLabelArbitrary,
});

// ============================================
// Test Helpers
// ============================================

/**
 * Renders a Button with the given configuration
 */
function renderButton(config: ButtonConfig) {
  return render(
    <Button
      variant={config.variant}
      size={config.size}
      disabled={config.disabled}
      isLoading={config.isLoading}
      data-testid="test-button"
    >
      {config.label}
    </Button>
  );
}

// ============================================
// Property Tests
// ============================================

describe('Property 28: Component Keyboard Navigation', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property: For any Button configuration, the button should be rendered
   * as a focusable element (unless disabled or loading).
   */
  it('should render Button as a focusable element when not disabled', () => {
    fc.assert(
      fc.property(buttonConfigArbitrary, (config) => {
        cleanup();
        renderButton(config);
        
        const button = screen.getByTestId('test-button');
        
        // Button should exist
        expect(button).toBeInTheDocument();
        
        // Button should be a button element
        expect(button.tagName.toLowerCase()).toBe('button');
        
        // If not disabled and not loading, should be focusable
        if (!config.disabled && !config.isLoading) {
          expect(button).not.toBeDisabled();
        } else {
          expect(button).toBeDisabled();
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any enabled Button, it should receive focus when tabbed to.
   */
  it('should receive focus via Tab key when enabled', async () => {
    const user = userEvent.setup();
    
    // Test with a few specific configurations to avoid async issues with fc.assert
    const configs: ButtonConfig[] = [
      { variant: 'default', size: 'default', disabled: false, isLoading: false, label: 'Click me' },
      { variant: 'outline', size: 'lg', disabled: false, isLoading: false, label: 'Submit' },
      { variant: 'ghost', size: 'sm', disabled: false, isLoading: false, label: 'Cancel' },
      { variant: 'secondary', size: 'icon', disabled: false, isLoading: false, label: 'X' },
    ];
    
    for (const config of configs) {
      cleanup();
      renderButton(config);
      
      const button = screen.getByTestId('test-button');
      
      // Tab to the button
      await user.tab();
      
      // Button should have focus
      expect(button).toHaveFocus();
    }
  });

  /**
   * Property: For any disabled Button, it should not receive focus.
   */
  it('should not receive focus when disabled', async () => {
    const user = userEvent.setup();
    
    const configs: ButtonConfig[] = [
      { variant: 'default', size: 'default', disabled: true, isLoading: false, label: 'Disabled' },
      { variant: 'outline', size: 'lg', disabled: true, isLoading: false, label: 'Disabled' },
    ];
    
    for (const config of configs) {
      cleanup();
      
      // Render with a focusable element before the button
      render(
        <div>
          <input data-testid="before-input" />
          <Button
            variant={config.variant}
            size={config.size}
            disabled={config.disabled}
            data-testid="test-button"
          >
            {config.label}
          </Button>
          <input data-testid="after-input" />
        </div>
      );
      
      const button = screen.getByTestId('test-button');
      const afterInput = screen.getByTestId('after-input');
      
      // Tab through elements
      await user.tab(); // Focus first input
      await user.tab(); // Should skip disabled button and go to after input
      
      // Button should not have focus
      expect(button).not.toHaveFocus();
      // After input should have focus (skipped the disabled button)
      expect(afterInput).toHaveFocus();
    }
  });

  /**
   * Property: For any loading Button, it should be disabled and not focusable.
   */
  it('should be disabled when loading', async () => {
    const configs: ButtonConfig[] = [
      { variant: 'default', size: 'default', disabled: false, isLoading: true, label: 'Loading' },
      { variant: 'destructive', size: 'lg', disabled: false, isLoading: true, label: 'Processing' },
    ];
    
    for (const config of configs) {
      cleanup();
      
      render(
        <div>
          <input data-testid="before-input" />
          <Button
            variant={config.variant}
            size={config.size}
            disabled={config.disabled}
            isLoading={config.isLoading}
            data-testid="test-button"
          >
            {config.label}
          </Button>
          <input data-testid="after-input" />
        </div>
      );
      
      const button = screen.getByTestId('test-button');
      
      // Button should be disabled when loading
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    }
  });

  /**
   * Property: For any Button variant, it should have proper focus-visible styles.
   * This tests that the button has the focus-visible classes applied.
   */
  it('should have focus-visible styles for all variants', () => {
    fc.assert(
      fc.property(buttonVariantArbitrary, (variant) => {
        cleanup();
        
        render(
          <Button variant={variant} data-testid="test-button">
            Test
          </Button>
        );
        
        const button = screen.getByTestId('test-button');
        const className = button.className;
        
        // Should have focus-visible ring styles
        expect(className).toContain('focus-visible:ring');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any Button, clicking via keyboard (Enter/Space) should work.
   */
  it('should be operable via Enter key', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    render(
      <Button
        onClick={() => { clicked = true; }}
        data-testid="test-button"
      >
        Click me
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();
    
    // Press Enter
    await user.keyboard('{Enter}');
    
    // Should have triggered click
    expect(clicked).toBe(true);
  });

  /**
   * Property: For any Button, clicking via Space key should work.
   */
  it('should be operable via Space key', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    render(
      <Button
        onClick={() => { clicked = true; }}
        data-testid="test-button"
      >
        Click me
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();
    
    // Press Space
    await user.keyboard(' ');
    
    // Should have triggered click
    expect(clicked).toBe(true);
  });

  /**
   * Property: For any disabled Button, keyboard activation should not work.
   */
  it('should not be operable via keyboard when disabled', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    render(
      <div>
        <Button
          onClick={() => { clicked = true; }}
          disabled
          data-testid="test-button"
        >
          Disabled
        </Button>
      </div>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Try to focus and click
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    
    // Should not have triggered click
    expect(clicked).toBe(false);
  });

  /**
   * Property: For any Button with loading state, keyboard activation should not work.
   */
  it('should not be operable via keyboard when loading', async () => {
    const user = userEvent.setup();
    let clicked = false;
    
    render(
      <Button
        onClick={() => { clicked = true; }}
        isLoading
        data-testid="test-button"
      >
        Loading
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Try to focus and click
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    
    // Should not have triggered click
    expect(clicked).toBe(false);
  });

  /**
   * Property: Button should have proper ARIA attributes.
   */
  it('should have proper ARIA attributes', () => {
    fc.assert(
      fc.property(buttonConfigArbitrary, (config) => {
        cleanup();
        renderButton(config);
        
        const button = screen.getByTestId('test-button');
        
        // Check aria-disabled matches disabled/loading state
        const isDisabled = config.disabled || config.isLoading;
        expect(button.getAttribute('aria-disabled')).toBe(String(isDisabled));
        
        // Check aria-busy for loading state
        expect(button.getAttribute('aria-busy')).toBe(String(config.isLoading));
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading button should show loading spinner.
   */
  it('should show loading spinner when isLoading is true', () => {
    render(
      <Button isLoading data-testid="test-button">
        Submit
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Should contain the loading spinner (Loader2 icon with animate-spin class)
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  /**
   * Property: Button should display loadingText when provided during loading.
   */
  it('should display loadingText when loading', () => {
    render(
      <Button isLoading loadingText="Processing..." data-testid="test-button">
        Submit
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Should show loading text
    expect(button).toHaveTextContent('Processing...');
  });

  /**
   * Property: Button should display children as loading text when loadingText not provided.
   */
  it('should display children as loading text when loadingText not provided', () => {
    render(
      <Button isLoading data-testid="test-button">
        Submit
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    
    // Should show children text
    expect(button).toHaveTextContent('Submit');
  });
});
