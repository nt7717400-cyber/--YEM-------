/// Modern Badge Components - 2025 Design System
/// Badges, Tags, and Status indicators
library;

import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';

/// Badge variant types
enum BadgeVariant {
  filled,
  outlined,
  soft,
}

/// Badge size
enum BadgeSize {
  small,
  medium,
  large,
}

/// Modern Badge - Versatile badge component
class ModernBadge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final BadgeVariant variant;
  final BadgeSize size;
  final bool hasShadow;

  const ModernBadge({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.variant = BadgeVariant.filled,
    this.size = BadgeSize.medium,
    this.hasShadow = true,
  });

  /// Featured badge preset
  factory ModernBadge.featured({String label = 'مميزة'}) {
    return ModernBadge(
      label: label,
      color: AppColors.featuredBadge,
      icon: Icons.star_rounded,
    );
  }

  /// New car badge preset
  factory ModernBadge.newCar({String label = 'جديدة'}) {
    return ModernBadge(
      label: label,
      color: AppColors.newBadge,
    );
  }

  /// Used car badge preset
  factory ModernBadge.usedCar({String label = 'مستعملة'}) {
    return ModernBadge(
      label: label,
      color: AppColors.usedBadge,
    );
  }

  /// Sold badge preset
  factory ModernBadge.sold({String label = 'مباعة'}) {
    return ModernBadge(
      label: label,
      color: AppColors.soldBadge,
    );
  }

  /// Auction badge preset
  factory ModernBadge.auction({String label = 'مزاد'}) {
    return ModernBadge(
      label: label,
      color: AppColors.accent,
      icon: Icons.gavel_rounded,
    );
  }

  @override
  Widget build(BuildContext context) {
    final (padding, textStyle, iconSize) = _getSizeProperties();

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: AppSpacing.borderRadiusSm,
        border: variant == BadgeVariant.outlined
            ? Border.all(color: color, width: 1.5)
            : null,
        boxShadow: hasShadow && variant == BadgeVariant.filled
            ? AppShadows.colored(color, opacity: 0.35, blur: 6, y: 2)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: iconSize,
              color: _getTextColor(),
            ),
            SizedBox(width: size == BadgeSize.small ? 3 : 4),
          ],
          Text(
            label,
            style: textStyle.copyWith(
              color: _getTextColor(),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  (EdgeInsets, TextStyle, double) _getSizeProperties() {
    switch (size) {
      case BadgeSize.small:
        return (
          const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          AppTypography.labelSmall,
          12.0,
        );
      case BadgeSize.medium:
        return (
          const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          AppTypography.labelMedium,
          14.0,
        );
      case BadgeSize.large:
        return (
          const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          AppTypography.labelLarge,
          16.0,
        );
    }
  }

  Color _getBackgroundColor() {
    switch (variant) {
      case BadgeVariant.filled:
        return color;
      case BadgeVariant.outlined:
        return Colors.transparent;
      case BadgeVariant.soft:
        return color.withValues(alpha: 0.12);
    }
  }

  Color _getTextColor() {
    switch (variant) {
      case BadgeVariant.filled:
        return Colors.white;
      case BadgeVariant.outlined:
      case BadgeVariant.soft:
        return color;
    }
  }
}

/// Status Dot - Small status indicator
class StatusDot extends StatelessWidget {
  final Color color;
  final double size;
  final bool animated;

  const StatusDot({
    super.key,
    required this.color,
    this.size = 8,
    this.animated = false,
  });

  factory StatusDot.online() => const StatusDot(color: AppColors.success);
  factory StatusDot.offline() => const StatusDot(color: AppColors.error);
  factory StatusDot.busy() => const StatusDot(color: AppColors.warning);
  factory StatusDot.live() => const StatusDot(color: AppColors.error, animated: true);

  @override
  Widget build(BuildContext context) {
    final dot = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.4),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
    );

    if (animated) {
      return _PulsingDot(color: color, size: size);
    }

    return dot;
  }
}

/// Pulsing dot animation
class _PulsingDot extends StatefulWidget {
  final Color color;
  final double size;

  const _PulsingDot({required this.color, required this.size});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    _animation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            color: widget.color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.color.withValues(alpha: _animation.value * 0.6),
                blurRadius: 8 * _animation.value,
                spreadRadius: 2 * _animation.value,
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Count Badge - Shows number (notifications, bids, etc.)
class CountBadge extends StatelessWidget {
  final int count;
  final Color? backgroundColor;
  final Color? textColor;
  final double size;
  final bool showZero;

  const CountBadge({
    super.key,
    required this.count,
    this.backgroundColor,
    this.textColor,
    this.size = 20,
    this.showZero = false,
  });

  @override
  Widget build(BuildContext context) {
    if (count == 0 && !showZero) {
      return const SizedBox.shrink();
    }

    final displayText = count > 99 ? '99+' : count.toString();
    final bgColor = backgroundColor ?? AppColors.error;
    final txtColor = textColor ?? Colors.white;

    return Container(
      constraints: BoxConstraints(
        minWidth: size,
        minHeight: size,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(size / 2),
        boxShadow: AppShadows.colored(bgColor, opacity: 0.4),
      ),
      child: Center(
        child: Text(
          displayText,
          style: AppTypography.labelSmall.copyWith(
            color: txtColor,
            fontWeight: FontWeight.w700,
            fontSize: size * 0.55,
          ),
        ),
      ),
    );
  }
}

/// Info Chip - Displays key-value info
class InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? iconColor;
  final Color? backgroundColor;

  const InfoChip({
    super.key,
    required this.icon,
    required this.label,
    this.iconColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = backgroundColor ??
        (isDark ? AppColors.surfaceDark : AppColors.backgroundLight);
    final icColor = iconColor ?? AppColors.textSecondaryLight;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: AppSpacing.borderRadiusSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: icColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
