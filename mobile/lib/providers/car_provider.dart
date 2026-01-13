/// Car Providers for Flutter Customer App
/// Requirements: 1.1, 7.1, 10.1
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/api_client.dart';
import '../models/car.dart';
import '../models/car_filter.dart';
import '../repositories/car_repository.dart';

// ============================================
// API Client Provider
// ============================================

/// API Client Provider - مزود عميل الـ API
final apiClientProvider = Provider<ApiClient>((ref) {
  // Base URL should be configured from environment
  // For Android emulator, use 10.0.2.2 to access host's localhost
  // Using PHP built-in server on port 8000
  const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );
  return ApiClient(baseUrl: baseUrl);
});

// ============================================
// Repository Providers
// ============================================

/// Car Repository Provider - مزود مستودع السيارات
final carRepositoryProvider = Provider<CarRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CarRepositoryImpl(apiClient: apiClient);
});

// ============================================
// Car Filter State Provider
// ============================================

/// Car Filter State - حالة فلتر السيارات
class CarFilterNotifier extends StateNotifier<CarFilter> {
  CarFilterNotifier() : super(const CarFilter());

  /// Update search term
  void setSearch(String? search) {
    state = CarFilter(
      search: search,
      brand: state.brand,
      condition: state.condition,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      year: state.year,
      sortBy: state.sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Update brand filter
  void setBrand(String? brand) {
    state = CarFilter(
      search: state.search,
      brand: brand,
      condition: state.condition,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      year: state.year,
      sortBy: state.sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Update condition filter
  void setCondition(CarCondition? condition) {
    state = CarFilter(
      search: state.search,
      brand: state.brand,
      condition: condition,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      year: state.year,
      sortBy: state.sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Update price range
  void setPriceRange(double? minPrice, double? maxPrice) {
    state = CarFilter(
      search: state.search,
      brand: state.brand,
      condition: state.condition,
      minPrice: minPrice,
      maxPrice: maxPrice,
      year: state.year,
      sortBy: state.sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Update year filter
  void setYear(int? year) {
    state = CarFilter(
      search: state.search,
      brand: state.brand,
      condition: state.condition,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      year: year,
      sortBy: state.sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Update sort option
  void setSortBy(SortBy sortBy) {
    state = CarFilter(
      search: state.search,
      brand: state.brand,
      condition: state.condition,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      year: state.year,
      sortBy: sortBy,
      status: state.status,
      featured: state.featured,
    );
  }

  /// Clear all filters
  void clearFilters() {
    state = const CarFilter();
  }

  /// Update entire filter
  void setFilter(CarFilter filter) {
    state = filter;
  }
}

/// Car Filter Provider - مزود فلتر السيارات
final carFilterProvider = StateNotifierProvider<CarFilterNotifier, CarFilter>((ref) {
  return CarFilterNotifier();
});

// ============================================
// Cars Providers
// ============================================

/// Cars Provider - مزود قائمة السيارات
/// Requirements: 1.1
final carsProvider = FutureProvider.family<CarsResponse, CarFilter?>((ref, filter) async {
  final repository = ref.watch(carRepositoryProvider);
  return repository.getCars(filter: filter);
});

/// Filtered Cars Provider - مزود السيارات المفلترة
/// Uses the current filter state
final filteredCarsProvider = FutureProvider<CarsResponse>((ref) async {
  final filter = ref.watch(carFilterProvider);
  final repository = ref.watch(carRepositoryProvider);
  return repository.getCars(filter: filter);
});

/// Featured Cars Provider - مزود السيارات المميزة
/// Requirements: 7.1
final featuredCarsProvider = FutureProvider<List<Car>>((ref) async {
  final repository = ref.watch(carRepositoryProvider);
  return repository.getFeaturedCars();
});

/// Car Details Provider - مزود تفاصيل السيارة
final carDetailsProvider = FutureProvider.family<Car, int>((ref, id) async {
  final repository = ref.watch(carRepositoryProvider);
  return repository.getCarById(id);
});

/// Brands Provider - مزود قائمة الماركات
/// Requirements: 10.1
final brandsProvider = FutureProvider<List<String>>((ref) async {
  final repository = ref.watch(carRepositoryProvider);
  return repository.getBrands();
});

/// Brand Car Count Provider - مزود عدد السيارات لكل ماركة
/// Requirements: 10.3
final brandCarCountProvider = FutureProvider<Map<String, int>>((ref) async {
  final carsResponse = await ref.watch(carsProvider(null).future);
  final repository = ref.watch(carRepositoryProvider);
  return repository.getCarCountByBrand(carsResponse.cars);
});

// ============================================
// Car Actions
// ============================================

/// Increment View Count - زيادة عدد المشاهدات
Future<void> incrementCarViewCount(WidgetRef ref, int carId) async {
  final repository = ref.read(carRepositoryProvider);
  await repository.incrementViewCount(carId);
}
