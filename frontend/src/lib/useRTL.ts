/**
 * useRTL Hook
 * خطاف دعم RTL
 * 
 * Requirements: 8.4
 * - React hook for RTL support
 * - Direction detection
 * - RTL-aware utilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  isRTL,
  isArabic,
  getDocumentDirection,
  flipHorizontal,
  toLogicalPosition,
  toPhysicalPosition,
  getRTLStyles,
  getRTLClasses,
  formatArabicNumber,
  formatArabicPercentage,
  getRTLCameraPosition,
  getRTLArrowKey,
  type TextDirection,
} from './rtlUtils';

// ============================================
// Types
// ============================================

export interface UseRTLResult {
  /** Current text direction */
  direction: TextDirection;
  /** Whether direction is RTL */
  isRTL: boolean;
  /** Whether language is Arabic */
  isArabic: boolean;
  /** Flip horizontal position */
  flipHorizontal: (position: 'left' | 'right') => 'left' | 'right';
  /** Convert to logical position */
  toLogical: (position: 'left' | 'right') => 'start' | 'end';
  /** Convert to physical position */
  toPhysical: (position: 'start' | 'end') => 'left' | 'right';
  /** Get RTL-aware styles */
  getStyles: typeof getRTLStyles;
  /** Get RTL-aware classes */
  getClasses: typeof getRTLClasses;
  /** Format number for Arabic */
  formatNumber: (num: number) => string;
  /** Format percentage for Arabic */
  formatPercentage: (value: number) => string;
  /** Get RTL camera position */
  getCameraPosition: (position: [number, number, number]) => [number, number, number];
  /** Get RTL arrow key */
  getArrowKey: (key: 'ArrowLeft' | 'ArrowRight') => 'ArrowLeft' | 'ArrowRight';
}

// ============================================
// Hook Implementation
// ============================================

/**
 * React hook for RTL support
 */
export function useRTL(): UseRTLResult {
  const [direction, setDirection] = useState<TextDirection>('rtl');
  const [arabic, setArabic] = useState(true);

  // Update direction on mount and when document changes
  useEffect(() => {
    const updateDirection = () => {
      setDirection(getDocumentDirection());
      setArabic(isArabic());
    };

    updateDirection();

    // Watch for direction changes
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            (mutation.attributeName === 'dir' || mutation.attributeName === 'lang')
          ) {
            updateDirection();
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir', 'lang'],
      });

      return () => observer.disconnect();
    }
  }, []);

  // Memoized utilities
  const rtl = direction === 'rtl';

  const flipHorizontalFn = useCallback(
    (position: 'left' | 'right') => flipHorizontal(position),
    []
  );

  const toLogicalFn = useCallback(
    (position: 'left' | 'right') => toLogicalPosition(position),
    []
  );

  const toPhysicalFn = useCallback(
    (position: 'start' | 'end') => toPhysicalPosition(position),
    []
  );

  const formatNumberFn = useCallback(
    (num: number) => formatArabicNumber(num),
    []
  );

  const formatPercentageFn = useCallback(
    (value: number) => formatArabicPercentage(value),
    []
  );

  const getCameraPositionFn = useCallback(
    (position: [number, number, number]) => getRTLCameraPosition(position),
    []
  );

  const getArrowKeyFn = useCallback(
    (key: 'ArrowLeft' | 'ArrowRight') => getRTLArrowKey(key),
    []
  );

  return {
    direction,
    isRTL: rtl,
    isArabic: arabic,
    flipHorizontal: flipHorizontalFn,
    toLogical: toLogicalFn,
    toPhysical: toPhysicalFn,
    getStyles: getRTLStyles,
    getClasses: getRTLClasses,
    formatNumber: formatNumberFn,
    formatPercentage: formatPercentageFn,
    getCameraPosition: getCameraPositionFn,
    getArrowKey: getArrowKeyFn,
  };
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * Hook to check if direction is RTL
 */
export function useIsRTL(): boolean {
  const [rtl, setRTL] = useState(true);

  useEffect(() => {
    setRTL(isRTL());

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        setRTL(isRTL());
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir'],
      });

      return () => observer.disconnect();
    }
  }, []);

  return rtl;
}

/**
 * Hook to get text direction
 */
export function useDirection(): TextDirection {
  const [direction, setDirection] = useState<TextDirection>('rtl');

  useEffect(() => {
    setDirection(getDocumentDirection());

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        setDirection(getDocumentDirection());
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir'],
      });

      return () => observer.disconnect();
    }
  }, []);

  return direction;
}

/**
 * Hook for RTL-aware keyboard navigation
 */
export function useRTLKeyboard(): {
  getArrowKey: (key: 'ArrowLeft' | 'ArrowRight') => 'ArrowLeft' | 'ArrowRight';
  isForward: (key: string) => boolean;
  isBackward: (key: string) => boolean;
} {
  const rtl = useIsRTL();

  const getArrowKey = useCallback(
    (key: 'ArrowLeft' | 'ArrowRight'): 'ArrowLeft' | 'ArrowRight' => {
      if (!rtl) return key;
      return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    },
    [rtl]
  );

  const isForward = useCallback(
    (key: string): boolean => {
      const forwardKeys = rtl ? ['ArrowLeft', 'KeyA'] : ['ArrowRight', 'KeyD'];
      return forwardKeys.includes(key);
    },
    [rtl]
  );

  const isBackward = useCallback(
    (key: string): boolean => {
      const backwardKeys = rtl ? ['ArrowRight', 'KeyD'] : ['ArrowLeft', 'KeyA'];
      return backwardKeys.includes(key);
    },
    [rtl]
  );

  return { getArrowKey, isForward, isBackward };
}

/**
 * Hook for RTL-aware number formatting
 */
export function useArabicNumbers(): {
  format: (num: number) => string;
  formatPercent: (value: number) => string;
} {
  const arabic = useMemo(() => isArabic(), []);

  const format = useCallback(
    (num: number): string => {
      if (!arabic) return num.toString();
      return formatArabicNumber(num);
    },
    [arabic]
  );

  const formatPercent = useCallback(
    (value: number): string => {
      return formatArabicPercentage(value);
    },
    []
  );

  return { format, formatPercent };
}

export default useRTL;
