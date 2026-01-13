'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { BannerForm } from '@/components/admin/BannerForm';
import { api } from '@/lib/api';
import { Banner } from '@/types/banner';

export default function EditBannerPage() {
  const params = useParams();
  const bannerId = Number(params.id);
  
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoading(true);
        const data = await api.getBannerById(bannerId);
        if (data) {
          setBanner(data);
        } else {
          setError('البانر غير موجود');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في جلب البانر');
      } finally {
        setIsLoading(false);
      }
    };

    if (bannerId) {
      fetchBanner();
    }
  }, [bannerId]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">تعديل البانر</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">جاري تحميل البانر...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : banner ? (
          <BannerForm banner={banner} isEdit />
        ) : null}
      </div>
    </AdminLayout>
  );
}
