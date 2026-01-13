'use client';

/**
 * CarViewerWithFallback Component
 * Now uses only 2D fallback since 3D viewer has been removed
 * Requirements: 11.4 - Updated to use 2D viewer
 */

import React from 'react';
import type { BodyType, BodyPartId, PartStatus } from '@/types/inspection';
import Car2DFallback from './Car2DFallback';

export interface CarViewerWithFallbackProps {
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  onPartClick: (partId: BodyPartId) => void;
  readOnly?: boolean;
  force2D?: boolean; // Kept for API compatibility, always uses 2D now
  /** Show browser compatibility warnings */
  showWarnings?: boolean;
}

export function CarViewerWithFallback({
  bodyType,
  partsStatus,
  onPartClick,
  readOnly = false,
}: CarViewerWithFallbackProps) {
  return (
    <Car2DFallback
      partsStatus={partsStatus}
      onPartClick={onPartClick}
      readOnly={readOnly}
      bodyType={bodyType}
    />
  );
}

export default CarViewerWithFallback;
