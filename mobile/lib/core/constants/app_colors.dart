import 'package:flutter/material.dart';

/// Modern App Color Palette - 2025 Design System
/// Based on Material Design 3 with custom brand colors
class AppColors {
  AppColors._();

  // ============================================
  // PRIMARY COLORS - Royal Blue (More Vibrant)
  // ============================================
  static const Color primary = Color(0xFF2563EB);        // Blue 600
  static const Color primaryLight = Color(0xFF60A5FA);   // Blue 400
  static const Color primaryDark = Color(0xFF1D4ED8);    // Blue 700
  static const Color primarySurface = Color(0xFFEFF6FF); // Blue 50
  static const Color primaryContainer = Color(0xFFDBEAFE); // Blue 100

  // ============================================
  // SECONDARY COLORS - Warm Gray
  // ============================================
  static const Color secondary = Color(0xFF6B7280);      // Gray 500
  static const Color secondaryLight = Color(0xFF9CA3AF); // Gray 400
  static const Color secondaryDark = Color(0xFF4B5563);  // Gray 600
  static const Color secondarySurface = Color(0xFFF9FAFB); // Gray 50

  // ============================================
  // ACCENT COLORS - Luxury Gold (Auctions/Featured)
  // ============================================
  static const Color accent = Color(0xFFD97706);         // Amber 600
  static const Color accentLight = Color(0xFFFBBF24);    // Amber 400
  static const Color accentDark = Color(0xFFB45309);     // Amber 700
  static const Color accentSurface = Color(0xFFFFFBEB); // Amber 50
  static const Color accentContainer = Color(0xFFFEF3C7); // Amber 100

  // ============================================
  // STATUS COLORS - Softer, More Elegant
  // ============================================
  // Success - Emerald
  static const Color success = Color(0xFF059669);        // Emerald 600
  static const Color successLight = Color(0xFF34D399);   // Emerald 400
  static const Color successSurface = Color(0xFFECFDF5); // Emerald 50
  
  // Warning - Amber
  static const Color warning = Color(0xFFD97706);        // Amber 600
  static const Color warningLight = Color(0xFFFBBF24);   // Amber 400
  static const Color warningSurface = Color(0xFFFFFBEB); // Amber 50
  
  // Error - Red
  static const Color error = Color(0xFFDC2626);          // Red 600
  static const Color errorLight = Color(0xFFF87171);     // Red 400
  static const Color errorSurface = Color(0xFFFEF2F2);   // Red 50
  
  // Info - Blue
  static const Color info = Color(0xFF2563EB);           // Blue 600
  static const Color infoLight = Color(0xFF60A5FA);      // Blue 400
  static const Color infoSurface = Color(0xFFEFF6FF);    // Blue 50

  // ============================================
  // BACKGROUND COLORS - Light Theme
  // ============================================
  static const Color backgroundLight = Color(0xFFFAFAFA);  // Neutral 50
  static const Color surfaceLight = Color(0xFFFFFFFF);     // White
  static const Color cardLight = Color(0xFFFFFFFF);        // White
  static const Color elevatedLight = Color(0xFFFFFFFF);    // White

  // ============================================
  // BACKGROUND COLORS - Dark Theme
  // ============================================
  static const Color backgroundDark = Color(0xFF111827);   // Gray 900
  static const Color surfaceDark = Color(0xFF1F2937);      // Gray 800
  static const Color cardDark = Color(0xFF374151);         // Gray 700
  static const Color elevatedDark = Color(0xFF4B5563);     // Gray 600

  // ============================================
  // TEXT COLORS - Light Theme
  // ============================================
  static const Color textPrimaryLight = Color(0xFF111827);   // Gray 900
  static const Color textSecondaryLight = Color(0xFF6B7280); // Gray 500
  static const Color textTertiaryLight = Color(0xFF9CA3AF);  // Gray 400
  static const Color textHintLight = Color(0xFFD1D5DB);      // Gray 300

  // ============================================
  // TEXT COLORS - Dark Theme
  // ============================================
  static const Color textPrimaryDark = Color(0xFFF9FAFB);    // Gray 50
  static const Color textSecondaryDark = Color(0xFFD1D5DB);  // Gray 300
  static const Color textTertiaryDark = Color(0xFF9CA3AF);   // Gray 400
  static const Color textHintDark = Color(0xFF6B7280);       // Gray 500

  // ============================================
  // BORDER COLORS
  // ============================================
  static const Color borderLight = Color(0xFFE5E7EB);    // Gray 200
  static const Color borderMedium = Color(0xFFD1D5DB);   // Gray 300
  static const Color borderDark = Color(0xFF4B5563);     // Gray 600

  // ============================================
  // DIVIDER COLORS
  // ============================================
  static const Color dividerLight = Color(0xFFF3F4F6);   // Gray 100
  static const Color dividerDark = Color(0xFF374151);    // Gray 700

  // ============================================
  // BADGE COLORS
  // ============================================
  static const Color featuredBadge = Color(0xFFD97706);  // Amber 600
  static const Color newBadge = Color(0xFF059669);       // Emerald 600
  static const Color usedBadge = Color(0xFF2563EB);      // Blue 600
  static const Color soldBadge = Color(0xFFDC2626);      // Red 600
  static const Color auctionBadge = Color(0xFF7C3AED);   // Violet 600

  // ============================================
  // SHIMMER COLORS
  // ============================================
  static const Color shimmerBase = Color(0xFFE5E7EB);       // Gray 200
  static const Color shimmerHighlight = Color(0xFFF9FAFB);  // Gray 50
  static const Color shimmerBaseDark = Color(0xFF374151);   // Gray 700
  static const Color shimmerHighlightDark = Color(0xFF4B5563); // Gray 600

  // ============================================
  // SPECIAL COLORS
  // ============================================
  static const Color whatsAppGreen = Color(0xFF25D366);
  static const Color overlay = Color(0x80000000);        // 50% black
  static const Color overlayLight = Color(0x40000000);   // 25% black

  // ============================================
  // GRADIENT PRESETS
  // ============================================
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryDark],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accentLight, accent],
  );

  static const LinearGradient surfaceGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [surfaceLight, backgroundLight],
  );

  static LinearGradient imageOverlayGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Colors.transparent,
      Colors.black.withValues(alpha: 0.7),
    ],
  );
}
