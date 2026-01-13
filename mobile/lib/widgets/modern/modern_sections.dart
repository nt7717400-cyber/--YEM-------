/// Modern Section Components - 2025 Design System
/// Reusable section headers and containers
library;

import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';

/// Modern Section Header
class ModernSectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final VoidCallback? onViewAll;
  final String? viewAllText;

  const ModernSectionHeader({
    super.key,
    required this.title,
    required this.icon,
    this.iconColor,
    this.onViewAll,
    this.viewAllText,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final icColor = iconColor ?? AppColors.primary;

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: icColor.withValues(alpha: 0.1),
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          child: Icon(icon, color: icColor, size: 20),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Text(
            title,
            style: AppTypography.headlineSmall.copyWith(
              color: isDark
                  ? AppColors.textPrimaryDark
                  : AppColors.textPrimaryLight,
            ),
          ),
        ),
        if (onViewAll != null)
          TextButton(
            onPressed: onViewAll,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  viewAllText ?? 'عرض الكل',
                  style: AppTypography.labelMedium.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: AppColors.primary,
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Modern Section Container
class ModernSectionContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final Color? backgroundColor;
  final bool hasBorder;
  final bool hasShadow;
  final Gradient? gradient;

  const ModernSectionContainer({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.hasBorder = true,
    this.hasShadow = false,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
      padding: padding ?? AppSpacing.cardPaddingAll,
      decoration: BoxDecoration(
        color: gradient == null
            ? (backgroundColor ?? (isDark ? AppColors.cardDark : AppColors.cardLight))
            : null,
        gradient: gradient,
        borderRadius: AppSpacing.borderRadiusLg,
        border: hasBorder
            ? Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              )
            : null,
        boxShadow: hasShadow
            ? (isDark ? AppShadows.darkSm : AppShadows.sm)
            : null,
      ),
      child: child,
    );
  }
}

/// Modern Info Row - Key-Value display
class ModernInfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;
  final Color? valueColor;
  final bool showDivider;

  const ModernInfoRow({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.valueColor,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 18,
                  color: isDark
                      ? AppColors.textTertiaryDark
                      : AppColors.textTertiaryLight,
                ),
                const SizedBox(width: AppSpacing.sm),
              ],
              Text(
                label,
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
              const Spacer(),
              Text(
                value,
                style: AppTypography.titleMedium.copyWith(
                  color: valueColor ??
                      (isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight),
                ),
              ),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
          ),
      ],
    );
  }
}

/// Modern Price Display
class ModernPriceDisplay extends StatelessWidget {
  final double price;
  final String? label;
  final bool isLarge;
  final Color? color;
  final bool showGradient;

  const ModernPriceDisplay({
    super.key,
    required this.price,
    this.label,
    this.isLarge = false,
    this.color,
    this.showGradient = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final priceColor = color ?? AppColors.primary;

    final priceText = _formatPrice(price);

    if (showGradient) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: AppSpacing.borderRadiusMd,
          boxShadow: AppShadows.primarySm,
        ),
        child: Column(
          children: [
            if (label != null)
              Text(
                label!,
                style: AppTypography.labelMedium.copyWith(
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
            Text(
              priceText,
              style: (isLarge ? AppTypography.priceLarge : AppTypography.price)
                  .copyWith(color: Colors.white),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null)
          Text(
            label!,
            style: AppTypography.labelMedium.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
          ),
        Text(
          priceText,
          style: (isLarge ? AppTypography.priceLarge : AppTypography.price)
              .copyWith(color: priceColor),
        ),
      ],
    );
  }

  String _formatPrice(double price) {
    if (price >= 1000000) {
      return '${(price / 1000000).toStringAsFixed(1)} مليون ر.ي';
    } else if (price >= 1000) {
      return '${(price / 1000).toStringAsFixed(0)} ألف ر.ي';
    }
    return '${price.toStringAsFixed(0)} ر.ي';
  }
}

/// Modern Stats Row
class ModernStatsRow extends StatelessWidget {
  final List<ModernStatItem> items;

  const ModernStatsRow({
    super.key,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: items.map((item) {
        final index = items.indexOf(item);
        return Expanded(
          child: Row(
            children: [
              if (index > 0)
                Container(
                  width: 1,
                  height: 40,
                  color: AppColors.dividerLight,
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                ),
              Expanded(child: item),
            ],
          ),
        );
      }).toList(),
    );
  }
}

/// Modern Stat Item
class ModernStatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;
  final Color? color;

  const ModernStatItem({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        if (icon != null)
          Icon(
            icon,
            size: 24,
            color: color ?? AppColors.primary,
          ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          value,
          style: AppTypography.titleLarge.copyWith(
            color: color ??
                (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: isDark
                ? AppColors.textTertiaryDark
                : AppColors.textTertiaryLight,
          ),
        ),
      ],
    );
  }
}

/// Modern Highlight Box
class ModernHighlightBox extends StatelessWidget {
  final Widget child;
  final Color color;
  final EdgeInsets? padding;

  const ModernHighlightBox({
    super.key,
    required this.child,
    this.color = AppColors.primary,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? AppSpacing.cardPaddingAll,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: AppSpacing.borderRadiusMd,
        border: Border.all(
          color: color.withValues(alpha: 0.3),
        ),
      ),
      child: child,
    );
  }
}
