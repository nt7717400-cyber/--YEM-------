'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { CarForm } from '@/components/admin/CarForm';
import { api } from '@/lib/api';
import { Car } from '@/types';

export default function EditCarClient() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carId = parseInt(params.id as string);
        const data = await api.getCarById(carId);
        if (!data) {
          setError('السيارة غير موجودة');
          return;
        }
        setCar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في جلب بيانات السيارة');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [params.id]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !car) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'السيارة غير موجودة'}</p>
          <button
            onClick={() => router.push('/admin/cars')}
            className="text-primary underline"
          >
            العودة لقائمة السيارات
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">تعديل السيارة: {car.name}</h1>
        <CarForm car={car} isEdit />
      </div>
    </AdminLayout>
  );
}
