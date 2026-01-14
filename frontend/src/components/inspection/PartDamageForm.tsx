'use client';

/**
 * PartDamageForm Component
 * Form for recording damage information for a car part
 * Requirements: 3.1, 3.2, 3.5, 3.6
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PartDamageFormProps, PartCondition, DamageSeverity, PartDamageData, PartKey } from '@/types/vds';
import {
  ALL_PART_CONDITIONS,
  ALL_DAMAGE_SEVERITIES,
  CONDITION_LABELS,
  SEVERITY_LABELS,
  getConditionColor,
  conditionRequiresSeverity,
} from '@/constants/vds';
import type { TireStatus } from '@/types/inspection';
import { ALL_TIRE_STATUSES, TIRE_STATUS_CONFIG, TIRE_STATUS_LABELS_BILINGUAL } from '@/constants/inspection';
import { getImageUrl } from '@/lib/api';

// Tire part keys (matching the PartKey type)
const TIRE_PART_KEYS: string[] = [
  'wheel_front_left',
  'wheel_front_right', 
  'wheel_rear_left',
  'wheel_rear_right',
];

// Check if part is a tire/wheel
function isTirePart(partKey: string): boolean {
  return TIRE_PART_KEYS.includes(partKey) || 
         partKey.includes('wheel') || 
         partKey.includes('tire');
}

// Map tire status to condition for storage
function tireStatusToCondition(status: TireStatus): PartCondition {
  const mapping: Record<TireStatus, PartCondition> = {
    new: 'good',
    used_50: 'scratch', // Using scratch as "50% used"
    damaged: 'broken',
  };
  return mapping[status] || 'not_inspected';
}

// Map condition back to tire status
function conditionToTireStatus(condition: PartCondition): TireStatus {
  const mapping: Record<PartCondition, TireStatus> = {
    good: 'new',
    scratch: 'used_50',
    painted: 'used_50',
    bodywork: 'used_50',
    broken: 'damaged',
    replaced: 'new',
    not_inspected: 'new',
  };
  return mapping[condition] || 'new';
}

/**
 * PartDamageForm - Form for recording part damage
 */
export function PartDamageForm({
  partKey,
  partLabel,
  currentData,
  onSave,
  onCancel,
  onDelete,
  language = 'ar',
}: PartDamageFormProps) {
  // Check if this is a tire part
  const isTire = isTirePart(partKey);
  
  // Form state
  const [condition, setCondition] = React.useState<PartCondition>(
    currentData?.condition || 'not_inspected'
  );
  const [tireStatus, setTireStatus] = React.useState<TireStatus>(
    currentData ? conditionToTireStatus(currentData.condition) : 'new'
  );
  const [severity, setSeverity] = React.useState<DamageSeverity | undefined>(
    currentData?.severity
  );
  const [notes, setNotes] = React.useState(currentData?.notes || '');
  const [photos, setPhotos] = React.useState<string[]>(currentData?.photos || []);
  const [uploading, setUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if severity is required (not for tires)
  const showSeverity = !isTire && conditionRequiresSeverity(condition);

  // Handle condition change
  const handleConditionChange = (value: string) => {
    const newCondition = value as PartCondition;
    setCondition(newCondition);
    
    // Clear severity if not needed
    if (!conditionRequiresSeverity(newCondition)) {
      setSeverity(undefined);
    }
  };

  // Handle tire status change
  const handleTireStatusChange = (value: string) => {
    const newStatus = value as TireStatus;
    setTireStatus(newStatus);
    // Also update condition for storage
    setCondition(tireStatusToCondition(newStatus));
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const newPhotos: string[] = [];
      
      for (const file of Array.from(files)) {
        // Compress and convert to base64
        const compressed = await compressImage(file, 1024, 0.8);
        newPhotos.push(compressed);
      }
      
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    console.log('[PartDamageForm] handleSave called');
    console.log('[PartDamageForm] photos state:', photos);
    console.log('[PartDamageForm] notes state:', notes);
    
    // For tires, use the mapped condition
    const finalCondition = isTire ? tireStatusToCondition(tireStatus) : condition;
    
    const data: PartDamageData = {
      partKey,
      condition: finalCondition,
      severity: showSeverity ? severity : undefined,
      notes: notes.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[PartDamageForm] Saving data:', data);
    onSave(data);
  };

  // Labels based on language
  const labels = {
    title: language === 'ar' ? 'تسجيل حالة الجزء' : 'Record Part Condition',
    tireTitle: language === 'ar' ? 'تسجيل حالة الإطار' : 'Record Tire Condition',
    condition: language === 'ar' ? 'الحالة' : 'Condition',
    tireCondition: language === 'ar' ? 'حالة الإطار' : 'Tire Condition',
    severity: language === 'ar' ? 'الشدة' : 'Severity',
    notes: language === 'ar' ? 'ملاحظات' : 'Notes',
    notesPlaceholder: language === 'ar' ? 'أضف ملاحظات إضافية...' : 'Add additional notes...',
    photos: language === 'ar' ? 'الصور' : 'Photos',
    addPhoto: language === 'ar' ? 'إضافة صورة' : 'Add Photo',
    save: language === 'ar' ? 'حفظ' : 'Save',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    delete: language === 'ar' ? 'حذف' : 'Delete',
    selectCondition: language === 'ar' ? 'اختر الحالة' : 'Select condition',
    selectTireCondition: language === 'ar' ? 'اختر حالة الإطار' : 'Select tire condition',
    selectSeverity: language === 'ar' ? 'اختر الشدة' : 'Select severity',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header - Mobile optimized with drag handle */}
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between">
          {/* Mobile drag handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />
          <div className="pt-2 sm:pt-0">
            <h3 className="font-semibold text-base sm:text-lg">{isTire ? labels.tireTitle : labels.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {partLabel[language]}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-2 -m-2"
            aria-label={labels.cancel}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {/* Tire Status Select (for tire parts) */}
          {isTire ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{labels.tireCondition}</label>
              <Select value={tireStatus} onValueChange={handleTireStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder={labels.selectTireCondition} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_TIRE_STATUSES.map((status) => {
                    const config = TIRE_STATUS_CONFIG[status];
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span>{config.icon}</span>
                          <span>{TIRE_STATUS_LABELS_BILINGUAL[status][language]}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Tire status description */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">
                  {language === 'ar' ? 'دليل الحالات:' : 'Status Guide:'}
                </div>
                <div className="space-y-1">
                  {ALL_TIRE_STATUSES.map((status) => {
                    const config = TIRE_STATUS_CONFIG[status];
                    return (
                      <div key={status} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span>{config.icon}</span>
                        <span className="text-gray-600">
                          {TIRE_STATUS_LABELS_BILINGUAL[status][language]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Condition Select (for non-tire parts) */
            <div className="space-y-2">
              <label className="text-sm font-medium">{labels.condition}</label>
              <Select value={condition} onValueChange={handleConditionChange}>
                <SelectTrigger>
                  <SelectValue placeholder={labels.selectCondition} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PART_CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getConditionColor(cond) }}
                        />
                        <span>{CONDITION_LABELS[cond][language]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Severity Select (conditional, not for tires) */}
          {showSeverity && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{labels.severity}</label>
              <Select
                value={severity || ''}
                onValueChange={(value) => setSeverity(value as DamageSeverity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={labels.selectSeverity} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DAMAGE_SEVERITIES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      {SEVERITY_LABELS[sev][language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{labels.notes}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={labels.notesPlaceholder}
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              rows={3}
            />
          </div>

          {/* Photos Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{labels.photos}</label>
            
            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={photo.startsWith('data:') ? photo : getImageUrl(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {labels.addPhoto}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions - Mobile optimized */}
        <div className="sticky bottom-0 bg-background border-t px-4 py-3 flex flex-col-reverse sm:flex-row gap-2 safe-area-inset-bottom">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
              {labels.cancel}
            </Button>
            <Button type="button" onClick={handleSave} className="flex-1 sm:flex-none">
              {labels.save}
            </Button>
          </div>
          {onDelete && currentData && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full sm:w-auto sm:mr-auto"
            >
              {labels.delete}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compress image to specified max size
 */
async function compressImage(
  file: File,
  maxSizeKB: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if too large
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default PartDamageForm;
