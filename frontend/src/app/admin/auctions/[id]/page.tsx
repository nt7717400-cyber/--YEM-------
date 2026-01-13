'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, getImageUrl } from '@/lib/api';
import { Auction, AuctionStatus, Bid } from '@/types/auction';

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

// Copy icon component
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

// Phone icon component
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

// Check icon component
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = Number(params.id);
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  
  // Extend time modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');

  // Copy phone number to clipboard
  const copyToClipboard = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fetchAuction = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAuctionById(auctionId);
      if (!data) {
        setError('المزاد غير موجود');
        return;
      }
      setAuction(data);
      // Set default new end time to current end time + 1 day
      const defaultNewEnd = new Date(data.endTime);
      defaultNewEnd.setDate(defaultNewEnd.getDate() + 1);
      setNewEndTime(defaultNewEnd.toISOString().slice(0, 16));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب المزاد');
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);


  const handleEndEarly = async () => {
    if (!confirm('هل أنت متأكد من إنهاء هذا المزاد مبكراً؟')) return;
    
    setActionLoading(true);
    try {
      const updatedAuction = await api.endAuctionEarly(auctionId);
      setAuction(updatedAuction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء هذا المزاد؟')) return;
    
    setActionLoading(true);
    try {
      await api.cancelAuction(auctionId);
      router.push('/admin/auctions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setActionLoading(false);
    }
  };

  const handleExtendTime = async () => {
    if (!newEndTime) {
      setError('يرجى تحديد وقت الانتهاء الجديد');
      return;
    }
    
    const newEnd = new Date(newEndTime);
    if (newEnd <= new Date()) {
      setError('يجب أن يكون الوقت الجديد في المستقبل');
      return;
    }
    
    setActionLoading(true);
    try {
      const updatedAuction = await api.extendAuctionTime(auctionId, newEnd.toISOString());
      setAuction(updatedAuction);
      setShowExtendModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBid = async (bidId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المزايدة؟')) return;
    
    setActionLoading(true);
    try {
      await api.deleteBid(auctionId, bidId);
      // Reload auction data
      await fetchAuction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف المزايدة');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
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


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!auction) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'المزاد غير موجود'}</p>
          <Link href="/admin/auctions">
            <Button className="mt-4">العودة للمزادات</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/auctions">
              <Button variant="outline">← العودة</Button>
            </Link>
            <h1 className="text-2xl font-bold">تفاصيل المزاد</h1>
          </div>
          {auction.status === 'ACTIVE' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(true)}
                disabled={actionLoading}
              >
                تمديد الوقت
              </Button>
              <Button
                variant="outline"
                onClick={handleEndEarly}
                disabled={actionLoading}
              >
                إنهاء مبكراً
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                إلغاء المزاد
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="mr-2 underline">
              إغلاق
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auction Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات السيارة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {auction.car?.images && auction.car.images[0] ? (
                    <Image
                      src={getImageUrl(auction.car.images[0].url)}
                      alt={auction.car.name}
                      width={200}
                      height={150}
                      className="w-48 h-36 object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <div className="w-48 h-36 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-4xl">
                      🚗
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{auction.car?.name}</h3>
                    <p className="text-gray-600">
                      {auction.car?.brand} - {auction.car?.model} - {auction.car?.year}
                    </p>
                    <Link href={`/admin/cars/${auction.carId}/edit`}>
                      <Button variant="outline" size="sm">
                        عرض السيارة
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Bids List */}
            <Card>
              <CardHeader>
                <CardTitle>العروض ({auction.bidCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {auction.bids && auction.bids.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-4">#</th>
                          <th className="text-right py-3 px-4">اسم المزايد</th>
                          <th className="text-right py-3 px-4">رقم الهاتف</th>
                          <th className="text-right py-3 px-4">المبلغ</th>
                          <th className="text-right py-3 px-4">التاريخ</th>
                          <th className="text-right py-3 px-4">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auction.bids.map((bid: Bid, index: number) => (
                          <tr 
                            key={bid.id} 
                            className={`border-b ${index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="py-3 px-4">
                              {index === 0 && (
                                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                                  الأعلى
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">{bid.bidderName}</td>
                            <td className="py-3 px-4 font-mono" dir="ltr">
                              <div className="flex items-center gap-2">
                                <span>{bid.phoneNumber || bid.maskedPhone}</span>
                                {bid.phoneNumber && (
                                  <>
                                    <button
                                      onClick={() => copyToClipboard(bid.phoneNumber!)}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="نسخ الرقم"
                                    >
                                      {copiedPhone === bid.phoneNumber ? (
                                        <CheckIcon className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <CopyIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                      )}
                                    </button>
                                    <a
                                      href={`tel:${bid.phoneNumber}`}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="اتصال"
                                    >
                                      <PhoneIcon className="w-4 h-4 text-green-500 hover:text-green-700" />
                                    </a>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {bid.amount.toLocaleString('ar-EG')} ر.ي
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatDate(bid.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteBid(bid.id)}
                                disabled={actionLoading}
                              >
                                حذف
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    لا توجد عروض بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Auction Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>حالة المزاد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الحالة</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[auction.status]}`}>
                    {STATUS_LABELS[auction.status]}
                  </span>
                </div>
                {auction.status === 'ACTIVE' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الوقت المتبقي</span>
                    <span className="text-orange-600 font-bold">
                      {getTimeRemaining(auction.endTime)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">وقت الانتهاء</span>
                  <span className="text-sm">{formatDate(auction.endTime)}</span>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>الأسعار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">السعر الابتدائي</span>
                  <span>{auction.startingPrice.toLocaleString('ar-EG')} ر.ي</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">السعر الحالي</span>
                  <span className="text-xl font-bold text-primary">
                    {auction.currentPrice.toLocaleString('ar-EG')} ر.ي
                  </span>
                </div>
                {auction.reservePrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">السعر الأدنى</span>
                    <span className={auction.currentPrice >= auction.reservePrice ? 'text-green-600' : 'text-red-600'}>
                      {auction.reservePrice.toLocaleString('ar-EG')} ر.ي
                      {auction.currentPrice >= auction.reservePrice ? ' ✓' : ' ✗'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الحد الأدنى للزيادة</span>
                  <span>{auction.minIncrement.toLocaleString('ar-EG')} ر.ي</span>
                </div>
              </CardContent>
            </Card>

            {auction.winnerPhone && (
              <Card>
                <CardHeader>
                  <CardTitle>الفائز</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-lg">{auction.winnerPhone}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Extend Time Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>تمديد وقت المزاد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">وقت الانتهاء الجديد</label>
                  <Input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowExtendModal(false)}
                    disabled={actionLoading}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleExtendTime}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'جاري التمديد...' : 'تمديد'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
