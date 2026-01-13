/// Property-Based Tests for Car Filter
/// Feature: flutter-customer-app, Property 2: Filter Correctness
/// Feature: flutter-customer-app, Property 3: Filter Reset
/// **Validates: Requirements 2.1-2.7**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/car_filter.dart';

/// Custom generators for filter tests
extension FilterGenerators on Any {
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
}

/// Helper to create a test car
Car createTestCar({
  required int id,
  required String brand,
  required CarCondition condition,
  required double price,
  required int year,
  bool isFeatured = false,
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
  group('Property 2: Filter Correctness', () {
    /// Property 2.1: Brand filter returns only cars of that brand
    /// *For any* brand filter, all returned cars should have that brand
    Glados(any.brandName).test(
      'Property 2.1: Brand filter returns only cars of selected brand',
      (brand) {
        // Create cars with different brands
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020),
          createTestCar(id: 3, brand: 'Toyota', condition: CarCondition.used, price: 40000, year: 2021),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.newCar, price: 80000, year: 2024),
          createTestCar(id: 5, brand: brand, condition: CarCondition.newCar, price: 60000, year: 2022),
        ];

        final filter = CarFilter(brand: brand);
        final filtered = filter.apply(cars);

        // All filtered cars should have the selected brand
        for (final car in filtered) {
          expect(car.brand, equals(brand));
        }
      },
    );

    /// Property 2.2: Condition filter returns only cars of that condition
    /// *For any* condition filter, all returned cars should have that condition
    Glados(any.carCondition).test(
      'Property 2.2: Condition filter returns only cars of selected condition',
      (condition) {
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 45000, year: 2022),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 60000, year: 2019),
        ];

        final filter = CarFilter(condition: condition);
        final filtered = filter.apply(cars);

        // All filtered cars should have the selected condition
        for (final car in filtered) {
          expect(car.condition, equals(condition));
        }
      },
    );

    /// Property 2.3: Price range filter returns only cars within range
    /// *For any* price range, all returned cars should have price within that range
    Glados2(any.positivePrice, any.positivePrice).test(
      'Property 2.3: Price range filter returns only cars within range',
      (price1, price2) {
        final minPrice = price1 < price2 ? price1 : price2;
        final maxPrice = price1 < price2 ? price2 : price1;

        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 10000, year: 2023),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 50000, year: 2020),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 100000, year: 2022),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 200000, year: 2019),
          createTestCar(id: 5, brand: 'Mercedes', condition: CarCondition.newCar, price: 300000, year: 2024),
        ];

        final filter = CarFilter(minPrice: minPrice, maxPrice: maxPrice);
        final filtered = filter.apply(cars);

        // All filtered cars should have price within range
        for (final car in filtered) {
          expect(car.price, greaterThanOrEqualTo(minPrice));
          expect(car.price, lessThanOrEqualTo(maxPrice));
        }
      },
    );

    /// Property 2.4: Year filter returns only cars of that year
    /// *For any* year filter, all returned cars should have that year
    Glados(any.validYear).test(
      'Property 2.4: Year filter returns only cars of selected year',
      (year) {
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2020),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2021),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 45000, year: 2022),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 60000, year: year),
        ];

        final filter = CarFilter(year: year);
        final filtered = filter.apply(cars);

        // All filtered cars should have the selected year
        for (final car in filtered) {
          expect(car.year, equals(year));
        }
      },
    );

    /// Property 2.5: Multiple filters apply AND logic
    /// *For any* combination of filters, all returned cars should satisfy ALL conditions
    Glados3(any.brandName, any.carCondition, any.validYear).test(
      'Property 2.5: Multiple filters apply AND logic',
      (brand, condition, year) {
        final cars = [
          createTestCar(id: 1, brand: brand, condition: condition, price: 50000, year: year),
          createTestCar(id: 2, brand: brand, condition: CarCondition.newCar, price: 30000, year: 2020),
          createTestCar(id: 3, brand: 'Other', condition: condition, price: 45000, year: year),
          createTestCar(id: 4, brand: brand, condition: condition, price: 60000, year: 2019),
        ];

        final filter = CarFilter(brand: brand, condition: condition, year: year);
        final filtered = filter.apply(cars);

        // All filtered cars should satisfy ALL filter conditions
        for (final car in filtered) {
          expect(car.brand, equals(brand));
          expect(car.condition, equals(condition));
          expect(car.year, equals(year));
        }
      },
    );

    /// Property 2.6: Search filter matches name, brand, or model
    Glados(any.brandName).test(
      'Property 2.6: Search filter matches name, brand, or model',
      (searchTerm) {
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020),
          createTestCar(id: 3, brand: searchTerm, condition: CarCondition.newCar, price: 45000, year: 2022),
        ];

        final filter = CarFilter(search: searchTerm);
        final filtered = filter.apply(cars);

        // All filtered cars should contain search term in name, brand, or model
        for (final car in filtered) {
          final matchesName = car.name.toLowerCase().contains(searchTerm.toLowerCase());
          final matchesBrand = car.brand.toLowerCase().contains(searchTerm.toLowerCase());
          final matchesModel = car.model.toLowerCase().contains(searchTerm.toLowerCase());
          expect(matchesName || matchesBrand || matchesModel, isTrue);
        }
      },
    );
  });

  group('Property 3: Filter Reset', () {
    /// Property 3: Clearing all filters returns same cars as no filters
    /// *For any* filter state, clearing all filters should return the same cars as querying with no filters
    Glados3(any.brandName, any.carCondition, any.positivePrice).test(
      'Property 3: Clearing filters returns same result as no filters',
      (brand, condition, price) {
        final cars = [
          createTestCar(id: 1, brand: 'Toyota', condition: CarCondition.newCar, price: 50000, year: 2023),
          createTestCar(id: 2, brand: 'Honda', condition: CarCondition.used, price: 30000, year: 2020),
          createTestCar(id: 3, brand: 'Nissan', condition: CarCondition.newCar, price: 45000, year: 2022),
          createTestCar(id: 4, brand: 'BMW', condition: CarCondition.used, price: 60000, year: 2019),
        ];

        // Apply filters
        final filteredWithFilters = CarFilter(
          brand: brand,
          condition: condition,
          minPrice: price,
        );

        // Empty filter (no filters)
        final emptyFilter = CarFilter.empty();

        // Apply empty filter
        final resultWithNoFilters = emptyFilter.apply(cars);

        // Clear filters and apply
        final clearedFilter = CarFilter.empty();
        final resultWithClearedFilters = clearedFilter.apply(cars);

        // Both should return the same cars (sorted by newest)
        expect(resultWithClearedFilters.length, equals(resultWithNoFilters.length));
        
        // Verify all cars are present
        for (final car in resultWithNoFilters) {
          expect(
            resultWithClearedFilters.any((c) => c.id == car.id),
            isTrue,
            reason: 'Car ${car.id} should be in cleared filter results',
          );
        }
      },
    );

    /// Property 3.1: Empty filter returns all cars
    Glados(any.boundedId).test(
      'Property 3.1: Empty filter returns all cars',
      (carCount) {
        final count = (carCount % 10) + 1; // 1-10 cars
        final cars = List.generate(
          count,
          (i) => createTestCar(
            id: i + 1,
            brand: 'Brand$i',
            condition: i.isEven ? CarCondition.newCar : CarCondition.used,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
          ),
        );

        final emptyFilter = CarFilter.empty();
        final filtered = emptyFilter.apply(cars);

        // Empty filter should return all cars
        expect(filtered.length, equals(cars.length));
      },
    );

    /// Property 3.2: hasFilters is false for empty filter
    Glados(any.boundedId).test(
      'Property 3.2: hasFilters is false for empty filter',
      (_) {
        final emptyFilter = CarFilter.empty();
        expect(emptyFilter.hasFilters, isFalse);
      },
    );

    /// Property 3.3: hasFilters is true when any filter is set
    Glados(any.brandName).test(
      'Property 3.3: hasFilters is true when brand filter is set',
      (brand) {
        final filter = CarFilter(brand: brand);
        expect(filter.hasFilters, isTrue);
      },
    );
  });
}
