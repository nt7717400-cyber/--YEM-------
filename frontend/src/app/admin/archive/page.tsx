'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, getImageUrl } from '@/lib/api';
import { Car } from '@/types';

export default function ArchivePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchArchivedCars = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getArchivedCars();
      setCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب السيارات المؤرشفة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedCars();
  }, [fetchArchivedCars]);

  const handleRestore = async (carId: number) => {
    if (!confirm('هل أنت متأكد من استعادة هذه السيارة؟')) return;
    
    setActionLoading(carId);
    try {
      await api.restoreCar(carId);
      setCars(cars.filter(car => car.id !== carId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في استعادة السيارة');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePermanently = async (carId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه السيارة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setActionLoading(carId);
    try {
      await api.deleteCar(carId);
      setCars(cars.filter(car => car.id !== carId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف السيارة');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">أرشيف السيارات المباعة</h1>

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
            <div className="flex justify-between items-center">
              <CardTitle>السيارات المباعة ({filteredCars.length})</CardTitle>
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredCars.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد سيارات مؤرشفة'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الصورة</th>
                      <th className="text-right py-3 px-4">السيارة</th>
                      <th className="text-right py-3 px-4">الماركة</th>
                      <th className="text-right py-3 px-4">السنة</th>
                      <th className="text-right py-3 px-4">السعر</th>
                      <th className="text-right py-3 px-4">المشاهدات</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.map((car) => (
                      <tr key={car.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {car.images && car.images[0] ? (
                            <Image
                              src={getImageUrl(car.images[0].url)}
                              alt={car.name}
                              width={64}
                              height={48}
                              className="w-16 h-12 object-cover rounded opacity-75"
                              unoptimized
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              🚗
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{car.name}</td>
                        <td className="py-3 px-4">{car.brand}</td>
                        <td className="py-3 px-4">{car.year}</td>
                        <td className="py-3 px-4">
                          {car.price.toLocaleString('ar-EG')} ر.ي
                        </td>
                        <td className="py-3 px-4">
                          {car.viewCount.toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(car.id)}
                              disabled={actionLoading === car.id}
                            >
                              استعادة
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePermanently(car.id)}
                              disabled={actionLoading === car.id}
                            >
                              حذف نهائي
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
