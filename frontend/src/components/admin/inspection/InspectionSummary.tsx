'use client';

import * as React from 'react';
import {
  BODY_PART_LABELS,
  PART_STATUS_CONFIG,
  ENGINE_STATUS_LABELS,
  TRANSMISSION_STATUS_LABELS,
  CHASSIS_STATUS_LABELS,
  ALL_BODY_PART_IDS,
  ALL_PART_STATUSES,
} from '@/constants/inspection';
import type {
  BodyPartId,
  PartStatus,
  MechanicalStatus,
} from '@/types/inspection';

/**
 * InspectionSummary Props
 * Requirements: 7.3, 7.4, 8.4
 */
export interface InspectionSummaryProps {
  partsStatus: Record<BodyPartId, PartStatus>;
  mechanical?: MechanicalStatus;
  showMechanical?: boolean;
}

/**
 * InspectionSummary Component
 * Displays a summary of all body parts statuses with legend and mechanical status
 * Requirements: 7.3, 7.4, 8.4
 */
export function InspectionSummary({
  partsStatus,
  mechanical,
  showMechanical = true,
}: InspectionSummaryProps) {
  // Count parts by status
  const statusCounts = React.useMemo(() => {
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

  return (
    <div className="w-full space-y-6" dir="rtl" data-testid="inspection-summary">
      {/* Legend - دليل الألوان */}
      <div className="bg-gray-50 rounded-lg p-4" data-testid="status-legend">
        <h4 className="text-md font-semibold text-gray-800 mb-3">دليل الألوان</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_PART_STATUSES.map((status) => (
            <div
              key={status}
              className="flex items-center gap-2"
              data-testid={`legend-item-${status}`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: PART_STATUS_CONFIG[status].color }}
              />
              <span className="text-sm text-gray-700">
                {PART_STATUS_CONFIG[status].icon} {PART_STATUS_CONFIG[status].label}
              </span>
              <span className="text-xs text-gray-500">({statusCounts[status]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Parts Summary - ملخص حالة الأجزاء */}
      <div className="bg-white border border-gray-200 rounded-lg p-4" data-testid="parts-summary">
        <h4 className="text-md font-semibold text-gray-800 mb-3">ملخص حالة الأجزاء</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ALL_BODY_PART_IDS.map((partId) => {
            const status = partsStatus[partId] || 'original';
            const config = PART_STATUS_CONFIG[status];
            return (
              <div
                key={partId}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                data-testid={`part-summary-${partId}`}
              >
                <span className="text-sm text-gray-700">{BODY_PART_LABELS[partId]}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon} {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mechanical Status Summary - ملخص الحالة الميكانيكية */}
      {showMechanical && mechanical && (
        <div className="bg-white border border-gray-200 rounded-lg p-4" data-testid="mechanical-summary">
          <h4 className="text-md font-semibold text-gray-800 mb-3">ملخص الحالة الميكانيكية</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
              <span className="text-sm font-medium text-gray-700">المكينة</span>
              <span className="text-sm text-gray-600" data-testid="engine-status-value">
                {ENGINE_STATUS_LABELS[mechanical.engine]}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
              <span className="text-sm font-medium text-gray-700">القير</span>
              <span className="text-sm text-gray-600" data-testid="transmission-status-value">
                {TRANSMISSION_STATUS_LABELS[mechanical.transmission]}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
              <span className="text-sm font-medium text-gray-700">الشاصي</span>
              <span className="text-sm text-gray-600" data-testid="chassis-status-value">
                {CHASSIS_STATUS_LABELS[mechanical.chassis]}
              </span>
            </div>
            {mechanical.technicalNotes && (
              <div className="p-2 rounded-md bg-gray-50">
                <span className="text-sm font-medium text-gray-700 block mb-1">الملاحظات الفنية</span>
                <p className="text-sm text-gray-600" data-testid="technical-notes-value">
                  {mechanical.technicalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InspectionSummary;
