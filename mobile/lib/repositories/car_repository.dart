/// Car Repository for Flutter Customer App
/// Requirements: 2.1-2.7

import '../core/api/api_client.dart';
import '../models/car.dart';
import '../models/car_filter.dart';

/// Abstract Car Repository Interface
abstract class CarRepository {
  /// Get all cars with optional filters
  Future<CarsResponse> getCars({CarFilter? filter});

  /// Get car by ID
  Future<Car> getCarById(int id);

  /// Get all available brands
  Future<List<String>> getBrands();

  /// Get featured cars
  Future<List<Car>> getFeaturedCars();

  /// Increment view count for a car
  Future<void> incrementViewCount(int carId);

  /// Filter cars locally (client-side filtering)
  List<Car> filterCars(List<Car> cars, CarFilter filter);

  /// Get cars count by brand
  Map<String, int> getCarCountByBrand(List<Car> cars);
}

/// Car Repository Implementation
class CarRepositoryImpl implements CarRepository {
  final ApiClient _apiClient;

  CarRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  @override
  Future<CarsResponse> getCars({CarFilter? filter}) async {
    return _apiClient.getCars(filter: filter);
  }

  @override
  Future<Car> getCarById(int id) async {
    return _apiClient.getCarById(id);
  }

  @override
  Future<List<String>> getBrands() async {
    return _apiClient.getBrands();
  }

  @override
  Future<List<Car>> getFeaturedCars() async {
    final filter = const CarFilter(featured: true);
    final response = await _apiClient.getCars(filter: filter);
    return response.cars;
  }

  @override
  Future<void> incrementViewCount(int carId) async {
    await _apiClient.incrementViewCount(carId);
  }

  /// Filter cars locally using CarFilter
  /// Requirements: 2.1-2.7
  @override
  List<Car> filterCars(List<Car> cars, CarFilter filter) {
    return filter.apply(cars);
  }

  /// Get count of available cars per brand
  /// Requirements: 10.3
  @override
  Map<String, int> getCarCountByBrand(List<Car> cars) {
    final brandCounts = <String, int>{};
    
    for (final car in cars) {
      if (car.status == CarStatus.available) {
        brandCounts[car.brand] = (brandCounts[car.brand] ?? 0) + 1;
      }
    }
    
    return brandCounts;
  }
}
