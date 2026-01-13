/// Property-Based Tests for Brand Car Count
/// Feature: flutter-customer-app, Property 9: Brand Car Count
/// **Validates: Requirements 10.3**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect, setUp, tearDown;
import 'package:glados/glados.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/repositories/car_repository.dart';
import 'package:customer_app/core/api/api_client.dart';

/// Custom generators for brand car count tests
extension BrandCarCountGenerators on Any {
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
      choose(['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes', 'Hyundai', 'Kia']);

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

/// Mock API client for testing (not used in these tests but required for repository)
class MockApiClient extends ApiClient {
  MockApiClient() : super(baseUrl: 'http://test');
}

void main() {
  group('Property 9: Brand Car Count', () {
    late CarRepository repository;

    setUp(() {
      repository = CarRepositoryImpl(apiClient: MockApiClient());
    });

    /// Property 9.1: Brand car count equals number of available cars with that brand
    /// *For any* brand in the brands list, the car count should equal the number of available cars with that brand
    Glados(any.brandName).test(
      'Property 9.1: Brand car count equals available cars count for that brand',
      (brand) {
        // Create cars with different brands and statuses
        final cars = [
          createTestCar(id: 1, brand: brand, condition: CarCondition.newCar, price: 50000, year: 2023, status: CarStatus.available),
          createTestCar(id: 2, brand: brand, condition: CarCondition.used, price: 30000, year: 2020, status: CarStatus.available),
          createTestCar(id: 3, brand: brand, condition: CarCondition.newCar, price: 45000, year: 2022, status: CarStatus.sold),
          createTestCar(id: 4, brand: 'Other', condition: CarCondition.used, price: 80000, year: 2024, status: CarStatus.available),
          createTestCar(id: 5, brand: brand, condition: CarCondition.newCar, price: 60000, year: 2021, status: CarStatus.available),
        ];

        final brandCounts = repository.getCarCountByBrand(cars);

        // Count available cars with the brand manually
        final expectedCount = cars
            .where((car) => car.brand == brand && car.status == CarStatus.available)
            .length;

        expect(brandCounts[brand], equals(expectedCount),
            reason: 'Brand $brand should have $expectedCount available cars');
      },
    );

    /// Property 9.2: Sold cars are not counted in brand car count
    /// *For any* brand, sold cars should not be included in the count
    Glados(any.brandName).test(
      'Property 9.2: Sold cars are not counted in brand car count',
      (brand) {
        // Create only sold cars for the brand
        final cars = [
          createTestCar(id: 1, brand: brand, condition: CarCondition.newCar, price: 50000, year: 2023, status: CarStatus.sold),
          createTestCar(id: 2, brand: brand, condition: CarCondition.used, price: 30000, year: 2020, status: CarStatus.sold),
          createTestCar(id: 3, brand: brand, condition: CarCondition.newCar, price: 45000, year: 2022, status: CarStatus.sold),
        ];

        final brandCounts = repository.getCarCountByBrand(cars);

        // Brand should not appear in counts (or have 0 count)
        expect(brandCounts[brand] ?? 0, equals(0),
            reason: 'Brand $brand should have 0 count when all cars are sold');
      },
    );

    /// Property 9.3: Total count across all brands equals total available cars
    /// *For any* list of cars, sum of all brand counts should equal total available cars
    Glados2(any.boundedId, any.boundedId).test(
      'Property 9.3: Sum of brand counts equals total available cars',
      (availableCount, soldCount) {
        final numAvailable = (availableCount % 10) + 1; // 1-10 available
        final numSold = (soldCount % 5) + 1; // 1-5 sold

        final cars = <Car>[];
        final brands = ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'];

        // Add available cars
        for (int i = 0; i < numAvailable; i++) {
          cars.add(createTestCar(
            id: i + 1,
            brand: brands[i % brands.length],
            condition: CarCondition.newCar,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            status: CarStatus.available,
          ));
        }

        // Add sold cars
        for (int i = 0; i < numSold; i++) {
          cars.add(createTestCar(
            id: numAvailable + i + 1,
            brand: brands[i % brands.length],
            condition: CarCondition.used,
            price: (i + 1) * 15000.0,
            year: 2018 + (i % 5),
            status: CarStatus.sold,
          ));
        }

        final brandCounts = repository.getCarCountByBrand(cars);

        // Sum of all brand counts
        final totalCount = brandCounts.values.fold(0, (sum, count) => sum + count);

        expect(totalCount, equals(numAvailable),
            reason: 'Sum of brand counts should equal $numAvailable available cars');
      },
    );

    /// Property 9.4: Empty car list returns empty brand counts
    /// *For any* empty list, brand counts should be empty
    Glados(any.boundedId).test(
      'Property 9.4: Empty car list returns empty brand counts',
      (_) {
        final cars = <Car>[];
        final brandCounts = repository.getCarCountByBrand(cars);

        expect(brandCounts, isEmpty,
            reason: 'Empty car list should return empty brand counts');
      },
    );

    /// Property 9.5: Each brand in counts has at least one available car
    /// *For any* brand appearing in counts, there should be at least one available car
    Glados(any.boundedId).test(
      'Property 9.5: Each brand in counts has at least one available car',
      (seed) {
        final brands = ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'];
        final cars = <Car>[];

        // Create some available and some sold cars
        for (int i = 0; i < 10; i++) {
          cars.add(createTestCar(
            id: i + 1,
            brand: brands[i % brands.length],
            condition: CarCondition.newCar,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            status: i.isEven ? CarStatus.available : CarStatus.sold,
          ));
        }

        final brandCounts = repository.getCarCountByBrand(cars);

        // Each brand in counts should have count > 0
        for (final entry in brandCounts.entries) {
          expect(entry.value, greaterThan(0),
              reason: 'Brand ${entry.key} should have at least 1 available car');
        }
      },
    );

    /// Property 9.6: Brand count is consistent with manual filtering
    /// *For any* brand, count should match filtering cars by brand and status
    Glados2(any.brandName, any.boundedId).test(
      'Property 9.6: Brand count matches manual filtering',
      (brand, carCount) {
        final numCars = (carCount % 15) + 5; // 5-19 cars
        final brands = ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes', brand];
        final cars = <Car>[];

        for (int i = 0; i < numCars; i++) {
          cars.add(createTestCar(
            id: i + 1,
            brand: brands[i % brands.length],
            condition: i.isEven ? CarCondition.newCar : CarCondition.used,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            status: i % 3 == 0 ? CarStatus.sold : CarStatus.available,
          ));
        }

        final brandCounts = repository.getCarCountByBrand(cars);

        // Manual count for each brand
        for (final b in brands.toSet()) {
          final manualCount = cars
              .where((car) => car.brand == b && car.status == CarStatus.available)
              .length;
          
          expect(brandCounts[b] ?? 0, equals(manualCount),
              reason: 'Brand $b count should be $manualCount');
        }
      },
    );

    /// Property 9.7: Brand counts are non-negative
    /// *For any* list of cars, all brand counts should be non-negative
    Glados(any.boundedId).test(
      'Property 9.7: All brand counts are non-negative',
      (carCount) {
        final numCars = (carCount % 20) + 1;
        final brands = ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'];
        
        final cars = List.generate(
          numCars,
          (i) => createTestCar(
            id: i + 1,
            brand: brands[i % brands.length],
            condition: CarCondition.newCar,
            price: (i + 1) * 10000.0,
            year: 2020 + (i % 5),
            status: i.isEven ? CarStatus.available : CarStatus.sold,
          ),
        );

        final brandCounts = repository.getCarCountByBrand(cars);

        for (final count in brandCounts.values) {
          expect(count, greaterThanOrEqualTo(0),
              reason: 'Brand count should be non-negative');
        }
      },
    );
  });
}
