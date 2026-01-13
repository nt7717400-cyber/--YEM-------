'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Check,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  /** Unique key for the column */
  key: keyof T | string;
  /** Display label for the column header */
  label: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Whether to hide on mobile */
  hideOnMobile?: boolean;
}

export interface RowAction<T> {
  /** Action label */
  label: string;
  /** Action icon */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: (row: T) => void;
  /** Variant for styling */
  variant?: 'default' | 'destructive';
  /** Whether the action is disabled */
  disabled?: (row: T) => boolean;
}

export interface PaginationConfig {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Available page size options */
  pageSizeOptions?: number[];
}

export interface DataTableProps<T extends { id: string | number }> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Pagination configuration */
  pagination?: PaginationConfig;
  /** Sort change handler */
  onSort?: (column: string, direction: SortDirection) => void;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Row selection handler */
  onRowSelect?: (selectedIds: (string | number)[]) => void;
  /** Currently selected row IDs */
  selectedIds?: (string | number)[];
  /** Row actions */
  rowActions?: RowAction<T>[];
  /** Bulk actions (shown when rows are selected) */
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedIds: (string | number)[]) => void;
    variant?: 'default' | 'destructive';
  }[];
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Get row ID function (defaults to row.id) */
  getRowId?: (row: T) => string | number;
}

// ============================================
// Helper Functions (exported for testing)
// ============================================

/**
 * Sorts data by a column in the specified direction
 */
export function sortData<T>(
  data: T[],
  column: keyof T | string,
  direction: SortDirection
): T[] {
  if (!direction) return data;

  return [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[column as string];
    const bValue = (b as Record<string, unknown>)[column as string];

    // Handle null/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? -1 : 1;
    if (bValue == null) return direction === 'asc' ? 1 : -1;

    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ar');
      return direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Fallback to string comparison
    const comparison = String(aValue).localeCompare(String(bValue), 'ar');
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Toggles sort direction: null -> asc -> desc -> null
 */
export function toggleSortDirection(current: SortDirection): SortDirection {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

/**
 * Calculates pagination info
 */
export function getPaginationInfo(config: PaginationConfig) {
  const { page, pageSize, total } = config;
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return {
    totalPages,
    startItem: total > 0 ? startItem : 0,
    endItem,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Checks if all visible rows are selected
 */
export function areAllSelected<T extends { id: string | number }>(
  data: T[],
  selectedIds: (string | number)[],
  getRowId: (row: T) => string | number = (row) => row.id
): boolean {
  if (data.length === 0) return false;
  return data.every((row) => selectedIds.includes(getRowId(row)));
}

/**
 * Checks if some (but not all) rows are selected
 */
export function areSomeSelected<T extends { id: string | number }>(
  data: T[],
  selectedIds: (string | number)[],
  getRowId: (row: T) => string | number = (row) => row.id
): boolean {
  if (data.length === 0) return false;
  const selectedCount = data.filter((row) =>
    selectedIds.includes(getRowId(row))
  ).length;
  return selectedCount > 0 && selectedCount < data.length;
}

// ============================================
// Sub-Components
// ============================================

interface SortIconProps {
  direction: SortDirection;
}

function SortIcon({ direction }: SortIconProps) {
  if (direction === 'asc') {
    return <ChevronUp className="h-4 w-4" />;
  }
  if (direction === 'desc') {
    return <ChevronDown className="h-4 w-4" />;
  }
  return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
}

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  'aria-label'?: string;
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-5 sm:w-5',
        checked || indeterminate
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-input bg-background hover:border-primary/50'
      )}
    >
      {checked && <Check className="h-3 w-3" />}
      {indeterminate && !checked && (
        <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
      )}
    </button>
  );
}

interface RowActionsMenuProps<T> {
  row: T;
  actions: RowAction<T>[];
}

function RowActionsMenu<T>({ row, actions }: RowActionsMenuProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="فتح قائمة الإجراءات"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md',
            'end-0 top-full mt-1',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {actions.map((action, index) => {
            const isDisabled = action.disabled?.(row) ?? false;
            return (
              <button
                key={index}
                role="menuitem"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    action.onClick(row);
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                  'min-h-[44px] sm:min-h-0',
                  'focus:outline-none focus:bg-accent',
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-accent cursor-pointer',
                  action.variant === 'destructive' && 'text-destructive'
                )}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ============================================
// Main Component
// ============================================

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  pagination,
  onSort,
  sortColumn,
  sortDirection,
  onRowSelect,
  selectedIds = [],
  rowActions,
  bulkActions,
  onSearch,
  searchPlaceholder = 'بحث...',
  onPageChange,
  onPageSizeChange,
  emptyMessage = 'لا توجد بيانات',
  className,
  getRowId = (row) => row.id,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Handle sort click
  const handleSortClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const columnKey = String(column.key);
    const newDirection =
      sortColumn === columnKey ? toggleSortDirection(sortDirection ?? null) : 'asc';

    onSort(columnKey, newDirection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!onRowSelect) return;

    const allSelected = areAllSelected(data, selectedIds, getRowId);
    if (allSelected) {
      // Deselect all visible rows
      const visibleIds = data.map(getRowId);
      onRowSelect(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible rows
      const visibleIds = data.map(getRowId);
      const newSelection = Array.from(new Set([...selectedIds, ...visibleIds]));
      onRowSelect(newSelection);
    }
  };

  // Handle row select
  const handleRowSelect = (row: T) => {
    if (!onRowSelect) return;

    const rowId = getRowId(row);
    if (selectedIds.includes(rowId)) {
      onRowSelect(selectedIds.filter((id) => id !== rowId));
    } else {
      onRowSelect([...selectedIds, rowId]);
    }
  };

  // Calculate pagination info
  const paginationInfo = pagination ? getPaginationInfo(pagination) : null;

  // Check selection states
  const allSelected = areAllSelected(data, selectedIds, getRowId);
  const someSelected = areSomeSelected(data, selectedIds, getRowId);

  // Visible columns count (for skeleton)
  const visibleColumnsCount =
    columns.length + (onRowSelect ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        {onSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="ps-9"
              aria-label={searchPlaceholder}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {bulkActions && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} محدد
            </span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => action.onClick(selectedIds)}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container - Horizontal scroll on mobile */}
      <div className="relative overflow-x-auto rounded-md border">
        <table className="w-full text-sm" role="grid">
          <thead className="bg-muted/50">
            <tr>
              {/* Selection Column */}
              {onRowSelect && (
                <th className="w-12 p-4 text-center sticky start-0 bg-muted/50 z-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    aria-label="تحديد الكل"
                  />
                </th>
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'p-4 text-start font-medium text-muted-foreground',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/80',
                    column.hideOnMobile && 'hidden md:table-cell'
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSortClick(column)}
                  aria-sort={
                    sortColumn === String(column.key)
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                        ? 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <SortIcon
                        direction={
                          sortColumn === String(column.key) ? sortDirection ?? null : null
                        }
                      />
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              {rowActions && rowActions.length > 0 && (
                <th className="w-12 p-4 text-center sticky end-0 bg-muted/50 z-10">
                  <span className="sr-only">الإجراءات</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableSkeleton columns={visibleColumnsCount} />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnsCount}
                  className="p-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      isSelected && 'bg-muted/30'
                    )}
                    data-selected={isSelected}
                  >
                    {/* Selection Cell */}
                    {onRowSelect && (
                      <td className="w-12 p-4 text-center sticky start-0 bg-background z-10">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleRowSelect(row)}
                          aria-label={`تحديد الصف ${rowId}`}
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[
                        String(column.key)
                      ] as T[keyof T];

                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            'p-4',
                            column.hideOnMobile && 'hidden md:table-cell'
                          )}
                        >
                          {column.render
                            ? column.render(value, row)
                            : String(value ?? '')}
                        </td>
                      );
                    })}

                    {/* Actions Cell */}
                    {rowActions && rowActions.length > 0 && (
                      <td className="w-12 p-4 text-center sticky end-0 bg-background z-10">
                        <RowActionsMenu row={row} actions={rowActions} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && paginationInfo && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">عرض</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">من أصل {pagination.total}</span>
          </div>

          {/* Page Info and Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {paginationInfo.startItem}-{paginationInfo.endItem} من {pagination.total}
            </span>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange?.(1)}
                disabled={!paginationInfo.hasPrevPage}
                aria-label="الصفحة الأولى"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!paginationInfo.hasPrevPage}
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Page Number */}
              <span className="px-3 text-sm">
                {pagination.page} / {paginationInfo.totalPages || 1}
              </span>

              {/* Next Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!paginationInfo.hasNextPage}
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange?.(paginationInfo.totalPages)}
                disabled={!paginationInfo.hasNextPage}
                aria-label="الصفحة الأخيرة"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Default Row Actions
// ============================================

export function createDefaultRowActions<T>(handlers: {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}): RowAction<T>[] {
  const actions: RowAction<T>[] = [];

  if (handlers.onView) {
    actions.push({
      label: 'عرض',
      icon: <Eye className="h-4 w-4" />,
      onClick: handlers.onView,
    });
  }

  if (handlers.onEdit) {
    actions.push({
      label: 'تعديل',
      icon: <Edit className="h-4 w-4" />,
      onClick: handlers.onEdit,
    });
  }

  if (handlers.onDelete) {
    actions.push({
      label: 'حذف',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handlers.onDelete,
      variant: 'destructive',
    });
  }

  return actions;
}

// ============================================
// Export
// ============================================

export default DataTable;
