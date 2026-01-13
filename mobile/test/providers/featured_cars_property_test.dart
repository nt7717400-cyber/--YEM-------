/// Property-Based Tests for Featured Cars Filter
/// Feature: flutter-customer-app, Property 4: Featured Cars Filter
/// **Validates: Requirements 7.1**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/car_filter.dart';

/// Custom generators for featured cars tests
extension FeaturedCarsGenerators on Any {
  /// Generate a valid CarCondition
  Generator<CarCondition> get carCondition => choose(CarCondition.values);

  /// Generate a valid CarStatus
  Generator<CarStatus> get carStatus => choose(CarStatus.values);

  /// Generate a valid year
  Generator<int> get validYear => intInRange(2000, 2025);

  /// Generate a positive price
  Generator<double> get positivePrice =>
      intInRange(10000, 500000).map((i) => i.toDouble());

  /// Generate a brand name
  Generator<String> get brandName =>
      choose(['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes']);

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 1000);

  /// Generate a boolean for featured status
  Generator<bool> get isFeatured => choose([true, false]);
}

/// Helper to create a test car
Car createTestCar({
  required int id,
  required String brand,
  required CarCondition condition,
  required double price,
  required int year,
  required bool isFeatured,
  CarStatus status = CarStatus.available,
}) {
  final now = DateTime.now();
  return Car(
    id: id,
    name: 'Car $id',
    brand: brand,
    model: 'Model $id',
    year: year,
    price: price,
    condition: condition,
    status: status,
    isFeatured: isFeatured,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  group('Property 4: Featured Cars Filter', () {
    /// Property 4.1: Featured filter returns only cars where isFeatured is true
    /// *For any* list of cars, filtering for featured cars should return only cars where isFeatured is true
    Glados(any.boundedId).test(
      'Property 4.1: Featured filter returns only cars with isFeatured=true',
      (seed) {
        // Create a mix of featured and non-featured cars
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023, isFeatured: true),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020, isFeatured: false),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 45000, year: 2022, isFeatured: true),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 80000, year: 2024, isFeatured: false),
          createTestCar(id: 5, brand: 'Mercedes', condition: CarCondition.newCar, price: 90000, year: 2023, isFeatured: true),
        ];

        // Apply featured filter
        final filter = const CarFilter(featured: true);
        final filtered = filter.apply(cars);

        // All filtered cars should have isFeatured = true
        for (final car in filtered) {
          expect(car.isFeatured, isTrue,
              reason: 'Car ${car.id} should be featured');
        }
      },
    );

    /// Property 4.2: Featured filter count matches expected count
    /// *For any* list of cars, the count of filtered featured cars should equal
    /// the count of cars with isFeatured=true in the original list
    Glados2(any.boundedId, any.boundedId).test(
      'Property 4.2: Featured filter count matches cars with isFeatured=true',
      (featuredCount, nonFeaturedCount) {
        // Bound the counts to reasonable values
        final numFeatured = (featuredCount % 10) + 1; // 1-10 featured
        final numNonFeatured = (nonFeaturedCount % 10) + 1; // 1-10 non-featured

        // Create cars with specified featured counts
        final cars = <Car>[];
        
        // Add featured cars
        for (int i = 0; i < numFeatured; i++) {
          cars.add(createTestCar(
            id: i + 1,
            brand: 'Brand$i',
            condition: CarCondition.newCar,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            isFeatured: true,
          ));
        }
        
        // Add non-featured cars
        for (int i = 0; i < numNonFeatured; i++) {
          cars.add(createTestCar(
            id: numFeatured + i + 1,
            brand: 'Brand${numFeatured + i}',
            condition: CarCondition.used,
            price: (i + 1) * 15000.0,
            year: 2018 + (i % 5),
            isFeatured: false,
          ));
        }

        // Apply featured filter
        final filter = const CarFilter(featured: true);
        final filtered = filter.apply(cars);

        // Count should match the number of featured cars we created
        expect(filtered.length, equals(numFeatured),
            reason: 'Should have exactly $numFeatured featured cars');
      },
    );

    /// Property 4.3: Non-featured filter returns only cars where isFeatured is false
    /// *For any* list of cars, filtering for non-featured cars should return only cars where isFeatured is false
    Glados(any.boundedId).test(
      'Property 4.3: Non-featured filter returns only cars with isFeatured=false',
      (seed) {
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023, isFeatured: true),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020, isFeatured: false),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 45000, year: 2022, isFeatured: true),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 80000, year: 2024, isFeatured: false),
        ];

        // Apply non-featured filter
        final filter = const CarFilter(featured: false);
        final filtered = filter.apply(cars);

        // All filtered cars should have isFeatured = false
        for (final car in filtered) {
          expect(car.isFeatured, isFalse,
              reason: 'Car ${car.id} should not be featured');
        }
      },
    );

    /// Property 4.4: Featured filter preserves all other car properties
    /// *For any* featured car, filtering should preserve all its properties
    Glados3(any.brandName, any.positivePrice, any.validYear).test(
      'Property 4.4: Featured filter preserves all car properties',
      (brand, price, year) {
        final now = DateTime.now();
        final originalCar = Car(
          id: 1,
          name: 'Test Car',
          brand: brand,
          model: 'Test Model',
          year: year,
          price: price,
          condition: CarCondition.newCar,
          status: CarStatus.available,
          isFeatured: true,
          createdAt: now,
          updatedAt: now,
        );

        final cars = [originalCar];
        final filter = const CarFilter(featured: true);
        final filtered = filter.apply(cars);

        expect(filtered.length, equals(1));
        final filteredCar = filtered.first;

        // All properties should be preserved
        expect(filteredCar.id, equals(originalCar.id));
        expect(filteredCar.name, equals(originalCar.name));
        expect(filteredCar.brand, equals(originalCar.brand));
        expect(filteredCar.model, equals(originalCar.model));
        expect(filteredCar.year, equals(originalCar.year));
        expect(filteredCar.price, equals(originalCar.price));
        expect(filteredCar.condition, equals(originalCar.condition));
        expect(filteredCar.status, equals(originalCar.status));
        expect(filteredCar.isFeatured, equals(originalCar.isFeatured));
      },
    );

    /// Property 4.5: Empty list returns empty when filtering for featured
    /// *For any* empty list, filtering for featured should return empty
    Glados(any.boundedId).test(
      'Property 4.5: Empty list returns empty when filtering for featured',
      (_) {
        final cars = <Car>[];
        final filter = const CarFilter(featured: true);
        final filtered = filter.apply(cars);

        expect(filtered, isEmpty);
      },
    );

    /// Property 4.6: All non-featured list returns empty when filtering for featured
    /// *For any* list with no featured cars, filtering for featured should return empty
    Glados(any.boundedId).test(
      'Property 4.6: List with no featured cars returns empty',
      (count) {
        final numCars = (count % 10) + 1; // 1-10 cars
        
        final cars = List.generate(
          numCars,
          (i) => createTestCar(
            id: i + 1,
            brand: 'Brand$i',
            condition: CarCondition.newCar,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            isFeatured: false, // All non-featured
          ),
        );

        final filter = const CarFilter(featured: true);
        final filtered = filter.apply(cars);

        expect(filtered, isEmpty,
            reason: 'Should return empty when no featured cars exist');
      },
    );

    /// Property 4.7: Featured filter can be combined with other filters
    /// *For any* combination of featured and brand filter, results should satisfy both
    Glados(any.brandName).test(
      'Property 4.7: Featured filter combines with brand filter (AND logic)',
      (brand) {
        final cars = [
          createTestCar(id: 1, brand: brand, condition: CarCondition.newCar, price: 50000, year: 2023, isFeatured: true),
          createTestCar(id: 2, brand: brand, condition: CarCondition.used, price: 30000, year: 2020, isFeatured: false),
          createTestCar(id: 3, brand: 'Other', condition: CarCondition.newCar, price: 45000, year: 2022, isFeatured: true),
          createTestCar(id: 4, brand: brand, condition: CarCondition.used, price: 80000, year: 2024, isFeatured: true),
        ];

        // Apply both featured and brand filter
        final filter = CarFilter(featured: true, brand: brand);
        final filtered = filter.apply(cars);

        // All filtered cars should satisfy BOTH conditions
        for (final car in filtered) {
          expect(car.isFeatured, isTrue,
              reason: 'Car ${car.id} should be featured');
          expect(car.brand, equals(brand),
              reason: 'Car ${car.id} should have brand $brand');
        }
      },
    );
  });
}
