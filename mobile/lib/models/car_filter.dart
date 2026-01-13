/// Car Filter Model for Flutter Customer App
/// Requirements: 2.1-2.6

import 'car.dart';

/// Sort By Options - خيارات الترتيب
enum SortBy {
  newest('newest'),
  priceAsc('price_asc'),
  priceDesc('price_desc');

  final String value;
  const SortBy(this.value);

  static SortBy fromString(String value) {
    return SortBy.values.firstWhere(
      (e) => e.value == value,
      orElse: () => SortBy.newest,
    );
  }

  String toJson() => value;
}

/// Car Filter - فلاتر البحث عن السيارات
class CarFilter {
  final String? search;
  final String? brand;
  final CarCondition? condition;
  final double? minPrice;
  final double? maxPrice;
  final int? year;
  final SortBy sortBy;
  final CarStatus? status;
  final bool? featured;
  final int? page;
  final int? perPage;

  const CarFilter({
    this.search,
    this.brand,
    this.condition,
    this.minPrice,
    this.maxPrice,
    this.year,
    this.sortBy = SortBy.newest,
    this.status,
    this.featured,
    this.page,
    this.perPage,
  });

  /// Create an empty filter
  factory CarFilter.empty() => const CarFilter();

  /// Check if any filter is applied
  bool get hasFilters =>
      search != null && search!.isNotEmpty ||
      brand != null ||
      condition != null ||
      minPrice != null ||
      maxPrice != null ||
      year != null ||
      status != null ||
      featured != null;

  /// Convert to query parameters for API
  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    
    if (search != null && search!.isNotEmpty) {
      params['search'] = search;
    }
    if (brand != null) {
      params['brand'] = brand;
    }
    if (condition != null) {
      params['condition'] = condition!.toJson();
    }
    if (minPrice != null) {
      params['minPrice'] = minPrice.toString();
    }
    if (maxPrice != null) {
      params['maxPrice'] = maxPrice.toString();
    }
    if (year != null) {
      params['year'] = year.toString();
    }
    if (sortBy != SortBy.newest) {
      params['sortBy'] = sortBy.toJson();
    }
    if (status != null) {
      params['status'] = status!.toJson();
    }
    if (featured != null) {
      params['featured'] = featured.toString();
    }
    
    return params;
  }

  /// Apply filter to a list of cars (client-side filtering)
  List<Car> apply(List<Car> cars) {
    var filtered = cars.toList();

    // Search filter
    if (search != null && search!.isNotEmpty) {
      final searchLower = search!.toLowerCase();
      filtered = filtered.where((car) =>
          car.name.toLowerCase().contains(searchLower) ||
          car.brand.toLowerCase().contains(searchLower) ||
          car.model.toLowerCase().contains(searchLower)).toList();
    }

    // Brand filter
    if (brand != null) {
      filtered = filtered.where((car) => car.brand == brand).toList();
    }

    // Condition filter
    if (condition != null) {
      filtered = filtered.where((car) => car.condition == condition).toList();
    }

    // Price range filter
    if (minPrice != null) {
      filtered = filtered.where((car) => car.price >= minPrice!).toList();
    }
    if (maxPrice != null) {
      filtered = filtered.where((car) => car.price <= maxPrice!).toList();
    }

    // Year filter
    if (year != null) {
      filtered = filtered.where((car) => car.year == year).toList();
    }

    // Status filter
    if (status != null) {
      filtered = filtered.where((car) => car.status == status).toList();
    }

    // Featured filter
    if (featured != null) {
      filtered = filtered.where((car) => car.isFeatured == featured).toList();
    }

    // Sort
    switch (sortBy) {
      case SortBy.newest:
        filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case SortBy.priceAsc:
        filtered.sort((a, b) => a.price.compareTo(b.price));
        break;
      case SortBy.priceDesc:
        filtered.sort((a, b) => b.price.compareTo(a.price));
        break;
    }

    return filtered;
  }

  CarFilter copyWith({
    String? search,
    String? brand,
    CarCondition? condition,
    double? minPrice,
    double? maxPrice,
    int? year,
    SortBy? sortBy,
    CarStatus? status,
    bool? featured,
    int? page,
    int? perPage,
  }) {
    return CarFilter(
      search: search ?? this.search,
      brand: brand ?? this.brand,
      condition: condition ?? this.condition,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      year: year ?? this.year,
      sortBy: sortBy ?? this.sortBy,
      status: status ?? this.status,
      featured: featured ?? this.featured,
      page: page ?? this.page,
      perPage: perPage ?? this.perPage,
    );
  }

  /// Clear specific filter fields
  CarFilter clearSearch() => copyWith()._withSearch(null);
  CarFilter clearBrand() => copyWith()._withBrand(null);
  CarFilter clearCondition() => copyWith()._withCondition(null);
  CarFilter clearPriceRange() => copyWith()._withMinPrice(null)._withMaxPrice(null);
  CarFilter clearYear() => copyWith()._withYear(null);

  // Private helpers for clearing nullable fields
  CarFilter _withSearch(String? value) => CarFilter(
    search: value,
    brand: brand,
    condition: condition,
    minPrice: minPrice,
    maxPrice: maxPrice,
    year: year,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  CarFilter _withBrand(String? value) => CarFilter(
    search: search,
    brand: value,
    condition: condition,
    minPrice: minPrice,
    maxPrice: maxPrice,
    year: year,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  CarFilter _withCondition(CarCondition? value) => CarFilter(
    search: search,
    brand: brand,
    condition: value,
    minPrice: minPrice,
    maxPrice: maxPrice,
    year: year,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  CarFilter _withMinPrice(double? value) => CarFilter(
    search: search,
    brand: brand,
    condition: condition,
    minPrice: value,
    maxPrice: maxPrice,
    year: year,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  CarFilter _withMaxPrice(double? value) => CarFilter(
    search: search,
    brand: brand,
    condition: condition,
    minPrice: minPrice,
    maxPrice: value,
    year: year,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  CarFilter _withYear(int? value) => CarFilter(
    search: search,
    brand: brand,
    condition: condition,
    minPrice: minPrice,
    maxPrice: maxPrice,
    year: value,
    sortBy: sortBy,
    status: status,
    featured: featured,
    page: page,
    perPage: perPage,
  );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CarFilter &&
          runtimeType == other.runtimeType &&
          search == other.search &&
          brand == other.brand &&
          condition == other.condition &&
          minPrice == other.minPrice &&
          maxPrice == other.maxPrice &&
          year == other.year &&
          sortBy == other.sortBy &&
          status == other.status &&
          featured == other.featured &&
          page == other.page &&
          perPage == other.perPage;

  @override
  int get hashCode =>
      search.hashCode ^
      brand.hashCode ^
      condition.hashCode ^
      minPrice.hashCode ^
      maxPrice.hashCode ^
      year.hashCode ^
      sortBy.hashCode ^
      status.hashCode ^
      featured.hashCode ^
      page.hashCode ^
      perPage.hashCode;
}
