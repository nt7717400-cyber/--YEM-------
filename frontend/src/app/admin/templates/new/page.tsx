'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { CarTemplate, CreateTemplateInput } from '@/types/vds';
import { CAR_TEMPLATE_LABELS, ALL_VIEW_ANGLES, VIEW_ANGLE_LABELS } from '@/constants/vds';

const ALL_TEMPLATE_TYPES: CarTemplate[] = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van'];

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewAngle, setPreviewAngle] = useState<'front' | 'rear' | 'left_side' | 'right_side'>('front');
  
  const [formData, setFormData] = useState<CreateTemplateInput>({
    nameAr: '',
    nameEn: '',
    type: 'sedan',
    isActive: true,
    isDefault: false,
    svgFront: '',
    svgRear: '',
    svgLeftSide: '',
    svgRightSide: '',
    svgTop: '',
  });

  const handleFileUpload = async (angle: string, file: File) => {
    const text = await file.text();
    const fieldMap: Record<string, keyof CreateTemplateInput> = {
      front: 'svgFront',
      rear: 'svgRear',
      left_side: 'svgLeftSide',
      right_side: 'svgRightSide',
      top: 'svgTop',
    };
    const field = fieldMap[angle];
    if (field) {
      setFormData(prev => ({ ...prev, [field]: text }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.createTemplate(formData);
      router.push('/admin/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إنشاء القالب');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentSvg = () => {
    const svgMap: Record<string, string> = {
      front: formData.svgFront,
      rear: formData.svgRear,
      left_side: formData.svgLeftSide,
      right_side: formData.svgRightSide,
    };
    return svgMap[previewAngle] || '';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إضافة قالب جديد</h1>
          <Button variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="mr-2 underline">
              إغلاق
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات القالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم بالعربية *</label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: سيدان"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية *</label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="Example: Sedan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع القالب *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CarTemplate }))}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2"
                    required
                  >
                    {ALL_TEMPLATE_TYPES.map((type) => (
                      <option key={type} value={type}>{CAR_TEMPLATE_LABELS[type].ar}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">نشط</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">افتراضي</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ملفات SVG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['front', 'rear', 'left_side', 'right_side'] as const).map((angle) => {
                  const fieldMap: Record<string, keyof CreateTemplateInput> = {
                    front: 'svgFront',
                    rear: 'svgRear',
                    left_side: 'svgLeftSide',
                    right_side: 'svgRightSide',
                  };
                  const field = fieldMap[angle];
                  const hasContent = !!formData[field];
                  
                  return (
                    <div key={angle} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">
                          {VIEW_ANGLE_LABELS[angle].ar} *
                        </label>
                        {hasContent && (
                          <span className="text-xs text-green-600">✓ تم الرفع</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(angle, file);
                        }}
                        className="w-full text-sm"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    {VIEW_ANGLE_LABELS.top.ar} (اختياري)
                  </label>
                  {formData.svgTop && (
                    <span className="text-xs text-green-600">✓ تم الرفع</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('top', file);
                  }}
                  className="w-full text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {(formData.svgFront || formData.svgRear || formData.svgLeftSide || formData.svgRightSide) && (
            <Card>
              <CardHeader>
                <CardTitle>معاينة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {ALL_VIEW_ANGLES.filter(a => a !== 'top').map((angle) => (
                    <Button
                      key={angle}
                      type="button"
                      variant={previewAngle === angle ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewAngle(angle as typeof previewAngle)}
                    >
                      {VIEW_ANGLE_LABELS[angle].ar}
                    </Button>
                  ))}
                </div>
                <div 
                  className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: getCurrentSvg() || '<p class="text-gray-400">لم يتم رفع ملف SVG لهذه الزاوية</p>' }}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : 'حفظ القالب'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
