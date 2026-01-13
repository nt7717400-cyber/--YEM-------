'use client';

/**
 * PDF Preview Component - مكون معاينة تقرير PDF
 * Requirements: 16.3
 * 
 * Provides a preview of the inspection PDF report before downloading:
 * - Preview the report layout
 * - Customize which sections to include
 * - Select paper size
 * - Download or print the report
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  InspectionPDFGenerator,
  type InspectionPDFData,
  type PDFReportOptions,
  DEFAULT_PDF_OPTIONS,
} from '@/lib/pdfGenerator';
import type { Car } from '@/types/car';
import type { BodyType, BodyPartId, PartStatus, MechanicalStatus } from '@/types/inspection';
import {
  PART_STATUS_CONFIG,
  ALL_BODY_PART_IDS,
  BODY_PART_LABELS,
  ENGINE_STATUS_LABELS,
  TRANSMISSION_STATUS_LABELS,
  CHASSIS_STATUS_LABELS,
  BODY_TYPE_LABELS,
} from '@/constants/inspection';

export interface PDFPreviewProps {
  car?: Car;
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  mechanical?: MechanicalStatus;
  damageDetails?: Record<string, { partKey: string; condition: string; severity?: string; notes?: string; photos?: string[]; updatedAt?: string }>;
  inspectorName?: string;
  customerName?: string;
  customerPhone?: string;
  inspectionDate?: string;
  generalNotes?: string;
  onClose?: () => void;
  language?: 'ar' | 'en';
}

/**
 * Section toggle checkbox component
 */
interface SectionToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SectionToggle({ label, checked, onChange, disabled }: SectionToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
      />
      <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
    </label>
  );
}

/**
 * PDF Preview Component
 */
export function PDFPreview({
  car,
  bodyType,
  partsStatus,
  mechanical,
  damageDetails,
  inspectorName,
  customerName,
  customerPhone,
  inspectionDate,
  generalNotes,
  onClose,
  language = 'ar',
}: PDFPreviewProps) {
  // PDF options state
  const [options, setOptions] = useState<PDFReportOptions>({
    ...DEFAULT_PDF_OPTIONS,
    language,
  });

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // Labels based on language
  const labels = useMemo(() => ({
    title: language === 'ar' ? 'معاينة تقرير الفحص' : 'Inspection Report Preview',
    sections: language === 'ar' ? 'الأقسام المضمنة' : 'Included Sections',
    vehicleInfo: language === 'ar' ? 'معلومات السيارة' : 'Vehicle Information',
    customerInfo: language === 'ar' ? 'معلومات العميل' : 'Customer Information',
    inspectorInfo: language === 'ar' ? 'معلومات الفاحص' : 'Inspector Information',
    diagrams: language === 'ar' ? 'مخططات السيارة' : 'Car Diagrams',
    damageTable: language === 'ar' ? 'جدول الأضرار' : 'Damage Table',
    photos: language === 'ar' ? 'صور الأضرار' : 'Damage Photos',
    paperSize: language === 'ar' ? 'حجم الورق' : 'Paper Size',
    reportLanguage: language === 'ar' ? 'لغة التقرير' : 'Report Language',
    arabic: language === 'ar' ? 'العربية' : 'Arabic',
    english: language === 'ar' ? 'الإنجليزية' : 'English',
    download: language === 'ar' ? 'تحميل PDF' : 'Download PDF',
    print: language === 'ar' ? 'طباعة' : 'Print',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    preview: language === 'ar' ? 'معاينة' : 'Preview',
    bodyCondition: language === 'ar' ? 'حالة الهيكل' : 'Body Condition',
    mechanicalStatus: language === 'ar' ? 'الحالة الميكانيكية' : 'Mechanical Status',
    engine: language === 'ar' ? 'المكينة' : 'Engine',
    transmission: language === 'ar' ? 'القير' : 'Transmission',
    chassis: language === 'ar' ? 'الشاصي' : 'Chassis',
    generating: language === 'ar' ? 'جاري الإنشاء...' : 'Generating...',
  }), [language]);

  // Prepare PDF data
  const pdfData: InspectionPDFData = useMemo(() => ({
    car,
    bodyType,
    partsStatus,
    mechanical,
    damageDetails,
    inspectorName,
    customerName,
    customerPhone,
    inspectionDate: inspectionDate || new Date().toISOString(),
    generalNotes,
    technicalNotes: mechanical?.technicalNotes,
  }), [car, bodyType, partsStatus, mechanical, damageDetails, inspectorName, customerName, customerPhone, inspectionDate, generalNotes]);

  // Count parts by status
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

  // Handle section toggle
  const handleSectionToggle = useCallback((section: keyof PDFReportOptions['includeSections'], checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      includeSections: {
        ...prev.includeSections,
        [section]: checked,
      },
    }));
  }, []);

  // Handle paper size change
  const handlePaperSizeChange = useCallback((size: 'A4' | 'Letter') => {
    setOptions((prev) => ({ ...prev, paperSize: size }));
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((lang: 'ar' | 'en') => {
    setOptions((prev) => ({ ...prev, language: lang }));
  }, []);

  // Handle download
  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generator = new InspectionPDFGenerator(pdfData, options);
      generator.download();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [pdfData, options]);

  // Handle print
  const handlePrint = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generator = new InspectionPDFGenerator(pdfData, options);
      generator.print();
    } catch (error) {
      console.error('Error printing PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [pdfData, options]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{labels.title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={labels.close}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Options Panel */}
            <div className="space-y-6">
              {/* Sections */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{labels.sections}</h3>
                <div className="space-y-2">
                  <SectionToggle
                    label={labels.vehicleInfo}
                    checked={options.includeSections.vehicleInfo}
                    onChange={(checked) => handleSectionToggle('vehicleInfo', checked)}
                  />
                  <SectionToggle
                    label={labels.customerInfo}
                    checked={options.includeSections.customerInfo}
                    onChange={(checked) => handleSectionToggle('customerInfo', checked)}
                    disabled={!customerName && !customerPhone}
                  />
                  <SectionToggle
                    label={labels.inspectorInfo}
                    checked={options.includeSections.inspectorInfo}
                    onChange={(checked) => handleSectionToggle('inspectorInfo', checked)}
                    disabled={!inspectorName}
                  />
                  <SectionToggle
                    label={labels.damageTable}
                    checked={options.includeSections.damageTable}
                    onChange={(checked) => handleSectionToggle('damageTable', checked)}
                  />
                </div>
              </div>

              {/* Paper Size */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{labels.paperSize}</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paperSize"
                      checked={options.paperSize === 'A4'}
                      onChange={() => handlePaperSizeChange('A4')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">A4</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paperSize"
                      checked={options.paperSize === 'Letter'}
                      onChange={() => handlePaperSizeChange('Letter')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Letter</span>
                  </label>
                </div>
              </div>

              {/* Report Language */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{labels.reportLanguage}</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportLanguage"
                      checked={options.language === 'ar'}
                      onChange={() => handleLanguageChange('ar')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{labels.arabic}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportLanguage"
                      checked={options.language === 'en'}
                      onChange={() => handleLanguageChange('en')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{labels.english}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{labels.preview}</h3>
              
              {/* Mini preview of report content */}
              <div className="bg-white rounded border border-gray-200 p-4 space-y-4 text-sm">
                {/* Vehicle Info Preview */}
                {options.includeSections.vehicleInfo && car && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{labels.vehicleInfo}</h4>
                    <div className="text-gray-600 space-y-1">
                      <p>{car.brand} {car.model} {car.year}</p>
                      <p>{BODY_TYPE_LABELS[bodyType]}</p>
                      {car.kilometers && <p>{car.kilometers.toLocaleString()} km</p>}
                    </div>
                  </div>
                )}

                {/* Body Condition Summary */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{labels.bodyCondition}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusCounts).map(([status, count]) => {
                      if (count === 0) return null;
                      const config = PART_STATUS_CONFIG[status as PartStatus];
                      return (
                        <span
                          key={status}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          {config.icon} {config.label}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Mechanical Status Preview */}
                {mechanical && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{labels.mechanicalStatus}</h4>
                    <div className="text-gray-600 space-y-1 text-xs">
                      <p>{labels.engine}: {ENGINE_STATUS_LABELS[mechanical.engine]}</p>
                      <p>{labels.transmission}: {TRANSMISSION_STATUS_LABELS[mechanical.transmission]}</p>
                      <p>{labels.chassis}: {CHASSIS_STATUS_LABELS[mechanical.chassis]}</p>
                    </div>
                  </div>
                )}

                {/* Damage Table Preview */}
                {options.includeSections.damageTable && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{labels.damageTable}</h4>
                    <div className="text-xs text-gray-500">
                      {ALL_BODY_PART_IDS.length} {language === 'ar' ? 'جزء' : 'parts'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              {labels.close}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isGenerating}
          >
            {isGenerating ? labels.generating : labels.print}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? labels.generating : labels.download}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PDFPreview;
