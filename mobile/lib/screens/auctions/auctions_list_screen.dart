/// Auctions List Screen - 2025 Modern Design
/// Requirements: 3.1, 3.5 - Display auctions grid/list sorted by ending soonest
library;

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/providers/auction_provider.dart';
import 'package:customer_app/widgets/modern/index.dart';

/// Auctions List Screen - شاشة قائمة المزادات
/// Modern design with blur app bar and enhanced cards
class AuctionsListScreen extends ConsumerStatefulWidget {
  final Function(Auction auction)? onAuctionTap;

  const AuctionsListScreen({
    super.key,
    this.onAuctionTap,
  });

  @override
  ConsumerState<AuctionsListScreen> createState() => _AuctionsListScreenState();
}

class _AuctionsListScreenState extends ConsumerState<AuctionsListScreen> {
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
    ref.invalidate(activeAuctionsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auctionsAsync = ref.watch(activeAuctionsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      body: ModernRefreshable(
        onRefresh: _refreshData,
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Modern App Bar with blur
            _buildModernAppBar(isDark),
            // Content
            auctionsAsync.when(
              data: (auctions) => _buildContent(auctions, isDark),
              loading: () => const SliverToBoxAdapter(
                child: ModernCarGridShimmer(itemCount: 6),
              ),
              error: (_, __) => SliverFillRemaining(
                child: ModernErrorWidget(
                  message: 'حدث خطأ في تحميل المزادات',
                  onRetry: _refreshData,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Modern App Bar with blur effect
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
                        color: AppColors.accentSurface,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                      child: Icon(
                        Icons.gavel_rounded,
                        color: AppColors.accent,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      AppStrings.auctions,
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

  Widget _buildContent(List<Auction> auctions, bool isDark) {
    if (auctions.isEmpty) {
      return SliverFillRemaining(
        child: ModernEmptyState(
          icon: Icons.gavel_rounded,
          title: 'لا توجد مزادات نشطة',
          subtitle: 'تابعنا للمزادات القادمة',
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
      padding: AppSpacing.screenPaddingHorizontal,
      sliver: SliverMainAxisGroup(
        slivers: [
          // Results header
          SliverToBoxAdapter(
            child: _buildResultsHeader(auctions.length, isDark),
          ),
          // Auctions grid
          SliverPadding(
            padding: const EdgeInsets.only(top: AppSpacing.lg),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: AppSpacing.itemGap,
                mainAxisSpacing: AppSpacing.itemGap,
                childAspectRatio: 0.68,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final auction = auctions[index];
                  return ModernAuctionCard(
                    auction: auction,
                    onTap: () => widget.onAuctionTap?.call(auction),
                  );
                },
                childCount: auctions.length,
              ),
            ),
          ),
          // Bottom padding
          const SliverToBoxAdapter(
            child: SizedBox(height: AppSpacing.xxxl),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsHeader(int count, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.lg),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.xs),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.1),
                  borderRadius: AppSpacing.borderRadiusXs,
                ),
                child: Icon(
                  Icons.gavel_rounded,
                  size: 16,
                  color: AppColors.accent,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                '$count ${AppStrings.auction}',
                style: AppTypography.labelMedium.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Icon(
                Icons.timer_outlined,
                size: 14,
                color: isDark
                    ? AppColors.textTertiaryDark
                    : AppColors.textTertiaryLight,
              ),
              const SizedBox(width: 4),
              Text(
                'مرتبة حسب الانتهاء',
                style: AppTypography.labelSmall.copyWith(
                  color: isDark
                      ? AppColors.textTertiaryDark
                      : AppColors.textTertiaryLight,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
