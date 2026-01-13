import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MechanicalStatusForm } from '@/components/admin/inspection/MechanicalStatusForm';
import {
  ENGINE_STATUS_LABELS,
  TRANSMISSION_STATUS_LABELS,
  CHASSIS_STATUS_LABELS,
} from '@/constants/inspection';
import type { MechanicalStatus } from '@/types/inspection';

/**
 * Unit Tests for MechanicalStatusForm Component
 * Requirements: 5.2, 5.3, 5.4
 */
describe('MechanicalStatusForm', () => {
  const defaultValue: MechanicalStatus = {
    engine: 'original',
    transmission: 'original',
    chassis: 'intact',
    technicalNotes: '',
  };

  const defaultProps = {
    value: defaultValue,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with Arabic title', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    expect(screen.getByText('الحالة الميكانيكية')).toBeInTheDocument();
  });

  it('renders all four fields', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    // Check all labels are present
    expect(screen.getByText('حالة المكينة')).toBeInTheDocument();
    expect(screen.getByText('حالة القير')).toBeInTheDocument();
    expect(screen.getByText('حالة الشاصي')).toBeInTheDocument();
    expect(screen.getByText('الملاحظات الفنية')).toBeInTheDocument();
  });

  it('renders engine status dropdown with trigger', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    expect(screen.getByTestId('engine-status-trigger')).toBeInTheDocument();
  });

  it('renders transmission status dropdown with trigger', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    expect(screen.getByTestId('transmission-status-trigger')).toBeInTheDocument();
  });

  it('renders chassis status dropdown with trigger', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    expect(screen.getByTestId('chassis-status-trigger')).toBeInTheDocument();
  });

  it('renders technical notes textarea', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    expect(screen.getByTestId('technical-notes-textarea')).toBeInTheDocument();
  });

  it('displays selected engine status value', () => {
    render(<MechanicalStatusForm {...defaultProps} value={{ ...defaultValue, engine: 'replaced' }} />);
    
    expect(screen.getByText(ENGINE_STATUS_LABELS['replaced'])).toBeInTheDocument();
  });

  it('displays selected transmission status value', () => {
    render(<MechanicalStatusForm {...defaultProps} value={{ ...defaultValue, transmission: 'replaced' }} />);
    
    expect(screen.getByText(TRANSMISSION_STATUS_LABELS['replaced'])).toBeInTheDocument();
  });

  it('displays selected chassis status value', () => {
    render(<MechanicalStatusForm {...defaultProps} value={{ ...defaultValue, chassis: 'accident_affected' }} />);
    
    expect(screen.getByText(CHASSIS_STATUS_LABELS['accident_affected'])).toBeInTheDocument();
  });

  it('displays technical notes value', () => {
    const notes = 'ملاحظة اختبارية';
    render(<MechanicalStatusForm {...defaultProps} value={{ ...defaultValue, technicalNotes: notes }} />);
    
    const textarea = screen.getByTestId('technical-notes-textarea');
    expect(textarea).toHaveValue(notes);
  });

  it('calls onChange when technical notes are updated', () => {
    const onChange = vi.fn();
    render(<MechanicalStatusForm {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByTestId('technical-notes-textarea');
    fireEvent.change(textarea, { target: { value: 'ملاحظة جديدة' } });
    
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...defaultValue,
      technicalNotes: 'ملاحظة جديدة',
    });
  });

  it('verifies all 3 engine status options are defined', () => {
    expect(Object.keys(ENGINE_STATUS_LABELS)).toHaveLength(3);
    expect(ENGINE_STATUS_LABELS['original']).toBe('أصلية');
    expect(ENGINE_STATUS_LABELS['replaced']).toBe('تم تغييرها');
    expect(ENGINE_STATUS_LABELS['refurbished']).toBe('مجددة');
  });

  it('verifies all 2 transmission status options are defined', () => {
    expect(Object.keys(TRANSMISSION_STATUS_LABELS)).toHaveLength(2);
    expect(TRANSMISSION_STATUS_LABELS['original']).toBe('أصلي');
    expect(TRANSMISSION_STATUS_LABELS['replaced']).toBe('تم تغييره');
  });

  it('verifies all 3 chassis status options are defined', () => {
    expect(Object.keys(CHASSIS_STATUS_LABELS)).toHaveLength(3);
    expect(CHASSIS_STATUS_LABELS['intact']).toBe('سليم');
    expect(CHASSIS_STATUS_LABELS['accident_affected']).toBe('متأثر بحادث');
    expect(CHASSIS_STATUS_LABELS['modified']).toBe('معدل');
  });

  it('disables all fields when disabled prop is true', () => {
    render(<MechanicalStatusForm {...defaultProps} disabled={true} />);
    
    expect(screen.getByTestId('engine-status-trigger')).toBeDisabled();
    expect(screen.getByTestId('transmission-status-trigger')).toBeDisabled();
    expect(screen.getByTestId('chassis-status-trigger')).toBeDisabled();
    expect(screen.getByTestId('technical-notes-textarea')).toBeDisabled();
  });

  it('enables all fields when disabled prop is false', () => {
    render(<MechanicalStatusForm {...defaultProps} disabled={false} />);
    
    expect(screen.getByTestId('engine-status-trigger')).not.toBeDisabled();
    expect(screen.getByTestId('transmission-status-trigger')).not.toBeDisabled();
    expect(screen.getByTestId('chassis-status-trigger')).not.toBeDisabled();
    expect(screen.getByTestId('technical-notes-textarea')).not.toBeDisabled();
  });

  it('has RTL direction for Arabic support', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    const form = screen.getByTestId('mechanical-status-form');
    expect(form).toHaveAttribute('dir', 'rtl');
  });

  it('textarea has correct placeholder text', () => {
    render(<MechanicalStatusForm {...defaultProps} />);
    
    const textarea = screen.getByTestId('technical-notes-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'أدخل أي ملاحظات فنية إضافية...');
  });
});
