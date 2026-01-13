
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { VDSColorMapping, UpdateColorMappingInput, PartCondition } from '@/types/vds';

interface ColorMappingFormData {
  conditionKey: PartCondition;
  colorHex: string;
  labelAr: string;
  labelEn: string;
  sortOrder: number;
}

export default function ColorMappingsManagementPage() {
  const [colorMappings, setColorMappings] = useState<VDSColorMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Editing state
  const [editingCondition, setEditingCondition] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<ColorMappingFormData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load color mappings
  const loadColorMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getAllColorMappings();
      setColorMappings(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColorMappings();
  }, [loadColorMappings]);

  // Start editing a color mapping
  const handleEdit = (cm: VDSColorMapping) => {
    setEditingCondition(cm.conditionKey);
    setEditFormData({
      conditionKey: cm.conditionKey,
      colorHex: cm.colorHex,
      labelAr: cm.labelAr,
      labelEn: cm.labelEn,
      sortOrder: cm.sortOrder,
    });
    setFormErrors({});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCondition(null);
    setEditFormData(null);
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!editFormData) return false;
    
    const errors: Record<string, string> = {};
    
    if (!editFormData.colorHex.trim()) {
      errors.colorHex = 'كود اللون مطلوب';
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(editFormData.colorHex)) {
      errors.colorHex = 'كود اللون غير صالح (يجب أن يكون بصيغة #RRGGBB)';
    }
    
    if (!editFormData.labelAr.trim()) {
      errors.labelAr = 'الاسم بالعربية مطلوب';
    }
    
    if (!editFormData.labelEn.trim()) {
      errors.labelEn = 'الاسم بالإنجليزية مطلوب';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save single color mapping
  const handleSaveEdit = async () => {
    if (!editFormData || !editingCondition || !validateForm()) return;
    
    try {
      setIsSaving(true);
      await api.updateSingleColorMapping(editingCondition, {
        colorHex: editFormData.colorHex,
        labelAr: editFormData.labelAr,
        labelEn: editFormData.labelEn,
        sortOrder: editFormData.sortOrder,
      });
      
      setEditingCondition(null);
      setEditFormData(null);
      loadColorMappings();
    } catch (err) {
      setFormErrors({
        submit: err instanceof Error ? err.message : 'حدث خطأ في حفظ البيانات',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update color in list (for preview)
  const handleColorChange = (conditionKey: string, newColor: string) => {
    setColorMappings((prev) =>
      prev.map((cm) =>
        cm.conditionKey === conditionKey ? { ...cm, colorHex: newColor } : cm
      )
    );
    setHasChanges(true);
  };

  // Save all changes
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const updateData: UpdateColorMappingInput[] = colorMappings.map((cm) => ({
        conditionKey: cm.conditionKey,
        colorHex: cm.colorHex,
        labelAr: cm.labelAr,
        labelEn: cm.labelEn,
        sortOrder: cm.sortOrder,
      }));
      
      await api.updateColorMappings(updateData);
      setHasChanges(false);
      loadColorMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الألوان إلى القيم الافتراضية؟')) return;
    
    try {
      setIsSaving(true);
      await api.resetColorMappings();
      setHasChanges(false);
      loadColorMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إعادة التعيين');
    } finally {
      setIsSaving(false);
    }
  };

  // Get condition icon
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'good':
        return '✓';
      case 'scratch':
        return '~';
      case 'bodywork':
        return '⚒';
      case 'broken':
        return '✗';
      case 'painted':
        return '🎨';
      case 'replaced':
        return '↻';
      case 'not_inspected':
        return '?';
      default:
        return '•';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة ألوان الحالات</h1>
            <p className="text-gray-500 mt-1">خريطة الألوان الموحدة لحالات أجزاء السيارة</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              إعادة تعيين
            </Button>
            {hasChanges && (
              <Button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Color Preview */}
            <Card>
              <CardHeader>
                <CardTitle>معاينة الألوان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {colorMappings.map((cm) => (
                    <div
                      key={cm.conditionKey}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                      style={{ borderColor: cm.colorHex }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: cm.colorHex }}
                      >
                        {getConditionIcon(cm.conditionKey)}
                      </div>
                      <span className="text-sm font-medium">{cm.labelAr}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Mappings List */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة الألوان</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {colorMappings.map((cm) => (
                    <div key={cm.conditionKey}>
                      {editingCondition === cm.conditionKey && editFormData ? (
                        /* Edit Mode */
                        <div className="p-4 bg-blue-50">
                          {formErrors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                              {formErrors.submit}
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Color Picker */}
                            <div>
                              <label className="block text-sm font-medium mb-1">اللون</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={editFormData.colorHex}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, colorHex: e.target.value })
                                  }
                                  className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                  value={editFormData.colorHex}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, colorHex: e.target.value })
                                  }
                                  placeholder="#RRGGBB"
                                  className={`flex-1 font-mono ${formErrors.colorHex ? 'border-red-500' : ''}`}
                                  dir="ltr"
                                />
                              </div>
                              {formErrors.colorHex && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.colorHex}</p>
                              )}
                            </div>
                            
                            {/* Arabic Label */}
                            <div>
                              <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
                              <Input
                                value={editFormData.labelAr}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, labelAr: e.target.value })
                                }
                                className={formErrors.labelAr ? 'border-red-500' : ''}
                              />
                              {formErrors.labelAr && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.labelAr}</p>
                              )}
                            </div>
                            
                            {/* English Label */}
                            <div>
                              <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
                              <Input
                                value={editFormData.labelEn}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, labelEn: e.target.value })
                                }
                                className={formErrors.labelEn ? 'border-red-500' : ''}
                                dir="ltr"
                              />
                              {formErrors.labelEn && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.labelEn}</p>
                              )}
                            </div>
                            
                            {/* Sort Order */}
                            <div>
                              <label className="block text-sm font-medium mb-1">الترتيب</label>
                              <Input
                                type="number"
                                value={editFormData.sortOrder}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    sortOrder: parseInt(e.target.value) || 0,
                                  })
                                }
                                min={0}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                            >
                              إلغاء
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            {/* Color Swatch */}
                            <div className="relative">
                              <div
                                className="w-12 h-12 rounded-lg shadow-inner flex items-center justify-center text-white text-xl font-bold"
                                style={{ backgroundColor: cm.colorHex }}
                              >
                                {getConditionIcon(cm.conditionKey)}
                              </div>
                              {/* Quick Color Picker */}
                              <input
                                type="color"
                                value={cm.colorHex}
                                onChange={(e) => handleColorChange(cm.conditionKey, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="تغيير اللون"
                              />
                            </div>
                            
                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{cm.labelAr}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600">{cm.labelEn}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                                  {cm.conditionKey}
                                </code>
                                <span
                                  className="font-mono text-xs px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: cm.colorHex + '20',
                                    color: cm.colorHex,
                                  }}
                                >
                                  {cm.colorHex}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 ml-4">
                              ترتيب: {cm.sortOrder}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(cm)}
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• يتم استخدام هذه الألوان في عرض حالة أجزاء السيارة على الرسم التفاعلي</p>
                  <p>• يمكنك تغيير اللون مباشرة بالنقر على مربع اللون</p>
                  <p>• التغييرات تظهر فوراً في المعاينة، اضغط &quot;حفظ التغييرات&quot; لحفظها</p>
                  <p>• استخدم &quot;إعادة تعيين&quot; للعودة إلى الألوان الافتراضية</p>
                </div>
              </CardContent>
            </Card>

            {/* Wheel Colors Info */}
            <Card>
              <CardHeader>
                <CardTitle>ألوان العجلات (ثابتة)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  العجلات تستخدم ألوان فريدة ومختلفة عن ألوان الهيكل لتمييزها بسهولة:
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { condition: 'good', color: '#10b981', labelAr: 'سليم', labelEn: 'Good' },
                    { condition: 'scratch', color: '#f59e0b', labelAr: 'خدش', labelEn: 'Scratch' },
                    { condition: 'bodywork', color: '#f97316', labelAr: 'سمكرة', labelEn: 'Bodywork' },
                    { condition: 'broken', color: '#dc2626', labelAr: 'كسر', labelEn: 'Broken' },
                    { condition: 'painted', color: '#6366f1', labelAr: 'رش', labelEn: 'Painted' },
                    { condition: 'replaced', color: '#a855f7', labelAr: 'تغيير', labelEn: 'Replaced' },
                    { condition: 'not_inspected', color: '#6b7280', labelAr: 'غير محدد', labelEn: 'Not Inspected' },
                  ].map((item) => (
                    <div
                      key={item.condition}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                      style={{ borderColor: item.color }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: item.color }}
                      >
                        {getConditionIcon(item.condition)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{item.labelAr}</span>
                        <span className="text-gray-400 mx-1">|</span>
                        <span className="text-gray-600">{item.labelEn}</span>
                      </div>
                      <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs mr-2">
                        {item.color}
                      </code>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  * ألوان العجلات ثابتة ولا يمكن تعديلها من هذه الصفحة
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
