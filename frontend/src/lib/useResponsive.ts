/**
 * useResponsive Hook
 * خطاف الاستجابة للأجهزة المختلفة
 * 
 * Requirements: 8.2
 * - React hook for responsive behavior
 * - Mobile/tablet/desktop detection
 * - Viewport change handling
 */

import { useState, useEffect } from 'react';
import {
  getViewportInfo,
  onViewportChange,
  getViewerConfig,
  getTouchSettings,
  prefersReducedMotion,
  type ViewportInfo,
  type DeviceType,
} from './responsiveUtils';

// ============================================
// Types
// ============================================

export interface UseResponsiveResult {
  /** Current viewport information */
  viewport: ViewportInfo;
  /** Current device type */
  deviceType: DeviceType;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Whether device is tablet */
  isTablet: boolean;
  /** Whether device is desktop */
  isDesktop: boolean;
  /** Whether device supports touch */
  isTouchDevice: boolean;
  /** Current orientation */
  orientation: 'portrait' | 'landscape';
  /** Whether user prefers reduced motion */
  reducedMotion: boolean;
  /** Viewer configuration for current device */
  viewerConfig: ReturnType<typeof getViewerConfig>;
  /** Touch settings for current device */
  touchSettings: ReturnType<typeof getTouchSettings>;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * React hook for responsive behavior
 */
export function useResponsive(): UseResponsiveResult {
  const [viewport, setViewport] = useState<ViewportInfo>(() => getViewportInfo());
  const [reducedMotion, setReducedMotion] = useState(false);

  // Update viewport on changes
  useEffect(() => {
    // Initial viewport
    setViewport(getViewportInfo());
    setReducedMotion(prefersReducedMotion());

    // Subscribe to viewport changes
    const unsubscribe = onViewportChange((info) => {
      setViewport(info);
    });

    // Listen for reduced motion preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        unsubscribe();
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    return unsubscribe;
  }, []);

  // Computed values
  const deviceType = viewport.deviceType;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isTouchDevice = viewport.isTouchDevice;
  const orientation = viewport.orientation;

  // Get device-specific configurations
  const viewerConfig = getViewerConfig();
  const touchSettings = getTouchSettings();

  return {
    viewport,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    orientation,
    reducedMotion,
    viewerConfig,
    touchSettings,
  };
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * Hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const info = getViewportInfo();
    setIsMobile(info.deviceType === 'mobile');

    const unsubscribe = onViewportChange((info) => {
      setIsMobile(info.deviceType === 'mobile');
    });

    return unsubscribe;
  }, []);

  return isMobile;
}

/**
 * Hook to check if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const info = getViewportInfo();
    setIsTouch(info.isTouchDevice);
  }, []);

  return isTouch;
}

/**
 * Hook to get current orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const info = getViewportInfo();
    setOrientation(info.orientation);

    const unsubscribe = onViewportChange((info) => {
      setOrientation(info.orientation);
    });

    return unsubscribe;
  }, []);

  return orientation;
}

/**
 * Hook to check for reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return reducedMotion;
}

/**
 * Hook to get viewer height based on device
 */
export function useViewerHeight(): number {
  const [height, setHeight] = useState(450);

  useEffect(() => {
    const config = getViewerConfig();
    setHeight(config.height);

    const unsubscribe = onViewportChange(() => {
      const config = getViewerConfig();
      setHeight(config.height);
    });

    return unsubscribe;
  }, []);

  return height;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to set dynamic viewport height (fixes iOS 100vh issue)
 */
export function useDynamicVH(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
}

export default useResponsive;
