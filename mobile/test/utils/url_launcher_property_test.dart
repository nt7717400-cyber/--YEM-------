/// Property-Based Tests for URL Launcher Utilities
/// Feature: flutter-customer-app
/// Property 6: WhatsApp URL Generation
/// Property 7: Phone URL Generation
/// **Validates: Requirements 4.1, 4.2, 4.3**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/core/utils/url_launcher_utils.dart';
import 'package:customer_app/models/car.dart';

/// Custom generators for URL testing
extension UrlGenerators on Any {
  /// Generate a valid phone number (Yemen format)
  Generator<String> get yemenPhoneNumber => intInRange(700000000, 789999999)
      .map((num) => num.toString());

  /// Generate a phone number with country code
  Generator<String> get phoneWithCountryCode =>
      yemenPhoneNumber.map((phone) => '+967${phone.substring(1)}');

  /// Generate a phone number with leading zero
  Generator<String> get phoneWithLeadingZero =>
      yemenPhoneNumber.map((phone) => '0${phone.substring(1)}');

  /// Generate a valid year
  Generator<int> get validYear => intInRange(1990, 2030);

  /// Generate a positive price
  Generator<double> get positivePrice =>
      intInRange(1000, 10000000).map((i) => i.toDouble());

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 100000);

  /// Generate a valid latitude
  Generator<double> get latitude =>
      intInRange(-90000, 90000).map((i) => i / 1000.0);

  /// Generate a valid longitude
  Generator<double> get longitude =>
      intInRange(-180000, 180000).map((i) => i / 1000.0);

  /// Generate a car brand name
  Generator<String> get carBrand => choose([
        'Toyota',
        'Honda',
        'Nissan',
        'Hyundai',
        'Kia',
        'Mercedes',
        'BMW',
        'Lexus',
      ]);

  /// Generate a car model name
  Generator<String> get carModel => choose([
        'Camry',
        'Corolla',
        'Civic',
        'Accord',
        'Altima',
        'Sonata',
        'Optima',
        'C-Class',
      ]);
}

void main() {
  group('WhatsApp URL Generation Property Tests', () {
    /// Property 6: WhatsApp URL Generation
    /// *For any* car and showroom settings, the generated WhatsApp URL should
    /// contain the correct phone number and include car details in the message.
    Glados2(any.phoneWithCountryCode, any.boundedId, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 6: WhatsApp URL contains correct phone number',
      (phoneNumber, carId) {
        final now = DateTime.now();
        final car = Car(
          id: carId,
          name: 'Test Car',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 50000.0,
          condition: CarCondition.newCar,
          createdAt: now,
          updatedAt: now,
        );

        final url = UrlLauncherUtils.generateWhatsAppUrl(
          phoneNumber: phoneNumber,
          car: car,
        );

        // URL should start with WhatsApp base URL
        expect(url.startsWith('https://wa.me/'), isTrue);

        // URL should contain the cleaned phone number (without +)
        final cleanedPhone = phoneNumber.replaceAll('+', '');
        expect(url.contains(cleanedPhone), isTrue);

        // URL should contain text parameter
        expect(url.contains('?text='), isTrue);
      },
    );

    Glados3(any.carBrand, any.carModel, any.positivePrice, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 6: WhatsApp URL message contains car details',
      (brand, model, price) {
        final now = DateTime.now();
        final car = Car(
          id: 1,
          name: '$brand $model',
          brand: brand,
          model: model,
          year: 2023,
          price: price,
          condition: CarCondition.newCar,
          createdAt: now,
          updatedAt: now,
        );

        final url = UrlLauncherUtils.generateWhatsAppUrl(
          phoneNumber: '+967771234567',
          car: car,
        );

        // Decode the URL to check message content
        final decodedUrl = Uri.decodeFull(url);

        // Message should contain car brand
        expect(decodedUrl.contains(brand), isTrue);

        // Message should contain car model
        expect(decodedUrl.contains(model), isTrue);

        // Message should contain car year
        expect(decodedUrl.contains('2023'), isTrue);
      },
    );

    Glados(any.yemenPhoneNumber, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 6: WhatsApp URL normalizes phone numbers without country code',
      (phoneNumber) {
        final now = DateTime.now();
        final car = Car(
          id: 1,
          name: 'Test Car',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 50000.0,
          condition: CarCondition.newCar,
          createdAt: now,
          updatedAt: now,
        );

        final url = UrlLauncherUtils.generateWhatsAppUrl(
          phoneNumber: phoneNumber,
          car: car,
        );

        // URL should contain Yemen country code (967)
        expect(url.contains('967'), isTrue);
      },
    );

    Glados(any.phoneWithLeadingZero, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 6: WhatsApp URL handles phone numbers with leading zero',
      (phoneNumber) {
        final now = DateTime.now();
        final car = Car(
          id: 1,
          name: 'Test Car',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 50000.0,
          condition: CarCondition.newCar,
          createdAt: now,
          updatedAt: now,
        );

        final url = UrlLauncherUtils.generateWhatsAppUrl(
          phoneNumber: phoneNumber,
          car: car,
        );

        // URL should start with WhatsApp base URL
        expect(url.startsWith('https://wa.me/'), isTrue);

        // URL should contain country code
        expect(url.contains('967'), isTrue);

        // URL should not contain leading zero after country code
        expect(url.contains('/+9670'), isFalse);
      },
    );
  });

  group('Phone URL Generation Property Tests', () {
    /// Property 7: Phone URL Generation
    /// *For any* showroom settings with a phone number, the generated phone URL
    /// should be in the format "tel:{phone}".
    Glados(any.phoneWithCountryCode, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 7: Phone URL has correct tel: format',
      (phoneNumber) {
        final url = UrlLauncherUtils.generatePhoneUrl(phoneNumber);

        // URL should start with tel:
        expect(url.startsWith('tel:'), isTrue);

        // URL should contain the phone number
        final cleanedPhone = phoneNumber.replaceAll('+', '');
        expect(url.contains(cleanedPhone), isTrue);
      },
    );

    Glados(any.yemenPhoneNumber, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 7: Phone URL normalizes numbers without country code',
      (phoneNumber) {
        final url = UrlLauncherUtils.generatePhoneUrl(phoneNumber);

        // URL should start with tel:
        expect(url.startsWith('tel:'), isTrue);

        // URL should contain Yemen country code
        expect(url.contains('967'), isTrue);
      },
    );

    Glados(any.phoneWithLeadingZero, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 7: Phone URL handles numbers with leading zero',
      (phoneNumber) {
        final url = UrlLauncherUtils.generatePhoneUrl(phoneNumber);

        // URL should start with tel:
        expect(url.startsWith('tel:'), isTrue);

        // URL should contain country code
        expect(url.contains('967'), isTrue);

        // URL should not have double zeros
        expect(url.contains('+9670'), isFalse);
      },
    );
  });

  group('Maps URL Generation Property Tests', () {
    Glados2(any.latitude, any.longitude, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Maps URL contains valid coordinates',
      (lat, lng) {
        final url = UrlLauncherUtils.generateMapsUrl(
          latitude: lat,
          longitude: lng,
        );

        // URL should be a Google Maps URL
        expect(url.contains('google.com/maps'), isTrue);

        // URL should contain the coordinates
        expect(url.contains(lat.toString()), isTrue);
        expect(url.contains(lng.toString()), isTrue);
      },
    );
  });
}
