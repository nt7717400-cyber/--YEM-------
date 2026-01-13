/// Modern Card Components - 2025 Design System
/// Base card, Car card, Auction card with modern styling
library;

import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/widgets/retryable_image.dart';
import 'package:customer_app/widgets/modern/modern_badge.dart';
import 'package:customer_app/widgets/modern/modern_countdown.dart';

/// Base Modern Card - Container with shadow and rounded corners
class ModernCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final List<BoxShadow>? shadow;
  final BorderRadius? borderRadius;
  final Border? border;
  final Gradient? gradient;

  const ModernCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.backgroundColor,
    this.shadow,
    this.borderRadius,
    this.border,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = backgroundColor ??
        (isDark ? AppColors.cardDark : AppColors.cardLight);

    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: gradient == null ? bgColor : null,
        gradient: gradient,
        borderRadius: borderRadius ?? AppSpacing.borderRadiusLg,
        boxShadow: shadow ?? (isDark ? AppShadows.darkSm : AppShadows.md),
        border: border,
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: borderRadius ?? AppSpacing.borderRadiusLg,
          child: padding != null ? Padding(padding: padding!, child: child) : child,
        ),
      ),
    );
  }
}

/// Modern Car Card - Full featured car display
class ModernCarCard extends StatelessWidget {
  final Car car;
  final VoidCallback? onTap;
  final bool showFeaturedBadge;

  const ModernCarCard({
    super.key,
    required this.car,
    this.onTap,
    this.showFeaturedBadge = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ModernCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Image Section
          AspectRatio(
            aspectRatio: AppSpacing.cardImageAspectRatio,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Car Image with Hero
                Hero(
                  tag: 'car_image_${car.id}',
                  child: _buildCarImage(isDark),
                ),
                // Gradient overlay
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: AppColors.imageOverlayGradient,
                    ),
                  ),
                ),
                // Badges
                _buildBadges(),
                // Price tag
                Positioned(
                  bottom: AppSpacing.sm,
                  right: AppSpacing.sm,
                  child: _buildPriceTag(),
                ),
              ],
            ),
          ),
          // Info Section
          Padding(
            padding: AppSpacing.cardPaddingSmallAll,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Car name
                Text(
                  car.name,
                  style: AppTypography.titleLarge.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                // Brand • Model • Year
                Text(
                  '${car.brand} • ${car.model} • ${car.year}',
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.sm),
                // Quick specs
                Row(
                  children: [
                    if (car.kilometers != null)
                      InfoChip(
                        icon: Icons.speed_outlined,
                        label: '${(car.kilometers! / 1000).toStringAsFixed(0)}K',
                      ),
                    if (car.kilometers != null) const SizedBox(width: AppSpacing.sm),
                    InfoChip(
                      icon: Icons.local_gas_station_outlined,
                      label: 'بنزين',
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Sold overlay
          if (car.status == CarStatus.sold) _buildSoldOverlay(isDark),
        ],
      ),
    );
  }

  Widget _buildCarImage(bool isDark) {
    final imageUrl =
        car.thumbnail ?? (car.images.isNotEmpty ? car.images.first.url : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      );
    }

    return RetryableImage(
      imageUrl: ApiEndpoints.getFullUrl(imageUrl),
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }

  Widget _buildBadges() {
    return Positioned(
      top: AppSpacing.sm,
      left: AppSpacing.sm,
      right: AppSpacing.sm,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Featured badge
          if (showFeaturedBadge && car.isFeatured)
            ModernBadge.featured()
          else
            const SizedBox.shrink(),
          // Condition badge
          car.condition == CarCondition.newCar
              ? ModernBadge.newCar()
              : ModernBadge.usedCar(),
        ],
      ),
    );
  }

  Widget _buildPriceTag() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: AppSpacing.borderRadiusSm,
        boxShadow: AppShadows.primarySm,
      ),
      child: Text(
        Formatters.formatCurrency(car.price),
        style: AppTypography.labelMedium.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildSoldOverlay(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.errorSurface,
        border: Border(
          top: BorderSide(
            color: AppColors.error.withValues(alpha: 0.2),
          ),
        ),
      ),
      child: Center(
        child: Text(
          'مباعة',
          style: AppTypography.labelMedium.copyWith(
            color: AppColors.error,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

/// Compact Car Card - For horizontal lists
class ModernCarCardCompact extends StatelessWidget {
  final Car car;
  final VoidCallback? onTap;
  final double width;

  const ModernCarCardCompact({
    super.key,
    required this.car,
    this.onTap,
    this.width = AppSpacing.cardCompactWidth,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      width: width,
      child: ModernCard(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            AspectRatio(
              aspectRatio: 16 / 10,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _buildImage(isDark),
                  // Featured badge
                  if (car.isFeatured)
                    Positioned(
                      top: 6,
                      right: 6,
                      child: ModernBadge.featured(label: ''),
                    ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    car.name,
                    style: AppTypography.titleMedium.copyWith(
                      color: isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${car.brand} • ${car.year}',
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    Formatters.formatCurrency(car.price),
                    style: AppTypography.titleMedium.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(bool isDark) {
    final imageUrl =
        car.thumbnail ?? (car.images.isNotEmpty ? car.images.first.url : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 32,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      );
    }

    return RetryableImage(
      imageUrl: ApiEndpoints.getFullUrl(imageUrl),
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.broken_image_rounded,
            size: 32,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }
}

/// Modern Auction Card - With countdown and bid info
class ModernAuctionCard extends StatelessWidget {
  final Auction auction;
  final VoidCallback? onTap;

  const ModernAuctionCard({
    super.key,
    required this.auction,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ModernCard(
      onTap: onTap,
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          isDark ? AppColors.cardDark : AppColors.cardLight,
          isDark
              ? AppColors.accent.withValues(alpha: 0.1)
              : AppColors.accentSurface,
        ],
      ),
      border: Border.all(
        color: AppColors.accent.withValues(alpha: 0.2),
        width: 1,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Image with auction overlay
          AspectRatio(
            aspectRatio: AppSpacing.cardImageAspectRatio,
            child: Stack(
              fit: StackFit.expand,
              children: [
                _buildCarImage(isDark),
                // Auction badge
                Positioned(
                  top: AppSpacing.sm,
                  right: AppSpacing.sm,
                  child: _buildAuctionBadge(),
                ),
                // Timer overlay
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: _buildTimerOverlay(),
                ),
              ],
            ),
          ),
          // Info Section
          Padding(
            padding: AppSpacing.cardPaddingSmallAll,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auction.carName ?? auction.car?.name ?? 'سيارة',
                  style: AppTypography.titleLarge.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.sm),
                // Current price
                Row(
                  children: [
                    Icon(
                      Icons.trending_up_rounded,
                      color: AppColors.success,
                      size: 18,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      Formatters.formatCurrency(auction.currentPrice),
                      style: AppTypography.headlineSmall.copyWith(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                // Bid count
                Row(
                  children: [
                    Icon(
                      Icons.people_outline_rounded,
                      size: 16,
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatBidCount(auction.bidCount),
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCarImage(bool isDark) {
    final imageUrl = auction.thumbnail ??
        auction.car?.thumbnail ??
        (auction.car?.images.isNotEmpty == true
            ? auction.car!.images.first.url
            : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      );
    }

    return RetryableImage(
      imageUrl: ApiEndpoints.getFullUrl(imageUrl),
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }

  Widget _buildAuctionBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        gradient: AppColors.accentGradient,
        borderRadius: AppSpacing.borderRadiusSm,
        boxShadow: AppShadows.accentSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.gavel_rounded, size: 16, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            'مزاد',
            style: AppTypography.labelMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimerOverlay() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: 0.7),
          ],
        ),
      ),
      child: ModernCountdown(
        endTime: auction.endTime,
        style: CountdownStyle.compact,
      ),
    );
  }

  String _formatBidCount(int count) {
    if (count == 0) return 'لا توجد عروض';
    if (count == 1) return 'عرض واحد';
    if (count == 2) return 'عرضان';
    if (count <= 10) return '$count عروض';
    return '$count عرض';
  }
}

/// Compact Auction Card - For horizontal lists
class ModernAuctionCardCompact extends StatelessWidget {
  final Auction auction;
  final VoidCallback? onTap;
  final double width;

  const ModernAuctionCardCompact({
    super.key,
    required this.auction,
    this.onTap,
    this.width = AppSpacing.auctionCardWidth,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      width: width,
      child: ModernCard(
        onTap: onTap,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            isDark ? AppColors.cardDark : AppColors.cardLight,
            isDark
                ? AppColors.accent.withValues(alpha: 0.08)
                : AppColors.accentSurface.withValues(alpha: 0.5),
          ],
        ),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: 0.15),
          width: 1,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image with badge
            AspectRatio(
              aspectRatio: 16 / 10,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _buildImage(isDark),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        gradient: AppColors.accentGradient,
                        borderRadius: AppSpacing.borderRadiusXs,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.gavel_rounded, size: 10, color: Colors.white),
                          SizedBox(width: 3),
                          Text(
                            'مزاد',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    auction.carName ?? auction.car?.name ?? 'سيارة',
                    style: AppTypography.titleMedium.copyWith(
                      color: isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    Formatters.formatCurrency(auction.currentPrice),
                    style: AppTypography.titleMedium.copyWith(
                      color: AppColors.accent,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  if (auction.isActive)
                    ModernCountdown(
                      endTime: auction.endTime,
                      style: CountdownStyle.minimal,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(bool isDark) {
    final imageUrl = auction.thumbnail ??
        auction.car?.thumbnail ??
        (auction.car?.images.isNotEmpty == true
            ? auction.car!.images.first.url
            : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.directions_car_rounded,
            size: 32,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      );
    }

    return RetryableImage(
      imageUrl: ApiEndpoints.getFullUrl(imageUrl),
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.broken_image_rounded,
            size: 32,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }
}
