import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BodyTypeSelector } from '@/components/admin/inspection/BodyTypeSelector';
import { ALL_BODY_TYPES, BODY_TYPE_LABELS } from '@/constants/inspection';

/**
 * Unit Tests for BodyTypeSelector Component
 * Requirements: 1.2
 * 
 * Note: Tests for dropdown interaction (opening/selecting) are skipped because
 * Radix UI Select component uses browser APIs (scrollIntoView, hasPointerCapture)
 * that are not fully supported in jsdom. The component functionality is verified
 * through integration/E2E tests in a real browser environment.
 */
describe('BodyTypeSelector', () => {
  it('renders with placeholder when no value is selected', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} />);
    
    expect(screen.getByText('اختر نوع الهيكل')).toBeInTheDocument();
  });

  it('renders the label in Arabic', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} />);
    
    expect(screen.getByText('نوع الهيكل')).toBeInTheDocument();
  });

  it('displays the selected value correctly for each body type', () => {
    const onChange = vi.fn();
    
    // Test each body type displays correctly when selected
    for (const type of ALL_BODY_TYPES) {
      const { unmount } = render(<BodyTypeSelector value={type} onChange={onChange} />);
      expect(screen.getByText(BODY_TYPE_LABELS[type])).toBeInTheDocument();
      unmount();
    }
  });

  it('verifies all 9 body types are defined', () => {
    // Verify the constants have all 9 body types
    expect(ALL_BODY_TYPES).toHaveLength(9);
    expect(ALL_BODY_TYPES).toContain('sedan');
    expect(ALL_BODY_TYPES).toContain('hatchback');
    expect(ALL_BODY_TYPES).toContain('coupe');
    expect(ALL_BODY_TYPES).toContain('suv');
    expect(ALL_BODY_TYPES).toContain('crossover');
    expect(ALL_BODY_TYPES).toContain('pickup');
    expect(ALL_BODY_TYPES).toContain('van');
    expect(ALL_BODY_TYPES).toContain('minivan');
    expect(ALL_BODY_TYPES).toContain('truck');
  });

  it('verifies all body types have Arabic labels', () => {
    for (const type of ALL_BODY_TYPES) {
      expect(BODY_TYPE_LABELS[type]).toBeDefined();
      expect(typeof BODY_TYPE_LABELS[type]).toBe('string');
      expect(BODY_TYPE_LABELS[type].length).toBeGreaterThan(0);
    }
  });

  it('is disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} disabled={true} />);
    
    const trigger = screen.getByTestId('body-type-trigger');
    expect(trigger).toBeDisabled();
  });

  it('is enabled when disabled prop is false', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} disabled={false} />);
    
    const trigger = screen.getByTestId('body-type-trigger');
    expect(trigger).not.toBeDisabled();
  });

  it('has RTL direction for Arabic support', () => {
    const onChange = vi.fn();
    const { container } = render(<BodyTypeSelector value={null} onChange={onChange} />);
    
    const wrapper = container.querySelector('[dir="rtl"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders trigger with correct test id', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} />);
    
    expect(screen.getByTestId('body-type-trigger')).toBeInTheDocument();
  });

  it('renders as a combobox role', () => {
    const onChange = vi.fn();
    render(<BodyTypeSelector value={null} onChange={onChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
