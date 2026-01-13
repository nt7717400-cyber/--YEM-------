/// Modern App Bar Components - 2025 Design System
/// Blur app bars, detail app bars
library;

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';

/// Modern Sliver App Bar with blur effect
class ModernSliverAppBar extends StatelessWidget {
  final String? title;
  final Widget? titleWidget;
  final double expandedHeight;
  final Widget? background;
  final List<Widget>? actions;
  final bool pinned;
  final bool floating;
  final bool snap;
  final Color? backgroundColor;
  final bool showBlur;
  final double blurSigma;

  const ModernSliverAppBar({
    super.key,
    this.title,
    this.titleWidget,
    this.expandedHeight = 300,
    this.background,
    this.actions,
    this.pinned = true,
    this.floating = false,
    this.snap = false,
    this.backgroundColor,
    this.showBlur = true,
    this.blurSigma = 10,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = backgroundColor ??
        (isDark ? AppColors.backgroundDark : AppColors.backgroundLight);

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: pinned,
      floating: floating,
      snap: snap,
      backgroundColor: bgColor,
      foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      systemOverlayStyle: isDark
          ? SystemUiOverlayStyle.light
          : SystemUiOverlayStyle.dark,
      actions: actions,
      flexibleSpace: FlexibleSpaceBar(
        title: titleWidget ?? (title != null
            ? Text(
                title!,
                style: AppTypography.titleLarge.copyWith(
                  color: isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimaryLight,
                ),
              )
            : null),
        background: background,
        collapseMode: CollapseMode.parallax,
      ),
    );
  }
}

/// Modern Detail App Bar - For detail screens with image
class ModernDetailAppBar extends StatelessWidget {
  final Widget imageWidget;
  final double expandedHeight;
  final List<Widget>? actions;
  final VoidCallback? onBack;

  const ModernDetailAppBar({
    super.key,
    required this.imageWidget,
    this.expandedHeight = 350,
    this.actions,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: true,
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      foregroundColor: Colors.white,
      elevation: 0,
      leading: Container(
        margin: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.3),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: onBack ?? () => Navigator.of(context).pop(),
        ),
      ),
      actions: actions?.map((action) {
        return Container(
          margin: const EdgeInsets.only(left: AppSpacing.sm),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.3),
            shape: BoxShape.circle,
          ),
          child: action,
        );
      }).toList(),
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            imageWidget,
            // Gradient overlay for better text visibility
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.5),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        collapseMode: CollapseMode.parallax,
      ),
    );
  }
}

/// Modern Blur App Bar - Floating style
class ModernBlurAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final Widget? titleWidget;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final bool showBlur;
  final double blurSigma;
  final Color? backgroundColor;

  const ModernBlurAppBar({
    super.key,
    this.title,
    this.titleWidget,
    this.actions,
    this.leading,
    this.centerTitle = true,
    this.showBlur = true,
    this.blurSigma = 10,
    this.backgroundColor,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = backgroundColor ??
        (isDark
            ? AppColors.backgroundDark.withValues(alpha: 0.9)
            : AppColors.backgroundLight.withValues(alpha: 0.9));

    Widget appBar = AppBar(
      title: titleWidget ?? (title != null
          ? Text(
              title!,
              style: AppTypography.headlineSmall.copyWith(
                color: isDark
                    ? AppColors.textPrimaryDark
                    : AppColors.textPrimaryLight,
              ),
            )
          : null),
      centerTitle: centerTitle,
      backgroundColor: showBlur ? Colors.transparent : bgColor,
      elevation: 0,
      leading: leading,
      actions: actions,
    );

    if (showBlur) {
      return ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            decoration: BoxDecoration(
              color: bgColor,
              boxShadow: AppShadows.appBar,
            ),
            child: appBar,
          ),
        ),
      );
    }

    return appBar;
  }
}

/// Modern Icon Button for App Bar
class ModernAppBarButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final Color? backgroundColor;
  final Color? iconColor;

  const ModernAppBarButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.backgroundColor,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.black.withValues(alpha: 0.3),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, color: iconColor ?? Colors.white),
        onPressed: onPressed,
        tooltip: tooltip,
      ),
    );
  }
}
