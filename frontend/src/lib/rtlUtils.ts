/**
 * RTL (Right-to-Left) Utilities
 * أدوات دعم اللغات من اليمين إلى اليسار
 * 
 * Requirements: 16.5
 * - Text alignment for RTL
 * - Element direction handling
 * - Bidirectional text support
 * - Logical properties support
 */

// ============================================
// Types
// ============================================

export type TextDirection = 'rtl' | 'ltr';

export interface RTLConfig {
  /** Current text direction */
  direction: TextDirection;
  /** Whether to flip horizontal positions */
  flipHorizontal: boolean;
  /** Text alignment */
  textAlign: 'start' | 'end' | 'right' | 'left' | 'center';
}

/**
 * Logical property mapping for CSS
 * Maps physical properties to logical equivalents
 */
export interface LogicalPropertyMap {
  marginLeft: 'marginInlineStart';
  marginRight: 'marginInlineEnd';
  paddingLeft: 'paddingInlineStart';
  paddingRight: 'paddingInlineEnd';
  left: 'insetInlineStart';
  right: 'insetInlineEnd';
  borderLeft: 'borderInlineStart';
  borderRight: 'borderInlineEnd';
  borderTopLeftRadius: 'borderStartStartRadius';
  borderTopRightRadius: 'borderStartEndRadius';
  borderBottomLeftRadius: 'borderEndStartRadius';
  borderBottomRightRadius: 'borderEndEndRadius';
}

// ============================================
// Direction Detection
// ============================================

/**
 * Get current document direction
 */
export function getDocumentDirection(): TextDirection {
  if (typeof document === 'undefined') {
    return 'rtl'; // Default to RTL for Arabic
  }
  
  const dir = document.documentElement.dir || document.body.dir;
  return dir === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Check if current direction is RTL
 */
export function isRTL(): boolean {
  return getDocumentDirection() === 'rtl';
}

/**
 * Get language from document
 */
export function getDocumentLanguage(): string {
  if (typeof document === 'undefined') {
    return 'ar';
  }
  return document.documentElement.lang || 'ar';
}

/**
 * Check if language is Arabic
 */
export function isArabic(): boolean {
  const lang = getDocumentLanguage();
  return lang.startsWith('ar');
}

// ============================================
// Position Utilities
// ============================================

/**
 * Flip horizontal position for RTL
 * Converts 'left' to 'right' and vice versa
 */
export function flipHorizontal(position: 'left' | 'right'): 'left' | 'right' {
  if (!isRTL()) return position;
  return position === 'left' ? 'right' : 'left';
}

/**
 * Get logical position (start/end) from physical position
 */
export function toLogicalPosition(position: 'left' | 'right'): 'start' | 'end' {
  const rtl = isRTL();
  if (position === 'left') {
    return rtl ? 'end' : 'start';
  }
  return rtl ? 'start' : 'end';
}

/**
 * Get physical position from logical position
 */
export function toPhysicalPosition(position: 'start' | 'end'): 'left' | 'right' {
  const rtl = isRTL();
  if (position === 'start') {
    return rtl ? 'right' : 'left';
  }
  return rtl ? 'left' : 'right';
}

/**
 * Flip X coordinate for RTL in a container
 */
export function flipX(x: number, containerWidth: number): number {
  if (!isRTL()) return x;
  return containerWidth - x;
}

/**
 * Get transform for RTL flipping
 */
export function getFlipTransform(): string {
  return isRTL() ? 'scaleX(-1)' : '';
}

// ============================================
// Text Utilities
// ============================================

/**
 * Get text alignment for current direction
 */
export function getTextAlign(align: 'start' | 'end' | 'center'): 'left' | 'right' | 'center' {
  if (align === 'center') return 'center';
  return toPhysicalPosition(align);
}

/**
 * Format number for Arabic locale
 */
export function formatArabicNumber(num: number): string {
  if (!isArabic()) return num.toString();
  
  // Use Arabic-Indic numerals
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
}

/**
 * Format percentage for Arabic
 */
export function formatArabicPercentage(value: number): string {
  const formatted = formatArabicNumber(Math.round(value));
  return isArabic() ? `${formatted}٪` : `${value}%`;
}

// ============================================
// CSS Utilities
// ============================================

/**
 * Get RTL-aware CSS properties
 */
export function getRTLStyles(styles: {
  marginLeft?: string | number;
  marginRight?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  left?: string | number;
  right?: string | number;
  borderLeft?: string;
  borderRight?: string;
  textAlign?: 'left' | 'right' | 'center';
}): React.CSSProperties {
  if (!isRTL()) {
    return styles as React.CSSProperties;
  }

  const flipped: React.CSSProperties = {};

  // Flip margins
  if (styles.marginLeft !== undefined) {
    flipped.marginRight = styles.marginLeft;
  }
  if (styles.marginRight !== undefined) {
    flipped.marginLeft = styles.marginRight;
  }

  // Flip padding
  if (styles.paddingLeft !== undefined) {
    flipped.paddingRight = styles.paddingLeft;
  }
  if (styles.paddingRight !== undefined) {
    flipped.paddingLeft = styles.paddingRight;
  }

  // Flip positions
  if (styles.left !== undefined) {
    flipped.right = styles.left;
  }
  if (styles.right !== undefined) {
    flipped.left = styles.right;
  }

  // Flip borders
  if (styles.borderLeft !== undefined) {
    flipped.borderRight = styles.borderLeft;
  }
  if (styles.borderRight !== undefined) {
    flipped.borderLeft = styles.borderRight;
  }

  // Flip text alignment
  if (styles.textAlign === 'left') {
    flipped.textAlign = 'right';
  } else if (styles.textAlign === 'right') {
    flipped.textAlign = 'left';
  } else if (styles.textAlign) {
    flipped.textAlign = styles.textAlign;
  }

  return flipped;
}

/**
 * Get logical CSS properties (direction-agnostic)
 * These properties work correctly in both LTR and RTL without flipping
 * Requirements: 16.5
 */
export function getLogicalStyles(styles: {
  marginInlineStart?: string | number;
  marginInlineEnd?: string | number;
  paddingInlineStart?: string | number;
  paddingInlineEnd?: string | number;
  insetInlineStart?: string | number;
  insetInlineEnd?: string | number;
  borderInlineStart?: string;
  borderInlineEnd?: string;
  textAlign?: 'start' | 'end' | 'center';
}): React.CSSProperties {
  // Logical properties work automatically in both directions
  return styles as React.CSSProperties;
}

/**
 * Convert physical CSS properties to logical properties
 * Requirements: 16.5
 */
export function toLogicalStyles(styles: {
  marginLeft?: string | number;
  marginRight?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  left?: string | number;
  right?: string | number;
  textAlign?: 'left' | 'right' | 'center';
}): React.CSSProperties {
  const logical: Record<string, string | number | undefined> = {};

  // Convert margins to logical
  if (styles.marginLeft !== undefined) {
    logical.marginInlineStart = styles.marginLeft;
  }
  if (styles.marginRight !== undefined) {
    logical.marginInlineEnd = styles.marginRight;
  }

  // Convert padding to logical
  if (styles.paddingLeft !== undefined) {
    logical.paddingInlineStart = styles.paddingLeft;
  }
  if (styles.paddingRight !== undefined) {
    logical.paddingInlineEnd = styles.paddingRight;
  }

  // Convert positions to logical
  if (styles.left !== undefined) {
    logical.insetInlineStart = styles.left;
  }
  if (styles.right !== undefined) {
    logical.insetInlineEnd = styles.right;
  }

  // Convert text alignment to logical
  if (styles.textAlign === 'left') {
    logical.textAlign = 'start';
  } else if (styles.textAlign === 'right') {
    logical.textAlign = 'end';
  } else if (styles.textAlign) {
    logical.textAlign = styles.textAlign;
  }

  return logical as React.CSSProperties;
}

/**
 * Get RTL-aware class names
 */
export function getRTLClasses(classes: {
  left?: string;
  right?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingLeft?: string;
  paddingRight?: string;
  textLeft?: string;
  textRight?: string;
}): string {
  const rtl = isRTL();
  const result: string[] = [];

  if (classes.left) {
    result.push(rtl ? classes.right || '' : classes.left);
  }
  if (classes.right) {
    result.push(rtl ? classes.left || '' : classes.right);
  }
  if (classes.marginLeft) {
    result.push(rtl ? classes.marginRight || '' : classes.marginLeft);
  }
  if (classes.marginRight) {
    result.push(rtl ? classes.marginLeft || '' : classes.marginRight);
  }
  if (classes.paddingLeft) {
    result.push(rtl ? classes.paddingRight || '' : classes.paddingLeft);
  }
  if (classes.paddingRight) {
    result.push(rtl ? classes.paddingLeft || '' : classes.paddingRight);
  }
  if (classes.textLeft) {
    result.push(rtl ? classes.textRight || '' : classes.textLeft);
  }
  if (classes.textRight) {
    result.push(rtl ? classes.textLeft || '' : classes.textRight);
  }

  return result.filter(Boolean).join(' ');
}

// ============================================
// 3D Viewer RTL Utilities
// ============================================

/**
 * Get camera position for RTL view
 * Flips the X coordinate for RTL to show car from the "correct" side
 */
export function getRTLCameraPosition(
  position: [number, number, number]
): [number, number, number] {
  if (!isRTL()) return position;
  return [-position[0], position[1], position[2]];
}

/**
 * Get orbit controls target for RTL
 */
export function getRTLOrbitTarget(
  target: [number, number, number]
): [number, number, number] {
  // Target usually stays the same (center of car)
  return target;
}

/**
 * Get label position offset for RTL
 */
export function getRTLLabelOffset(
  offset: { x: number; y: number }
): { x: number; y: number } {
  if (!isRTL()) return offset;
  return { x: -offset.x, y: offset.y };
}

// ============================================
// Icon Utilities
// ============================================

/**
 * Check if icon should be flipped for RTL
 * Some icons (like arrows) should be flipped, others shouldn't
 */
export function shouldFlipIcon(iconName: string): boolean {
  const flipIcons = [
    'arrow-left',
    'arrow-right',
    'chevron-left',
    'chevron-right',
    'caret-left',
    'caret-right',
    'reply',
    'forward',
    'undo',
    'redo',
  ];
  
  return isRTL() && flipIcons.some(name => iconName.toLowerCase().includes(name));
}

/**
 * Get icon transform for RTL
 */
export function getIconTransform(iconName: string): string {
  return shouldFlipIcon(iconName) ? 'scaleX(-1)' : '';
}

// ============================================
// Keyboard Navigation RTL
// ============================================

/**
 * Get RTL-aware arrow key mapping
 * In RTL, left arrow should go "forward" and right arrow should go "back"
 */
export function getRTLArrowKey(key: 'ArrowLeft' | 'ArrowRight'): 'ArrowLeft' | 'ArrowRight' {
  if (!isRTL()) return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}

/**
 * Check if key is "forward" direction
 */
export function isForwardKey(key: string): boolean {
  const forwardKeys = isRTL() 
    ? ['ArrowLeft', 'KeyA'] 
    : ['ArrowRight', 'KeyD'];
  return forwardKeys.includes(key);
}

/**
 * Check if key is "backward" direction
 */
export function isBackwardKey(key: string): boolean {
  const backwardKeys = isRTL() 
    ? ['ArrowRight', 'KeyD'] 
    : ['ArrowLeft', 'KeyA'];
  return backwardKeys.includes(key);
}

// ============================================
// Animation Utilities
// ============================================

/**
 * Get RTL-aware animation direction
 */
export function getAnimationDirection(direction: 'left' | 'right'): 'left' | 'right' {
  if (!isRTL()) return direction;
  return direction === 'left' ? 'right' : 'left';
}

/**
 * Get slide animation transform
 */
export function getSlideTransform(
  direction: 'in' | 'out',
  from: 'left' | 'right'
): string {
  const actualFrom = isRTL() 
    ? (from === 'left' ? 'right' : 'left') 
    : from;
  
  const translateX = actualFrom === 'left' ? '-100%' : '100%';
  
  if (direction === 'in') {
    return `translateX(${translateX})`;
  }
  return 'translateX(0)';
}

const rtlUtils = {
  getDocumentDirection,
  isRTL,
  getDocumentLanguage,
  isArabic,
  flipHorizontal,
  toLogicalPosition,
  toPhysicalPosition,
  flipX,
  getFlipTransform,
  getTextAlign,
  formatArabicNumber,
  formatArabicPercentage,
  getRTLStyles,
  getLogicalStyles,
  toLogicalStyles,
  getRTLClasses,
  getRTLCameraPosition,
  getRTLOrbitTarget,
  getRTLLabelOffset,
  shouldFlipIcon,
  getIconTransform,
  getRTLArrowKey,
  isForwardKey,
  isBackwardKey,
  getAnimationDirection,
  getSlideTransform,
};

export default rtlUtils;
