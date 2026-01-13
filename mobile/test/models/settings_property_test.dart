/// Property-Based Tests for Settings Model
/// Feature: flutter-customer-app, Property 10: Settings Data Completeness
/// **Validates: Requirements 6.1**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/settings.dart';

/// Custom generators for Settings model
extension SettingsGenerators on Any {
  /// Generate a valid phone number
  Generator<String> get phoneNumber =>
      intInRange(700000000, 799999999).map((n) => '+967$n');

  /// Generate optional latitude
  Generator<double?> get optionalLatitude =>
      either(
        doubleInRange(-90.0, 90.0).map((d) => d as double?),
        always(null),
      );

  /// Generate optional longitude
  Generator<double?> get optionalLongitude =>
      either(
        doubleInRange(-180.0, 180.0).map((d) => d as double?),
        always(null),
      );

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 100000);
}

void main() {
  group('Settings Model Property Tests', () {
    /// Property 10: Settings Data Completeness
    /// *For any* settings response, it should contain name, description, address,
    /// phone, whatsapp, and workingHours.
    Glados(any.boundedId, ExploreConfig(initialSize: 5, numRuns: 100)).test(
      'Property 10: Settings JSON round-trip preserves all required fields',
      (id) {
        final now = DateTime.now();
        final settings = ShowroomSettings(
          id: id.toString(),
          name: 'Test Showroom $id',
          description: 'Test Description $id',
          address: 'Test Address $id',
          phone: '+967777${id % 1000000}',
          whatsapp: '+967777${id % 1000000}',
          workingHours: '9:00 AM - 6:00 PM',
          updatedAt: now,
        );

        // Serialize to JSON
        final json = settings.toJson();

        // Deserialize back
        final restored = ShowroomSettings.fromJson(json);

        // Verify all required fields are preserved
        expect(restored.id, equals(settings.id));
        expect(restored.name, equals(settings.name));
        expect(restored.description, equals(settings.description));
        expect(restored.address, equals(settings.address));
        expect(restored.phone, equals(settings.phone));
        expect(restored.whatsapp, equals(settings.whatsapp));
        expect(restored.workingHours, equals(settings.workingHours));
      },
    );

    Glados2(any.phoneNumber, any.phoneNumber, ExploreConfig(initialSize: 5, numRuns: 100)).test(
      'Property 10: Settings phone and whatsapp preserved in round-trip',
      (phone, whatsapp) {
        final now = DateTime.now();
        final settings = ShowroomSettings(
          id: '1',
          name: 'Test Showroom',
          description: 'Test Description',
          address: 'Test Address',
          phone: phone,
          whatsapp: whatsapp,
          workingHours: '9:00 AM - 6:00 PM',
          updatedAt: now,
        );

        final json = settings.toJson();
        final restored = ShowroomSettings.fromJson(json);

        expect(restored.phone, equals(phone));
        expect(restored.whatsapp, equals(whatsapp));
      },
    );

    Glados2(any.optionalLatitude, any.optionalLongitude, ExploreConfig(initialSize: 5, numRuns: 100)).test(
      'Property 10: Settings map coordinates preserved in round-trip',
      (lat, lng) {
        final now = DateTime.now();
        final settings = ShowroomSettings(
          id: '1',
          name: 'Test Showroom',
          description: 'Test Description',
          address: 'Test Address',
          phone: '+967777123456',
          whatsapp: '+967777123456',
          workingHours: '9:00 AM - 6:00 PM',
          mapLatitude: lat,
          mapLongitude: lng,
          updatedAt: now,
        );

        final json = settings.toJson();
        final restored = ShowroomSettings.fromJson(json);

        expect(restored.mapLatitude, equals(lat));
        expect(restored.mapLongitude, equals(lng));
      },
    );

    Glados(any.boundedId, ExploreConfig(initialSize: 5, numRuns: 100)).test(
      'Property 10: Settings isComplete returns true when all required fields are non-empty',
      (id) {
        final now = DateTime.now();
        final settings = ShowroomSettings(
          id: id.toString(),
          name: 'Test Showroom',
          description: 'Test Description',
          address: 'Test Address',
          phone: '+967777123456',
          whatsapp: '+967777123456',
          workingHours: '9:00 AM - 6:00 PM',
          updatedAt: now,
        );

        // All required fields are non-empty, so isComplete should be true
        expect(settings.isComplete, isTrue);
      },
    );

    Glados2(any.optionalLatitude, any.optionalLongitude, ExploreConfig(initialSize: 5, numRuns: 100)).test(
      'Property 10: Settings hasMapCoordinates is true only when both lat and lng are present',
      (lat, lng) {
        final now = DateTime.now();
        final settings = ShowroomSettings(
          id: '1',
          name: 'Test Showroom',
          description: 'Test Description',
          address: 'Test Address',
          phone: '+967777123456',
          whatsapp: '+967777123456',
          workingHours: '9:00 AM - 6:00 PM',
          mapLatitude: lat,
          mapLongitude: lng,
          updatedAt: now,
        );

        // hasMapCoordinates should be true only when both are non-null
        final expectedHasCoordinates = lat != null && lng != null;
        expect(settings.hasMapCoordinates, equals(expectedHasCoordinates));
      },
    );
  });

  group('Settings Model Edge Cases', () {
    test('Settings with empty name returns isComplete as false', () {
      final now = DateTime.now();
      final settings = ShowroomSettings(
        id: '1',
        name: '',
        description: 'Test Description',
        address: 'Test Address',
        phone: '+967777123456',
        whatsapp: '+967777123456',
        workingHours: '9:00 AM - 6:00 PM',
        updatedAt: now,
      );

      expect(settings.isComplete, isFalse);
    });

    test('Settings fromJson handles missing optional fields', () {
      final json = {
        'id': '1',
        'name': 'Test Showroom',
        'description': 'Test Description',
        'address': 'Test Address',
        'phone': '+967777123456',
        'whatsapp': '+967777123456',
        'workingHours': '9:00 AM - 6:00 PM',
        'updatedAt': DateTime.now().toIso8601String(),
        // mapLatitude and mapLongitude are missing
      };

      final settings = ShowroomSettings.fromJson(json);

      expect(settings.mapLatitude, isNull);
      expect(settings.mapLongitude, isNull);
      expect(settings.hasMapCoordinates, isFalse);
    });

    test('Settings copyWith preserves unchanged fields', () {
      final now = DateTime.now();
      final original = ShowroomSettings(
        id: '1',
        name: 'Original Name',
        description: 'Original Description',
        address: 'Original Address',
        phone: '+967777111111',
        whatsapp: '+967777222222',
        workingHours: '9:00 AM - 6:00 PM',
        mapLatitude: 15.3694,
        mapLongitude: 44.1910,
        updatedAt: now,
      );

      final updated = original.copyWith(name: 'Updated Name');

      expect(updated.name, equals('Updated Name'));
      expect(updated.description, equals(original.description));
      expect(updated.address, equals(original.address));
      expect(updated.phone, equals(original.phone));
      expect(updated.whatsapp, equals(original.whatsapp));
      expect(updated.workingHours, equals(original.workingHours));
      expect(updated.mapLatitude, equals(original.mapLatitude));
      expect(updated.mapLongitude, equals(original.mapLongitude));
    });

    test('Settings equality works correctly', () {
      final now = DateTime.now();
      final settings1 = ShowroomSettings(
        id: '1',
        name: 'Test Showroom',
        description: 'Test Description',
        address: 'Test Address',
        phone: '+967777123456',
        whatsapp: '+967777123456',
        workingHours: '9:00 AM - 6:00 PM',
        updatedAt: now,
      );

      final settings2 = ShowroomSettings(
        id: '1',
        name: 'Test Showroom',
        description: 'Different Description',
        address: 'Test Address',
        phone: '+967777123456',
        whatsapp: '+967777123456',
        workingHours: 'Different Hours',
        updatedAt: now,
      );

      // Equality is based on id, name, address, phone, whatsapp
      expect(settings1, equals(settings2));
    });
  });
}
