'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { CarTemplate, VDSTemplateDetail, VDSPartKey, VDSPartMapping, UpdateTemplateInput, ViewAngle } from '@/types/vds';
import { CAR_TEMPLATE_LABELS, ALL_VIEW_ANGLES, VIEW_ANGLE_LABELS } from '@/constants/vds';

const ALL_TEMPLATE_TYPES: CarTemplate[] = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van'];

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = Number(params.id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewAngle, setPreviewAngle] = useState<'front' | 'rear' | 'left_side' | 'right_side'>('front');
  const [partKeys, setPartKeys] = useState<VDSPartKey[]>([]);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateTemplateInput>({
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
    partMappings: [],
  });

  const fetchTemplate = useCallback(async () => {
    try {
      setIsLoading(true);
      const [template, keys] = await Promise.all([
        api.getTemplateById(templateId),
        api.getAllPartKeys({ active: true }) as Promise<VDSPartKey[]>,
      ]);
      
      if (!template) {
        setError('القالب غير موجود');
        return;
      }

      setFormData({
        nameAr: template.nameAr,
        nameEn: template.nameEn,
        type: template.type,
        isActive: template.isActive,
        isDefault: template.isDefault,
        svgFront: template.svgFront,
        svgRear: template.svgRear,
        svgLeftSide: template.svgLeftSide,
        svgRightSide: template.svgRightSide,
        svgTop: template.svgTop,
        partMappings: template.partMappings.map(m => ({
          partKey: m.partKey,
          svgElementId: m.svgElementId,
          viewAngles: m.viewAngles,
          isVisible: m.isVisible,
        })),
      });
      setPartKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب بيانات القالب');
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleFileUpload = async (angle: string, file: File) => {
    const text = await file.text();
    const fieldMap: Record<string, keyof UpdateTemplateInput> = {
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

  const handlePartMappingChange = (partKey: string, field: keyof VDSPartMapping, value: unknown) => {
    setFormData(prev => {
      const mappings = [...(prev.partMappings || [])];
      const index = mappings.findIndex(m => m.partKey === partKey);
      
      if (index >= 0) {
        mappings[index] = { ...mappings[index], [field]: value };
      } else {
        mappings.push({
          partKey,
          svgElementId: field === 'svgElementId' ? (value as string) : partKey,
          viewAngles: field === 'viewAngles' ? (value as ViewAngle[]) : [],
          isVisible: field === 'isVisible' ? (value as boolean) : true,
        });
      }
      
      return { ...prev, partMappings: mappings };
    });
  };

  const getPartMapping = (partKey: string): Partial<VDSPartMapping> => {
    return formData.partMappings?.find(m => m.partKey === partKey) || {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await api.updateTemplate(templateId, formData);
      router.push('/admin/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث القالب');
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentSvg = () => {
    const svgMap: Record<string, string | undefined> = {
      front: formData.svgFront,
      rear: formData.svgRear,
      left_side: formData.svgLeftSide,
      right_side: formData.svgRightSide,
    };
    return svgMap[previewAngle] || '';
  };

  // Group part keys by category
  const groupedPartKeys = partKeys.reduce((acc, pk) => {
    if (!acc[pk.category]) acc[pk.category] = [];
    acc[pk.category].push(pk);
    return acc;
  }, {} as Record<string, VDSPartKey[]>);

  const categoryLabels: Record<string, string> = {
    front: 'الأمام',
    rear: 'الخلف',
    left: 'الجانب الأيسر',
    right: 'الجانب الأيمن',
    top: 'الأعلى',
    wheels: 'العجلات',
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">تعديل القالب</h1>
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
                  const fieldMap: Record<string, keyof UpdateTemplateInput> = {
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
                          {VIEW_ANGLE_LABELS[angle].ar}
                        </label>
                        {hasContent && (
                          <span className="text-xs text-green-600">✓ موجود</span>
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
                    <span className="text-xs text-green-600">✓ موجود</span>
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

          <Card>
            <CardHeader>
              <CardTitle>معاينة القالب</CardTitle>
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
                className="border rounded-lg p-4 bg-gray-50 min-h-[300px] flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-[300px]"
                dangerouslySetInnerHTML={{ __html: getCurrentSvg() || '<p class="text-gray-400">لم يتم رفع ملف SVG لهذه الزاوية</p>' }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ربط الأجزاء بعناصر SVG</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                حدد معرف عنصر SVG لكل جزء من أجزاء السيارة، والزوايا التي يظهر فيها الجزء.
              </p>
              
              <div className="space-y-6">
                {Object.entries(groupedPartKeys).map(([category, parts]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-3 text-gray-700">{categoryLabels[category] || category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {parts.map((pk) => {
                        const mapping = getPartMapping(pk.partKey);
                        const isExpanded = selectedPart === pk.partKey;
                        
                        return (
                          <div 
                            key={pk.partKey} 
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${isExpanded ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
                            onClick={() => setSelectedPart(isExpanded ? null : pk.partKey)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{pk.labelAr}</span>
                              <label className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={mapping.isVisible !== false}
                                  onChange={(e) => handlePartMappingChange(pk.partKey, 'isVisible', e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-xs text-gray-500">مرئي</span>
                              </label>
                            </div>
                            
                            {isExpanded && (
                              <div className="mt-3 space-y-3" onClick={e => e.stopPropagation()}>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">معرف عنصر SVG</label>
                                  <Input
                                    value={mapping.svgElementId || pk.partKey}
                                    onChange={(e) => handlePartMappingChange(pk.partKey, 'svgElementId', e.target.value)}
                                    placeholder={pk.partKey}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">الزوايا</label>
                                  <div className="flex flex-wrap gap-2">
                                    {ALL_VIEW_ANGLES.map((angle) => (
                                      <label key={angle} className="flex items-center gap-1">
                                        <input
                                          type="checkbox"
                                          checked={mapping.viewAngles?.includes(angle) || false}
                                          onChange={(e) => {
                                            const current = mapping.viewAngles || [];
                                            const updated = e.target.checked
                                              ? [...current, angle]
                                              : current.filter(a => a !== angle);
                                            handlePartMappingChange(pk.partKey, 'viewAngles', updated);
                                          }}
                                          className="rounded"
                                        />
                                        <span className="text-xs">{VIEW_ANGLE_LABELS[angle].ar}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
