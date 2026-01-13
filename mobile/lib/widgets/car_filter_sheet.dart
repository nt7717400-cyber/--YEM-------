/// CarFilterSheet Widget for Flutter Customer App
/// Requirements: 2.1-2.7 - Filter cars by brand, condition, price range, year

import 'package:flutter/material.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/car_filter.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/formatters.dart';

/// Bottom sheet for filtering cars
class CarFilterSheet extends StatefulWidget {
  final CarFilter initialFilter;
  final List<String> availableBrands;
  final List<int> availableYears;
  final double? minAvailablePrice;
  final double? maxAvailablePrice;
  final Function(CarFilter) onApply;
  final VoidCallback? onClear;

  const CarFilterSheet({
    super.key,
    required this.initialFilter,
    required this.availableBrands,
    required this.availableYears,
    this.minAvailablePrice,
    this.maxAvailablePrice,
    required this.onApply,
    this.onClear,
  });

  /// Show the filter sheet as a modal bottom sheet
  static Future<CarFilter?> show({
    required BuildContext context,
    required CarFilter initialFilter,
    required List<String> availableBrands,
    required List<int> availableYears,
    double? minAvailablePrice,
    double? maxAvailablePrice,
  }) async {
    return showModalBottomSheet<CarFilter>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CarFilterSheet(
        initialFilter: initialFilter,
        availableBrands: availableBrands,
        availableYears: availableYears,
        minAvailablePrice: minAvailablePrice,
        maxAvailablePrice: maxAvailablePrice,
        onApply: (filter) => Navigator.of(context).pop(filter),
        onClear: () => Navigator.of(context).pop(CarFilter.empty()),
      ),
    );
  }

  @override
  State<CarFilterSheet> createState() => _CarFilterSheetState();
}

class _CarFilterSheetState extends State<CarFilterSheet> {
  late String? _selectedBrand;
  late CarCondition? _selectedCondition;
  late int? _selectedYear;
  late SortBy _selectedSortBy;
  late RangeValues _priceRange;
  late TextEditingController _minPriceController;
  late TextEditingController _maxPriceController;

  double get _minPrice => widget.minAvailablePrice ?? 0;
  double get _maxPrice => widget.maxAvailablePrice ?? 100000000;

  @override
  void initState() {
    super.initState();
    _selectedBrand = widget.initialFilter.brand;
    _selectedCondition = widget.initialFilter.condition;
    _selectedYear = widget.initialFilter.year;
    _selectedSortBy = widget.initialFilter.sortBy;
    
    final minVal = widget.initialFilter.minPrice ?? _minPrice;
    final maxVal = widget.initialFilter.maxPrice ?? _maxPrice;
    _priceRange = RangeValues(minVal, maxVal);
    
    _minPriceController = TextEditingController(
      text: widget.initialFilter.minPrice?.toStringAsFixed(0) ?? '',
    );
    _maxPriceController = TextEditingController(
      text: widget.initialFilter.maxPrice?.toStringAsFixed(0) ?? '',
    );
  }

  @override
  void dispose() {
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    final filter = CarFilter(
      brand: _selectedBrand,
      condition: _selectedCondition,
      year: _selectedYear,
      sortBy: _selectedSortBy,
      minPrice: _priceRange.start > _minPrice ? _priceRange.start : null,
      maxPrice: _priceRange.end < _maxPrice ? _priceRange.end : null,
    );
    widget.onApply(filter);
  }

  void _clearFilters() {
    setState(() {
      _selectedBrand = null;
      _selectedCondition = null;
      _selectedYear = null;
      _selectedSortBy = SortBy.newest;
      _priceRange = RangeValues(_minPrice, _maxPrice);
      _minPriceController.clear();
      _maxPriceController.clear();
    });
    widget.onClear?.call();
  }

  bool get _hasActiveFilters =>
      _selectedBrand != null ||
      _selectedCondition != null ||
      _selectedYear != null ||
      _priceRange.start > _minPrice ||
      _priceRange.end < _maxPrice;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          _buildHandleBar(isDark),
          // Header
          _buildHeader(isDark),
          const Divider(height: 1),
          // Filter content
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: 16 + bottomPadding,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sort by
                  _buildSortBySection(isDark),
                  const SizedBox(height: 24),
                  // Brand filter
                  _buildBrandSection(isDark),
                  const SizedBox(height: 24),
                  // Condition filter
                  _buildConditionSection(isDark),
                  const SizedBox(height: 24),
                  // Year filter
                  _buildYearSection(isDark),
                  const SizedBox(height: 24),
                  // Price range filter
                  _buildPriceRangeSection(isDark),
                  const SizedBox(height: 32),
                  // Action buttons
                  _buildActionButtons(isDark),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHandleBar(bool isDark) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: isDark ? AppColors.borderDark : AppColors.borderLight,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppStrings.filter,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          if (_hasActiveFilters)
            TextButton(
              onPressed: _clearFilters,
              child: Text(
                AppStrings.clearFilters,
                style: TextStyle(
                  color: AppColors.error,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        ),
      ),
    );
  }

  Widget _buildSortBySection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(AppStrings.sortBy, isDark),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: SortBy.values.map((sortBy) {
            final isSelected = _selectedSortBy == sortBy;
            return _buildChip(
              label: _getSortByLabel(sortBy),
              isSelected: isSelected,
              onTap: () => setState(() => _selectedSortBy = sortBy),
              isDark: isDark,
            );
          }).toList(),
        ),
      ],
    );
  }

  String _getSortByLabel(SortBy sortBy) {
    switch (sortBy) {
      case SortBy.newest:
        return AppStrings.newest;
      case SortBy.priceAsc:
        return AppStrings.priceAsc;
      case SortBy.priceDesc:
        return AppStrings.priceDesc;
    }
  }

  Widget _buildBrandSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(AppStrings.brand, isDark),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildChip(
              label: AppStrings.allBrands,
              isSelected: _selectedBrand == null,
              onTap: () => setState(() => _selectedBrand = null),
              isDark: isDark,
            ),
            ...widget.availableBrands.map((brand) {
              final isSelected = _selectedBrand == brand;
              return _buildChip(
                label: brand,
                isSelected: isSelected,
                onTap: () => setState(() => _selectedBrand = brand),
                isDark: isDark,
              );
            }),
          ],
        ),
      ],
    );
  }

  Widget _buildConditionSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(AppStrings.condition, isDark),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildChip(
              label: AppStrings.allConditions,
              isSelected: _selectedCondition == null,
              onTap: () => setState(() => _selectedCondition = null),
              isDark: isDark,
            ),
            _buildChip(
              label: AppStrings.newCar,
              isSelected: _selectedCondition == CarCondition.newCar,
              onTap: () => setState(() => _selectedCondition = CarCondition.newCar),
              isDark: isDark,
            ),
            _buildChip(
              label: AppStrings.usedCar,
              isSelected: _selectedCondition == CarCondition.used,
              onTap: () => setState(() => _selectedCondition = CarCondition.used),
              isDark: isDark,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildYearSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(AppStrings.year, isDark),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<int?>(
              value: _selectedYear,
              isExpanded: true,
              hint: Text(
                AppStrings.allYears,
                style: TextStyle(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              items: [
                DropdownMenuItem<int?>(
                  value: null,
                  child: Text(AppStrings.allYears),
                ),
                ...widget.availableYears.map((year) {
                  return DropdownMenuItem<int>(
                    value: year,
                    child: Text(Formatters.formatYear(year)),
                  );
                }),
              ],
              onChanged: (value) => setState(() => _selectedYear = value),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRangeSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(AppStrings.priceRange, isDark),
        // Price range slider
        RangeSlider(
          values: _priceRange,
          min: _minPrice,
          max: _maxPrice,
          divisions: 100,
          activeColor: AppColors.primary,
          inactiveColor: isDark ? AppColors.borderDark : AppColors.borderLight,
          labels: RangeLabels(
            Formatters.formatCurrency(_priceRange.start),
            Formatters.formatCurrency(_priceRange.end),
          ),
          onChanged: (values) {
            setState(() {
              _priceRange = values;
              _minPriceController.text = values.start.toStringAsFixed(0);
              _maxPriceController.text = values.end.toStringAsFixed(0);
            });
          },
        ),
        const SizedBox(height: 8),
        // Price range labels
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              Formatters.formatCurrency(_priceRange.start),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            Text(
              Formatters.formatCurrency(_priceRange.end),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? AppColors.cardDark : AppColors.cardLight),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons(bool isDark) {
    return Row(
      children: [
        // Clear button
        Expanded(
          child: OutlinedButton(
            onPressed: _clearFilters,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: BorderSide(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              AppStrings.clearFilters,
              style: TextStyle(
                fontSize: 16,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Apply button
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: _applyFilters,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              AppStrings.applyFilters,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Filter button with active indicator
class FilterButton extends StatelessWidget {
  final bool hasActiveFilters;
  final int activeFilterCount;
  final VoidCallback onPressed;

  const FilterButton({
    super.key,
    this.hasActiveFilters = false,
    this.activeFilterCount = 0,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Stack(
      children: [
        IconButton(
          onPressed: onPressed,
          icon: Icon(
            Icons.tune,
            color: hasActiveFilters
                ? AppColors.primary
                : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
          ),
          tooltip: AppStrings.filter,
        ),
        if (hasActiveFilters && activeFilterCount > 0)
          Positioned(
            top: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 16,
                minHeight: 16,
              ),
              child: Text(
                activeFilterCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}
