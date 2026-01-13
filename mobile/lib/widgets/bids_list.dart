/// BidsList Widget for Flutter Customer App
/// Requirements: 5.1 - Display bids with bidder names, masked phones, and amounts

import 'package:flutter/material.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/utils/formatters.dart';

/// Widget to display list of bids for an auction
/// Shows: bidder name, masked phone number, bid amount
class BidsList extends StatelessWidget {
  final List<Bid> bids;
  final bool showHeader;
  final int? maxItems;

  const BidsList({
    super.key,
    required this.bids,
    this.showHeader = true,
    this.maxItems,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final displayBids = maxItems != null ? bids.take(maxItems!).toList() : bids;

    if (bids.isEmpty) {
      return _buildEmptyState(isDark);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (showHeader) ...[
          _buildHeader(isDark),
          const SizedBox(height: 12),
        ],
        ...displayBids.asMap().entries.map((entry) {
          final index = entry.key;
          final bid = entry.value;
          return _buildBidItem(bid, index, isDark);
        }),
        if (maxItems != null && bids.length > maxItems!) ...[
          const SizedBox(height: 8),
          _buildShowMoreButton(isDark),
        ],
      ],
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            Icons.gavel,
            size: 48,
            color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
          ),
          const SizedBox(height: 12),
          Text(
            'لا توجد عروض بعد',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'كن أول من يقدم عرضاً!',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Row(
      children: [
        Icon(
          Icons.list_alt,
          color: AppColors.primary,
          size: 20,
        ),
        const SizedBox(width: 8),
        Text(
          'العروض المقدمة',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '${bids.length}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBidItem(Bid bid, int index, bool isDark) {
    final isHighest = index == 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isHighest
            ? AppColors.success.withValues(alpha: 0.1)
            : (isDark ? AppColors.surfaceDark : Colors.white),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isHighest
              ? AppColors.success.withValues(alpha: 0.3)
              : (isDark ? AppColors.borderDark : AppColors.borderLight),
        ),
      ),
      child: Row(
        children: [
          // Rank badge
          _buildRankBadge(index, isHighest),
          const SizedBox(width: 12),
          // Bidder info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      bid.bidderName,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                    if (isHighest) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.success,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'الأعلى',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.phone,
                      size: 12,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                    const SizedBox(width: 4),
                    Directionality(
                      textDirection: TextDirection.ltr,
                      child: Text(
                        bid.maskedPhone,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Icon(
                      Icons.access_time,
                      size: 12,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      Formatters.formatRelativeTime(bid.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Bid amount
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                Formatters.formatCurrency(bid.amount),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isHighest ? AppColors.success : AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRankBadge(int index, bool isHighest) {
    final rank = index + 1;
    Color badgeColor;
    IconData? icon;

    if (rank == 1) {
      badgeColor = AppColors.success;
      icon = Icons.emoji_events;
    } else if (rank == 2) {
      badgeColor = AppColors.accent;
    } else if (rank == 3) {
      badgeColor = AppColors.warning;
    } else {
      badgeColor = AppColors.secondary;
    }

    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: badgeColor.withValues(alpha: 0.2),
        shape: BoxShape.circle,
        border: Border.all(color: badgeColor, width: 2),
      ),
      child: Center(
        child: icon != null
            ? Icon(icon, size: 16, color: badgeColor)
            : Text(
                '$rank',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: badgeColor,
                ),
              ),
      ),
    );
  }

  Widget _buildShowMoreButton(bool isDark) {
    return TextButton(
      onPressed: () {
        // This would typically navigate to a full bids list
      },
      child: Text(
        'عرض جميع العروض (${bids.length})',
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

/// Compact bids list for preview
class BidsListCompact extends StatelessWidget {
  final List<Bid> bids;
  final int maxItems;

  const BidsListCompact({
    super.key,
    required this.bids,
    this.maxItems = 3,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final displayBids = bids.take(maxItems).toList();

    if (bids.isEmpty) {
      return Text(
        'لا توجد عروض بعد',
        style: TextStyle(
          fontSize: 12,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: displayBids.map((bid) => _buildCompactBidItem(bid, isDark)).toList(),
    );
  }

  Widget _buildCompactBidItem(Bid bid, bool isDark) {
    final isHighest = bids.indexOf(bid) == 0;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          if (isHighest)
            Icon(
              Icons.emoji_events,
              size: 14,
              color: AppColors.success,
            )
          else
            const SizedBox(width: 14),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              bid.bidderName,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            Formatters.formatCurrency(bid.amount),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isHighest ? AppColors.success : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Single bid item widget for reuse
class BidItem extends StatelessWidget {
  final Bid bid;
  final bool isHighest;
  final bool showRank;
  final int? rank;

  const BidItem({
    super.key,
    required this.bid,
    this.isHighest = false,
    this.showRank = false,
    this.rank,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isHighest
            ? AppColors.success.withValues(alpha: 0.1)
            : (isDark ? AppColors.surfaceDark : Colors.white),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isHighest
              ? AppColors.success.withValues(alpha: 0.3)
              : (isDark ? AppColors.borderDark : AppColors.borderLight),
        ),
      ),
      child: Row(
        children: [
          // Bidder info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      bid.bidderName,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                    if (isHighest) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.emoji_events,
                        size: 16,
                        color: AppColors.success,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Directionality(
                  textDirection: TextDirection.ltr,
                  child: Text(
                    bid.maskedPhone,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Bid amount
          Text(
            Formatters.formatCurrency(bid.amount),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isHighest ? AppColors.success : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}
