'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ENGINE_STATUS_LABELS,
  TRANSMISSION_STATUS_LABELS,
  CHASSIS_STATUS_LABELS,
} from '@/constants/inspection';
import type {
  MechanicalStatus,
  EngineStatus,
  TransmissionStatus,
  ChassisStatus,
} from '@/types/inspection';

/**
 * MechanicalStatusForm Props
 * Requirements: 5.2, 5.3, 5.4, 5.5
 */
export interface MechanicalStatusFormProps {
  value: MechanicalStatus;
  onChange: (status: MechanicalStatus) => void;
  disabled?: boolean;
}

// Engine status options
const ENGINE_STATUSES: EngineStatus[] = ['original', 'replaced', 'refurbished'];

// Transmission status options
const TRANSMISSION_STATUSES: TransmissionStatus[] = ['original', 'replaced'];

// Chassis status options
const CHASSIS_STATUSES: ChassisStatus[] = ['intact', 'accident_affected', 'modified'];

/**
 * MechanicalStatusForm Component
 * Form for documenting mechanical condition of used cars
 * Requirements: 5.2, 5.3, 5.4, 5.5
 */
export function MechanicalStatusForm({
  value,
  onChange,
  disabled = false,
}: MechanicalStatusFormProps) {
  const handleEngineChange = (engine: EngineStatus) => {
    onChange({ ...value, engine });
  };

  const handleTransmissionChange = (transmission: TransmissionStatus) => {
    onChange({ ...value, transmission });
  };

  const handleChassisChange = (chassis: ChassisStatus) => {
    onChange({ ...value, chassis });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...value, technicalNotes: e.target.value });
  };

  return (
    <div className="w-full space-y-4" dir="rtl" data-testid="mechanical-status-form">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">الحالة الميكانيكية</h3>
      
      {/* Grid layout for selects on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Engine Status - حالة المكينة */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            حالة المكينة
          </label>
          <Select
            value={value.engine}
            onValueChange={(val) => handleEngineChange(val as EngineStatus)}
            disabled={disabled}
            dir="rtl"
          >
            <SelectTrigger className="w-full text-right text-sm" data-testid="engine-status-trigger">
              <SelectValue placeholder="اختر حالة المكينة" />
            </SelectTrigger>
            <SelectContent className="text-right" dir="rtl">
              {ENGINE_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-right"
                  data-testid={`engine-status-option-${status}`}
                >
                  {ENGINE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission Status - حالة القير */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            حالة القير
          </label>
          <Select
            value={value.transmission}
            onValueChange={(val) => handleTransmissionChange(val as TransmissionStatus)}
            disabled={disabled}
            dir="rtl"
          >
            <SelectTrigger className="w-full text-right text-sm" data-testid="transmission-status-trigger">
              <SelectValue placeholder="اختر حالة القير" />
            </SelectTrigger>
            <SelectContent className="text-right" dir="rtl">
              {TRANSMISSION_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-right"
                  data-testid={`transmission-status-option-${status}`}
                >
                  {TRANSMISSION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chassis Status - حالة الشاصي */}
        <div className="w-full sm:col-span-2 lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            حالة الشاصي
          </label>
          <Select
            value={value.chassis}
            onValueChange={(val) => handleChassisChange(val as ChassisStatus)}
            disabled={disabled}
            dir="rtl"
          >
            <SelectTrigger className="w-full text-right text-sm" data-testid="chassis-status-trigger">
              <SelectValue placeholder="اختر حالة الشاصي" />
            </SelectTrigger>
            <SelectContent className="text-right" dir="rtl">
              {CHASSIS_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-right"
                  data-testid={`chassis-status-option-${status}`}
                >
                  {CHASSIS_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Technical Notes - الملاحظات الفنية */}
      <div className="w-full">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          الملاحظات الفنية
        </label>
        <textarea
          value={value.technicalNotes}
          onChange={handleNotesChange}
          disabled={disabled}
          placeholder="أدخل أي ملاحظات فنية إضافية..."
          className="w-full min-h-[80px] sm:min-h-[100px] p-2.5 sm:p-3 border border-gray-300 rounded-md text-right text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          dir="rtl"
          data-testid="technical-notes-textarea"
        />
      </div>
    </div>
  );
}

export default MechanicalStatusForm;
