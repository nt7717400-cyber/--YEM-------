/// Modern Image Gallery - 2025 Design System
/// Image carousel with zoom and indicators
library;

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/models/car.dart';

/// Modern Image Gallery with page indicator
class ModernImageGallery extends StatefulWidget {
  final List<CarImage> images;
  final String? thumbnailUrl;
  final double height;
  final bool showIndicator;
  final bool enableZoom;
  final VoidCallback? onTap;

  const ModernImageGallery({
    super.key,
    required this.images,
    this.thumbnailUrl,
    this.height = 350,
    this.showIndicator = true,
    this.enableZoom = true,
    this.onTap,
  });

  @override
  State<ModernImageGallery> createState() => _ModernImageGalleryState();
}

class _ModernImageGalleryState extends State<ModernImageGallery> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<String> get _imageUrls {
    if (widget.images.isEmpty && widget.thumbnailUrl != null) {
      return [widget.thumbnailUrl!];
    }
    return widget.images.map((img) => img.url).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_imageUrls.isEmpty) {
      return _buildPlaceholder(isDark);
    }

    return SizedBox(
      height: widget.height,
      child: Stack(
        children: [
          // Image PageView
          PageView.builder(
            controller: _pageController,
            itemCount: _imageUrls.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: widget.onTap ?? () => _showFullScreen(index),
                child: _buildImage(_imageUrls[index], isDark),
              );
            },
          ),
          // Page indicator
          if (widget.showIndicator && _imageUrls.length > 1)
            Positioned(
              bottom: AppSpacing.md,
              left: 0,
              right: 0,
              child: _buildIndicator(),
            ),
          // Image counter badge
          if (_imageUrls.length > 1)
            Positioned(
              top: AppSpacing.md,
              right: AppSpacing.md,
              child: _buildCounterBadge(),
            ),
        ],
      ),
    );
  }

  Widget _buildImage(String url, bool isDark) {
    final fullUrl = ApiEndpoints.getFullUrl(url);

    return CachedNetworkImage(
      imageUrl: fullUrl,
      fit: BoxFit.cover,
      placeholder: (context, url) => Container(
        color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
        child: Center(
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation(AppColors.primary),
          ),
        ),
      ),
      errorWidget: (context, url, error) => Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Center(
          child: Icon(
            Icons.broken_image_rounded,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder(bool isDark) {
    return Container(
      height: widget.height,
      color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
      child: Center(
        child: Icon(
          Icons.directions_car_rounded,
          size: 64,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      ),
    );
  }

  Widget _buildIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_imageUrls.length, (index) {
        final isActive = index == _currentPage;
        return AnimatedContainer(
          duration: AppSpacing.durationFast,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: isActive ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive
                ? Colors.white
                : Colors.white.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 4,
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildCounterBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.6),
        borderRadius: AppSpacing.borderRadiusSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.photo_library_rounded,
            size: 14,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            '${_currentPage + 1}/${_imageUrls.length}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  void _showFullScreen(int initialIndex) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black87,
        pageBuilder: (context, animation, secondaryAnimation) {
          return _FullScreenGallery(
            images: _imageUrls,
            initialIndex: initialIndex,
          );
        },
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }
}

/// Full Screen Gallery View
class _FullScreenGallery extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const _FullScreenGallery({
    required this.images,
    required this.initialIndex,
  });

  @override
  State<_FullScreenGallery> createState() => _FullScreenGalleryState();
}

class _FullScreenGalleryState extends State<_FullScreenGallery> {
  late PageController _pageController;
  late int _currentPage;
  final TransformationController _transformController = TransformationController();

  @override
  void initState() {
    super.initState();
    _currentPage = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _transformController.dispose();
    super.dispose();
  }

  void _resetZoom() {
    _transformController.value = Matrix4.identity();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Zoomable image
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: PageView.builder(
              controller: _pageController,
              itemCount: widget.images.length,
              onPageChanged: (index) {
                setState(() => _currentPage = index);
                _resetZoom();
              },
              itemBuilder: (context, index) {
                return InteractiveViewer(
                  transformationController: _transformController,
                  minScale: 1.0,
                  maxScale: 4.0,
                  child: Center(
                    child: CachedNetworkImage(
                      imageUrl: ApiEndpoints.getFullUrl(widget.images[index]),
                      fit: BoxFit.contain,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(
                          color: Colors.white,
                        ),
                      ),
                      errorWidget: (context, url, error) => const Icon(
                        Icons.broken_image_rounded,
                        size: 64,
                        color: Colors.white54,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          // Close button
          Positioned(
            top: MediaQuery.of(context).padding.top + AppSpacing.md,
            right: AppSpacing.md,
            child: IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.close_rounded,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          // Page indicator
          if (widget.images.length > 1)
            Positioned(
              bottom: MediaQuery.of(context).padding.bottom + AppSpacing.xxl,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    borderRadius: AppSpacing.borderRadiusMd,
                  ),
                  child: Text(
                    '${_currentPage + 1} / ${widget.images.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
