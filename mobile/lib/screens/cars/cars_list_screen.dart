/// Modern Cars List Screen - 2025 Design System
/// Requirements: 1.1, 1.6, 2.1-2.7, 9.3 - Browse cars with search, filter, and pull-to-refresh
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/car_filter.dart';
import 'package:customer_app/providers/car_provider.dart';
import 'package:customer_app/widgets/modern/index.dart';
import 'package:customer_app/widgets/car_filter_sheet.dart';

/// Cars List Screen - شاشة قائمة السيارات
class CarsListScreen extends ConsumerStatefulWidget {
  final String? initialSearch;
  final String? initialBrand;
  final Function(Car car)? onCarTap;

  const CarsListScreen({
    super.key,
    this.initialSearch,
    this.initialBrand,
    this.onCarTap,
  });

  @override
  ConsumerState<CarsListScreen> createState() => _CarsListScreenState();
}

class _CarsListScreenState extends ConsumerState<CarsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<int> _availableYears = [];
  double? _minAvailablePrice;
  double? _maxAvailablePrice;

  @override
  void initState() {
    super.initState();

    if (widget.initialSearch != null) {
      _searchController.text = widget.initialSearch!;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(carFilterProvider.notifier).setSearch(widget.initialSearch);
      });
    }

    if (widget.initialBrand != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(carFilterProvider.notifier).setBrand(widget.initialBrand);
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleSearch(String query) {
    ref
        .read(carFilterProvider.notifier)
        .setSearch(query.trim().isEmpty ? null : query.trim());
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(carFilterProvider.notifier).setSearch(null);
  }

  Future<void> _showFilterSheet() async {
    final currentFilter = ref.read(carFilterProvider);
    final brands = await ref.read(brandsProvider.future);

    if (!mounted) return;

    final result = await CarFilterSheet.show(
      context: context,
      initialFilter: currentFilter,
      availableBrands: brands,
      availableYears: _availableYears,
      minAvailablePrice: _minAvailablePrice,
      maxAvailablePrice: _maxAvailablePrice,
    );

    if (result != null) {
      final searchText = _searchController.text.trim();
      ref.read(carFilterProvider.notifier).setFilter(
            CarFilter(
              search: searchText.isEmpty ? null : searchText,
              brand: result.brand,
              condition: result.condition,
              minPrice: result.minPrice,
              maxPrice: result.maxPrice,
              year: result.year,
              sortBy: result.sortBy,
            ),
          );
    }
  }

  Future<void> _refreshData() async {
    ref.invalidate(filteredCarsProvider);
    ref.invalidate(brandsProvider);
  }

  void _updateFilterOptions(List<Car> cars) {
    if (cars.isEmpty) return;

    final years = cars.map((c) => c.year).toSet().toList()
      ..sort((a, b) => b.compareTo(a));
    final prices = cars.map((c) => c.price).toList();
    final minPrice = prices.reduce((a, b) => a < b ? a : b);
    final maxPrice = prices.reduce((a, b) => a > b ? a : b);

    if (mounted) {
      setState(() {
        _availableYears = years;
        _minAvailablePrice = minPrice;
        _maxAvailablePrice = maxPrice;
      });
    }
  }

  void _clearAllFilters() {
    _searchController.clear();
    ref.read(carFilterProvider.notifier).clearFilters();
  }

  int _getActiveFilterCount(CarFilter filter) {
    int count = 0;
    if (filter.brand != null) count++;
    if (filter.condition != null) count++;
    if (filter.year != null) count++;
    if (filter.minPrice != null || filter.maxPrice != null) count++;
    return count;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final filter = ref.watch(carFilterProvider);
    final carsAsync = ref.watch(filteredCarsProvider);

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: _buildAppBar(isDark, filter),
      body: Column(
        children: [
          // Search bar
          _buildSearchBar(isDark),
          // Cars content
          Expanded(
            child: carsAsync.when(
              data: (response) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _updateFilterOptions(response.cars);
                });
                return _buildCarsContent(response.cars, isDark, filter);
              },
              loading: () => const ModernCarGridShimmer(itemCount: 6),
              error: (error, stack) => ModernErrorWidget.generic(
                details: error.toString(),
                onRetry: _refreshData,
              ),
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(bool isDark, CarFilter filter) {
    final activeFilterCount = _getActiveFilterCount(filter);

    return AppBar(
      title: Text(
        AppStrings.availableCars,
        style: AppTypography.headlineSmall.copyWith(
          color:
              isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        ),
      ),
      centerTitle: true,
      backgroundColor:
          isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      elevation: 0,
      actions: [
        // Filter button with badge
        _FilterButton(
          hasActiveFilters: activeFilterCount > 0,
          activeFilterCount: activeFilterCount,
          onPressed: _showFilterSheet,
          isDark: isDark,
        ),
      ],
    );
  }

  Widget _buildSearchBar(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.screenPadding,
        vertical: AppSpacing.sm,
      ),
      child: ModernSearchBar(
        controller: _searchController,
        hint: AppStrings.searchHint,
        onChanged: (value) {
          if (value.isEmpty) _handleSearch(value);
        },
        onSubmitted: _handleSearch,
        onClear: _clearSearch,
        showShadow: false,
      ),
    );
  }

  Widget _buildCarsContent(List<Car> cars, bool isDark, CarFilter filter) {
    if (cars.isEmpty) {
      return _buildEmptyState(filter);
    }

    return ModernRefreshable(
      onRefresh: _refreshData,
      child: CustomScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // Results header
          SliverToBoxAdapter(
            child: _buildResultsHeader(cars.length, isDark, filter),
          ),
          // Cars grid
          SliverPadding(
            padding: AppSpacing.screenPaddingAll,
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: AppSpacing.gridGap,
                mainAxisSpacing: AppSpacing.gridGap,
                childAspectRatio: 0.68,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final car = cars[index];
                  return ModernCarCard(
                    car: car,
                    onTap: () => widget.onCarTap?.call(car),
                  );
                },
                childCount: cars.length,
              ),
            ),
          ),
          // Bottom padding
          const SliverToBoxAdapter(
            child: SizedBox(height: AppSpacing.lg),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsHeader(int count, bool isDark, CarFilter filter) {
    final hasFilters = filter.hasFilters;

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.screenPadding,
        AppSpacing.sm,
        AppSpacing.screenPadding,
        0,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  borderRadius: AppSpacing.borderRadiusSm,
                ),
                child: Text(
                  '$count',
                  style: AppTypography.labelMedium.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                AppStrings.cars,
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
          if (hasFilters)
            TextButton.icon(
              onPressed: _clearAllFilters,
              icon: Icon(
                Icons.clear_all_rounded,
                size: 18,
                color: AppColors.error,
              ),
              label: Text(
                AppStrings.clearFilters,
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.error,
                ),
              ),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(CarFilter filter) {
    if (filter.hasFilters) {
      return ModernEmptyState.noSearchResults(
        onClearFilters: _clearAllFilters,
      );
    }

    return ModernEmptyState.noCars(
      action: PrimaryButton(
        label: AppStrings.retry,
        icon: Icons.refresh_rounded,
        onPressed: _refreshData,
        isExpanded: false,
      ),
    );
  }
}

/// Filter Button with badge
class _FilterButton extends StatelessWidget {
  final bool hasActiveFilters;
  final int activeFilterCount;
  final VoidCallback onPressed;
  final bool isDark;

  const _FilterButton({
    required this.hasActiveFilters,
    required this.activeFilterCount,
    required this.onPressed,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: AppSpacing.sm),
      child: Stack(
        children: [
          ModernIconButton(
            icon: Icons.tune_rounded,
            onPressed: onPressed,
            backgroundColor: hasActiveFilters
                ? AppColors.primarySurface
                : (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
            iconColor: hasActiveFilters
                ? AppColors.primary
                : (isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondaryLight),
            size: 44,
            iconSize: 22,
            shadow: [],
            tooltip: AppStrings.filter,
          ),
          if (hasActiveFilters && activeFilterCount > 0)
            Positioned(
              top: 4,
              right: 4,
              child: CountBadge(
                count: activeFilterCount,
                size: 18,
              ),
            ),
        ],
      ),
    );
  }
}
