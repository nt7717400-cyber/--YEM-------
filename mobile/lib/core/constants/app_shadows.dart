import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Shadow System - 2025 Design
/// Elevation levels for depth and hierarchy
class AppShadows {
  AppShadows._();

  // ============================================
  // ELEVATION LEVELS
  // ============================================

  /// No shadow
  static List<BoxShadow> get none => [];

  /// Extra small shadow - subtle lift
  static List<BoxShadow> get xs => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.03),
      blurRadius: 2,
      offset: const Offset(0, 1),
    ),
  ];

  /// Small shadow - cards, buttons
  static List<BoxShadow> get sm => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 4,
      offset: const Offset(0, 1),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.02),
      blurRadius: 2,
      offset: const Offset(0, 1),
    ),
  ];

  /// Medium shadow - elevated cards, dropdowns
  static List<BoxShadow> get md => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.06),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 4,
      offset: const Offset(0, 1),
    ),
  ];

  /// Large shadow - modals, popovers
  static List<BoxShadow> get lg => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
  ];

  /// Extra large shadow - dialogs, sheets
  static List<BoxShadow> get xl => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.1),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  /// 2XL shadow - floating elements
  static List<BoxShadow> get xxl => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.12),
      blurRadius: 32,
      offset: const Offset(0, 12),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.06),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];

  // ============================================
  // COLORED SHADOWS (for buttons)
  // ============================================

  /// Primary color shadow
  static List<BoxShadow> get primarySm => [
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.25),
      blurRadius: 8,
      offset: const Offset(0, 3),
    ),
  ];

  static List<BoxShadow> get primaryMd => [
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.3),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  /// Accent color shadow
  static List<BoxShadow> get accentSm => [
    BoxShadow(
      color: AppColors.accent.withValues(alpha: 0.25),
      blurRadius: 8,
      offset: const Offset(0, 3),
    ),
  ];

  static List<BoxShadow> get accentMd => [
    BoxShadow(
      color: AppColors.accent.withValues(alpha: 0.3),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  /// Success color shadow
  static List<BoxShadow> get successSm => [
    BoxShadow(
      color: AppColors.success.withValues(alpha: 0.25),
      blurRadius: 8,
      offset: const Offset(0, 3),
    ),
  ];

  /// Error color shadow
  static List<BoxShadow> get errorSm => [
    BoxShadow(
      color: AppColors.error.withValues(alpha: 0.25),
      blurRadius: 8,
      offset: const Offset(0, 3),
    ),
  ];

  /// WhatsApp green shadow
  static List<BoxShadow> get whatsAppSm => [
    BoxShadow(
      color: AppColors.whatsAppGreen.withValues(alpha: 0.3),
      blurRadius: 8,
      offset: const Offset(0, 3),
    ),
  ];

  // ============================================
  // CUSTOM SHADOW GENERATOR
  // ============================================

  /// Generate colored shadow for any color
  static List<BoxShadow> colored(Color color, {double opacity = 0.25, double blur = 8, double y = 3}) {
    return [
      BoxShadow(
        color: color.withValues(alpha: opacity),
        blurRadius: blur,
        offset: Offset(0, y),
      ),
    ];
  }

  /// Generate inner shadow (inset effect)
  static List<BoxShadow> get innerSm => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.06),
      blurRadius: 4,
      offset: const Offset(0, 2),
      spreadRadius: -2,
    ),
  ];

  // ============================================
  // DARK THEME SHADOWS
  // ============================================

  static List<BoxShadow> get darkSm => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.2),
      blurRadius: 4,
      offset: const Offset(0, 1),
    ),
  ];

  static List<BoxShadow> get darkMd => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.3),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> get darkLg => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.4),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  // ============================================
  // SPECIAL SHADOWS
  // ============================================

  /// Bottom navigation shadow
  static List<BoxShadow> get bottomNav => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 16,
      offset: const Offset(0, -4),
    ),
  ];

  /// Top app bar shadow
  static List<BoxShadow> get appBar => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  /// Floating action button shadow
  static List<BoxShadow> get fab => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.15),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
  ];
}
