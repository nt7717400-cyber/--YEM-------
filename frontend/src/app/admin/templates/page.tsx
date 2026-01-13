'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { VDSTemplate, CarTemplate } from '@/types/vds';
import { CAR_TEMPLATE_LABELS } from '@/constants/vds';

const ALL_TEMPLATE_TYPES: CarTemplate[] = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van'];

export default function TemplatesManagementPage() {
  const [templates, setTemplates] = useState<VDSTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<CarTemplate | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: { active?: boolean; type?: string } = {};
      if (typeFilter) {
        filters.type = typeFilter;
      }
      if (statusFilter !== 'all') {
        filters.active = statusFilter === 'active';
      }
      const data = await api.getAllTemplates(filters);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب القوالب');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleToggleActive = async (template: VDSTemplate) => {
    setActionLoading(template.id);
    try {
      const updated = await api.updateTemplate(template.id, { isActive: !template.isActive });
      setTemplates(templates.map(t => t.id === template.id ? { ...t, isActive: updated.isActive } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (template: VDSTemplate) => {
    if (template.isDefault) return;
    setActionLoading(template.id);
    try {
      await api.updateTemplate(template.id, { isDefault: true });
      setTemplates(templates.map(t => ({
        ...t,
        isDefault: t.id === template.id
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    
    setActionLoading(templateId);
    try {
      await api.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة قوالب الفحص</h1>
          <Link href="/admin/templates/new">
            <Button>+ إضافة قالب</Button>
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
              <CardTitle>القوالب ({templates.length})</CardTitle>
              <div className="flex gap-4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as CarTemplate | '')}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1"
                >
                  <option value="">جميع الأنواع</option>
                  {ALL_TEMPLATE_TYPES.map((type) => (
                    <option key={type} value={type}>{CAR_TEMPLATE_LABELS[type].ar}</option>
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
            ) : templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                لا توجد قوالب بعد
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">النوع</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">افتراضي</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{template.nameAr}</div>
                          <div className="text-sm text-gray-500">{template.nameEn}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {CAR_TEMPLATE_LABELS[template.type]?.ar || template.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {template.isDefault ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              افتراضي
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefault(template)}
                              className="text-sm text-blue-600 hover:underline"
                              disabled={actionLoading === template.id}
                            >
                              تعيين كافتراضي
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(template.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/templates/${template.id}/edit`}>
                              <Button variant="outline" size="sm">
                                تعديل
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(template)}
                              disabled={actionLoading === template.id}
                            >
                              {template.isActive ? 'إيقاف' : 'تفعيل'}
                            </Button>
                            {!template.isDefault && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(template.id)}
                                disabled={actionLoading === template.id}
                              >
                                حذف
                              </Button>
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
