/// Image Cache Manager for Flutter Customer App
/// Optimizes image loading and caching for better performance
library;

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:customer_app/core/constants/app_colors.dart';

/// Optimized cached network image with shimmer loading
class OptimizedCachedImage extends StatelessWidget {
  final String imageUrl;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final Widget? errorWidget;
  final BorderRadius? borderRadius;

  const OptimizedCachedImage({
    super.key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.placeholder,
    this.errorWidget,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Widget image = CachedNetworkImage(
      imageUrl: imageUrl,
      fit: fit,
      width: width,
      height: height,
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
      fadeInDuration: const Duration(milliseconds: 200),
      fadeOutDuration: const Duration(milliseconds: 200),
      placeholder: (context, url) => placeholder ?? _buildShimmerPlaceholder(isDark),
      errorWidget: (context, url, error) => errorWidget ?? _buildErrorWidget(isDark),
    );

    if (borderRadius != null) {
      image = ClipRRect(
        borderRadius: borderRadius!,
        child: image,
      );
    }

    return image;
  }

  Widget _buildShimmerPlaceholder(bool isDark) {
    return Container(
      color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
      child: Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }

  Widget _buildErrorWidget(bool isDark) {
    return Container(
      color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
      child: Icon(
        Icons.broken_image_outlined,
        size: 32,
        color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
      ),
    );
  }
}

/// Preload images for better UX
class ImagePreloader {
  static Future<void> preloadImages(BuildContext context, List<String> urls) async {
    for (final url in urls) {
      if (url.isNotEmpty) {
        try {
          await precacheImage(
            CachedNetworkImageProvider(url),
            context,
          );
        } catch (_) {
          // Silently fail - not critical
        }
      }
    }
  }

  static Future<void> preloadImage(BuildContext context, String url) async {
    if (url.isNotEmpty) {
      try {
        await precacheImage(
          CachedNetworkImageProvider(url),
          context,
        );
      } catch (_) {
        // Silently fail
      }
    }
  }
}
