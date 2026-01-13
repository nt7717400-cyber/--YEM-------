'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, getImageUrl } from '@/lib/api';
import { Auction, AuctionStatus } from '@/types/auction';

const STATUS_LABELS: Record<AuctionStatus, string> = {
  ACTIVE: 'نشط',
  ENDED: 'منتهي',
  CANCELLED: 'ملغي',
  SOLD: 'مباع',
};

const STATUS_COLORS: Record<AuctionStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ENDED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SOLD: 'bg-blue-100 text-blue-800',
};

export default function AuctionsManagementPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | ''>('');

  const fetchAuctions = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await api.getAllAuctions(filters);
      setAuctions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب المزادات');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);


  const handleEndEarly = async (auctionId: number) => {
    if (!confirm('هل أنت متأكد من إنهاء هذا المزاد مبكراً؟')) return;
    
    setActionLoading(auctionId);
    try {
      const updatedAuction = await api.endAuctionEarly(auctionId);
      setAuctions(auctions.map(a => a.id === auctionId ? updatedAuction : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (auctionId: number) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا المزاد؟')) return;
    
    setActionLoading(auctionId);
    try {
      await api.cancelAuction(auctionId);
      setAuctions(auctions.filter(a => a.id !== auctionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'انتهى';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} يوم ${hours} ساعة`;
    if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
    return `${minutes} دقيقة`;
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة المزادات</h1>
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
              <CardTitle>المزادات ({auctions.length})</CardTitle>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AuctionStatus | '')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1"
                >
                  <option value="">جميع الحالات</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="ENDED">منتهي</option>
                  <option value="SOLD">مباع</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : auctions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                لا توجد مزادات بعد
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الصورة</th>
                      <th className="text-right py-3 px-4">السيارة</th>
                      <th className="text-right py-3 px-4">السعر الابتدائي</th>
                      <th className="text-right py-3 px-4">السعر الحالي</th>
                      <th className="text-right py-3 px-4">عدد العروض</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الوقت المتبقي</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctions.map((auction) => (
                      <tr key={auction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {auction.car?.images && auction.car.images[0] ? (
                            <Image
                              src={getImageUrl(auction.car.images[0].url)}
                              alt={auction.car.name}
                              width={64}
                              height={48}
                              className="w-16 h-12 object-cover rounded"
                              unoptimized
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              🚗
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {auction.car?.name || `سيارة #${auction.carId}`}
                        </td>
                        <td className="py-3 px-4">
                          {auction.startingPrice.toLocaleString('ar-EG')} ر.ي
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">
                          {auction.currentPrice.toLocaleString('ar-EG')} ر.ي
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {auction.bidCount} عرض
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[auction.status]}`}>
                            {STATUS_LABELS[auction.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {auction.status === 'ACTIVE' ? (
                            <span className="text-orange-600 font-medium">
                              {getTimeRemaining(auction.endTime)}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {formatDate(auction.endTime)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/auctions/${auction.id}`}>
                              <Button variant="outline" size="sm">
                                التفاصيل
                              </Button>
                            </Link>
                            {auction.status === 'ACTIVE' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEndEarly(auction.id)}
                                  disabled={actionLoading === auction.id}
                                >
                                  إنهاء
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(auction.id)}
                                  disabled={actionLoading === auction.id}
                                >
                                  إلغاء
                                </Button>
                              </>
                            )}
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
