import 'package:flutter/material.dart';

/// Spacing & Dimension System - 2025 Design
/// Based on 4px grid system
class AppSpacing {
  AppSpacing._();

  // ============================================
  // BASE SPACING (4px grid)
  // ============================================
  static const double xxs = 2;    // 2px
  static const double xs = 4;     // 4px
  static const double sm = 8;     // 8px
  static const double md = 12;    // 12px
  static const double lg = 16;    // 16px
  static const double xl = 20;    // 20px
  static const double xxl = 24;   // 24px
  static const double xxxl = 32;  // 32px
  static const double huge = 40;  // 40px
  static const double massive = 48; // 48px

  // ============================================
  // COMPONENT SPACING
  // ============================================
  static const double cardPadding = 16;
  static const double cardPaddingSmall = 12;
  static const double screenPadding = 16;
  static const double screenPaddingLarge = 20;
  static const double sectionGap = 24;
  static const double itemGap = 12;
  static const double itemGapSmall = 8;
  static const double listItemGap = 12;
  static const double gridGap = 12;

  // ============================================
  // BORDER RADIUS
  // ============================================
  static const double radiusXs = 4;
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 20;
  static const double radiusXxl = 24;
  static const double radiusFull = 999;

  // BorderRadius objects for convenience
  static final BorderRadius borderRadiusXs = BorderRadius.circular(radiusXs);
  static final BorderRadius borderRadiusSm = BorderRadius.circular(radiusSm);
  static final BorderRadius borderRadiusMd = BorderRadius.circular(radiusMd);
  static final BorderRadius borderRadiusLg = BorderRadius.circular(radiusLg);
  static final BorderRadius borderRadiusXl = BorderRadius.circular(radiusXl);
  static final BorderRadius borderRadiusXxl = BorderRadius.circular(radiusXxl);
  static final BorderRadius borderRadiusFull = BorderRadius.circular(radiusFull);

  // Top-only radius for bottom sheets
  static final BorderRadius bottomSheetRadius = const BorderRadius.vertical(
    top: Radius.circular(radiusXxl),
  );

  // ============================================
  // COMPONENT SIZES
  // ============================================
  
  // Buttons
  static const double buttonHeight = 52;
  static const double buttonHeightSmall = 44;
  static const double buttonHeightLarge = 56;
  static const double buttonMinWidth = 120;
  
  // Icons
  static const double iconXs = 16;
  static const double iconSm = 20;
  static const double iconMd = 24;
  static const double iconLg = 28;
  static const double iconXl = 32;
  static const double iconXxl = 48;
  
  // Navigation
  static const double bottomNavHeight = 70;
  static const double bottomNavIconSize = 26;
  static const double appBarHeight = 60;
  
  // Cards
  static const double cardImageAspectRatio = 4 / 3;
  static const double cardCompactWidth = 200;
  static const double auctionCardWidth = 220;
  
  // Banners
  static const double bannerHeight = 200;
  static const double bannerHeightSmall = 160;
  
  // Inputs
  static const double inputHeight = 52;
  static const double inputHeightSmall = 44;
  
  // Badges
  static const double badgeHeight = 24;
  static const double badgeHeightSmall = 20;
  
  // Avatar
  static const double avatarSm = 32;
  static const double avatarMd = 40;
  static const double avatarLg = 56;
  static const double avatarXl = 80;

  // ============================================
  // EDGE INSETS PRESETS
  // ============================================
  
  // All sides
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);
  static const EdgeInsets paddingXxl = EdgeInsets.all(xxl);
  
  // Horizontal only
  static const EdgeInsets paddingHorizontalSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets paddingHorizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets paddingHorizontalLg = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets paddingHorizontalXl = EdgeInsets.symmetric(horizontal: xl);
  
  // Vertical only
  static const EdgeInsets paddingVerticalSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets paddingVerticalMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets paddingVerticalLg = EdgeInsets.symmetric(vertical: lg);
  
  // Screen padding
  static const EdgeInsets screenPaddingAll = EdgeInsets.all(screenPadding);
  static const EdgeInsets screenPaddingHorizontal = EdgeInsets.symmetric(horizontal: screenPadding);
  
  // Card padding
  static const EdgeInsets cardPaddingAll = EdgeInsets.all(cardPadding);
  static const EdgeInsets cardPaddingSmallAll = EdgeInsets.all(cardPaddingSmall);

  // ============================================
  // ANIMATION DURATIONS
  // ============================================
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 250);
  static const Duration durationSlow = Duration(milliseconds: 350);
  static const Duration durationVerySlow = Duration(milliseconds: 500);

  // ============================================
  // ANIMATION CURVES
  // ============================================
  static const Curve curveDefault = Curves.easeInOut;
  static const Curve curveEmphasized = Curves.easeOutCubic;
  static const Curve curveBounce = Curves.elasticOut;
}
