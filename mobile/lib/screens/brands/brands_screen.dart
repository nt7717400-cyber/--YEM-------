/// Brands Screen - 2025 Modern Design
/// Requirements: 10.1, 10.2, 10.3 - Display brands with car count and navigate to filtered cars
library;

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/providers/car_provider.dart';
import 'package:customer_app/widgets/modern/index.dart';

/// Brands Screen - شاشة الماركات
/// Modern design with blur app bar
class BrandsScreen extends ConsumerStatefulWidget {
  final Function(String brand)? onBrandTap;

  const BrandsScreen({
    super.key,
    this.onBrandTap,
  });

  @override
  ConsumerState<BrandsScreen> createState() => _BrandsScreenState();
}

class _BrandsScreenState extends ConsumerState<BrandsScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final isScrolled = _scrollController.offset > 10;
    if (isScrolled != _isScrolled) {
      setState(() => _isScrolled = isScrolled);
    }
  }

  Future<void> _refreshData() async {
    ref.invalidate(brandsProvider);
    ref.invalidate(brandCarCountProvider);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final brandsAsync = ref.watch(brandsProvider);
    final brandCountsAsync = ref.watch(brandCarCountProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      body: ModernRefreshable(
        onRefresh: _refreshData,
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Modern App Bar
            _buildModernAppBar(isDark),
            // Content
            brandsAsync.when(
              data: (brands) => brandCountsAsync.when(
                data: (brandCounts) => _buildContent(brands, brandCounts, isDark),
                loading: () => const SliverToBoxAdapter(
                  child: _BrandsGridShimmer(),
                ),
                error: (_, __) => SliverFillRemaining(
                  child: ModernErrorWidget(
                    message: 'حدث خطأ في تحميل الماركات',
                    onRetry: _refreshData,
                  ),
                ),
              ),
              loading: () => const SliverToBoxAdapter(
                child: _BrandsGridShimmer(),
              ),
              error: (_, __) => SliverFillRemaining(
                child: ModernErrorWidget(
                  message: 'حدث خطأ في تحميل الماركات',
                  onRetry: _refreshData,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernAppBar(bool isDark) {
    return SliverAppBar(
      floating: true,
      snap: true,
      expandedHeight: AppSpacing.appBarHeight,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: _isScrolled ? 10 : 0,
            sigmaY: _isScrolled ? 10 : 0,
          ),
          child: AnimatedContainer(
            duration: AppSpacing.durationNormal,
            decoration: BoxDecoration(
              color: _isScrolled
                  ? (isDark
                      ? AppColors.backgroundDark.withValues(alpha: 0.9)
                      : AppColors.backgroundLight.withValues(alpha: 0.9))
                  : Colors.transparent,
              boxShadow: _isScrolled ? AppShadows.appBar : null,
            ),
            child: SafeArea(
              bottom: false,
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.primarySurface,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                      child: Icon(
                        Icons.category_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      AppStrings.brands,
                      style: AppTypography.headlineMedium.copyWith(
                        color: isDark
                            ? AppColors.textPrimaryDark
                            : AppColors.textPrimaryLight,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(List<String> brands, Map<String, int> brandCounts, bool isDark) {
    if (brands.isEmpty) {
      return SliverFillRemaining(
        child: ModernEmptyState(
          icon: Icons.category_outlined,
          title: 'لا توجد ماركات متاحة',
          subtitle: 'جرب مرة أخرى لاحقاً',
          action: PrimaryButton(
            label: AppStrings.retry,
            icon: Icons.refresh_rounded,
            onPressed: _refreshData,
            isExpanded: false,
          ),
        ),
      );
    }

    return SliverPadding(
      padding: AppSpacing.screenPaddingAll,
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: AppSpacing.gridGap,
          mainAxisSpacing: AppSpacing.gridGap,
          childAspectRatio: 1.2,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final brand = brands[index];
            final carCount = brandCounts[brand] ?? 0;
            return _ModernBrandCard(
              brand: brand,
              carCount: carCount,
              onTap: () => widget.onBrandTap?.call(brand),
            );
          },
          childCount: brands.length,
        ),
      ),
    );
  }
}

/// Modern Brand Card
class _ModernBrandCard extends StatelessWidget {
  final String brand;
  final int carCount;
  final VoidCallback? onTap;

  const _ModernBrandCard({
    required this.brand,
    required this.carCount,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ModernCard(
      onTap: onTap,
      padding: AppSpacing.cardPaddingAll,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Brand icon
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: AppShadows.primarySm,
            ),
            child: const Icon(
              Icons.directions_car_rounded,
              size: 28,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          // Brand name
          Text(
            brand,
            style: AppTypography.titleLarge.copyWith(
              color: isDark
                  ? AppColors.textPrimaryDark
                  : AppColors.textPrimaryLight,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AppSpacing.xs),
          // Car count badge
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.primarySurface,
              borderRadius: AppSpacing.borderRadiusSm,
            ),
            child: Text(
              '$carCount ${AppStrings.cars}',
              style: AppTypography.labelSmall.copyWith(
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

/// Shimmer loading for brands grid
class _BrandsGridShimmer extends StatelessWidget {
  const _BrandsGridShimmer();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: AppSpacing.screenPaddingAll,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: AppSpacing.gridGap,
          mainAxisSpacing: AppSpacing.gridGap,
          childAspectRatio: 1.2,
        ),
        itemCount: 6,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.cardDark : AppColors.cardLight,
              borderRadius: AppSpacing.borderRadiusLg,
            ),
            child: ModernShimmer(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  SkeletonBox(
                    height: 16,
                    width: 80,
                    borderRadius: AppSpacing.borderRadiusXs,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  SkeletonBox(
                    height: 20,
                    width: 60,
                    borderRadius: AppSpacing.borderRadiusSm,
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
