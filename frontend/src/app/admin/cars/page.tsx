'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AdminLayout, DataTable } from '@/components/admin';
import type { Column, RowAction, PaginationConfig } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { api, getImageUrl } from '@/lib/api';
import { Car } from '@/types';
import { Star, Copy, Archive, Plus, Trash2, Edit, Eye } from 'lucide-react';

/**
 * CarsManagementPage - Requirements: 8.1-15.5
 * 
 * Integrated admin cars page with:
 * - DataTable with sorting and pagination (10.1, 10.3)
 * - Search and filtering (10.4)
 * - Row actions (Edit, Delete, View) (10.5)
 * - Bulk actions for multiple selections (10.6)
 * - Mobile-optimized horizontal scroll (10.8)
 */

const ITEMS_PER_PAGE = 10;

export default function CarsManagementPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  
  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; carId?: number; carName?: string }>({ isOpen: false });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllCars({ status: 'AVAILABLE' });
      setCars(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ في جلب السيارات');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...cars];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(car =>
        car.name.toLowerCase().includes(query) ||
        car.brand.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn as keyof Car];
        const bValue = b[sortColumn as keyof Car];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue, 'ar');
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return result;
  }, [cars, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCars.slice(start, start + pageSize);
  }, [filteredCars, currentPage, pageSize]);

  const pagination: PaginationConfig = {
    page: currentPage,
    pageSize,
    total: filteredCars.length,
    pageSizeOptions: [10, 20, 50],
  };

  // Handlers
  const handleToggleFeatured = async (carId: number) => {
    try {
      const updatedCar = await api.toggleFeatured(carId);
      setCars(cars.map(car => car.id === carId ? updatedCar : car));
      toast.success('تم تحديث حالة التمييز');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleArchive = async (carId: number) => {
    try {
      await api.archiveCar(carId);
      setCars(cars.filter(car => car.id !== carId));
      toast.success('تم أرشفة السيارة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleDuplicate = async (carId: number) => {
    try {
      const newCar = await api.duplicateCar(carId);
      setCars([newCar, ...cars]);
      toast.success('تم نسخ السيارة بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleDelete = async (carId: number) => {
    try {
      await api.deleteCar(carId);
      setCars(cars.filter(car => car.id !== carId));
      setDeleteConfirm({ isOpen: false });
      toast.success('تم حذف السيارة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.deleteCar(id as number)));
      setCars(cars.filter(car => !selectedIds.includes(car.id)));
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
      toast.success(`تم حذف ${selectedIds.length} سيارة`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Table columns definition
  const columns: Column<Car>[] = [
    {
      key: 'thumbnail',
      label: 'الصورة',
      width: '80px',
      render: (_, car) => (
        car.images && car.images[0] ? (
          <Image
            src={getImageUrl(car.images[0].url)}
            alt={car.name}
            width={64}
            height={48}
            className="w-16 h-12 object-cover rounded"
            unoptimized
          />
        ) : (
          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
            🚗
          </div>
        )
      ),
    },
    {
      key: 'name',
      label: 'السيارة',
      sortable: true,
      render: (_, car) => (
        <div>
          <p className="font-medium">{car.name}</p>
          <p className="text-sm text-muted-foreground">{car.brand} - {car.model}</p>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'السنة',
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: 'price',
      label: 'السعر',
      sortable: true,
      render: (value) => (
        <span>{(value as number).toLocaleString('ar-EG')} ر.ي</span>
      ),
    },
    {
      key: 'condition',
      label: 'الحالة',
      hideOnMobile: true,
      render: (value) => (
        <Badge variant={value === 'NEW' ? 'default' : 'secondary'}>
          {value === 'NEW' ? 'جديدة' : 'مستعملة'}
        </Badge>
      ),
    },
    {
      key: 'isFeatured',
      label: 'مميزة',
      render: (_, car) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFeatured(car.id);
          }}
          className={`text-xl transition-colors ${car.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
          aria-label={car.isFeatured ? 'إلغاء التمييز' : 'تمييز السيارة'}
        >
          <Star className={`h-5 w-5 ${car.isFeatured ? 'fill-current' : ''}`} />
        </button>
      ),
    },
    {
      key: 'viewCount',
      label: 'المشاهدات',
      sortable: true,
      hideOnMobile: true,
      render: (value) => (
        <span className="text-muted-foreground">{value as number}</span>
      ),
    },
  ];

  // Row actions
  const rowActions: RowAction<Car>[] = [
    {
      label: 'عرض',
      icon: <Eye className="h-4 w-4" />,
      onClick: (car) => window.open(`/cars/${car.id}`, '_blank'),
    },
    {
      label: 'تعديل',
      icon: <Edit className="h-4 w-4" />,
      onClick: (car) => router.push(`/admin/cars/${car.id}/edit`),
    },
    {
      label: 'نسخ',
      icon: <Copy className="h-4 w-4" />,
      onClick: (car) => handleDuplicate(car.id),
    },
    {
      label: 'أرشفة',
      icon: <Archive className="h-4 w-4" />,
      onClick: (car) => handleArchive(car.id),
    },
    {
      label: 'حذف',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (car) => setDeleteConfirm({ isOpen: true, carId: car.id, carName: car.name }),
      variant: 'destructive',
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'حذف المحدد',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setBulkDeleteConfirm(true),
      variant: 'destructive' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة السيارات</h1>
            <p className="text-muted-foreground">
              {filteredCars.length} سيارة متوفرة
            </p>
          </div>
          <Link href="/admin/cars/new">
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة سيارة
            </Button>
          </Link>
        </div>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0 sm:p-6">
            <DataTable
              data={paginatedCars}
              columns={columns}
              isLoading={isLoading}
              pagination={pagination}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onRowSelect={setSelectedIds}
              selectedIds={selectedIds}
              rowActions={rowActions}
              bulkActions={bulkActions}
              onSearch={setSearchQuery}
              searchPlaceholder="بحث بالاسم أو الماركة..."
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              emptyMessage="لا توجد سيارات"
              getRowId={(car) => car.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => deleteConfirm.carId && handleDelete(deleteConfirm.carId)}
        title="حذف السيارة"
        description={`هل أنت متأكد من حذف "${deleteConfirm.carName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="حذف السيارات المحددة"
        description={`هل أنت متأكد من حذف ${selectedIds.length} سيارة؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف الكل"
        cancelText="إلغاء"
        variant="destructive"
      />
    </AdminLayout>
  );
}
