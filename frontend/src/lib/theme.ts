/**
 * Theme System - Requirements: 16.4
 * Centralized theme management with color palette definitions
 * 
 * This module provides:
 * - Color palette with shades (50-900)
 * - Semantic color definitions
 * - Theme utilities for consistent styling
 * - WCAG AA compliant color contrast helpers
 */

// ============================================
// Color Palette Types
// ============================================

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
  foreground: string;
}

export interface SemanticColors {
  success: ColorShades;
  warning: ColorShades;
  info: ColorShades;
  destructive: {
    DEFAULT: string;
    foreground: string;
  };
}

export interface ThemeColors {
  primary: ColorShades;
  secondary: {
    DEFAULT: string;
    foreground: string;
  };
  muted: {
    DEFAULT: string;
    foreground: string;
  };
  accent: {
    DEFAULT: string;
    foreground: string;
  };
  background: string;
  foreground: string;
  card: {
    DEFAULT: string;
    foreground: string;
  };
  popover: {
    DEFAULT: string;
    foreground: string;
  };
  border: string;
  input: string;
  ring: string;
}

// ============================================
// Color Palette Definitions - Requirements: 16.1
// ============================================

/**
 * Primary color palette with shades
 * Blue-based primary color for brand identity
 */
export const primaryPalette: ColorShades = {
  50: 'hsl(var(--primary-50))',
  100: 'hsl(var(--primary-100))',
  200: 'hsl(var(--primary-200))',
  300: 'hsl(var(--primary-300))',
  400: 'hsl(var(--primary-400))',
  500: 'hsl(var(--primary-500))',
  600: 'hsl(var(--primary-600))',
  700: 'hsl(var(--primary-700))',
  800: 'hsl(var(--primary-800))',
  900: 'hsl(var(--primary-900))',
  DEFAULT: 'hsl(var(--primary))',
  foreground: 'hsl(var(--primary-foreground))',
};

// ============================================
// Semantic Color Definitions - Requirements: 16.2
// ============================================

/**
 * Success color palette (Green)
 * Used for positive actions, confirmations, and success states
 */
export const successPalette: ColorShades = {
  50: 'hsl(var(--success-50))',
  100: 'hsl(var(--success-100))',
  200: 'hsl(var(--success-200))',
  300: 'hsl(var(--success-300))',
  400: 'hsl(var(--success-400))',
  500: 'hsl(var(--success-500))',
  600: 'hsl(var(--success-600))',
  700: 'hsl(var(--success-700))',
  800: 'hsl(var(--success-800))',
  900: 'hsl(var(--success-900))',
  DEFAULT: 'hsl(var(--success))',
  foreground: 'hsl(var(--success-foreground))',
};

/**
 * Warning color palette (Amber)
 * Used for warnings, cautions, and attention-needed states
 */
export const warningPalette: ColorShades = {
  50: 'hsl(var(--warning-50))',
  100: 'hsl(var(--warning-100))',
  200: 'hsl(var(--warning-200))',
  300: 'hsl(var(--warning-300))',
  400: 'hsl(var(--warning-400))',
  500: 'hsl(var(--warning-500))',
  600: 'hsl(var(--warning-600))',
  700: 'hsl(var(--warning-700))',
  800: 'hsl(var(--warning-800))',
  900: 'hsl(var(--warning-900))',
  DEFAULT: 'hsl(var(--warning))',
  foreground: 'hsl(var(--warning-foreground))',
};

/**
 * Info color palette (Cyan)
 * Used for informational messages and neutral highlights
 */
export const infoPalette: ColorShades = {
  50: 'hsl(var(--info-50))',
  100: 'hsl(var(--info-100))',
  200: 'hsl(var(--info-200))',
  300: 'hsl(var(--info-300))',
  400: 'hsl(var(--info-400))',
  500: 'hsl(var(--info-500))',
  600: 'hsl(var(--info-600))',
  700: 'hsl(var(--info-700))',
  800: 'hsl(var(--info-800))',
  900: 'hsl(var(--info-900))',
  DEFAULT: 'hsl(var(--info))',
  foreground: 'hsl(var(--info-foreground))',
};

// ============================================
// Semantic Colors Export
// ============================================

export const semanticColors: SemanticColors = {
  success: successPalette,
  warning: warningPalette,
  info: infoPalette,
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
};

// ============================================
// Theme Colors Export
// ============================================

export const themeColors: ThemeColors = {
  primary: primaryPalette,
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
};

// ============================================
// Color Contrast Utilities - Requirements: 16.3
// ============================================

/**
 * HSL color values for contrast calculation
 * These are the raw HSL values used in CSS variables
 */
export const colorContrastValues = {
  light: {
    // Primary colors
    primary: { h: 221.2, s: 83.2, l: 53.3 },
    primaryForeground: { h: 210, s: 40, l: 98 },
    
    // Semantic colors - All adjusted for WCAG AA (4.5:1 minimum)
    success: { h: 142, s: 76, l: 28 },
    successForeground: { h: 0, s: 0, l: 100 },
    
    warning: { h: 38, s: 92, l: 50 },
    warningForeground: { h: 0, s: 0, l: 0 },
    
    info: { h: 199, s: 89, l: 35 },
    infoForeground: { h: 0, s: 0, l: 100 },
    
    // Adjusted for WCAG AA contrast (4.5:1 minimum)
    destructive: { h: 0, s: 72, l: 51 },
    destructiveForeground: { h: 0, s: 0, l: 100 },
    
    // Background/Foreground
    background: { h: 0, s: 0, l: 100 },
    foreground: { h: 222.2, s: 84, l: 4.9 },
  },
  dark: {
    // Primary colors
    primary: { h: 217.2, s: 91.2, l: 59.8 },
    primaryForeground: { h: 222.2, s: 47.4, l: 11.2 },
    
    // Semantic colors
    success: { h: 142, s: 71, l: 45 },
    successForeground: { h: 144, s: 61, l: 10 },
    
    warning: { h: 43, s: 96, l: 56 },
    warningForeground: { h: 22, s: 78, l: 10 },
    
    info: { h: 198, s: 93, l: 60 },
    infoForeground: { h: 202, s: 80, l: 10 },
    
    destructive: { h: 0, s: 62.8, l: 30.6 },
    destructiveForeground: { h: 210, s: 40, l: 98 },
    
    // Background/Foreground
    background: { h: 222.2, s: 84, l: 4.9 },
    foreground: { h: 210, s: 40, l: 98 },
  },
};

/**
 * Convert HSL to relative luminance
 * Used for WCAG contrast ratio calculation
 */
export function hslToRelativeLuminance(h: number, s: number, l: number): number {
  // Convert HSL to RGB
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  r = r + m;
  g = g + m;
  b = b + m;
  
  // Convert to sRGB
  const toSRGB = (value: number) => {
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  
  // Calculate relative luminance
  return 0.2126 * toSRGB(r) + 0.7152 * toSRGB(g) + 0.0722 * toSRGB(b);
}

/**
 * Calculate WCAG contrast ratio between two colors
 * @param color1 HSL values { h, s, l }
 * @param color2 HSL values { h, s, l }
 * @returns Contrast ratio (1 to 21)
 */
export function calculateContrastRatio(
  color1: { h: number; s: number; l: number },
  color2: { h: number; s: number; l: number }
): number {
  const l1 = hslToRelativeLuminance(color1.h, color1.s, color1.l);
  const l2 = hslToRelativeLuminance(color2.h, color2.s, color2.l);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * @param ratio Contrast ratio
 * @param isLargeText Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AA
 */
export function meetsWCAGAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * @param ratio Contrast ratio
 * @param isLargeText Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AAA
 */
export function meetsWCAGAAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// ============================================
// Theme Utility Functions
// ============================================

/**
 * Get color shade by intensity
 * @param palette Color palette
 * @param shade Shade intensity (50-900)
 */
export function getColorShade(
  palette: ColorShades,
  shade: keyof Omit<ColorShades, 'DEFAULT' | 'foreground'>
): string {
  return palette[shade];
}

/**
 * Get semantic color by type
 * @param type Semantic color type
 */
export function getSemanticColor(
  type: keyof SemanticColors
): ColorShades | { DEFAULT: string; foreground: string } {
  return semanticColors[type];
}

/**
 * Color variant types for components
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive';

/**
 * Get color classes for a variant
 * @param variant Color variant
 * @returns Tailwind classes for background and text
 */
export function getVariantClasses(variant: ColorVariant): {
  bg: string;
  text: string;
  border: string;
  hover: string;
} {
  const variants: Record<ColorVariant, { bg: string; text: string; border: string; hover: string }> = {
    primary: {
      bg: 'bg-primary',
      text: 'text-primary-foreground',
      border: 'border-primary',
      hover: 'hover:bg-primary/90',
    },
    secondary: {
      bg: 'bg-secondary',
      text: 'text-secondary-foreground',
      border: 'border-secondary',
      hover: 'hover:bg-secondary/80',
    },
    success: {
      bg: 'bg-success',
      text: 'text-success-foreground',
      border: 'border-success',
      hover: 'hover:bg-success/90',
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-warning-foreground',
      border: 'border-warning',
      hover: 'hover:bg-warning/90',
    },
    info: {
      bg: 'bg-info',
      text: 'text-info-foreground',
      border: 'border-info',
      hover: 'hover:bg-info/90',
    },
    destructive: {
      bg: 'bg-destructive',
      text: 'text-destructive-foreground',
      border: 'border-destructive',
      hover: 'hover:bg-destructive/90',
    },
  };
  
  return variants[variant];
}

// ============================================
// Default Export
// ============================================

export const theme = {
  colors: themeColors,
  semantic: semanticColors,
  palettes: {
    primary: primaryPalette,
    success: successPalette,
    warning: warningPalette,
    info: infoPalette,
  },
  utils: {
    getColorShade,
    getSemanticColor,
    getVariantClasses,
    calculateContrastRatio,
    meetsWCAGAA,
    meetsWCAGAAA,
    hslToRelativeLuminance,
  },
  contrastValues: colorContrastValues,
};

export default theme;
