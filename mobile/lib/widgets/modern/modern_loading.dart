/// Modern Loading Components - 2025 Design System
/// Shimmer effects, Skeletons, Progress indicators
library;

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_spacing.dart';

/// Modern Shimmer wrapper
class ModernShimmer extends StatelessWidget {
  final Widget child;
  final bool enabled;

  const ModernShimmer({
    super.key,
    required this.child,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Shimmer.fromColors(
      baseColor: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
      highlightColor: isDark ? AppColors.shimmerHighlightDark : AppColors.shimmerHighlight,
      child: child,
    );
  }
}

/// Skeleton box for shimmer
class SkeletonBox extends StatelessWidget {
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  const SkeletonBox({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: borderRadius ?? AppSpacing.borderRadiusSm,
      ),
    );
  }
}

/// Modern Car Card Shimmer
class ModernCarCardShimmer extends StatelessWidget {
  const ModernCarCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppSpacing.borderRadiusLg,
      ),
      clipBehavior: Clip.antiAlias,
      child: ModernShimmer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image placeholder
            AspectRatio(
              aspectRatio: AppSpacing.cardImageAspectRatio,
              child: const SkeletonBox(),
            ),
            // Info placeholder
            Padding(
              padding: AppSpacing.cardPaddingSmallAll,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(
                    height: 18,
                    width: double.infinity,
                    borderRadius: AppSpacing.borderRadiusXs,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SkeletonBox(
                    height: 14,
                    width: 120,
                    borderRadius: AppSpacing.borderRadiusXs,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      SkeletonBox(
                        height: 24,
                        width: 60,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      SkeletonBox(
                        height: 24,
                        width: 60,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Modern Car Grid Shimmer
class ModernCarGridShimmer extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;

  const ModernCarGridShimmer({
    super.key,
    this.itemCount = 6,
    this.crossAxisCount = 2,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: AppSpacing.screenPaddingAll,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: AppSpacing.gridGap,
        mainAxisSpacing: AppSpacing.gridGap,
        childAspectRatio: 0.72,
      ),
      itemCount: itemCount,
      itemBuilder: (context, index) => const ModernCarCardShimmer(),
    );
  }
}

/// Modern Horizontal List Shimmer
class ModernHorizontalListShimmer extends StatelessWidget {
  final int itemCount;
  final double itemWidth;
  final double height;

  const ModernHorizontalListShimmer({
    super.key,
    this.itemCount = 4,
    this.itemWidth = AppSpacing.cardCompactWidth,
    this.height = 220,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      height: height,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: AppSpacing.screenPaddingHorizontal,
        itemCount: itemCount,
        itemBuilder: (context, index) {
          return Container(
            width: itemWidth,
            margin: EdgeInsets.only(
              left: index == 0 ? 0 : AppSpacing.itemGap,
            ),
            decoration: BoxDecoration(
              color: isDark ? AppColors.cardDark : AppColors.cardLight,
              borderRadius: AppSpacing.borderRadiusLg,
            ),
            clipBehavior: Clip.antiAlias,
            child: ModernShimmer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    flex: 3,
                    child: const SkeletonBox(),
                  ),
                  Expanded(
                    flex: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SkeletonBox(
                            height: 14,
                            width: double.infinity,
                            borderRadius: AppSpacing.borderRadiusXs,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          SkeletonBox(
                            height: 12,
                            width: 80,
                            borderRadius: AppSpacing.borderRadiusXs,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          SkeletonBox(
                            height: 14,
                            width: 60,
                            borderRadius: AppSpacing.borderRadiusXs,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Modern Banner Shimmer
class ModernBannerShimmer extends StatelessWidget {
  final double height;

  const ModernBannerShimmer({
    super.key,
    this.height = AppSpacing.bannerHeight,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: height,
      margin: AppSpacing.screenPaddingHorizontal,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppSpacing.borderRadiusLg,
      ),
      clipBehavior: Clip.antiAlias,
      child: ModernShimmer(
        child: const SkeletonBox(),
      ),
    );
  }
}

/// Modern Details Shimmer
class ModernDetailsShimmer extends StatelessWidget {
  const ModernDetailsShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image gallery placeholder
          ModernShimmer(
            child: Container(
              height: 350,
              color: isDark ? AppColors.cardDark : AppColors.shimmerBase,
            ),
          ),
          Padding(
            padding: AppSpacing.screenPaddingAll,
            child: ModernShimmer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges
                  Row(
                    children: [
                      SkeletonBox(
                        height: 28,
                        width: 70,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      SkeletonBox(
                        height: 28,
                        width: 60,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  // Title
                  SkeletonBox(
                    height: 28,
                    width: double.infinity,
                    borderRadius: AppSpacing.borderRadiusSm,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  // Subtitle
                  SkeletonBox(
                    height: 18,
                    width: 200,
                    borderRadius: AppSpacing.borderRadiusXs,
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  // Price box
                  SkeletonBox(
                    height: 60,
                    width: double.infinity,
                    borderRadius: AppSpacing.borderRadiusMd,
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  // Specs
                  ...List.generate(
                    5,
                    (index) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SkeletonBox(
                            height: 16,
                            width: 80,
                            borderRadius: AppSpacing.borderRadiusXs,
                          ),
                          SkeletonBox(
                            height: 16,
                            width: 100,
                            borderRadius: AppSpacing.borderRadiusXs,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  // Description
                  SkeletonBox(
                    height: 120,
                    width: double.infinity,
                    borderRadius: AppSpacing.borderRadiusMd,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Modern Loading Indicator
class ModernLoadingIndicator extends StatelessWidget {
  final String? message;
  final double size;

  const ModernLoadingIndicator({
    super.key,
    this.message,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation(AppColors.primary),
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: AppSpacing.lg),
            Text(
              message!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Inline loading spinner
class ModernInlineLoader extends StatelessWidget {
  final double size;
  final double strokeWidth;
  final Color? color;

  const ModernInlineLoader({
    super.key,
    this.size = 20,
    this.strokeWidth = 2,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation(color ?? AppColors.primary),
      ),
    );
  }
}

/// Pull to refresh wrapper
class ModernRefreshable extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;

  const ModernRefreshable({
    super.key,
    required this.child,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: AppColors.primary,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.surfaceDark
          : AppColors.surfaceLight,
      child: child,
    );
  }
}
