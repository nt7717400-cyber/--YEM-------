/// Property-Based Tests for Banner Schedule
/// Feature: flutter-customer-app, Property 5: Banner Schedule Validation
/// **Validates: Requirements 5.4**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect, setUp, tearDown;
import 'package:glados/glados.dart';
import 'package:customer_app/models/banner.dart';
import 'package:customer_app/repositories/banner_repository.dart';
import 'package:customer_app/core/api/api_client.dart';
import 'package:dio/dio.dart';

/// Custom generators for banner tests
extension BannerGenerators on Any {
  /// Generate a valid BannerPosition
  Generator<BannerPosition> get bannerPosition => choose(BannerPosition.values);

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 1000);

  /// Generate days offset (positive or negative)
  Generator<int> get daysOffset => intInRange(-30, 30);
}

/// Helper to create a test banner
Banner createTestBanner({
  required int id,
  required bool isActive,
  DateTime? startDate,
  DateTime? endDate,
  int displayOrder = 0,
}) {
  final now = DateTime.now();
  return Banner(
    id: id,
    title: 'Banner $id',
    imageUrl: 'https://example.com/banner_$id.jpg',
    position: BannerPosition.heroTop,
    isActive: isActive,
    startDate: startDate,
    endDate: endDate,
    displayOrder: displayOrder,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  group('Property 5: Banner Schedule Validation', () {
    late BannerRepositoryImpl repository;

    setUp(() {
      // Create a mock API client (we only test filterBySchedule which doesn't need API)
      final dio = Dio();
      final apiClient = ApiClient(baseUrl: 'https://example.com', dio: dio);
      repository = BannerRepositoryImpl(apiClient: apiClient);
    });

    /// Property 5.1: Banners within schedule are included
    /// *For any* banner with startDate <= now <= endDate, it should be displayed
    Glados2(any.boundedId, any.daysOffset).test(
      'Property 5.1: Active banners within schedule are included',
      (id, daysBeforeStart) {
        final now = DateTime.now();
        // Ensure start is before now and end is after now
        final startDate = now.subtract(Duration(days: daysBeforeStart.abs() + 1));
        final endDate = now.add(Duration(days: daysBeforeStart.abs() + 1));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be included
        expect(filtered.length, equals(1));
        expect(filtered.first.id, equals(id));
      },
    );

    /// Property 5.2: Banners before schedule start are excluded
    /// *For any* banner with startDate > now, it should NOT be displayed
    Glados(any.boundedId).test(
      'Property 5.2: Banners before schedule start are excluded',
      (id) {
        final now = DateTime.now();
        // Start date is in the future
        final startDate = now.add(const Duration(days: 5));
        final endDate = now.add(const Duration(days: 10));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be excluded
        expect(filtered.isEmpty, isTrue);
      },
    );

    /// Property 5.3: Banners after schedule end are excluded
    /// *For any* banner with endDate < now, it should NOT be displayed
    Glados(any.boundedId).test(
      'Property 5.3: Banners after schedule end are excluded',
      (id) {
        final now = DateTime.now();
        // End date is in the past
        final startDate = now.subtract(const Duration(days: 10));
        final endDate = now.subtract(const Duration(days: 5));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be excluded
        expect(filtered.isEmpty, isTrue);
      },
    );

    /// Property 5.4: Inactive banners are excluded regardless of schedule
    /// *For any* banner with isActive == false, it should NOT be displayed
    Glados(any.boundedId).test(
      'Property 5.4: Inactive banners are excluded regardless of schedule',
      (id) {
        final now = DateTime.now();
        // Valid schedule but inactive
        final startDate = now.subtract(const Duration(days: 5));
        final endDate = now.add(const Duration(days: 5));

        final banner = createTestBanner(
          id: id,
          isActive: false, // Inactive
          startDate: startDate,
          endDate: endDate,
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be excluded
        expect(filtered.isEmpty, isTrue);
      },
    );

    /// Property 5.5: Banners with no schedule dates are always valid (if active)
    /// *For any* active banner with null startDate and endDate, it should be displayed
    Glados(any.boundedId).test(
      'Property 5.5: Active banners with no schedule are always valid',
      (id) {
        final now = DateTime.now();

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: null, // No start date
          endDate: null, // No end date
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be included
        expect(filtered.length, equals(1));
        expect(filtered.first.id, equals(id));
      },
    );

    /// Property 5.6: Banners with only startDate are valid if now >= startDate
    Glados(any.boundedId).test(
      'Property 5.6: Banners with only startDate in past are valid',
      (id) {
        final now = DateTime.now();
        final startDate = now.subtract(const Duration(days: 5));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: null, // No end date
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be included
        expect(filtered.length, equals(1));
      },
    );

    /// Property 5.7: Banners with only endDate are valid if now <= endDate
    Glados(any.boundedId).test(
      'Property 5.7: Banners with only endDate in future are valid',
      (id) {
        final now = DateTime.now();
        final endDate = now.add(const Duration(days: 5));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: null, // No start date
          endDate: endDate,
        );

        final banners = [banner];
        final filtered = repository.filterBySchedule(banners, now);

        // Banner should be included
        expect(filtered.length, equals(1));
      },
    );

    /// Property 5.8: Filtered banners are sorted by displayOrder
    Glados(any.boundedId).test(
      'Property 5.8: Filtered banners are sorted by displayOrder',
      (seed) {
        final now = DateTime.now();
        final startDate = now.subtract(const Duration(days: 5));
        final endDate = now.add(const Duration(days: 5));

        // Create banners with different display orders
        final banners = [
          createTestBanner(id: 1, isActive: true, startDate: startDate, endDate: endDate, displayOrder: 3),
          createTestBanner(id: 2, isActive: true, startDate: startDate, endDate: endDate, displayOrder: 1),
          createTestBanner(id: 3, isActive: true, startDate: startDate, endDate: endDate, displayOrder: 2),
        ];

        final filtered = repository.filterBySchedule(banners, now);

        // Should be sorted by displayOrder
        expect(filtered.length, equals(3));
        expect(filtered[0].displayOrder, equals(1));
        expect(filtered[1].displayOrder, equals(2));
        expect(filtered[2].displayOrder, equals(3));
      },
    );
  });

  group('Banner.isWithinSchedule Method Tests', () {
    /// Test the Banner model's isWithinSchedule method directly
    Glados(any.boundedId).test(
      'isWithinSchedule returns true for banners within schedule',
      (id) {
        final now = DateTime.now();
        final startDate = now.subtract(const Duration(days: 1));
        final endDate = now.add(const Duration(days: 1));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        expect(banner.isWithinSchedule(now), isTrue);
      },
    );

    Glados(any.boundedId).test(
      'isWithinSchedule returns false for banners before start',
      (id) {
        final now = DateTime.now();
        final startDate = now.add(const Duration(days: 1));
        final endDate = now.add(const Duration(days: 5));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        expect(banner.isWithinSchedule(now), isFalse);
      },
    );

    Glados(any.boundedId).test(
      'isWithinSchedule returns false for banners after end',
      (id) {
        final now = DateTime.now();
        final startDate = now.subtract(const Duration(days: 5));
        final endDate = now.subtract(const Duration(days: 1));

        final banner = createTestBanner(
          id: id,
          isActive: true,
          startDate: startDate,
          endDate: endDate,
        );

        expect(banner.isWithinSchedule(now), isFalse);
      },
    );
  });
}
