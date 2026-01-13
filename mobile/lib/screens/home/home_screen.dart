/// Modern Home Screen - 2025 Design System
/// Requirements: 5.1, 7.1, 7.2, 7.3 - Hero banners, featured cars, quick search
/// Requirements: 3.1 - Add auctions section
library;

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/models/banner.dart' as app_banner;
import 'package:customer_app/providers/car_provider.dart';
import 'package:customer_app/providers/banner_provider.dart';
import 'package:customer_app/providers/auction_provider.dart';
import 'package:customer_app/widgets/banner_carousel.dart';
import 'package:customer_app/widgets/modern/index.dart';
import 'package:url_launcher/url_launcher.dart';

/// Home Screen - الشاشة الرئيسية
/// Modern design with blur app bar, enhanced sections
class HomeScreen extends ConsumerStatefulWidget {
  final VoidCallback? onNavigateToCars;
  final VoidCallback? onNavigateToAuctions;
  final Function(String? search)? onSearch;
  final Function(Car car)? onCarTap;
  final Function(Auction auction)? onAuctionTap;

  const HomeScreen({
    super.key,
    this.onNavigateToCars,
    this.onNavigateToAuctions,
    this.onSearch,
    this.onCarTap,
    this.onAuctionTap,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final isScrolled = _scrollController.offset > 10;
    if (isScrolled != _isScrolled) {
      setState(() => _isScrolled = isScrolled);
    }
  }

  void _handleSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      widget.onSearch?.call(query);
    }
  }

  Future<void> _handleBannerClick(app_banner.Banner banner) async {
    await trackBannerClick(ref, banner.id);
    if (banner.linkUrl != null && banner.linkUrl!.isNotEmpty) {
      final uri = Uri.tryParse(banner.linkUrl!);
      if (uri != null && await canLaunchUrl(uri)) {
        await launchUrl(
          uri,
          mode: banner.linkTarget == app_banner.LinkTarget.blank
              ? LaunchMode.externalApplication
              : LaunchMode.inAppWebView,
        );
      }
    }
  }

  void _handleBannerView(app_banner.Banner banner) {
    trackBannerView(ref, banner.id);
  }

  Future<void> _refreshData() async {
    ref.invalidate(heroBannersProvider);
    ref.invalidate(featuredCarsProvider);
    ref.invalidate(activeAuctionsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppSpacing.lg),
                  // Hero Banner Carousel
                  _buildHeroBanners(),
                  const SizedBox(height: AppSpacing.xxl),
                  // Quick Search
                  _buildQuickSearch(isDark),
                  const SizedBox(height: AppSpacing.sectionGap),
                  // Active Auctions Section
                  _buildAuctionsSection(isDark),
                  const SizedBox(height: AppSpacing.sectionGap),
                  // Featured Cars Section
                  _buildFeaturedCarsSection(isDark),
                  const SizedBox(height: AppSpacing.xxxl),
                ],
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
                        color: AppColors.primarySurface,
                        borderRadius: AppSpacing.borderRadiusSm,
                      ),
                      child: Icon(
                        Icons.directions_car_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      AppStrings.appName,
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

  /// Hero Banners
  Widget _buildHeroBanners() {
    final bannersAsync = ref.watch(heroBannersProvider);

    return bannersAsync.when(
      data: (banners) {
        if (banners.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: BannerCarousel(
            banners: banners,
            height: AppSpacing.bannerHeight,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 5),
            onBannerView: _handleBannerView,
            onBannerClick: _handleBannerClick,
          ),
        );
      },
      loading: () => const ModernBannerShimmer(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  /// Quick Search Bar
  Widget _buildQuickSearch(bool isDark) {
    return Padding(
      padding: AppSpacing.screenPaddingHorizontal,
      child: ModernSearchBar(
        controller: _searchController,
        hint: AppStrings.searchHint,
        onSubmitted: (_) => _handleSearch(),
        showShadow: true,
      ),
    );
  }

  /// Section Header
  Widget _buildSectionHeader({
    required String title,
    required IconData icon,
    required Color iconColor,
    VoidCallback? onViewAll,
    required bool isDark,
  }) {
    return Padding(
      padding: AppSpacing.screenPaddingHorizontal,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: AppSpacing.borderRadiusSm,
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: AppSpacing.md),
          Text(
            title,
            style: AppTypography.headlineSmall.copyWith(
              color: isDark
                  ? AppColors.textPrimaryDark
                  : AppColors.textPrimaryLight,
            ),
          ),
          const Spacer(),
          if (onViewAll != null)
            TextButton.icon(
              onPressed: onViewAll,
              icon: Text(
                AppStrings.viewAll,
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.primary,
                ),
              ),
              label: Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: AppColors.primary,
              ),
            ),
        ],
      ),
    );
  }

  /// Auctions Section
  Widget _buildAuctionsSection(bool isDark) {
    final auctionsAsync = ref.watch(activeAuctionsProvider);

    return auctionsAsync.when(
      data: (auctions) {
        if (auctions.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader(
              title: AppStrings.auctions,
              icon: Icons.gavel_rounded,
              iconColor: AppColors.accent,
              onViewAll: widget.onNavigateToAuctions,
              isDark: isDark,
            ),
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              height: 260,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: AppSpacing.screenPaddingHorizontal,
                itemCount: auctions.length > 5 ? 5 : auctions.length,
                itemBuilder: (context, index) {
                  final auction = auctions[index];
                  return Padding(
                    padding: EdgeInsets.only(
                      left: index == 0 ? 0 : AppSpacing.itemGap,
                    ),
                    child: ModernAuctionCardCompact(
                      auction: auction,
                      onTap: () => widget.onAuctionTap?.call(auction),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(
            title: AppStrings.auctions,
            icon: Icons.gavel_rounded,
            iconColor: AppColors.accent,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          const ModernHorizontalListShimmer(
            itemCount: 3,
            itemWidth: AppSpacing.auctionCardWidth,
            height: 260,
          ),
        ],
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  /// Featured Cars Section
  Widget _buildFeaturedCarsSection(bool isDark) {
    final featuredCarsAsync = ref.watch(featuredCarsProvider);

    return featuredCarsAsync.when(
      data: (cars) {
        if (cars.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader(
              title: AppStrings.featuredCars,
              icon: Icons.star_rounded,
              iconColor: AppColors.featuredBadge,
              onViewAll: widget.onNavigateToCars,
              isDark: isDark,
            ),
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              height: 240,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: AppSpacing.screenPaddingHorizontal,
                itemCount: cars.length,
                itemBuilder: (context, index) {
                  final car = cars[index];
                  return Padding(
                    padding: EdgeInsets.only(
                      left: index == 0 ? 0 : AppSpacing.itemGap,
                    ),
                    child: ModernCarCardCompact(
                      car: car,
                      onTap: () => widget.onCarTap?.call(car),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(
            title: AppStrings.featuredCars,
            icon: Icons.star_rounded,
            iconColor: AppColors.featuredBadge,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          const ModernHorizontalListShimmer(
            itemCount: 3,
            itemWidth: AppSpacing.cardCompactWidth,
            height: 240,
          ),
        ],
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
