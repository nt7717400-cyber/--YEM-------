/// Modern Empty State & Error Components - 2025 Design System
/// Empty states, Error displays, Offline banners
library;

import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/widgets/modern/modern_buttons.dart';

/// Modern Empty State Widget
class ModernEmptyState extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Color? iconColor;
  final Widget? action;

  const ModernEmptyState({
    super.key,
    required this.title,
    this.subtitle,
    required this.icon,
    this.iconColor,
    this.action,
  });

  /// No cars available
  factory ModernEmptyState.noCars({Widget? action}) {
    return ModernEmptyState(
      title: AppStrings.noCarsAvailable,
      subtitle: 'لا توجد سيارات متاحة حالياً',
      icon: Icons.directions_car_outlined,
      action: action,
    );
  }

  /// No search results
  factory ModernEmptyState.noSearchResults({VoidCallback? onClearFilters}) {
    return ModernEmptyState(
      title: AppStrings.noSearchResults,
      subtitle: 'جرب تغيير معايير البحث أو مسح الفلاتر',
      icon: Icons.search_off_rounded,
      action: onClearFilters != null
          ? SecondaryButton(
              label: AppStrings.clearFilters,
              icon: Icons.clear_all_rounded,
              onPressed: onClearFilters,
              isExpanded: false,
            )
          : null,
    );
  }

  /// No auctions
  factory ModernEmptyState.noAuctions() {
    return const ModernEmptyState(
      title: 'لا توجد مزادات نشطة',
      subtitle: 'تابعنا للحصول على أحدث المزادات',
      icon: Icons.gavel_outlined,
      iconColor: AppColors.accent,
    );
  }

  /// No bids
  factory ModernEmptyState.noBids() {
    return const ModernEmptyState(
      title: AppStrings.noBidsYet,
      subtitle: AppStrings.beFirstBidder,
      icon: Icons.how_to_vote_outlined,
      iconColor: AppColors.accent,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final icColor = iconColor ??
        (isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon container
            Container(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              decoration: BoxDecoration(
                color: icColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 56,
                color: icColor,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
            // Title
            Text(
              title,
              style: AppTypography.headlineSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                subtitle!,
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: AppSpacing.xxl),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Modern Error Widget
class ModernErrorWidget extends StatelessWidget {
  final String? title;
  final String? message;
  final IconData icon;
  final VoidCallback? onRetry;

  const ModernErrorWidget({
    super.key,
    this.title,
    this.message,
    this.icon = Icons.error_outline_rounded,
    this.onRetry,
  });

  /// Network error
  factory ModernErrorWidget.network({VoidCallback? onRetry}) {
    return ModernErrorWidget(
      title: AppStrings.noInternet,
      message: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
      icon: Icons.wifi_off_rounded,
      onRetry: onRetry,
    );
  }

  /// Server error
  factory ModernErrorWidget.server({VoidCallback? onRetry, String? details}) {
    return ModernErrorWidget(
      title: AppStrings.serverError,
      message: details ?? 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
      icon: Icons.cloud_off_rounded,
      onRetry: onRetry,
    );
  }

  /// Generic error
  factory ModernErrorWidget.generic({VoidCallback? onRetry, String? details}) {
    return ModernErrorWidget(
      title: AppStrings.error,
      message: details ?? AppStrings.unknownError,
      icon: Icons.error_outline_rounded,
      onRetry: onRetry,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Error icon
            Container(
              padding: const EdgeInsets.all(AppSpacing.xl),
              decoration: BoxDecoration(
                color: AppColors.errorSurface,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
            // Title
            Text(
              title ?? AppStrings.error,
              style: AppTypography.headlineSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                message!,
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.xxl),
              PrimaryButton(
                label: AppStrings.retry,
                icon: Icons.refresh_rounded,
                onPressed: onRetry,
                isExpanded: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Inline Error Widget (smaller)
class ModernInlineError extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;

  const ModernInlineError({
    super.key,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: AppSpacing.paddingLg,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.errorSurface,
              borderRadius: AppSpacing.borderRadiusSm,
            ),
            child: Icon(
              Icons.error_outline_rounded,
              color: AppColors.error,
              size: 20,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              message ?? AppStrings.error,
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ),
          if (onRetry != null)
            TextButton(
              onPressed: onRetry,
              child: Text(
                AppStrings.retry,
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Offline Banner
class ModernOfflineBanner extends StatelessWidget {
  final VoidCallback? onRetry;

  const ModernOfflineBanner({
    super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      color: AppColors.warning,
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                AppStrings.noInternet,
                style: AppTypography.labelMedium.copyWith(
                  color: Colors.white,
                ),
              ),
            ),
            if (onRetry != null)
              TextButton(
                onPressed: onRetry,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                ),
                child: Text(
                  AppStrings.retry,
                  style: AppTypography.labelMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Modern Snackbar helpers
class ModernSnackBar {
  /// Show success snackbar
  static void showSuccess(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: AppSpacing.borderRadiusXs,
              ),
              child: const Icon(
                Icons.check_circle_outline_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                message,
                style: AppTypography.bodyMedium.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusMd,
        ),
        margin: AppSpacing.paddingLg,
      ),
    );
  }

  /// Show error snackbar
  static void showError(BuildContext context, String message, {VoidCallback? onRetry}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: AppSpacing.borderRadiusXs,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                message,
                style: AppTypography.bodyMedium.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusMd,
        ),
        margin: AppSpacing.paddingLg,
        action: onRetry != null
            ? SnackBarAction(
                label: AppStrings.retry,
                textColor: Colors.white,
                onPressed: onRetry,
              )
            : null,
      ),
    );
  }

  /// Show info snackbar
  static void showInfo(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: AppSpacing.borderRadiusXs,
              ),
              child: const Icon(
                Icons.info_outline_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                message,
                style: AppTypography.bodyMedium.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.info,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusMd,
        ),
        margin: AppSpacing.paddingLg,
      ),
    );
  }
}
