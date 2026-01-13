/// BannerCarousel Widget for Flutter Customer App
/// Requirements: 5.1, 5.2, 5.3 - Display banners with auto-scroll and click tracking

import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:customer_app/models/banner.dart' as app_banner;
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/widgets/retryable_image.dart';

/// Carousel widget for displaying promotional banners
/// Features: auto-scroll, page indicator, click tracking
class BannerCarousel extends StatefulWidget {
  final List<app_banner.Banner> banners;
  final Function(app_banner.Banner)? onBannerView;
  final Function(app_banner.Banner)? onBannerClick;
  final double height;
  final bool autoPlay;
  final Duration autoPlayInterval;
  final bool showIndicator;

  const BannerCarousel({
    super.key,
    required this.banners,
    this.onBannerView,
    this.onBannerClick,
    this.height = 180,
    this.autoPlay = true,
    this.autoPlayInterval = const Duration(seconds: 5),
    this.showIndicator = true,
  });

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  int _currentIndex = 0;
  final CarouselSliderController _carouselController = CarouselSliderController();
  final Set<int> _viewedBanners = {};

  @override
  void initState() {
    super.initState();
    // Track initial banner view
    if (widget.banners.isNotEmpty) {
      _trackBannerView(0);
    }
  }

  void _trackBannerView(int index) {
    if (index < widget.banners.length && !_viewedBanners.contains(index)) {
      _viewedBanners.add(index);
      widget.onBannerView?.call(widget.banners[index]);
    }
  }

  void _handleBannerClick(app_banner.Banner banner) {
    widget.onBannerClick?.call(banner);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) {
      return const SizedBox.shrink();
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        CarouselSlider.builder(
          carouselController: _carouselController,
          itemCount: widget.banners.length,
          itemBuilder: (context, index, realIndex) {
            return _buildBannerItem(widget.banners[index], isDark);
          },
          options: CarouselOptions(
            height: widget.height,
            viewportFraction: 1.0,
            autoPlay: widget.autoPlay && widget.banners.length > 1,
            autoPlayInterval: widget.autoPlayInterval,
            autoPlayAnimationDuration: const Duration(milliseconds: 800),
            autoPlayCurve: Curves.fastOutSlowIn,
            enlargeCenterPage: false,
            onPageChanged: (index, reason) {
              setState(() {
                _currentIndex = index;
              });
              _trackBannerView(index);
            },
          ),
        ),
        if (widget.showIndicator && widget.banners.length > 1)
          _buildIndicator(isDark),
      ],
    );
  }

  Widget _buildBannerItem(app_banner.Banner banner, bool isDark) {
    // Use mobile image if available, otherwise use regular image
    final imageUrl = ApiEndpoints.getFullUrl(banner.imageMobileUrl ?? banner.imageUrl);

    return GestureDetector(
      onTap: banner.linkUrl != null ? () => _handleBannerClick(banner) : null,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Banner image
              RetryableImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                errorWidget: Container(
                  color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.broken_image,
                        size: 48,
                        color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        banner.title,
                        style: TextStyle(
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Click indicator for banners with links
              if (banner.linkUrl != null)
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.touch_app,
                          size: 14,
                          color: Colors.white,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'اضغط للمزيد',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIndicator(bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: widget.banners.asMap().entries.map((entry) {
          return GestureDetector(
            onTap: () => _carouselController.animateToPage(entry.key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: _currentIndex == entry.key ? 24 : 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                color: _currentIndex == entry.key
                    ? AppColors.primary
                    : (isDark ? AppColors.borderDark : AppColors.borderLight),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Simple banner display for single banner
class SingleBanner extends StatelessWidget {
  final app_banner.Banner banner;
  final VoidCallback? onView;
  final VoidCallback? onClick;
  final double height;

  const SingleBanner({
    super.key,
    required this.banner,
    this.onView,
    this.onClick,
    this.height = 120,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final imageUrl = banner.imageMobileUrl ?? banner.imageUrl;

    // Track view on build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      onView?.call();
    });

    return GestureDetector(
      onTap: banner.linkUrl != null ? onClick : null,
      child: Container(
        height: height,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: RetryableImage(
            imageUrl: imageUrl,
            fit: BoxFit.cover,
            errorWidget: Container(
              color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
              child: Center(
                child: Text(
                  banner.title,
                  style: TextStyle(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
