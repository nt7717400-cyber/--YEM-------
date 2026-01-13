'use client';

import * as React from 'react';
import { BODY_PART_LABELS, PART_STATUS_CONFIG, ALL_PART_STATUSES } from '@/constants/inspection';
import type { BodyPartId, PartStatus } from '@/types/inspection';

/**
 * PartStatusPopup Props
 * Requirements: 4.1, 4.2
 */
export interface PartStatusPopupProps {
  partId: BodyPartId;
  currentStatus: PartStatus;
  onStatusSelect: (status: PartStatus) => void;
  onClose: () => void;
}

/**
 * PartStatusPopup Component
 * Popup for selecting the status of a car body part
 * Requirements: 4.1 - Display status selection popup when body part is clicked
 * Requirements: 4.2 - Include 6 status options with colors and icons
 */
export function PartStatusPopup({
  partId,
  currentStatus,
  onStatusSelect,
  onClose,
}: PartStatusPopupProps) {
  // Handle click outside to close
  const popupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px]"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      data-testid="part-status-popup"
    >
      {/* Header with part name and close button */}
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h3
          id="popup-title"
          className="text-lg font-semibold text-gray-900"
          data-testid="popup-part-name"
        >
          {BODY_PART_LABELS[partId]}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="إغلاق"
          data-testid="popup-close-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Status options */}
      <div className="space-y-2" role="radiogroup" aria-label="حالة الجزء">
        {ALL_PART_STATUSES.map((status) => {
          const config = PART_STATUS_CONFIG[status];
          const isSelected = status === currentStatus;

          return (
            <button
              key={status}
              onClick={() => onStatusSelect(status)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={isSelected}
              data-testid={`status-option-${status}`}
            >
              {/* Color indicator */}
              <span
                className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-300"
                style={{ backgroundColor: config.color }}
                data-testid={`status-color-${status}`}
              />
              
              {/* Icon */}
              <span className="text-xl" aria-hidden="true">
                {config.icon}
              </span>
              
              {/* Label */}
              <span className="flex-1 text-right font-medium text-gray-700">
                {config.label}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PartStatusPopup;
