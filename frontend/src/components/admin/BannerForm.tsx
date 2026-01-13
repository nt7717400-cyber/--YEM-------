'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api, getImageUrl } from '@/lib/api';
import { Banner, BannerPosition, LinkTarget, CreateBannerInput, UpdateBannerInput } from '@/types/banner';

interface BannerFormProps {
  banner?: Banner;
  isEdit?: boolean;
}

const POSITION_LABELS: Record<BannerPosition, string> = {
  hero_top: 'أعلى الهيرو',
  hero_bottom: 'أسفل الهيرو',
  sidebar: 'الشريط الجانبي',
  cars_between: 'بين السيارات',
  car_detail: 'تفاصيل السيارة',
  footer_above: 'أعلى الفوتر',
  popup: 'نافذة منبثقة',
};

const ALL_POSITIONS: BannerPosition[] = [
  'hero_top',
  'hero_bottom',
  'sidebar',
  'cars_between',
  'car_detail',
  'footer_above',
  'popup',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function BannerForm({ banner, isEdit = false }: BannerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState(banner?.title || '');
  const [position, setPosition] = useState<BannerPosition>(banner?.position || 'hero_top');
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || '');
  const [linkTarget, setLinkTarget] = useState<LinkTarget>(banner?.linkTarget || '_blank');
  const [displayOrder, setDisplayOrder] = useState(banner?.displayOrder?.toString() || '0');
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [startDate, setStartDate] = useState(banner?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(banner?.endDate?.split('T')[0] || '');

  // Image state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl ? getImageUrl(banner.imageUrl) : null);
  const [imageMobile, setImageMobile] = useState<File | null>(null);
  const [imageMobilePreview, setImageMobilePreview] = useState<string | null>(
    banner?.imageMobileUrl ? getImageUrl(banner.imageMobileUrl) : null
  );

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'صيغة الصورة غير مدعومة. الصيغ المدعومة: JPG, PNG, WebP';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'حجم الصورة يتجاوز 5 ميجابايت';
    }
    return null;
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageSelect = useCallback((file: File, isMobile = false) => {
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const preview = URL.createObjectURL(file);
    if (isMobile) {
      setImageMobile(file);
      setImageMobilePreview(preview);
    } else {
      setImage(file);
      setImagePreview(preview);
    }
    setError('');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, isMobile = false) => {
    e.preventDefault();
    if (isMobile) {
      setIsDraggingMobile(true);
    } else {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, isMobile = false) => {
    e.preventDefault();
    if (isMobile) {
      setIsDraggingMobile(false);
    } else {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, isMobile = false) => {
    e.preventDefault();
    if (isMobile) {
      setIsDraggingMobile(false);
    } else {
      setIsDragging(false);
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file, isMobile);
    }
  }, [handleImageSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file, isMobile);
    }
  };

  const removeImage = (isMobile = false) => {
    if (isMobile) {
      setImageMobile(null);
      setImageMobilePreview(null);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!title.trim()) {
        setError('يرجى إدخال عنوان البانر');
        setIsLoading(false);
        return;
      }

      if (!isEdit && !image) {
        setError('يرجى رفع صورة البانر');
        setIsLoading(false);
        return;
      }

      // Validate URL format
      if (linkUrl && !validateUrl(linkUrl)) {
        setError('صيغة الرابط غير صحيحة');
        setIsLoading(false);
        return;
      }

      // Validate schedule dates
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
        setIsLoading(false);
        return;
      }

      if (isEdit && banner) {
        const updateData: UpdateBannerInput = {
          title: title.trim(),
          position,
          linkUrl: linkUrl.trim() || undefined,
          linkTarget,
          displayOrder: parseInt(displayOrder) || 0,
          isActive,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };

        if (image) {
          updateData.image = image;
        }
        if (imageMobile) {
          updateData.imageMobile = imageMobile;
        }

        await api.updateBanner(banner.id, updateData);
      } else {
        if (!image) {
          setError('يرجى رفع صورة البانر');
          setIsLoading(false);
          return;
        }

        const createData: CreateBannerInput = {
          title: title.trim(),
          image,
          position,
          linkUrl: linkUrl.trim() || undefined,
          linkTarget,
          displayOrder: parseInt(displayOrder) || 0,
          isActive,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };

        if (imageMobile) {
          createData.imageMobile = imageMobile;
        }

        await api.createBanner(createData);
      }

      router.push('/admin/banners');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حفظ البانر');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان البانر *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: عرض خاص على السيارات الجديدة"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">موقع الظهور *</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as BannerPosition)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1"
                required
              >
                {ALL_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">رابط البانر</label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">فتح الرابط في</label>
              <select
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value as LinkTarget)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1"
              >
                <option value="_blank">نافذة جديدة</option>
                <option value="_self">نفس النافذة</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ترتيب العرض</label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
              />
              <p className="text-xs text-gray-500">الأرقام الأصغر تظهر أولاً</p>
            </div>
            <div className="space-y-2 flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">البانر نشط</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>الجدولة الزمنية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ البداية</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-xs text-gray-500">اتركه فارغاً للبدء فوراً</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ النهاية</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-gray-500">اتركه فارغاً للعرض بدون حد زمني</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Image */}
      <Card>
        <CardHeader>
          <CardTitle>صورة البانر الرئيسية *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview && (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="معاينة الصورة"
                width={400}
                height={200}
                className="max-w-full h-auto rounded-lg border"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(false)}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => handleDragOver(e, false)}
            onDragLeave={(e) => handleDragLeave(e, false)}
            onDrop={(e) => handleDrop(e, false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileInputChange(e, false)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-gray-600">
                اسحب الصورة هنا أو{' '}
                <span className="text-primary underline">اختر من جهازك</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                الصيغ المدعومة: JPG, PNG, WebP (الحد الأقصى: 5MB)
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Image */}
      <Card>
        <CardHeader>
          <CardTitle>صورة الموبايل (اختياري)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            يمكنك رفع صورة مختلفة للأجهزة المحمولة. إذا لم ترفع صورة، سيتم استخدام الصورة الرئيسية.
          </p>

          {imageMobilePreview && (
            <div className="relative inline-block">
              <Image
                src={imageMobilePreview}
                alt="معاينة صورة الموبايل"
                width={200}
                height={200}
                className="max-w-full h-auto rounded-lg border"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(true)}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => handleDragOver(e, true)}
            onDragLeave={(e) => handleDragLeave(e, true)}
            onDrop={(e) => handleDrop(e, true)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDraggingMobile ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileInputChange(e, true)}
              className="hidden"
              id="image-mobile-upload"
            />
            <label htmlFor="image-mobile-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-gray-600">
                اسحب صورة الموبايل هنا أو{' '}
                <span className="text-primary underline">اختر من جهازك</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                الصيغ المدعومة: JPG, PNG, WebP (الحد الأقصى: 5MB)
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'جاري الحفظ...' : isEdit ? 'تحديث البانر' : 'إضافة البانر'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/banners')}
          disabled={isLoading}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
