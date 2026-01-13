'use client';

/**
 * TiresStatusForm Component - نموذج حالة الإطارات
 * Form for recording tire condition for each wheel position
 */

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TiresStatus, TireStatus, TirePosition } from '@/types/inspection';
import {
  ALL_TIRE_STATUSES,
  ALL_TIRE_POSITIONS,
  TIRE_STATUS_CONFIG,
  TIRE_POSITION_LABELS,
  TIRE_POSITION_LABELS_BILINGUAL,
  TIRE_STATUS_LABELS_BILINGUAL,
} from '@/constants/inspection';

export interface TiresStatusFormProps {
  value: TiresStatus;
  onChange: (value: TiresStatus) => void;
  disabled?: boolean;
  language?: 'ar' | 'en';
}

// Default tires status
export const DEFAULT_TIRES_STATUS: TiresStatus = {
  front_left: 'new',
  front_right: 'new',
  rear_left: 'new',
  rear_right: 'new',
  spare: 'new',
};

/**
 * TiresStatusForm Component
 */
export function TiresStatusForm({
  value,
  onChange,
  disabled = false,
  language = 'ar',
}: TiresStatusFormProps) {
  const isRTL = language === 'ar';

  // Handle tire status change
  const handleTireChange = (position: TirePosition, status: TireStatus) => {
    onChange({
      ...value,
      [position]: status,
    });
  };

  // Labels
  const labels = {
    title: language === 'ar' ? 'حالة الإطارات' : 'Tires Condition',
    selectStatus: language === 'ar' ? 'اختر الحالة' : 'Select status',
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tire Diagram */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Car outline */}
        <div className="bg-gray-100 rounded-lg p-6 relative">
          {/* Car body representation */}
          <div className="bg-gray-300 rounded-lg mx-auto w-32 h-48 relative">
            {/* Front */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
              {language === 'ar' ? 'أمام' : 'Front'}
            </div>
            {/* Rear */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
              {language === 'ar' ? 'خلف' : 'Rear'}
            </div>
          </div>

          {/* Tire positions */}
          {/* Front Left */}
          <div className="absolute top-8 left-4">
            <TireSelector
              position="front_left"
              status={value.front_left}
              onChange={(status) => handleTireChange('front_left', status)}
              disabled={disabled}
              language={language}
            />
          </div>

          {/* Front Right */}
          <div className="absolute top-8 right-4">
            <TireSelector
              position="front_right"
              status={value.front_right}
              onChange={(status) => handleTireChange('front_right', status)}
              disabled={disabled}
              language={language}
            />
          </div>

          {/* Rear Left */}
          <div className="absolute bottom-16 left-4">
            <TireSelector
              position="rear_left"
              status={value.rear_left}
              onChange={(status) => handleTireChange('rear_left', status)}
              disabled={disabled}
              language={language}
            />
          </div>

          {/* Rear Right */}
          <div className="absolute bottom-16 right-4">
            <TireSelector
              position="rear_right"
              status={value.rear_right}
              onChange={(status) => handleTireChange('rear_right', status)}
              disabled={disabled}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Spare Tire */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-700">
            {TIRE_POSITION_LABELS_BILINGUAL.spare[language]}
          </span>
          <Select
            value={value.spare || 'new'}
            onValueChange={(status) => handleTireChange('spare', status as TireStatus)}
            disabled={disabled}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={labels.selectStatus} />
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
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-2">
          {language === 'ar' ? 'دليل الحالات:' : 'Status Legend:'}
        </div>
        <div className="flex flex-wrap gap-3">
          {ALL_TIRE_STATUSES.map((status) => {
            const config = TIRE_STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs">{config.icon}</span>
                <span className="text-xs text-gray-600">
                  {TIRE_STATUS_LABELS_BILINGUAL[status][language]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Tire Selector Component
 */
interface TireSelectorProps {
  position: TirePosition;
  status: TireStatus;
  onChange: (status: TireStatus) => void;
  disabled?: boolean;
  language?: 'ar' | 'en';
}

function TireSelector({ position, status, onChange, disabled, language = 'ar' }: TireSelectorProps) {
  const config = TIRE_STATUS_CONFIG[status];
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Tire visual */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // Cycle through statuses
          const currentIndex = ALL_TIRE_STATUSES.indexOf(status);
          const nextIndex = (currentIndex + 1) % ALL_TIRE_STATUSES.length;
          onChange(ALL_TIRE_STATUSES[nextIndex]);
        }}
        className={`
          w-8 h-12 rounded-sm border-2 transition-all
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
        `}
        style={{ 
          backgroundColor: config.color,
          borderColor: config.color,
        }}
        title={`${TIRE_POSITION_LABELS_BILINGUAL[position][language]}: ${TIRE_STATUS_LABELS_BILINGUAL[status][language]}`}
      >
        <span className="text-white text-xs">{config.icon}</span>
      </button>
      {/* Position label */}
      <span className="text-[10px] text-gray-500 text-center max-w-[60px]">
        {TIRE_POSITION_LABELS_BILINGUAL[position][language]}
      </span>
    </div>
  );
}

export default TiresStatusForm;
