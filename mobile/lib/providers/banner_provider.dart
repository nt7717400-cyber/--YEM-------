/// Banner Provider for Flutter Customer App
/// Requirements: 5.1
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/banner.dart';
import '../repositories/banner_repository.dart';
import 'car_provider.dart'; // For apiClientProvider

// ============================================
// Repository Provider
// ============================================

/// Banner Repository Provider - مزود مستودع البانرات
final bannerRepositoryProvider = Provider<BannerRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BannerRepositoryImpl(apiClient: apiClient);
});

// ============================================
// Banner Providers
// ============================================

/// Banners Provider by Position - مزود البانرات حسب الموقع
/// Requirements: 5.1
final bannersProvider = FutureProvider.family<List<Banner>, String>((ref, position) async {
  final repository = ref.watch(bannerRepositoryProvider);
  return repository.getActiveBanners(position);
});

/// Hero Banners Provider - مزود بانرات الهيرو
/// Convenience provider for hero_top position
final heroBannersProvider = FutureProvider<List<Banner>>((ref) async {
  final repository = ref.watch(bannerRepositoryProvider);
  return repository.getActiveBanners(BannerPosition.heroTop.value);
});

/// Popup Banners Provider - مزود بانرات البوب أب
final popupBannersProvider = FutureProvider<List<Banner>>((ref) async {
  final repository = ref.watch(bannerRepositoryProvider);
  return repository.getActiveBanners(BannerPosition.popup.value);
});

/// Car Detail Banners Provider - مزود بانرات تفاصيل السيارة
final carDetailBannersProvider = FutureProvider<List<Banner>>((ref) async {
  final repository = ref.watch(bannerRepositoryProvider);
  return repository.getActiveBanners(BannerPosition.carDetail.value);
});

// ============================================
// Banner Actions
// ============================================

/// Track Banner View - تتبع مشاهدة البانر
/// Requirements: 5.2
Future<void> trackBannerView(WidgetRef ref, int bannerId) async {
  final repository = ref.read(bannerRepositoryProvider);
  await repository.trackView(bannerId);
}

/// Track Banner Click - تتبع النقر على البانر
/// Requirements: 5.3
Future<void> trackBannerClick(WidgetRef ref, int bannerId) async {
  final repository = ref.read(bannerRepositoryProvider);
  await repository.trackClick(bannerId);
}
