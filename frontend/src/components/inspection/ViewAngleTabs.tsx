'use client';

/**
 * ViewAngleTabs Component
 * Navigation tabs for switching between view angles
 * Requirements: 1.1, 1.6
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ViewAngleTabsProps, ViewAngle } from '@/types/vds';
import { ALL_VIEW_ANGLES, VIEW_ANGLE_LABELS } from '@/constants/vds';

// Icons for each view angle
const ViewAngleIcons: Record<ViewAngle, React.ReactNode> = {
  front: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <circle cx="8" cy="14" r="1.5" />
      <circle cx="16" cy="14" r="1.5" />
    </svg>
  ),
  rear: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <rect x="7" y="12" width="4" height="3" rx="0.5" />
      <rect x="13" y="12" width="4" height="3" rx="0.5" />
    </svg>
  ),
  left_side: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 14h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
      <path d="M4 14V10a2 2 0 0 1 2-2h4l2-2h4a2 2 0 0 1 2 2v6" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  ),
  right_side: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 14H2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4z" />
      <path d="M20 14V10a2 2 0 0 0-2-2h-4l-2-2H8a2 2 0 0 0-2 2v6" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="6" cy="18" r="2" />
    </svg>
  ),
  top: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M6 8h12" />
      <path d="M6 16h12" />
    </svg>
  ),
};

/**
 * ViewAngleTabs - Navigation tabs for view angles
 */
export function ViewAngleTabs({
  currentAngle,
  onAngleChange,
  availableAngles = ALL_VIEW_ANGLES,
  language = 'ar',
  className,
}: ViewAngleTabsProps) {
  return (
    <div className={cn(
      'flex gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap',
      'scrollbar-hide',
      className
    )}>
      {availableAngles.map((angle) => {
        const isActive = currentAngle === angle;
        const label = VIEW_ANGLE_LABELS[angle]?.[language] || angle;
        
        return (
          <button
            key={angle}
            type="button"
            onClick={() => onAngleChange(angle)}
            className={cn(
              'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
              'border focus:outline-none focus:ring-2 focus:ring-primary/50',
              'whitespace-nowrap flex-shrink-0',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
            )}
            aria-pressed={isActive}
            aria-label={label}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5">{ViewAngleIcons[angle]}</span>
            <span className="hidden xs:inline sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ViewAngleTabs;
