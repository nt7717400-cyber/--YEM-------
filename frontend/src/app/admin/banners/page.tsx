'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, getImageUrl } from '@/lib/api';
import { Banner, BannerPosition, BannerFilters } from '@/types/banner';

const POSITION_LABELS: Record<BannerPosition, string> = {
  hero_top: 'أعلى الهيرو',
  hero_bottom: 'أسفل الهيرو',
  sidebar: 'الشريط الجانبي',
  cars_between: 'بين السيارات',
  car_detail: 'تفاصيل السيارة',
  footer_above: 'أعلى الفوتر',
  popup: 'نافذة منبثقة',
};

const ALL_POSITIONS: BannerPosition[] = [
  'hero_top',
  'hero_bottom',
  'sidebar',
  'cars_between',
  'car_detail',
  'footer_above',
  'popup',
];

export default function BannersManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Filters
  const [positionFilter, setPositionFilter] = useState<BannerPosition | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: BannerFilters = {};
      if (positionFilter) {
        filters.position = positionFilter;
      }
      if (statusFilter !== 'all') {
        filters.isActive = statusFilter === 'active';
      }
      const data = await api.getAllBanners(filters);
      setBanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب البانرات');
    } finally {
      setIsLoading(false);
    }
  }, [positionFilter, statusFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleToggleActive = async (bannerId: number) => {
    setActionLoading(bannerId);
    try {
      const updatedBanner = await api.toggleBannerActive(bannerId);
      setBanners(banners.map(b => b.id === bannerId ? updatedBanner : b));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;
    
    setActionLoading(bannerId);
    try {
      await api.deleteBanner(bannerId);
      setBanners(banners.filter(b => b.id !== bannerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  const isScheduleActive = (banner: Banner) => {
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return false;
    if (banner.endDate && new Date(banner.endDate) < now) return false;
    return true;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة البانرات</h1>
          <Link href="/admin/banners/new">
            <Button>+ إضافة بانر</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="mr-2 underline">
              إغلاق
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>البانرات ({banners.length})</CardTitle>
              <div className="flex gap-4">
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as BannerPosition | '')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1"
                >
                  <option value="">جميع المواقع</option>
                  {ALL_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : banners.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                لا توجد بانرات بعد
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الصورة</th>
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">الموقع</th>
                      <th className="text-right py-3 px-4">الترتيب</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الجدولة</th>
                      <th className="text-right py-3 px-4">الإحصائيات</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Image
                            src={getImageUrl(banner.imageUrl)}
                            alt={banner.title}
                            width={80}
                            height={48}
                            className="w-20 h-12 object-cover rounded"
                            unoptimized
                          />
                        </td>
                        <td className="py-3 px-4 font-medium">{banner.title}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {POSITION_LABELS[banner.position]}
                          </span>
                        </td>
                        <td className="py-3 px-4">{banner.displayOrder}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            banner.isActive && isScheduleActive(banner)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.isActive ? (isScheduleActive(banner) ? 'نشط' : 'خارج الجدولة') : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>من: {formatDate(banner.startDate)}</div>
                          <div>إلى: {formatDate(banner.endDate)}</div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>👁 {banner.viewCount}</div>
                          <div>👆 {banner.clickCount}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/banners/${banner.id}/edit`}>
                              <Button variant="outline" size="sm">
                                تعديل
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(banner.id)}
                              disabled={actionLoading === banner.id}
                            >
                              {banner.isActive ? 'إيقاف' : 'تفعيل'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(banner.id)}
                              disabled={actionLoading === banner.id}
                            >
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
