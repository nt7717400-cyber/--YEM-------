/// Settings Provider for Flutter Customer App
/// Requirements: 6.1
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/settings.dart';
import '../repositories/settings_repository.dart';
import 'car_provider.dart'; // For apiClientProvider

// ============================================
// Repository Provider
// ============================================

/// Settings Repository Provider - مزود مستودع الإعدادات
final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SettingsRepositoryImpl(apiClient: apiClient);
});

// ============================================
// Settings Provider
// ============================================

/// Settings Provider - مزود إعدادات المعرض
/// Requirements: 6.1
final settingsProvider = FutureProvider<ShowroomSettings>((ref) async {
  final repository = ref.watch(settingsRepositoryProvider);
  return repository.getSettings();
});

/// Showroom Name Provider - مزود اسم المعرض
/// Convenience provider for just the showroom name
final showroomNameProvider = FutureProvider<String>((ref) async {
  final settings = await ref.watch(settingsProvider.future);
  return settings.name;
});

/// Showroom Contact Provider - مزود معلومات التواصل
/// Returns phone and whatsapp numbers
final showroomContactProvider = FutureProvider<({String phone, String whatsapp})>((ref) async {
  final settings = await ref.watch(settingsProvider.future);
  return (phone: settings.phone, whatsapp: settings.whatsapp);
});

/// Showroom Location Provider - مزود موقع المعرض
/// Returns map coordinates if available
final showroomLocationProvider = FutureProvider<({double? lat, double? lng, String address})>((ref) async {
  final settings = await ref.watch(settingsProvider.future);
  return (
    lat: settings.mapLatitude,
    lng: settings.mapLongitude,
    address: settings.address,
  );
});
