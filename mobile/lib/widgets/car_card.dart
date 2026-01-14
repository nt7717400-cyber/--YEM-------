/// CarCard Widget for Flutter Customer App
/// Requirements: 1.2, 1.3 - Display car info with featured badge

import 'package:flutter/material.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/widgets/retryable_image.dart';

/// Card widget displaying car information
/// Shows: image, name, brand, model, year, price, condition, featured badge
class CarCard extends StatelessWidget {
  final Car car;
  final VoidCallback? onTap;
  final bool showFeaturedBadge;

  const CarCard({
    super.key,
    required this.car,
    this.onTap,
    this.showFeaturedBadge = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image with badges
            _buildImageSection(isDark),
            // Car info
            _buildInfoSection(context, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection(bool isDark) {
    return AspectRatio(
      aspectRatio: 16 / 10,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Car image
          _buildCarImage(isDark),
          // Badges overlay
          _buildBadges(),
        ],
      ),
    );
  }

  Widget _buildCarImage(bool isDark) {
    final imageUrl = car.thumbnail ?? (car.images.isNotEmpty ? car.images.first.url : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Icon(
          Icons.directions_car,
          size: 48,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      );
    }

    final fullUrl = ApiEndpoints.getFullUrl(imageUrl);

    return Container(
      color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
      child: RetryableImage(
        imageUrl: fullUrl,
        fit: BoxFit.contain,
        errorWidget: Container(
          color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
          child: Icon(
            Icons.directions_car,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
        ),
      ),
    );
  }

  Widget _buildBadges() {
    return Positioned(
      top: 8,
      right: 8,
      left: 8,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Featured badge
          if (showFeaturedBadge && car.isFeatured)
            _buildBadge(
              text: AppStrings.featured,
              color: AppColors.featuredBadge,
              icon: Icons.star,
            ),
          const Spacer(),
          // Condition badge
          _buildConditionBadge(),
        ],
      ),
    );
  }

  Widget _buildConditionBadge() {
    final isNew = car.condition == CarCondition.newCar;
    return _buildBadge(
      text: isNew ? AppStrings.newCar : AppStrings.usedCar,
      color: isNew ? AppColors.newBadge : AppColors.usedBadge,
    );
  }

  Widget _buildBadge({
    required String text,
    required Color color,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: Colors.white),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Car name
          Text(
            car.name,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          // Brand and model
          Text(
            '${car.brand} ${car.model}',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          // Year and price row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Year
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 14,
                    color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    Formatters.formatYear(car.year),
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
              // Price
              Text(
                Formatters.formatCurrency(car.price),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          // Sold badge if applicable
          if (car.status == CarStatus.sold) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.soldBadge.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                AppStrings.sold,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.soldBadge,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Compact car card for horizontal lists
class CarCardCompact extends StatelessWidget {
  final Car car;
  final VoidCallback? onTap;
  final double width;

  const CarCardCompact({
    super.key,
    required this.car,
    this.onTap,
    this.width = 200,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      width: width,
      child: Card(
        clipBehavior: Clip.antiAlias,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Image
              AspectRatio(
                aspectRatio: 16 / 10,
                child: _buildImage(isDark),
              ),
              // Info
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      car.name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${car.brand} • ${car.year}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.formatCurrency(car.price),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImage(bool isDark) {
    final imageUrl = car.thumbnail ?? (car.images.isNotEmpty ? car.images.first.url : null);

    if (imageUrl == null) {
      return Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Icon(
          Icons.directions_car,
          size: 32,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      );
    }

    return RetryableImage(
      imageUrl: ApiEndpoints.getFullUrl(imageUrl),
      fit: BoxFit.cover,
      errorWidget: Container(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
        child: Icon(
          Icons.broken_image,
          size: 32,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      ),
    );
  }
}
