'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api, getImageUrl } from '@/lib/api';
import { Car, CarImage, CreateCarInput, UpdateCarInput } from '@/types';
import { PriceType } from '@/types/auction';
import { InspectionSection } from '@/components/admin/inspection';
import { ALL_BODY_PART_IDS } from '@/constants/inspection';
import type { InspectionData, BodyPartId, PartStatus } from '@/types/inspection';

interface CarFormProps {
  car?: Car;
  isEdit?: boolean;
}

export function CarForm({ car, isEdit = false }: CarFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState(car?.name || '');
  const [brand, setBrand] = useState(car?.brand || '');
  const [model, setModel] = useState(car?.model || '');
  const [year, setYear] = useState(car?.year?.toString() || new Date().getFullYear().toString());
  const [price, setPrice] = useState(car?.price?.toString() || '');
  const [condition, setCondition] = useState<'NEW' | 'USED'>(car?.condition || 'NEW');
  const [origin, setOrigin] = useState(car?.origin || '');
  const [kilometers, setKilometers] = useState(car?.kilometers?.toString() || '');
  const [description, setDescription] = useState(car?.description || '');
  const [specifications, setSpecifications] = useState(car?.specifications || '');
  const [isFeatured, setIsFeatured] = useState(car?.isFeatured || false);
  
  // Price type and auction state
  const [priceType, setPriceType] = useState<PriceType>(car?.priceType || 'FIXED');
  const [startingPrice, setStartingPrice] = useState(car?.auction?.startingPrice?.toString() || '');
  const [reservePrice, setReservePrice] = useState(car?.auction?.reservePrice?.toString() || '');
  const [minIncrement, setMinIncrement] = useState(car?.auction?.minIncrement?.toString() || '100');
  const [endTime, setEndTime] = useState(() => {
    if (car?.auction?.endTime) {
      // Format for datetime-local input
      const date = new Date(car.auction.endTime);
      return date.toISOString().slice(0, 16);
    }
    // Default to 7 days from now
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 7);
    return defaultEnd.toISOString().slice(0, 16);
  });
  
  // Images state
  const [images, setImages] = useState<CarImage[]>(car?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Video state
  const [videoType, setVideoType] = useState<'YOUTUBE' | 'UPLOAD' | 'NONE'>(
    car?.video?.type || 'NONE'
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    car?.video?.type === 'YOUTUBE' ? car.video.url : ''
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Inspection state - for used cars
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(() => {
    // Initialize from existing car inspection data if available
    if (car?.inspection) {
      // Convert bodyParts array to Record if needed
      const bodyPartsRecord: Record<BodyPartId, PartStatus> = {} as Record<BodyPartId, PartStatus>;
      ALL_BODY_PART_IDS.forEach((partId) => {
        bodyPartsRecord[partId] = 'original';
      });
      
      if (car.inspection.bodyParts) {
        if (Array.isArray(car.inspection.bodyParts)) {
          car.inspection.bodyParts.forEach((part: { partId: BodyPartId; status: PartStatus }) => {
            bodyPartsRecord[part.partId] = part.status;
          });
        } else {
          Object.assign(bodyPartsRecord, car.inspection.bodyParts);
        }
      }
      
      // Load mechanical data including tires
      const mechanical = car.inspection.mechanical || {
        engine: 'original',
        transmission: 'original',
        chassis: 'intact',
        technicalNotes: '',
      };
      
      // Ensure tires data is loaded from mechanical
      if (car.inspection.mechanical?.tires) {
        mechanical.tires = car.inspection.mechanical.tires;
      }
      
      console.log('[CarForm] Loading inspection data, tires:', mechanical.tires);
      console.log('[CarForm] Loading inspection data, damageDetails:', car.inspection.damageDetails);
      
      return {
        bodyType: car.inspection.bodyType || 'sedan',
        bodyParts: bodyPartsRecord,
        mechanical,
        // Load existing damage details (photos, notes, etc.)
        damageDetails: car.inspection.damageDetails || undefined,
      };
    }
    return null;
  });

  // Initialize inspection data when condition changes to USED
  useEffect(() => {
    if (condition === 'USED' && !inspectionData) {
      const defaultPartsStatus: Record<BodyPartId, PartStatus> = {} as Record<BodyPartId, PartStatus>;
      ALL_BODY_PART_IDS.forEach((partId) => {
        defaultPartsStatus[partId] = 'original';
      });
      
      setInspectionData({
        bodyType: 'sedan',
        bodyParts: defaultPartsStatus,
        mechanical: {
          engine: 'original',
          transmission: 'original',
          chassis: 'intact',
          technicalNotes: '',
          tires: {
            front_left: 'new',
            front_right: 'new',
            rear_left: 'new',
            rear_right: 'new',
          },
        },
      });
    }
  }, [condition, inspectionData]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    setNewImages(prev => [...prev, ...files]);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    if (!car?.id) return;
    try {
      await api.deleteImage(car.id, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف الصورة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!name.trim() || !brand.trim() || !model.trim()) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        setIsLoading(false);
        return;
      }

      // Validate price for FIXED type
      if (priceType === 'FIXED' && !price.trim()) {
        setError('يرجى إدخال السعر');
        setIsLoading(false);
        return;
      }

      // Validate body type for used cars
      if (condition === 'USED' && (!inspectionData || !inspectionData.bodyType)) {
        setError('يرجى اختيار نوع الهيكل للسيارة المستعملة');
        setIsLoading(false);
        return;
      }

      // Validate auction fields
      if (priceType === 'AUCTION') {
        if (!startingPrice.trim()) {
          setError('يرجى إدخال السعر الابتدائي للمزاد');
          setIsLoading(false);
          return;
        }
        if (!endTime) {
          setError('يرجى تحديد وقت انتهاء المزاد');
          setIsLoading(false);
          return;
        }
        const endDate = new Date(endTime);
        if (endDate <= new Date()) {
          setError('يجب أن يكون وقت انتهاء المزاد في المستقبل');
          setIsLoading(false);
          return;
        }
        if (reservePrice && parseFloat(reservePrice) < parseFloat(startingPrice)) {
          setError('يجب أن يكون السعر الأدنى أكبر من أو يساوي السعر الابتدائي');
          setIsLoading(false);
          return;
        }
      }

      const carData: CreateCarInput | UpdateCarInput = {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year),
        price: priceType === 'AUCTION' ? parseFloat(startingPrice) : parseFloat(price),
        priceType,
        condition,
        origin: origin.trim() || undefined,
        kilometers: condition === 'USED' && kilometers ? parseInt(kilometers) : undefined,
        description: description.trim(),
        specifications: specifications.trim(),
        isFeatured,
        bodyType: condition === 'USED' && inspectionData ? inspectionData.bodyType : undefined,
        // Auction fields
        ...(priceType === 'AUCTION' && {
          startingPrice: parseFloat(startingPrice),
          reservePrice: reservePrice ? parseFloat(reservePrice) : undefined,
          minIncrement: minIncrement ? parseFloat(minIncrement) : 100,
          endTime: new Date(endTime).toISOString(),
        }),
      };

      let savedCar: Car;
      
      if (isEdit && car) {
        savedCar = await api.updateCar(car.id, carData);
      } else {
        savedCar = await api.createCar(carData as CreateCarInput);
      }

      // Upload new images
      if (newImages.length > 0) {
        setUploadingImages(true);
        await api.uploadImages(savedCar.id, newImages);
        setUploadingImages(false);
      }

      // Handle video
      if (videoType === 'YOUTUBE' && youtubeUrl.trim()) {
        // Delete existing video if any
        if (car?.video) {
          await api.deleteVideo(car.video.id);
        }
        await api.addYoutubeVideo(savedCar.id, youtubeUrl.trim());
      } else if (videoType === 'UPLOAD' && videoFile) {
        // Delete existing video if any
        if (car?.video) {
          await api.deleteVideo(car.video.id);
        }
        await api.uploadVideo(savedCar.id, videoFile);
      } else if (videoType === 'NONE' && car?.video) {
        await api.deleteVideo(car.video.id);
      }

      // Save inspection data for used cars
      if (condition === 'USED' && inspectionData) {
        console.log('[CarForm] Saving inspection data...');
        console.log('[CarForm] inspectionData.damageDetails:', inspectionData.damageDetails);
        console.log('[CarForm] inspectionData.mechanical.tires:', inspectionData.mechanical.tires);
        
        // Convert bodyParts Record to array format for API
        const bodyPartsArray = Object.entries(inspectionData.bodyParts).map(([partId, status]) => ({
          partId: partId as BodyPartId,
          status,
        }));

        const inspectionPayload = {
          bodyType: inspectionData.bodyType,
          bodyParts: bodyPartsArray,
          engine: inspectionData.mechanical.engine,
          transmission: inspectionData.mechanical.transmission,
          chassis: inspectionData.mechanical.chassis,
          tires: inspectionData.mechanical.tires,
          technicalNotes: inspectionData.mechanical.technicalNotes,
          damageDetails: inspectionData.damageDetails,
        };

        console.log('[CarForm] inspectionPayload:', inspectionPayload);
        await api.saveInspection(savedCar.id, inspectionPayload);
      }

      router.push('/admin/cars');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حفظ السيارة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">اسم السيارة *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: تويوتا كامري 2024"
                required
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">الماركة *</label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="مثال: تويوتا"
                required
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">الموديل *</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="مثال: كامري"
                required
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">سنة الصنع *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                <option value="">-- اختر السنة --</option>
                {Array.from({ length: (new Date().getFullYear() + 2) - 1990 + 1 }, (_, i) => (new Date().getFullYear() + 2) - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">السعر (ر.ي) *</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 5000000"
                min="0"
                required={priceType === 'FIXED'}
                disabled={priceType === 'AUCTION'}
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">نوع التسعير *</label>
              <div className="flex gap-4 h-10 sm:h-9 items-center">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="priceType"
                    checked={priceType === 'FIXED'}
                    onChange={() => setPriceType('FIXED')}
                    className="w-4 h-4"
                  />
                  <span>سعر ثابت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="priceType"
                    checked={priceType === 'AUCTION'}
                    onChange={() => setPriceType('AUCTION')}
                    className="w-4 h-4"
                  />
                  <span>مزاد</span>
                </label>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">حالة السيارة *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'NEW' | 'USED')}
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="NEW">جديدة</option>
                <option value="USED">مستعملة</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">وارد السيارة</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">-- اختر الوارد --</option>
                <option value="خليجي">وارد خليجي</option>
                <option value="أمريكي">وارد أمريكي</option>
                <option value="كوري">وارد كوري</option>
                <option value="ياباني">وارد ياباني</option>
                <option value="أوروبي">وارد أوروبي</option>
                <option value="صيني">وارد صيني</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            {condition === 'USED' && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">الكيلومترات</label>
                <Input
                  type="number"
                  value={kilometers}
                  onChange={(e) => setKilometers(e.target.value)}
                  placeholder="مثال: 50000"
                  min="0"
                  className="h-10 sm:h-9 text-sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف تفصيلي للسيارة..."
              className="w-full min-h-[80px] sm:min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">المواصفات</label>
            <textarea
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="المواصفات الفنية..."
              className="w-full min-h-[80px] sm:min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded w-4 h-4"
            />
            <label htmlFor="isFeatured" className="text-xs sm:text-sm">
              سيارة مميزة (تظهر في الصفحة الرئيسية)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Auction Fields - Only when price type is AUCTION */}
      {priceType === 'AUCTION' && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">إعدادات المزاد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">السعر الابتدائي (ر.ي) *</label>
                <Input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="مثال: 1000000"
                  min="0"
                  required
                  className="h-10 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">السعر الأدنى (اختياري)</label>
                <Input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  placeholder="السعر الأدنى المقبول"
                  min="0"
                  className="h-10 sm:h-9 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-gray-500">
                  إذا لم يصل المزاد لهذا السعر، لن يتم البيع
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">الحد الأدنى للزيادة (ر.ي)</label>
                <Input
                  type="number"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="h-10 sm:h-9 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-gray-500">
                  أقل مبلغ يمكن زيادته على السعر الحالي
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">وقت انتهاء المزاد *</label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="h-10 sm:h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">الصور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          {/* Existing Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={getImageUrl(image.url)}
                    alt={`صورة ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    unoptimized
                  />
                  {index === 0 && (
                    <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      الرئيسية
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-xs sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
              {newImages.map((file, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`صورة جديدة ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-dashed border-primary"
                    unoptimized
                  />
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    جديدة
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-xs sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="text-3xl sm:text-4xl mb-2">📷</div>
              <p className="text-sm sm:text-base text-gray-600">
                اسحب الصور هنا أو{' '}
                <span className="text-primary underline">اختر من جهازك</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                يمكنك رفع عدة صور (الصورة الأولى ستكون الرئيسية)
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Video */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">الفيديو</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="videoType"
                checked={videoType === 'NONE'}
                onChange={() => setVideoType('NONE')}
                className="w-4 h-4"
              />
              <span>بدون فيديو</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="videoType"
                checked={videoType === 'YOUTUBE'}
                onChange={() => setVideoType('YOUTUBE')}
                className="w-4 h-4"
              />
              <span>رابط يوتيوب</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="videoType"
                checked={videoType === 'UPLOAD'}
                onChange={() => setVideoType('UPLOAD')}
                className="w-4 h-4"
              />
              <span>رفع فيديو</span>
            </label>
          </div>

          {videoType === 'YOUTUBE' && (
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-10 sm:h-9 text-sm"
            />
          )}

          {videoType === 'UPLOAD' && (
            <div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {videoFile && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  الملف المحدد: {videoFile.name}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Section - Only for USED cars */}
      {condition === 'USED' && (
        <div data-testid="inspection-section-wrapper">
          <InspectionSection
            value={inspectionData}
            onChange={setInspectionData}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-background py-3 sm:py-4 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0 sm:static">
        <Button 
          type="submit" 
          disabled={isLoading || uploadingImages}
          className="h-11 sm:h-10 text-sm order-1 sm:order-none"
        >
          {isLoading ? 'جاري الحفظ...' : uploadingImages ? 'جاري رفع الصور...' : isEdit ? 'تحديث السيارة' : 'إضافة السيارة'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/cars')}
          disabled={isLoading}
          className="h-11 sm:h-10 text-sm order-2 sm:order-none"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
