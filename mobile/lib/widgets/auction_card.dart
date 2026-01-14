/// AuctionCard Widget for Flutter Customer App
/// Requirements: 3.2 - Display auction car with image, name, current price, bid count, countdown timer

import 'package:flutter/material.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/widgets/retryable_image.dart';
import 'countdown_timer.dart';

/// Card widget displaying auction information
/// Shows: car image, name, current price, bid count, countdown timer
class AuctionCard extends StatelessWidget {
  final Auction auction;
  final VoidCallback? onTap;

  const AuctionCard({
    super.key,
    required this.auction,
    this.onTap,
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
            // Auction info
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
    // Try direct thumbnail first, then car thumbnail, then car images
    final imageUrl = auction.thumbnail ?? 
        auction.car?.thumbnail ?? 
        (auction.car?.images.isNotEmpty == true ? auction.car!.images.first.url : null);

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
          // Auction badge
          _buildBadge(
            text: 'مزاد',
            color: AppColors.accent,
            icon: Icons.gavel,
          ),
          const Spacer(),
          // Status badge
          _buildStatusBadge(),
        ],
      ),
    );
  }

  Widget _buildStatusBadge() {
    if (auction.hasEnded) {
      return _buildBadge(
        text: 'انتهى المزاد',
        color: AppColors.soldBadge,
      );
    }
    return const SizedBox.shrink();
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
            auction.carName ?? auction.car?.name ?? 'سيارة',
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
          if (auction.brand != null || auction.car != null)
            Text(
              auction.brand != null 
                  ? '${auction.brand} ${auction.model ?? ''}'
                  : '${auction.car!.brand} ${auction.car!.model}',
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          const SizedBox(height: 8),
          // Current price
          Row(
            children: [
              Text(
                'السعر الحالي: ',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                Formatters.formatCurrency(auction.currentPrice),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Bid count and countdown
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Bid count
              Row(
                children: [
                  Icon(
                    Icons.people,
                    size: 14,
                    color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _formatBidCount(auction.bidCount),
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
              // Countdown timer
              if (auction.isActive)
                CountdownTimer(
                  endTime: auction.endTime,
                  compact: true,
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatBidCount(int count) {
    if (count == 0) return 'لا توجد عروض';
    if (count == 1) return 'عرض واحد';
    if (count == 2) return 'عرضان';
    if (count <= 10) return '$count عروض';
    return '$count عرض';
  }
}

/// Compact auction card for horizontal lists
class AuctionCardCompact extends StatelessWidget {
  final Auction auction;
  final VoidCallback? onTap;
  final double width;

  const AuctionCardCompact({
    super.key,
    required this.auction,
    this.onTap,
    this.width = 220,
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
              // Image with auction badge
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    _buildImage(isDark),
                    Positioned(
                      top: 6,
                      right: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.gavel, size: 10, color: Colors.white),
                            SizedBox(width: 3),
                            Text(
                              'مزاد',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Info
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auction.carName ?? auction.car?.name ?? 'سيارة',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.formatCurrency(auction.currentPrice),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (auction.isActive)
                      CountdownTimer(
                        endTime: auction.endTime,
                        compact: true,
                        textStyle: TextStyle(
                          fontSize: 11,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
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
    // Try direct thumbnail first, then car thumbnail, then car images
    final imageUrl = auction.thumbnail ?? 
        auction.car?.thumbnail ?? 
        (auction.car?.images.isNotEmpty == true ? auction.car!.images.first.url : null);

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
