'use client';

import { AdminLayout } from '@/components/admin';
import { BannerForm } from '@/components/admin/BannerForm';

export default function NewBannerPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">إضافة بانر جديد</h1>
        <BannerForm />
      </div>
    </AdminLayout>
  );
}
