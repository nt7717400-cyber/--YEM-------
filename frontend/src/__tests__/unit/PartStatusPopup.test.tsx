import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartStatusPopup } from '@/components/admin/inspection/PartStatusPopup';
import { ALL_PART_STATUSES, PART_STATUS_CONFIG, BODY_PART_LABELS } from '@/constants/inspection';
import type { BodyPartId, PartStatus } from '@/types/inspection';

/**
 * Unit Tests for PartStatusPopup Component
 * Requirements: 4.1, 4.2
 */
describe('PartStatusPopup', () => {
  const defaultProps = {
    partId: 'front_bumper' as BodyPartId,
    currentStatus: 'original' as PartStatus,
    onStatusSelect: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the popup with correct part name in Arabic', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    expect(screen.getByTestId('popup-part-name')).toHaveTextContent(
      BODY_PART_LABELS[defaultProps.partId]
    );
  });

  it('displays all 6 status options', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    // Verify all 6 status options are rendered
    expect(ALL_PART_STATUSES).toHaveLength(6);
    for (const status of ALL_PART_STATUSES) {
      expect(screen.getByTestId(`status-option-${status}`)).toBeInTheDocument();
    }
  });

  it('displays correct labels for all status options', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    for (const status of ALL_PART_STATUSES) {
      const config = PART_STATUS_CONFIG[status];
      expect(screen.getByText(config.label)).toBeInTheDocument();
    }
  });

  it('displays correct icons for all status options', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    for (const status of ALL_PART_STATUSES) {
      const config = PART_STATUS_CONFIG[status];
      expect(screen.getByText(config.icon)).toBeInTheDocument();
    }
  });

  it('displays correct colors for all status options', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    for (const status of ALL_PART_STATUSES) {
      const config = PART_STATUS_CONFIG[status];
      const colorIndicator = screen.getByTestId(`status-color-${status}`);
      expect(colorIndicator).toHaveStyle({ backgroundColor: config.color });
    }
  });

  it('calls onStatusSelect when a status option is clicked', () => {
    const onStatusSelect = vi.fn();
    render(<PartStatusPopup {...defaultProps} onStatusSelect={onStatusSelect} />);
    
    // Click on 'painted' status
    fireEvent.click(screen.getByTestId('status-option-painted'));
    
    expect(onStatusSelect).toHaveBeenCalledTimes(1);
    expect(onStatusSelect).toHaveBeenCalledWith('painted');
  });

  it('calls onStatusSelect with correct status for each option', () => {
    const onStatusSelect = vi.fn();
    render(<PartStatusPopup {...defaultProps} onStatusSelect={onStatusSelect} />);
    
    for (const status of ALL_PART_STATUSES) {
      fireEvent.click(screen.getByTestId(`status-option-${status}`));
      expect(onStatusSelect).toHaveBeenLastCalledWith(status);
    }
    
    expect(onStatusSelect).toHaveBeenCalledTimes(ALL_PART_STATUSES.length);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<PartStatusPopup {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId('popup-close-button'));
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('highlights the currently selected status', () => {
    render(<PartStatusPopup {...defaultProps} currentStatus="accident" />);
    
    const selectedOption = screen.getByTestId('status-option-accident');
    expect(selectedOption).toHaveAttribute('aria-checked', 'true');
    
    // Other options should not be selected
    const otherOption = screen.getByTestId('status-option-original');
    expect(otherOption).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with RTL direction for Arabic support', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    const popup = screen.getByTestId('part-status-popup');
    expect(popup).toHaveAttribute('dir', 'rtl');
  });

  it('has correct accessibility attributes', () => {
    render(<PartStatusPopup {...defaultProps} />);
    
    const popup = screen.getByTestId('part-status-popup');
    expect(popup).toHaveAttribute('role', 'dialog');
    expect(popup).toHaveAttribute('aria-modal', 'true');
  });

  it('renders different part names correctly', () => {
    const partIds: BodyPartId[] = ['hood', 'roof', 'trunk', 'front_left_door'];
    
    for (const partId of partIds) {
      const { unmount } = render(
        <PartStatusPopup {...defaultProps} partId={partId} />
      );
      
      expect(screen.getByTestId('popup-part-name')).toHaveTextContent(
        BODY_PART_LABELS[partId]
      );
      
      unmount();
    }
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<PartStatusPopup {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
