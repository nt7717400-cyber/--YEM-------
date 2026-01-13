'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal';
import { CarFilters as CarFiltersType } from '@/types';
import { cn } from '@/lib/utils';

/**
 * CarFilters Component - Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 * 
 * Enhanced filter component with:
 * - Collapsible sidebar on desktop - Requirement 4.2
 * - Bottom sheet modal on mobile - Requirement 4.3
 * - Real-time filter updates without page reload - Requirement 4.4
 * - Active filter chips that can be removed - Requirement 4.5, 4.6
 * - Results count display - Requirement 4.7
 * - Friendly empty state - Requirement 4.8
 */

export interface FilterChip {
  key: string;
  label: string;
  value: string;
}

export interface CarFiltersProps {
  filters: CarFiltersType;
  onFilterChange: (filters: CarFiltersType) => void;
  brands: string[];
  resultsCount: number;
  isLoading?: boolean;
  className?: string;
}

// Generate year options
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

/**
 * Converts filter state to an array of filter chips for display.
 * Each chip represents an active filter that can be removed.
 */
export function getActiveFilterChips(filters: CarFiltersType): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `بحث: ${filters.search}`,
      value: filters.search,
    });
  }

  if (filters.brand) {
    chips.push({
      key: 'brand',
      label: `الماركة: ${filters.brand}`,
      value: filters.brand,
    });
  }

  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: `الحالة: ${filters.condition === 'NEW' ? 'جديدة' : 'مستعملة'}`,
      value: filters.condition,
    });
  }

  if (filters.year) {
    chips.push({
      key: 'year',
      label: `السنة: ${filters.year}`,
      value: filters.year.toString(),
    });
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    chips.push({
      key: 'minPrice',
      label: `أقل سعر: ${filters.minPrice.toLocaleString()} ر.ي`,
      value: filters.minPrice.toString(),
    });
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    chips.push({
      key: 'maxPrice',
      label: `أعلى سعر: ${filters.maxPrice.toLocaleString()} ر.ي`,
      value: filters.maxPrice.toString(),
    });
  }

  return chips;
}

/**
 * Removes a filter by key and returns the updated filters.
 */
export function removeFilter(
  filters: CarFiltersType,
  filterKey: string
): CarFiltersType {
  const newFilters = { ...filters };

  switch (filterKey) {
    case 'search':
      delete newFilters.search;
      break;
    case 'brand':
      delete newFilters.brand;
      break;
    case 'condition':
      delete newFilters.condition;
      break;
    case 'year':
      delete newFilters.year;
      break;
    case 'minPrice':
      delete newFilters.minPrice;
      break;
    case 'maxPrice':
      delete newFilters.maxPrice;
      break;
  }

  return newFilters;
}

/**
 * Checks if any filters are active.
 */
export function hasActiveFilters(filters: CarFiltersType): boolean {
  return (
    !!filters.search ||
    !!filters.brand ||
    !!filters.condition ||
    !!filters.year ||
    (filters.minPrice !== undefined && filters.minPrice > 0) ||
    (filters.maxPrice !== undefined && filters.maxPrice > 0)
  );
}


/**
 * Filter Chips Component - Displays active filters as removable chips
 * Requirements: 4.5, 4.6
 */
export function FilterChips({
  filters,
  onRemove,
  className,
}: {
  filters: CarFiltersType;
  onRemove: (key: string) => void;
  className?: string;
}) {
  const chips = getActiveFilterChips(filters);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="list" aria-label="الفلاتر النشطة">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            'bg-primary/10 text-primary text-sm font-medium',
            'hover:bg-primary/20 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label={`إزالة فلتر ${chip.label}`}
          role="listitem"
        >
          <span>{chip.label}</span>
          <XIcon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/**
 * Results Count Component - Displays the number of results
 * Requirement: 4.7
 */
export function ResultsCount({
  count,
  isLoading,
  className,
}: {
  count: number;
  isLoading?: boolean;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={cn('text-muted-foreground', className)}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className={cn('text-muted-foreground', className)} aria-live="polite">
      {count === 0 ? 'لا توجد نتائج' : `${count} سيارة`}
    </div>
  );
}

/**
 * Empty State Component - Friendly message when no results
 * Requirement: 4.8
 */
export function EmptyFilterState({
  onClearFilters,
  className,
}: {
  onClearFilters: () => void;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground/50">
        <SearchEmptyIcon />
      </div>
      <h3 className="text-lg font-semibold mb-2">لم يتم العثور على سيارات</h3>
      <p className="text-muted-foreground mb-4">
        جرب تغيير معايير البحث أو إزالة بعض الفلاتر
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        مسح جميع الفلاتر
      </Button>
    </div>
  );
}

/**
 * Filter Form Component - The actual filter inputs
 */
function FilterForm({
  filters,
  brands,
  onFilterChange,
  onApply,
  onClear,
  isLoading,
}: {
  filters: CarFiltersType;
  brands: string[];
  onFilterChange: (filters: CarFiltersType) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
}) {
  const [localFilters, setLocalFilters] = useState<CarFiltersType>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof CarFiltersType, value: string | number | undefined) => {
    const newFilters = { ...localFilters };
    if (value === '' || value === undefined || value === 'all') {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, unknown>)[key] = value;
    }
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onApply();
  };

  const handleClear = () => {
    const clearedFilters: CarFiltersType = { sortBy: filters.sortBy };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="filter-search" className="block text-sm font-medium mb-1.5">
          البحث
        </label>
        <Input
          id="filter-search"
          type="text"
          value={localFilters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="ابحث عن سيارة..."
        />
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="filter-brand" className="block text-sm font-medium mb-1.5">
          الماركة
        </label>
        <Select
          value={localFilters.brand || 'all'}
          onValueChange={(v) => handleChange('brand', v === 'all' ? undefined : v)}
        >
          <SelectTrigger id="filter-brand">
            <SelectValue placeholder="اختر الماركة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <label htmlFor="filter-condition" className="block text-sm font-medium mb-1.5">
          الحالة
        </label>
        <Select
          value={localFilters.condition || 'all'}
          onValueChange={(v) => handleChange('condition', v === 'all' ? undefined : v)}
        >
          <SelectTrigger id="filter-condition">
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="NEW">جديدة</SelectItem>
            <SelectItem value="USED">مستعملة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div>
        <label htmlFor="filter-year" className="block text-sm font-medium mb-1.5">
          السنة
        </label>
        <Select
          value={localFilters.year?.toString() || 'all'}
          onValueChange={(v) => handleChange('year', v === 'all' ? undefined : parseInt(v))}
        >
          <SelectTrigger id="filter-year">
            <SelectValue placeholder="اختر السنة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="filter-min-price" className="block text-sm font-medium mb-1.5">
            أقل سعر
          </label>
          <Input
            id="filter-min-price"
            type="number"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="filter-max-price" className="block text-sm font-medium mb-1.5">
            أعلى سعر
          </label>
          <Input
            id="filter-max-price"
            type="number"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="∞"
            min="0"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label htmlFor="filter-sort" className="block text-sm font-medium mb-1.5">
          الترتيب
        </label>
        <Select
          value={localFilters.sortBy || 'newest'}
          onValueChange={(v) => handleChange('sortBy', v as CarFiltersType['sortBy'])}
        >
          <SelectTrigger id="filter-sort">
            <SelectValue placeholder="اختر الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
            <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleApply} className="flex-1" disabled={isLoading}>
          {isLoading ? 'جاري التحميل...' : 'تطبيق الفلاتر'}
        </Button>
        <Button variant="outline" onClick={handleClear}>
          مسح
        </Button>
      </div>
    </div>
  );
}


/**
 * Desktop Sidebar Filters - Collapsible sidebar on desktop
 * Requirement: 4.2
 */
export function DesktopFilters({
  filters,
  brands,
  onFilterChange,
  isLoading,
  className,
}: {
  filters: CarFiltersType;
  brands: string[];
  onFilterChange: (filters: CarFiltersType) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:block transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-72',
        className
      )}
    >
      <div className="sticky top-24">
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* Header with collapse toggle */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <h2 className="font-semibold">الفلاتر</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'توسيع الفلاتر' : 'طي الفلاتر'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronLeftIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filter content */}
          {!isCollapsed && (
            <div className="p-4">
              <FilterForm
                filters={filters}
                brands={brands}
                onFilterChange={onFilterChange}
                onApply={() => {}}
                onClear={() => {}}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/**
 * Mobile Bottom Sheet Filters - Bottom sheet modal on mobile
 * Requirement: 4.3
 */
export function MobileFilters({
  filters,
  brands,
  onFilterChange,
  isLoading,
  className,
}: {
  filters: CarFiltersType;
  brands: string[];
  onFilterChange: (filters: CarFiltersType) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = getActiveFilterChips(filters).length;

  return (
    <div className={cn('lg:hidden', className)}>
      {/* Filter trigger button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          الفلاتر
        </span>
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Bottom sheet modal */}
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent
          className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 rounded-t-xl rounded-b-none max-h-[85vh] overflow-y-auto"
          closeOnOverlay={true}
        >
          <ModalHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <ModalTitle>الفلاتر</ModalTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                إغلاق
              </Button>
            </div>
          </ModalHeader>

          <div className="p-4">
            <FilterForm
              filters={filters}
              brands={brands}
              onFilterChange={onFilterChange}
              onApply={() => setIsOpen(false)}
              onClear={() => setIsOpen(false)}
              isLoading={isLoading}
            />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

/**
 * Main CarFilters Component - Combines all filter functionality
 */
export function CarFiltersComponent({
  filters,
  onFilterChange,
  brands,
  resultsCount,
  isLoading,
  className,
}: CarFiltersProps) {
  const handleRemoveFilter = useCallback(
    (key: string) => {
      const newFilters = removeFilter(filters, key);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleClearAll = useCallback(() => {
    onFilterChange({ sortBy: filters.sortBy });
  }, [filters.sortBy, onFilterChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile filter button */}
      <MobileFilters
        filters={filters}
        brands={brands}
        onFilterChange={onFilterChange}
        isLoading={isLoading}
      />

      {/* Active filter chips */}
      <FilterChips filters={filters} onRemove={handleRemoveFilter} />

      {/* Results count */}
      <ResultsCount count={resultsCount} isLoading={isLoading} />

      {/* Empty state when no results and filters are active */}
      {resultsCount === 0 && hasActiveFilters(filters) && !isLoading && (
        <EmptyFilterState onClearFilters={handleClearAll} />
      )}
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SearchEmptyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5L10.5 13.5M10.5 10.5l3 3"
      />
    </svg>
  );
}

export { CarFiltersComponent as CarFilters };
