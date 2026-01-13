'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CarGrid, CarFilters, DesktopFilters, FilterChips, ResultsCount, EmptyFilterState, hasActiveFilters, removeFilter } from '@/components/cars';
import { SearchBar, SearchSuggestion } from '@/components/search';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerDisplay } from '@/components/banners';
import { api } from '@/lib/api';
import { Car, CarFilters as CarFiltersType } from '@/types';

/**
 * CarsPageClient - Requirements: 2.1-2.7, 4.1-4.8
 * 
 * Integrated car listing page with:
 * - CarCard display with all required information (2.1-2.7)
 * - SearchBar with instant suggestions (4.1)
 * - CarFilters with collapsible sidebar on desktop (4.2)
 * - Bottom sheet filters on mobile (4.3)
 * - Real-time filter updates without page reload (4.4)
 * - Active filter chips that can be removed (4.5, 4.6)
 * - Results count display (4.7)
 * - Friendly empty state (4.8)
 */

const ITEMS_PER_PAGE = 12;

export default function CarsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Initialize filters from URL params
  const initialFilters: CarFiltersType = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    brand: searchParams.get('brand') || undefined,
    condition: (searchParams.get('condition') as 'NEW' | 'USED') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    sortBy: (searchParams.get('sortBy') as CarFiltersType['sortBy']) || 'newest',
    status: 'AVAILABLE',
  }), [searchParams]);

  const [filters, setFilters] = useState<CarFiltersType>(initialFilters);

  // Load cars based on filters - Requirement 4.4
  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllCars({
        ...filters,
        status: 'AVAILABLE',
      });
      setCars(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Load brands for filter options
  useEffect(() => {
    api.getBrands().then(setBrands).catch(console.error);
  }, []);

  // Update URL with filters
  const updateURL = useCallback((newFilters: CarFiltersType) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.condition) params.set('condition', newFilters.condition);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.year) params.set('year', newFilters.year.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);
    
    const queryString = params.toString();
    router.push(`/cars${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  // Handle filter changes - Requirement 4.4
  const handleFilterChange = useCallback((newFilters: CarFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Handle search - Requirement 4.1
  const handleSearch = useCallback((query: string) => {
    const newFilters = { ...filters, search: query || undefined };
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  // Handle search query change for suggestions - Requirement 4.1
  const handleQueryChange = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      // Generate suggestions from brands and existing car names
      const brandSuggestions: SearchSuggestion[] = brands
        .filter(b => b.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(b => ({ type: 'brand' as const, label: b, value: b }));

      const carSuggestions: SearchSuggestion[] = cars
        .filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.brand.toLowerCase().includes(query.toLowerCase()) ||
          c.model.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map(c => ({ type: 'car' as const, label: c.name, value: c.name }));

      setSuggestions([...brandSuggestions, ...carSuggestions]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [brands, cars]);

  // Handle removing a filter chip - Requirement 4.6
  const handleRemoveFilter = useCallback((key: string) => {
    const newFilters = removeFilter(filters, key);
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: CarFiltersType = { sortBy: 'newest', status: 'AVAILABLE' };
    setFilters(clearedFilters);
    router.push('/cars');
  }, [router]);

  // Pagination
  const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
  const paginatedCars = cars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Check if filters are active
  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">جميع السيارات</h1>
      
      {/* Main Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters - Requirement 4.2 */}
        <DesktopFilters
          filters={filters}
          brands={brands}
          onFilterChange={handleFilterChange}
          isLoading={loading}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar - Requirement 4.1 */}
          <div className="mb-6">
            <SearchBar
              defaultValue={filters.search || ''}
              placeholder="ابحث عن سيارة بالاسم أو الماركة..."
              suggestions={suggestions}
              onSearch={handleSearch}
              onQueryChange={handleQueryChange}
              isLoading={suggestionsLoading}
            />
          </div>

          {/* Mobile Filters Button - Requirement 4.3 */}
          <div className="lg:hidden mb-4">
            <CarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              brands={brands}
              resultsCount={cars.length}
              isLoading={loading}
            />
          </div>

          {/* Active Filter Chips - Requirements 4.5, 4.6 */}
          {filtersActive && (
            <div className="mb-4">
              <FilterChips 
                filters={filters} 
                onRemove={handleRemoveFilter}
              />
            </div>
          )}

          {/* Results Count - Requirement 4.7 */}
          <div className="mb-4 flex items-center justify-between">
            <ResultsCount count={cars.length} isLoading={loading} />
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>
          
          {/* Cars Grid */}
          {loading ? (
            <CarsGridSkeleton />
          ) : cars.length === 0 && filtersActive ? (
            // Empty State - Requirement 4.8
            <EmptyFilterState onClearFilters={clearFilters} />
          ) : (
            <>
              {/* First half of cars */}
              <CarGrid 
                cars={paginatedCars.slice(0, Math.ceil(paginatedCars.length / 2))} 
                emptyMessage="لا توجد سيارات متوفرة حالياً" 
              />
              
              {/* Cars Between Banner - shown between car rows */}
              {paginatedCars.length > 3 && (
                <BannerDisplay 
                  position="cars_between" 
                  single 
                  className="my-8"
                />
              )}
              
              {/* Second half of cars */}
              {paginatedCars.length > Math.ceil(paginatedCars.length / 2) && (
                <CarGrid 
                  cars={paginatedCars.slice(Math.ceil(paginatedCars.length / 2))} 
                  emptyMessage="" 
                />
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
        
        {/* Sidebar Banner - visible on large screens */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24">
            <BannerDisplay 
              position="sidebar" 
              className="space-y-4"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Pagination Component
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if at the beginning or end
    if (currentPage <= 2) {
      end = Math.min(totalPages - 1, 4);
    } else if (currentPage >= totalPages - 1) {
      start = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis if needed
    if (start > 2) {
      pages.push('ellipsis');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        السابق
      </Button>
      
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-10"
              aria-label={`الصفحة ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        التالي
      </Button>
    </div>
  );
}

/**
 * Cars Grid Skeleton - Loading state
 */
function CarsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-lg border overflow-hidden">
          <Skeleton variant="rectangular" className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-4 w-1/4" />
          </div>
          <div className="p-4 pt-0 flex justify-between">
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="text" className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
