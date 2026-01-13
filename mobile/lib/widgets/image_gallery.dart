/// ImageGallery Widget for Flutter Customer App
/// Requirements: 3.2 - Display car images in gallery/carousel with zoom support

import 'package:flutter/material.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/widgets/retryable_image.dart';

/// Gallery widget for displaying car images
/// Features: page indicator, zoom support, fullscreen view, thumbnail strip
class ImageGallery extends StatefulWidget {
  final List<CarImage> images;
  final String? thumbnailUrl;
  final double height;
  final bool showIndicator;
  final bool enableZoom;
  final bool showThumbnails;

  const ImageGallery({
    super.key,
    required this.images,
    this.thumbnailUrl,
    this.height = 300,
    this.showIndicator = true,
    this.enableZoom = true,
    this.showThumbnails = true,
  });

  @override
  State<ImageGallery> createState() => _ImageGalleryState();
}

class _ImageGalleryState extends State<ImageGallery> {
  late PageController _pageController;
  int _currentIndex = 0;

  List<String> get _imageUrls {
    final urls = widget.images.map((img) => ApiEndpoints.getFullUrl(img.url)).toList();
    // Add thumbnail if no images available
    if (urls.isEmpty && widget.thumbnailUrl != null) {
      urls.add(ApiEndpoints.getFullUrl(widget.thumbnailUrl));
    }
    return urls;
  }

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

  void _openFullscreen(int initialIndex) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => FullscreenGallery(
          imageUrls: _imageUrls,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  void _goToImage(int index) {
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_imageUrls.isEmpty) {
      return _buildPlaceholder(isDark);
    }

    return Column(
      children: [
        // Main image
        SizedBox(
          height: widget.height,
          child: Stack(
            children: [
              // Image PageView
              PageView.builder(
                controller: _pageController,
                itemCount: _imageUrls.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: widget.enableZoom ? () => _openFullscreen(index) : null,
                    child: _buildImage(_imageUrls[index], isDark),
                  );
                },
              ),
              // Image count badge
              if (_imageUrls.length > 1)
                Positioned(
                  top: 12,
                  left: 12,
                  child: _buildCountBadge(),
                ),
              // Zoom hint
              if (widget.enableZoom)
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: _buildZoomHint(isDark),
                ),
            ],
          ),
        ),
        // Thumbnail strip (if multiple images)
        if (widget.showThumbnails && _imageUrls.length > 1)
          _buildThumbnailStrip(isDark),
        // Dot indicator (fallback if thumbnails disabled)
        if (!widget.showThumbnails && widget.showIndicator && _imageUrls.length > 1)
          _buildIndicator(isDark),
      ],
    );
  }

  Widget _buildThumbnailStrip(bool isDark) {
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: _imageUrls.length,
        itemBuilder: (context, index) {
          final isSelected = index == _currentIndex;
          return GestureDetector(
            onTap: () => _goToImage(index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
              decoration: BoxDecoration(
                border: Border.all(
                  color: isSelected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(6),
                boxShadow: isSelected ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 3,
                    spreadRadius: 0,
                  ),
                ] : null,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: RetryableImage(
                  imageUrl: _imageUrls[index],
                  fit: BoxFit.cover,
                  errorWidget: Container(
                    color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
                    child: Icon(
                      Icons.broken_image,
                      size: 16,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlaceholder(bool isDark) {
    return Container(
      height: widget.height,
      color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.image_not_supported,
              size: 64,
              color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
            ),
            const SizedBox(height: 8),
            Text(
              'لا توجد صور',
              style: TextStyle(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(String url, bool isDark) {
    return RetryableImage(
      imageUrl: url,
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Icon(
          Icons.broken_image,
          size: 64,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      ),
    );
  }

  Widget _buildCountBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.photo_library,
            size: 14,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            '${_currentIndex + 1}/${_imageUrls.length}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildZoomHint(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.zoom_in,
            size: 14,
            color: Colors.white,
          ),
          SizedBox(width: 4),
          Text(
            'اضغط للتكبير',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIndicator(bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_imageUrls.length, (index) {
          return GestureDetector(
            onTap: () => _goToImage(index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: _currentIndex == index ? 24 : 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                color: _currentIndex == index
                    ? AppColors.primary
                    : (isDark ? AppColors.borderDark : AppColors.borderLight),
              ),
            ),
          );
        }),
      ),
    );
  }
}

/// Fullscreen gallery with zoom and pan support
class FullscreenGallery extends StatefulWidget {
  final List<String> imageUrls;
  final int initialIndex;

  const FullscreenGallery({
    super.key,
    required this.imageUrls,
    this.initialIndex = 0,
  });

  @override
  State<FullscreenGallery> createState() => _FullscreenGalleryState();
}

class _FullscreenGalleryState extends State<FullscreenGallery> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${_currentIndex + 1} / ${widget.imageUrls.length}',
          style: const TextStyle(color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.imageUrls.length,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemBuilder: (context, index) {
          return InteractiveViewer(
            minScale: 0.5,
            maxScale: 4.0,
            child: Center(
              child: RetryableImage(
                imageUrl: widget.imageUrls[index],
                fit: BoxFit.contain,
                errorWidget: const Icon(
                  Icons.broken_image,
                  size: 64,
                  color: Colors.white54,
                ),
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: widget.imageUrls.length > 1
          ? _buildThumbnailStrip()
          : null,
    );
  }

  Widget _buildThumbnailStrip() {
    return Container(
      height: 80,
      color: Colors.black,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        itemCount: widget.imageUrls.length,
        itemBuilder: (context, index) {
          final isSelected = index == _currentIndex;
          return GestureDetector(
            onTap: () {
              _pageController.animateToPage(
                index,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );
            },
            child: Container(
              width: 64,
              height: 64,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: RetryableImage(
                  imageUrl: widget.imageUrls[index],
                  fit: BoxFit.cover,
                  errorWidget: Container(
                    color: Colors.grey[800],
                    child: const Icon(
                      Icons.broken_image,
                      size: 24,
                      color: Colors.white54,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Thumbnail grid for displaying multiple images
class ImageThumbnailGrid extends StatelessWidget {
  final List<CarImage> images;
  final int maxDisplay;
  final VoidCallback? onViewAll;

  const ImageThumbnailGrid({
    super.key,
    required this.images,
    this.maxDisplay = 4,
    this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final displayImages = images.take(maxDisplay).toList();
    final remainingCount = images.length - maxDisplay;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: displayImages.length,
      itemBuilder: (context, index) {
        final isLast = index == displayImages.length - 1 && remainingCount > 0;
        
        return GestureDetector(
          onTap: onViewAll,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Stack(
              fit: StackFit.expand,
              children: [
                RetryableImage(
                  imageUrl: ApiEndpoints.getFullUrl(displayImages[index].url),
                  fit: BoxFit.cover,
                  errorWidget: Container(
                    color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
                    child: const Icon(Icons.broken_image, size: 24),
                  ),
                ),
                if (isLast)
                  Container(
                    color: Colors.black.withValues(alpha: 0.6),
                    child: Center(
                      child: Text(
                        '+$remainingCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
