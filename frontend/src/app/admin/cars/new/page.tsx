'use client';

import { AdminLayout } from '@/components/admin';
import { CarForm } from '@/components/admin/CarForm';

export default function NewCarPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">إضافة سيارة جديدة</h1>
        <CarForm />
      </div>
    </AdminLayout>
  );
}
