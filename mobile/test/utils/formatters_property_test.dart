/// Property-Based Tests for Formatters
/// Feature: flutter-customer-app
/// Property 8: Currency Formatting
/// **Validates: Requirements 8.3**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/core/utils/formatters.dart';

/// Custom generators for formatter testing
extension FormatterGenerators on Any {
  /// Generate a positive price value
  Generator<double> get positivePrice =>
      intInRange(1, 100000000).map((i) => i.toDouble());

  /// Generate a small positive price
  Generator<double> get smallPrice =>
      intInRange(1, 1000).map((i) => i.toDouble());

  /// Generate a large positive price
  Generator<double> get largePrice =>
      intInRange(1000000, 100000000).map((i) => i.toDouble());

  /// Generate a valid year
  Generator<int> get validYear => intInRange(1900, 2100);

  /// Generate a positive integer for counts
  Generator<int> get positiveCount => intInRange(0, 1000000);

  /// Generate kilometers value
  Generator<int> get kilometers => intInRange(0, 500000);
}

void main() {
  group('Currency Formatting Property Tests', () {
    /// Property 8: Currency Formatting
    /// *For any* price value, the formatted string should be in Arabic format
    /// with YER currency.
    Glados(any.positivePrice, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 8: Currency format contains YER currency symbol',
      (price) {
        final formatted = Formatters.formatCurrency(price);

        // Should contain Arabic Rial symbol
        expect(formatted.contains('ر.ي'), isTrue);
      },
    );

    Glados(any.positivePrice, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 8: Currency format produces non-empty string',
      (price) {
        final formatted = Formatters.formatCurrency(price);

        // Should not be empty
        expect(formatted.isNotEmpty, isTrue);

        // Should have reasonable length
        expect(formatted.length, greaterThan(3));
      },
    );

    Glados(any.largePrice, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 8: Large prices are formatted with separators',
      (price) {
        final formatted = Formatters.formatCurrency(price);

        // Large numbers should have Arabic comma separator (٬) or regular comma
        // The intl package uses Arabic comma for Arabic locale
        final hasArabicSeparator = formatted.contains('٬');
        final hasRegularSeparator = formatted.contains(',');
        expect(hasArabicSeparator || hasRegularSeparator, isTrue);
      },
    );

    Glados(any.positivePrice, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Property 8: Western currency format contains YER',
      (price) {
        final formatted = Formatters.formatCurrencyWestern(price);

        // Should contain YER
        expect(formatted.contains('YER'), isTrue);
      },
    );
  });

  group('Number Formatting Property Tests', () {
    Glados(any.positiveCount, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Number format produces non-empty string',
      (number) {
        final formatted = Formatters.formatNumber(number);

        // Should not be empty
        expect(formatted.isNotEmpty, isTrue);
      },
    );

    Glados(any.kilometers, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Kilometers format contains km symbol',
      (km) {
        final formatted = Formatters.formatKilometers(km);

        // Should contain Arabic km symbol
        expect(formatted.contains('كم'), isTrue);
      },
    );
  });

  group('Year Formatting Property Tests', () {
    Glados(any.validYear, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Year format produces 4-character string',
      (year) {
        final formatted = Formatters.formatYear(year);

        // Year should be 4 characters (Arabic numerals)
        expect(formatted.length, equals(4));
      },
    );

    Glados(any.validYear, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Year format contains only Arabic numerals',
      (year) {
        final formatted = Formatters.formatYear(year);

        // Should only contain Arabic numerals
        final arabicNumerals = RegExp(r'^[٠-٩]+$');
        expect(arabicNumerals.hasMatch(formatted), isTrue);
      },
    );
  });

  group('View Count Formatting Property Tests', () {
    Glados(any.positiveCount, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'View count format produces non-empty string',
      (count) {
        final formatted = Formatters.formatViewCount(count);

        // Should not be empty
        expect(formatted.isNotEmpty, isTrue);

        // Should contain Arabic word for view
        expect(formatted.contains('مشاهد'), isTrue);
      },
    );
  });

  group('Car Count Formatting Property Tests', () {
    Glados(any.positiveCount, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Car count format produces appropriate Arabic text',
      (count) {
        final formatted = Formatters.formatCarCount(count);

        // Should not be empty
        expect(formatted.isNotEmpty, isTrue);

        // Should contain Arabic word for car or "no cars"
        final containsCarWord = formatted.contains('سيار') ||
            formatted.contains('لا توجد');
        expect(containsCarWord, isTrue);
      },
    );
  });

  group('Numeral Conversion Property Tests', () {
    Glados(any.validYear, ExploreConfig(initialSize: 5, numRuns: 20)).test(
      'Western to Arabic numeral conversion is reversible',
      (year) {
        final yearStr = year.toString();
        final arabicYear = Formatters.formatYear(year);
        final backToWestern = Formatters.toWesternNumerals(arabicYear);

        // Round-trip should preserve the original value
        expect(backToWestern, equals(yearStr));
      },
    );
  });
}
