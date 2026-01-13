/// Banner Repository for Flutter Customer App
/// Requirements: 5.4

import '../core/api/api_client.dart';
import '../models/banner.dart';

/// Abstract Banner Repository Interface
abstract class BannerRepository {
  /// Get active banners by position
  Future<List<Banner>> getActiveBanners(String position);

  /// Track banner view
  Future<void> trackView(int bannerId);

  /// Track banner click
  Future<void> trackClick(int bannerId);

  /// Filter banners by schedule (client-side)
  List<Banner> filterBySchedule(List<Banner> banners, [DateTime? now]);
}

/// Banner Repository Implementation
class BannerRepositoryImpl implements BannerRepository {
  final ApiClient _apiClient;

  BannerRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  @override
  Future<List<Banner>> getActiveBanners(String position) async {
    final banners = await _apiClient.getBannersByPosition(position);
    // Filter by schedule on client side as well for extra safety
    return filterBySchedule(banners);
  }

  @override
  Future<void> trackView(int bannerId) async {
    await _apiClient.trackBannerView(bannerId);
  }

  @override
  Future<void> trackClick(int bannerId) async {
    await _apiClient.trackBannerClick(bannerId);
  }

  /// Filter banners by schedule
  /// Requirements: 5.4
  /// Only returns banners that are:
  /// - Active (isActive == true)
  /// - Within their scheduled dates (startDate <= now <= endDate)
  @override
  List<Banner> filterBySchedule(List<Banner> banners, [DateTime? now]) {
    final currentTime = now ?? DateTime.now();
    
    return banners.where((banner) {
      // Must be active
      if (!banner.isActive) {
        return false;
      }
      
      // Check schedule using the Banner model's method
      return banner.isWithinSchedule(currentTime);
    }).toList()
      // Sort by display order
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
  }
}
