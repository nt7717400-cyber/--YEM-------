/// Settings Repository for Flutter Customer App
/// Requirements: 6.1

import '../core/api/api_client.dart';
import '../models/settings.dart';

/// Abstract Settings Repository Interface
abstract class SettingsRepository {
  /// Get showroom settings
  Future<ShowroomSettings> getSettings();
}

/// Settings Repository Implementation
class SettingsRepositoryImpl implements SettingsRepository {
  final ApiClient _apiClient;

  SettingsRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  @override
  Future<ShowroomSettings> getSettings() async {
    return _apiClient.getSettings();
  }
}
