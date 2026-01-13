'use client';

/**
 * InspectionViewer Component - مكون عرض الفحص للعملاء
 * Requirements: 15.1, 15.3, 15.5, 16.4, 9.1, 9.2, 9.3
 * 
 * Displays the car inspection data in read-only mode for customers:
 * - Interactive SVG viewer with color-coded parts (read-only)
 * - View angle tabs for navigation
 * - Part details popup on click
 * - Color legend explaining each status
 * - Mechanical status summary
 * - PDF download and print buttons
 * - Full i18n support with RTL layout
 * 
 * Updated: Now uses SVGInspectionViewer with interactive part details
 * Updated: Added PDF generation capabilities
 * Updated: Added full i18n support
 */

import React, { useMemo, useState, useCallback } from 'react';
import { SVGInspectionViewer } from '@/components/inspection/SVGInspectionViewer';
import { ViewAngleTabs } from '@/components/inspection/ViewAngleTabs';
import { ColorLegend } from '@/components/inspection/ColorLegend';
import { PDFPreview } from '@/components/inspection/PDFPreview';
import { LanguageSwitcher } from '@/components/inspection/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useInspectionI18n } from '@/lib/useInspectionI18n';
import type { Car } from '@/types/car';
import type { BodyType, BodyPartId, PartStatus, MechanicalStatus } from '@/types/inspection';
import type { ViewAngle, CarTemplate, PartKey, PartDamageData, PartCondition } from '@/types/vds';
import {
  PART_STATUS_CONFIG,
  ALL_PART_STATUSES,
  ALL_BODY_PART_IDS,
  BODY_PART_LABELS,
  ENGINE_STATUS_LABELS,
  TRANSMISSION_STATUS_LABELS,
  CHASSIS_STATUS_LABELS,
  BODY_TYPE_LABELS,
} from '@/constants/inspection';
import {
  PART_LABELS,
  ALL_VIEW_ANGLES,
  CONDITION_LABELS,
  getConditionColor,
  CAR_TEMPLATE_LABELS,
  isWheelPart,
} from '@/constants/vds';
import {
  InspectionPDFGenerator,
  type InspectionPDFData,
} from '@/lib/pdfGenerator';
import { getImageUrl } from '@/lib/api';

export interface InspectionViewerProps {
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  mechanical?: MechanicalStatus;
  car?: Car;
  showPDFButtons?: boolean;
  damageDetails?: Record<string, { partKey: string; condition: string; severity?: string; notes?: string; photos?: string[]; updatedAt: string }>;
}

/**
 * Map BodyType to CarTemplate
 */
function bodyTypeToCarTemplate(bodyType: BodyType): CarTemplate {
  const mapping: Record<BodyType, CarTemplate> = {
    sedan: 'sedan',
    hatchback: 'hatchback',
    coupe: 'coupe',
    suv: 'suv',
    crossover: 'suv',
    pickup: 'pickup',
    van: 'van',
    minivan: 'van',
    truck: 'pickup',
  };
  return mapping[bodyType] || 'sedan';
}

/**
 * Map old PartStatus to new PartCondition
 */
function partStatusToCondition(status: PartStatus): PartCondition {
  const mapping: Record<PartStatus, PartCondition> = {
    original: 'good',
    painted: 'painted',
    bodywork: 'bodywork',
    accident: 'broken',
    replaced: 'replaced',
    needs_check: 'not_inspected',
  };
  return mapping[status] || 'not_inspected';
}

/**
 * Map BodyPartId to PartKey (handle naming differences)
 */
function bodyPartIdToPartKey(partId: BodyPartId): PartKey | null {
  const mapping: Record<BodyPartId, PartKey> = {
    front_bumper: 'front_bumper',
    rear_bumper: 'rear_bumper',
    hood: 'hood',
    roof: 'roof',
    trunk: 'trunk',
    front_left_door: 'left_front_door',
    front_right_door: 'right_front_door',
    rear_left_door: 'left_rear_door',
    rear_right_door: 'right_rear_door',
    front_left_fender: 'left_front_fender',
    front_right_fender: 'right_front_fender',
    rear_left_quarter: 'left_rear_quarter',
    rear_right_quarter: 'right_rear_quarter',
  };
  return mapping[partId] || null;
}

/**
 * Map PartKey to BodyPartId (reverse mapping)
 */
function partKeyToBodyPartId(partKey: PartKey): BodyPartId | null {
  const mapping: Record<string, BodyPartId> = {
    front_bumper: 'front_bumper',
    rear_bumper: 'rear_bumper',
    hood: 'hood',
    roof: 'roof',
    trunk: 'trunk',
    left_front_door: 'front_left_door',
    right_front_door: 'front_right_door',
    left_rear_door: 'rear_left_door',
    right_rear_door: 'rear_right_door',
    left_front_fender: 'front_left_fender',
    right_front_fender: 'front_right_fender',
    left_rear_quarter: 'rear_left_quarter',
    right_rear_quarter: 'rear_right_quarter',
  };
  return mapping[partKey] || null;
}

/**
 * Convert InspectionData bodyParts to VDS partsStatus format
 */
function convertToVDSPartsStatus(
  bodyParts: Record<BodyPartId, PartStatus>,
  damageDetails?: Record<string, { partKey: string; condition: string; severity?: string; notes?: string; photos?: string[]; updatedAt: string }>,
  tiresStatus?: { front_left: string; front_right: string; rear_left: string; rear_right: string; spare?: string }
): Record<string, PartDamageData> {
  const vdsStatus: Record<string, PartDamageData> = {};
  
  // Add body parts
  Object.entries(bodyParts).forEach(([partId, status]) => {
    const partKey = bodyPartIdToPartKey(partId as BodyPartId);
    if (partKey) {
      // Check if we have extended damage details
      const detail = damageDetails?.[partKey];
      
      vdsStatus[partKey] = {
        partKey,
        condition: detail?.condition as PartCondition || partStatusToCondition(status),
        severity: detail?.severity as any,
        notes: detail?.notes,
        photos: detail?.photos,
        updatedAt: detail?.updatedAt || new Date().toISOString(),
      };
    }
  });
  
  // Add tire/wheel parts from tiresStatus
  if (tiresStatus) {
    const tirePositionToPartKey: Record<string, string> = {
      'front_left': 'wheel_front_left',
      'front_right': 'wheel_front_right',
      'rear_left': 'wheel_rear_left',
      'rear_right': 'wheel_rear_right',
    };
    
    const tireStatusToCondition: Record<string, PartCondition> = {
      'new': 'good',
      'used_50': 'scratch',
      'damaged': 'broken',
    };
    
    Object.entries(tiresStatus).forEach(([position, status]) => {
      if (position === 'spare') return; // Skip spare tire for now
      
      const partKey = tirePositionToPartKey[position];
      if (partKey && status) {
        const detail = damageDetails?.[partKey];
        
        vdsStatus[partKey] = {
          partKey: partKey as PartKey,
          condition: detail?.condition as PartCondition || tireStatusToCondition[status] || 'good',
          severity: detail?.severity as any,
          notes: detail?.notes,
          photos: detail?.photos,
          updatedAt: detail?.updatedAt || new Date().toISOString(),
        };
      }
    });
  }
  
  // Add extra parts from damageDetails (headlights, mirrors, windshields, etc.)
  if (damageDetails) {
    Object.entries(damageDetails).forEach(([partKey, detail]) => {
      // Skip if already added (body parts or wheels)
      if (vdsStatus[partKey]) return;
      
      vdsStatus[partKey] = {
        partKey: partKey as PartKey,
        condition: detail.condition as PartCondition || 'not_inspected',
        severity: detail.severity as any,
        notes: detail.notes,
        photos: detail.photos,
        updatedAt: detail.updatedAt || new Date().toISOString(),
      };
    });
  }
  
  return vdsStatus;
}

/**
 * Part Details Popup Component
 */
interface PartDetailsPopupProps {
  partKey: PartKey;
  partData: PartDamageData;
  onClose: () => void;
  language: 'ar' | 'en';
}

function PartDetailsPopup({ partKey, partData, onClose, language }: PartDetailsPopupProps) {
  const partLabel = PART_LABELS[partKey] || { ar: partKey, en: partKey };
  const condition = partData?.condition || 'not_inspected';
  const isRTL = language === 'ar';
  
  // Check if this is a wheel/tire part
  const isWheel = isWheelPart(partKey);
  
  // Tire-specific condition labels with unique colors
  const tireConditionLabels: Record<string, { ar: string; en: string; color: string }> = {
    'good': { ar: 'جديد', en: 'New', color: '#10b981' },        // Emerald - أخضر زمردي
    'scratch': { ar: 'مستهلك 50%', en: '50% Used', color: '#f59e0b' },  // Amber - كهرماني
    'bodywork': { ar: 'سمكرة', en: 'Bodywork', color: '#f97316' },  // Orange - برتقالي
    'broken': { ar: 'تالف', en: 'Damaged', color: '#dc2626' },     // Red-600 - أحمر داكن
    'painted': { ar: 'رش', en: 'Painted', color: '#6366f1' },      // Indigo - نيلي
    'replaced': { ar: 'تغيير', en: 'Replaced', color: '#a855f7' }, // Purple - بنفسجي فاتح
    'not_inspected': { ar: 'غير مفحوص', en: 'Not Inspected', color: '#6b7280' }, // Gray-500
  };
  
  // Get the appropriate label and color based on part type
  let conditionLabel: { ar: string; en: string };
  let conditionColor: string;
  
  if (isWheel) {
    const tireConfig = tireConditionLabels[condition] || tireConditionLabels['not_inspected'];
    conditionLabel = { ar: tireConfig.ar, en: tireConfig.en };
    conditionColor = tireConfig.color;
  } else {
    conditionLabel = CONDITION_LABELS[condition] || { ar: condition, en: condition };
    conditionColor = getConditionColor(condition);
  }

  const labels = {
    partName: language === 'ar' ? 'اسم الجزء' : 'Part Name',
    condition: language === 'ar' ? 'الحالة' : 'Condition',
    severity: language === 'ar' ? 'الشدة' : 'Severity',
    notes: language === 'ar' ? 'ملاحظات' : 'Notes',
    photos: language === 'ar' ? 'صور الضرر' : 'Damage Photos',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    noNotes: language === 'ar' ? 'لا توجد ملاحظات' : 'No notes',
    noPhotos: language === 'ar' ? 'لا توجد صور' : 'No photos',
  };

  const severityLabels: Record<string, { ar: string; en: string }> = {
    light: { ar: 'خفيف', en: 'Light' },
    medium: { ar: 'متوسط', en: 'Medium' },
    severe: { ar: 'شديد', en: 'Severe' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{partLabel[language]}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={labels.close}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Part Details */}
        <div className="p-4 space-y-3">
          {/* Part Name */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{labels.partName}</span>
            <span className="text-sm font-medium">{partLabel[language]}</span>
          </div>
          
          {/* Condition */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{labels.condition}</span>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: conditionColor }}
              />
              <span className="text-sm font-medium">{conditionLabel[language]}</span>
            </div>
          </div>

          {/* Severity (if available) */}
          {partData?.severity && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{labels.severity}</span>
              <span className="text-sm font-medium">
                {severityLabels[partData.severity]?.[language] || partData.severity}
              </span>
            </div>
          )}

          {/* Notes (if available) */}
          {partData?.notes && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-gray-700 block mb-1">{labels.notes}</span>
              <p className="text-sm text-gray-600">{partData.notes}</p>
            </div>
          )}

          {/* Photos (if available) */}
          {partData?.photos && partData.photos.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">{labels.photos}</span>
              <div className="grid grid-cols-2 gap-2">
                {partData.photos.map((photo, index) => {
                  const photoUrl = photo.startsWith('data:') ? photo : getImageUrl(photo);
                  return (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photoUrl}
                        alt={`${partLabel[language]} - ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(photoUrl, '_blank')}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bilingual name */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{language === 'ar' ? 'Part Name' : 'اسم الجزء'}</span>
            <span className="text-sm font-medium text-gray-500">{partLabel[language === 'ar' ? 'en' : 'ar']}</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * InspectionViewer - Customer-facing inspection display component
 * Shows inspection data similar to Flutter app design:
 * 1. Interactive SVG viewer button
 * 2. Mechanical status section
 * 3. Body parts section
 * 4. Tires section
 * 5. Color legend
 * 6. Technical notes
 */
export function InspectionViewer({
  bodyType,
  partsStatus,
  mechanical,
  car,
  showPDFButtons = true,
  damageDetails,
}: InspectionViewerProps) {
  // i18n hook for translations and RTL support
  const { t, language, setLanguage, direction, isRTL } = useInspectionI18n();
  
  // Show/hide SVG viewer modal
  const [showSVGViewer, setShowSVGViewer] = useState(false);
  
  // Current view angle for SVG viewer
  const [currentAngle, setCurrentAngle] = useState<ViewAngle>('front');
  
  // Selected part for details popup
  const [selectedPart, setSelectedPart] = useState<PartKey | null>(null);

  // PDF preview modal state
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // PDF generation loading state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Convert to VDS format for SVG viewer (including tire status)
  const vdsPartsStatus = useMemo(
    () => convertToVDSPartsStatus(partsStatus, damageDetails, mechanical?.tires),
    [partsStatus, damageDetails, mechanical?.tires]
  );

  // Count parts by status for summary
  const statusCounts = useMemo(() => {
    const counts: Record<PartStatus, number> = {
      original: 0,
      painted: 0,
      bodywork: 0,
      accident: 0,
      replaced: 0,
      needs_check: 0,
    };
    
    ALL_BODY_PART_IDS.forEach((partId) => {
      const status = partsStatus[partId] || 'original';
      counts[status]++;
    });
    
    return counts;
  }, [partsStatus]);

  // Handle part click - show details popup
  const handlePartClick = (partKey: PartKey) => {
    setSelectedPart(partKey);
  };

  // Get data for selected part
  const getSelectedPartData = (): PartDamageData => {
    if (!selectedPart) return { partKey: '' as PartKey, condition: 'not_inspected', updatedAt: new Date().toISOString() };
    return vdsPartsStatus[selectedPart] || { partKey: selectedPart, condition: 'not_inspected', updatedAt: new Date().toISOString() };
  };

  // Prepare PDF data
  const pdfData: InspectionPDFData = useMemo(() => ({
    car,
    bodyType,
    partsStatus,
    mechanical,
    inspectionDate: new Date().toISOString(),
    damageDetails,
    technicalNotes: mechanical?.technicalNotes,
  }), [car, bodyType, partsStatus, mechanical, damageDetails]);

  // Handle quick PDF download
  const handleQuickDownload = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      const generator = new InspectionPDFGenerator(pdfData, { language });
      await generator.download();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pdfData, language]);

  // Handle quick print
  const handleQuickPrint = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      const generator = new InspectionPDFGenerator(pdfData, { language });
      await generator.print();
    } catch (error) {
      console.error('Error printing PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pdfData, language]);

  // Bilingual body type label
  const bodyTypeLabel = language === 'ar' ? BODY_TYPE_LABELS[bodyType] : bodyType.charAt(0).toUpperCase() + bodyType.slice(1);

  return (
    <div className="w-full" dir={direction} data-testid="inspection-viewer">
      {/* Main Container - matching Flutter design */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {language === 'ar' ? 'تقرير الفحص' : 'Inspection Report'}
          </h2>
          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* 1. Interactive SVG Viewer Button - زر عرض تقرير الفحص التفاعلي */}
        <Button
          onClick={() => setShowSVGViewer(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          {language === 'ar' ? 'عرض تقرير الفحص التفاعلي' : 'View Interactive Inspection Report'}
        </Button>

        <div className="border-t border-gray-200" />

        {/* 2. Mechanical Status Section - الحالة الميكانيكية */}
        {mechanical && (
          <>
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-3">
                {language === 'ar' ? 'الحالة الميكانيكية' : 'Mechanical Status'}
              </h3>
              <div className="space-y-2">
                <MechanicalRow 
                  label={language === 'ar' ? 'المكينة' : 'Engine'} 
                  value={ENGINE_STATUS_LABELS[mechanical.engine]} 
                />
                <MechanicalRow 
                  label={language === 'ar' ? 'القير' : 'Transmission'} 
                  value={TRANSMISSION_STATUS_LABELS[mechanical.transmission]} 
                />
                <MechanicalRow 
                  label={language === 'ar' ? 'الشاصي' : 'Chassis'} 
                  value={CHASSIS_STATUS_LABELS[mechanical.chassis]} 
                />
              </div>
            </div>
            <div className="border-t border-gray-200" />
          </>
        )}

        {/* 3. Body Parts Section - حالة الهيكل */}
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            {language === 'ar' ? 'حالة الهيكل' : 'Body Condition'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALL_BODY_PART_IDS.map((partId) => {
              const status = partsStatus[partId] || 'original';
              // Check for damage details override
              const partKey = bodyPartIdToPartKey(partId);
              const damageDetail = partKey ? damageDetails?.[partKey] : null;
              const condition = (damageDetail?.condition as PartCondition) || partStatusToCondition(status);
              const color = getConditionColor(condition);
              
              return (
                <div
                  key={partId}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ 
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}30`
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-700">{BODY_PART_LABELS[partId]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Tires Section - حالة الإطارات */}
        {mechanical?.tires && (
          <>
            <div className="border-t border-gray-200" />
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-3">
                {language === 'ar' ? 'حالة الإطارات' : 'Tires Condition'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(['front_left', 'front_right', 'rear_left', 'rear_right'] as const).map((position) => {
                  const status = mechanical.tires?.[position];
                  const positionLabels: Record<string, { ar: string; en: string }> = {
                    front_left: { ar: 'أمامي أيسر', en: 'Front Left' },
                    front_right: { ar: 'أمامي أيمن', en: 'Front Right' },
                    rear_left: { ar: 'خلفي أيسر', en: 'Rear Left' },
                    rear_right: { ar: 'خلفي أيمن', en: 'Rear Right' },
                  };
                  const statusConfig: Record<string, { label: { ar: string; en: string }; color: string; icon: string }> = {
                    new: { label: { ar: 'جديد', en: 'New' }, color: '#22c55e', icon: '✅' },
                    used_50: { label: { ar: 'مستهلك 50%', en: '50% Used' }, color: '#f59e0b', icon: '⚠️' },
                    damaged: { label: { ar: 'تالف', en: 'Damaged' }, color: '#ef4444', icon: '❌' },
                  };
                  const config = statusConfig[status || 'new'];
                  
                  return (
                    <div
                      key={position}
                      className="flex items-center justify-between p-2.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: `${config.color}10`,
                        border: `1px solid ${config.color}30`
                      }}
                    >
                      <span className="text-gray-600 text-xs">
                        {positionLabels[position][language]}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: config.color }}>
                        {config.icon} {config.label[language]}
                      </span>
                    </div>
                  );
                })}
                {mechanical.tires?.spare && (
                  <div
                    className="col-span-2 flex items-center justify-between p-2.5 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: `${(statusConfig => statusConfig[mechanical.tires?.spare || 'new']?.color || '#22c55e')({ new: { color: '#22c55e' }, used_50: { color: '#f59e0b' }, damaged: { color: '#ef4444' } })}10`,
                    }}
                  >
                    <span className="text-gray-600 text-xs">
                      {language === 'ar' ? 'الاحتياطي' : 'Spare'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      {mechanical.tires.spare === 'new' ? '✅' : mechanical.tires.spare === 'used_50' ? '⚠️' : '❌'}
                      {mechanical.tires.spare === 'new' ? (language === 'ar' ? 'جديد' : 'New') : 
                       mechanical.tires.spare === 'used_50' ? (language === 'ar' ? 'مستهلك 50%' : '50% Used') : 
                       (language === 'ar' ? 'تالف' : 'Damaged')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 5. Color Legend - دليل الألوان */}
        <div className="border-t border-gray-200" />
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            {language === 'ar' ? 'دليل الألوان' : 'Color Legend'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: { ar: 'سليم', en: 'Good' }, color: '#22c55e' },
              { label: { ar: 'خدش', en: 'Scratch' }, color: '#eab308' },
              { label: { ar: 'سمكرة', en: 'Bodywork' }, color: '#f97316' },
              { label: { ar: 'كسر', en: 'Broken' }, color: '#ef4444' },
              { label: { ar: 'رش', en: 'Painted' }, color: '#3b82f6' },
              { label: { ar: 'تغيير', en: 'Replaced' }, color: '#8b5cf6' },
              { label: { ar: 'غير محدد', en: 'Not Inspected' }, color: '#9ca3af' },
            ].map((item) => (
              <div key={item.label.en} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.label[language]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Technical Notes - ملاحظات فنية */}
        {mechanical?.technicalNotes && (
          <>
            <div className="border-t border-gray-200" />
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">
                {language === 'ar' ? 'ملاحظات فنية' : 'Technical Notes'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {mechanical.technicalNotes}
              </p>
            </div>
          </>
        )}

        {/* PDF Buttons */}
        {showPDFButtons && (
          <>
            <div className="border-t border-gray-200" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPDFPreview(true)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('previewReport')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickPrint}
                disabled={isGeneratingPDF}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {t('print')}
              </Button>
              <Button
                size="sm"
                onClick={handleQuickDownload}
                disabled={isGeneratingPDF}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isGeneratingPDF ? t('generating') : t('downloadPdf')}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* SVG Viewer Modal - نافذة عرض الفحص التفاعلي */}
      {showSVGViewer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSVGViewer(false)}>
          <div 
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">
                {language === 'ar' ? 'تقرير الفحص التفاعلي' : 'Interactive Inspection Report'}
              </h3>
              <button
                onClick={() => setShowSVGViewer(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <p className="text-sm text-gray-500 mb-3">
                {language === 'ar' ? 'اضغط على أي جزء لعرض التفاصيل' : 'Click on any part to view details'}
              </p>
              
              {/* View Angle Tabs */}
              <ViewAngleTabs
                currentAngle={currentAngle}
                onAngleChange={setCurrentAngle}
                availableAngles={ALL_VIEW_ANGLES}
                language={language}
                className="mb-4"
              />

              {/* SVG Viewer */}
              <div className="w-full h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-300">
                <SVGInspectionViewer
                  templateType={bodyTypeToCarTemplate(bodyType)}
                  viewAngle={currentAngle}
                  partsStatus={vdsPartsStatus}
                  onPartClick={handlePartClick}
                  readOnly={false}
                  language={language}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part Details Popup */}
      {selectedPart && (
        <PartDetailsPopup
          partKey={selectedPart}
          partData={getSelectedPartData()}
          onClose={() => setSelectedPart(null)}
          language={language}
        />
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <PDFPreview
          car={car}
          bodyType={bodyType}
          partsStatus={partsStatus}
          mechanical={mechanical}
          damageDetails={damageDetails}
          onClose={() => setShowPDFPreview(false)}
          language={language}
        />
      )}
    </div>
  );
}

/**
 * MechanicalRow - Helper component for mechanical status rows
 */
function MechanicalRow({ label, value }: { label: string; value: string }) {
  // Determine color based on value
  const getStatusColor = (val: string) => {
    if (val === 'أصلي' || val === 'سليم' || val === 'Original' || val === 'Intact') {
      return '#22c55e'; // green
    } else if (val === 'مستبدل' || val === 'مجدد' || val === 'معدل' || val === 'Replaced' || val === 'Refurbished' || val === 'Modified') {
      return '#f59e0b'; // amber
    } else {
      return '#ef4444'; // red
    }
  };
  
  const color = getStatusColor(value);
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span 
        className="text-xs px-2.5 py-1 rounded-lg font-medium"
        style={{ 
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default InspectionViewer;
