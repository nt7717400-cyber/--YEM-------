/// Retryable Image Widget for Flutter Customer App
/// Handles image loading with automatic retry on failure
library;

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:customer_app/core/constants/app_colors.dart';

/// Retryable Image Widget with automatic retry on failure
class RetryableImage extends StatelessWidget {
  final String imageUrl;
  final BoxFit fit;
  final int maxRetries;
  final Widget? placeholder;
  final Widget? errorWidget;
  final double? width;
  final double? height;

  const RetryableImage({
    super.key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.maxRetries = 3,
    this.placeholder,
    this.errorWidget,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return CachedNetworkImage(
      imageUrl: imageUrl,
      fit: fit,
      width: width,
      height: height,
      // Optimize memory by resizing cached images
      memCacheWidth: width?.toInt() ?? 800,
      memCacheHeight: height?.toInt() ?? 800,
      // Faster fade animations
      fadeInDuration: const Duration(milliseconds: 150),
      fadeOutDuration: const Duration(milliseconds: 100),
      // Use placeholder and error widgets
      placeholder: (context, url) => placeholder ?? _buildDefaultPlaceholder(isDark),
      errorWidget: (context, url, error) {
        debugPrint('Image error for $imageUrl: $error');
        return errorWidget ?? _buildDefaultError(isDark);
      },
    );
  }

  Widget _buildDefaultPlaceholder(bool isDark) {
    return Container(
      color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
      child: Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: isDark ? AppColors.textHintDark : AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultError(bool isDark) {
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
