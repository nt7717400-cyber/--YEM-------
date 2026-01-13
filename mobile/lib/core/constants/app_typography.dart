import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Modern Typography System - 2025 Design
/// Optimized for Arabic (RTL) and English (LTR)
/// Using Cairo font from Google Fonts for Arabic support
class AppTypography {
  AppTypography._();

  // Font Family
  static const String fontFamily = 'Cairo';

  // Get Cairo TextStyle from Google Fonts
  static TextStyle _cairo({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    double height = 1.5,
    double letterSpacing = 0,
    Color? color,
  }) {
    return GoogleFonts.cairo(
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      letterSpacing: letterSpacing,
      color: color,
    );
  }

  // ============================================
  // DISPLAY - Large Headlines
  // ============================================
  static TextStyle get displayLarge => _cairo(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.25,
    letterSpacing: -0.5,
  );

  static TextStyle get displayMedium => _cairo(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    height: 1.3,
    letterSpacing: -0.25,
  );

  static TextStyle get displaySmall => _cairo(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.35,
  );

  // ============================================
  // HEADLINE - Section Headers
  // ============================================
  static TextStyle get headlineLarge => _cairo(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    height: 1.35,
  );

  static TextStyle get headlineMedium => _cairo(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  static TextStyle get headlineSmall => _cairo(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  // ============================================
  // TITLE - Card Titles, List Items
  // ============================================
  static TextStyle get titleLarge => _cairo(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.5,
  );

  static TextStyle get titleMedium => _cairo(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.5,
  );

  static TextStyle get titleSmall => _cairo(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.5,
  );

  // ============================================
  // BODY - Regular Text Content
  // ============================================
  static TextStyle get bodyLarge => _cairo(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.6,
  );

  static TextStyle get bodyMedium => _cairo(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.6,
  );

  static TextStyle get bodySmall => _cairo(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  // ============================================
  // LABEL - Buttons, Chips, Tags
  // ============================================
  static TextStyle get labelLarge => _cairo(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.4,
    letterSpacing: 0.1,
  );

  static TextStyle get labelMedium => _cairo(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.4,
    letterSpacing: 0.1,
  );

  static TextStyle get labelSmall => _cairo(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 0.1,
  );

  // ============================================
  // SPECIAL STYLES
  // ============================================
  
  /// Price display style
  static TextStyle get price => _cairo(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Large price for details
  static TextStyle get priceLarge => _cairo(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    height: 1.2,
  );

  /// Badge text
  static TextStyle get badge => _cairo(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    height: 1.2,
    letterSpacing: 0.2,
  );

  /// Timer/countdown numbers
  static TextStyle get timer => _cairo(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    height: 1.2,
  );

  /// Navigation label
  static TextStyle get navLabel => _cairo(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.3,
  );

  // ============================================
  // HELPER METHODS
  // ============================================

  /// Get text style with custom color
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Get primary text style (light theme)
  static TextStyle primaryText(TextStyle style) {
    return style.copyWith(color: AppColors.textPrimaryLight);
  }

  /// Get secondary text style (light theme)
  static TextStyle secondaryText(TextStyle style) {
    return style.copyWith(color: AppColors.textSecondaryLight);
  }

  /// Get tertiary/hint text style (light theme)
  static TextStyle tertiaryText(TextStyle style) {
    return style.copyWith(color: AppColors.textTertiaryLight);
  }

  /// Get error text style
  static TextStyle errorText(TextStyle style) {
    return style.copyWith(color: AppColors.error);
  }

  /// Get success text style
  static TextStyle successText(TextStyle style) {
    return style.copyWith(color: AppColors.success);
  }
}
