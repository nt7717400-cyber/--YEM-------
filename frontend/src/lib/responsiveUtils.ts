/**
 * Responsive Utilities
 * أدوات الاستجابة للأجهزة المختلفة
 * 
 * Requirements: 8.2
 * - Mobile responsiveness
 * - Tablet responsiveness
 * - Desktop optimization
 */

// ============================================
// Types
// ============================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface ViewportInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isTouchDevice: boolean;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

// ============================================
// Constants
// ============================================

export const BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 640,      // sm
  tablet: 768,      // md
  desktop: 1024,    // lg
  largeDesktop: 1280, // xl
};

// 3D Viewer specific responsive settings
export const VIEWER_RESPONSIVE_CONFIG = {
  mobile: {
    height: 350,
    controlsSize: 'small',
    showKeyboardHints: false,
    touchSensitivity: 1.2,
    zoomRange: [4, 12],
  },
  tablet: {
    height: 400,
    controlsSize: 'medium',
    showKeyboardHints: false,
    touchSensitivity: 1.0,
    zoomRange: [3.5, 14],
  },
  desktop: {
    height: 450,
    controlsSize: 'normal',
    showKeyboardHints: true,
    touchSensitivity: 0.8,
    zoomRange: [3, 15],
  },
} as const;

// ============================================
// Viewport Detection
// ============================================

/**
 * Get current viewport information
 */
export function getViewportInfo(): ViewportInfo {
  if (typeof window === 'undefined') {
    return {
      width: 1024,
      height: 768,
      deviceType: 'desktop',
      orientation: 'landscape',
      isTouchDevice: false,
      pixelRatio: 1,
      safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;

  // Determine device type
  let deviceType: DeviceType = 'desktop';
  if (width < BREAKPOINTS.mobile) {
    deviceType = 'mobile';
  } else if (width < BREAKPOINTS.desktop) {
    deviceType = 'tablet';
  }

  // Determine orientation
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';

  // Check for touch device
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0;

  // Get safe area insets (for notched devices)
  const safeAreaInsets = getSafeAreaInsets();

  return {
    width,
    height,
    deviceType,
    orientation,
    isTouchDevice,
    pixelRatio,
    safeAreaInsets,
  };
}

/**
 * Get safe area insets for notched devices
 */
function getSafeAreaInsets(): ViewportInfo['safeAreaInsets'] {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10) || 
         parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10) ||
           parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) ||
            parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10) ||
          parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
}

// ============================================
// Responsive Helpers
// ============================================

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof ResponsiveBreakpoints): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  
  switch (breakpoint) {
    case 'mobile':
      return width < BREAKPOINTS.mobile;
    case 'tablet':
      return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop;
    case 'desktop':
      return width >= BREAKPOINTS.desktop && width < BREAKPOINTS.largeDesktop;
    case 'largeDesktop':
      return width >= BREAKPOINTS.largeDesktop;
    default:
      return false;
  }
}

/**
 * Get responsive value based on current viewport
 */
export function getResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const viewport = getViewportInfo();
  
  switch (viewport.deviceType) {
    case 'mobile':
      return values.mobile ?? values.default;
    case 'tablet':
      return values.tablet ?? values.default;
    case 'desktop':
      return values.desktop ?? values.default;
    default:
      return values.default;
  }
}

/**
 * Get viewer configuration for current device
 */
export function getViewerConfig() {
  const viewport = getViewportInfo();
  return VIEWER_RESPONSIVE_CONFIG[viewport.deviceType];
}

// ============================================
// CSS Helpers
// ============================================

/**
 * Generate responsive CSS classes
 */
export function getResponsiveClasses(baseClass: string): string {
  const viewport = getViewportInfo();
  const classes = [baseClass];
  
  classes.push(`${baseClass}--${viewport.deviceType}`);
  classes.push(`${baseClass}--${viewport.orientation}`);
  
  if (viewport.isTouchDevice) {
    classes.push(`${baseClass}--touch`);
  }
  
  return classes.join(' ');
}

/**
 * Calculate responsive font size
 */
export function getResponsiveFontSize(baseSizePx: number): number {
  const viewport = getViewportInfo();
  
  switch (viewport.deviceType) {
    case 'mobile':
      return Math.max(baseSizePx * 0.875, 12); // Min 12px
    case 'tablet':
      return baseSizePx * 0.9375;
    case 'desktop':
    default:
      return baseSizePx;
  }
}

/**
 * Calculate responsive spacing
 */
export function getResponsiveSpacing(baseSpacingPx: number): number {
  const viewport = getViewportInfo();
  
  switch (viewport.deviceType) {
    case 'mobile':
      return Math.max(baseSpacingPx * 0.75, 4);
    case 'tablet':
      return baseSpacingPx * 0.875;
    case 'desktop':
    default:
      return baseSpacingPx;
  }
}

// ============================================
// Touch Optimization
// ============================================

/**
 * Get touch-optimized settings
 */
export function getTouchSettings(): {
  minTouchTarget: number;
  touchSlop: number;
  longPressDelay: number;
  doubleTapDelay: number;
} {
  const viewport = getViewportInfo();
  
  if (!viewport.isTouchDevice) {
    return {
      minTouchTarget: 24,
      touchSlop: 8,
      longPressDelay: 500,
      doubleTapDelay: 300,
    };
  }
  
  // Touch devices need larger targets
  return {
    minTouchTarget: viewport.deviceType === 'mobile' ? 44 : 40,
    touchSlop: viewport.deviceType === 'mobile' ? 12 : 10,
    longPressDelay: 400,
    doubleTapDelay: 250,
  };
}

/**
 * Check if element meets minimum touch target size
 */
export function meetsMinTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const { minTouchTarget } = getTouchSettings();
  
  return rect.width >= minTouchTarget && rect.height >= minTouchTarget;
}

// ============================================
// Viewport Change Detection
// ============================================

type ViewportChangeCallback = (info: ViewportInfo) => void;
const viewportChangeCallbacks: Set<ViewportChangeCallback> = new Set();
let resizeObserver: ResizeObserver | null = null;

/**
 * Subscribe to viewport changes
 */
export function onViewportChange(callback: ViewportChangeCallback): () => void {
  viewportChangeCallbacks.add(callback);
  
  // Initialize observer if needed
  if (typeof window !== 'undefined' && !resizeObserver) {
    const handleResize = () => {
      const info = getViewportInfo();
      viewportChangeCallbacks.forEach(cb => cb(info));
    };
    
    // Use ResizeObserver if available
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);
    } else {
      // Fallback to resize event
      window.addEventListener('resize', handleResize);
    }
    
    // Also listen for orientation changes
    window.addEventListener('orientationchange', handleResize);
  }
  
  // Return unsubscribe function
  return () => {
    viewportChangeCallbacks.delete(callback);
  };
}

// ============================================
// Media Query Helpers
// ============================================

/**
 * Check if a media query matches
 */
export function matchMedia(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(query).matches;
}

/**
 * Common media queries
 */
export const mediaQueries = {
  mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  highContrast: '(prefers-contrast: high)',
} as const;

/**
 * Check for reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  return matchMedia(mediaQueries.reducedMotion);
}

/**
 * Check for dark mode preference
 */
export function prefersDarkMode(): boolean {
  return matchMedia(mediaQueries.darkMode);
}

const responsiveUtils = {
  getViewportInfo,
  matchesBreakpoint,
  getResponsiveValue,
  getViewerConfig,
  getResponsiveClasses,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getTouchSettings,
  meetsMinTouchTarget,
  onViewportChange,
  matchMedia,
  mediaQueries,
  prefersReducedMotion,
  prefersDarkMode,
  BREAKPOINTS,
  VIEWER_RESPONSIVE_CONFIG,
  getFormLayoutColumns,
};

// ============================================
// Form Layout Helpers - Requirements: 15.2
// ============================================

/**
 * Get the number of form columns based on viewport width
 * Forms should be single-column on mobile for better usability
 * 
 * @param viewportWidth - Current viewport width in pixels
 * @param maxColumns - Maximum columns on desktop (default: 2)
 * @returns Number of columns to display
 */
export function getFormLayoutColumns(viewportWidth: number, maxColumns: number = 2): number {
  // Mobile (< 640px): Always single column
  if (viewportWidth < BREAKPOINTS.mobile) {
    return 1;
  }
  
  // Tablet (640px - 1023px): 2 columns max
  if (viewportWidth < BREAKPOINTS.desktop) {
    return Math.min(2, maxColumns);
  }
  
  // Desktop (>= 1024px): Use maxColumns
  return maxColumns;
}

/**
 * Check if form should be in single-column layout
 * 
 * @param viewportWidth - Current viewport width in pixels
 * @returns true if form should be single-column
 */
export function isFormSingleColumn(viewportWidth: number): boolean {
  return viewportWidth < BREAKPOINTS.mobile;
}

export default responsiveUtils;
