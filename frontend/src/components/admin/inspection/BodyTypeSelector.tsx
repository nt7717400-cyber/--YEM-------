'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BODY_TYPE_LABELS, ALL_BODY_TYPES } from '@/constants/inspection';
import type { BodyType } from '@/types/inspection';

/**
 * BodyTypeSelector Props
 * Requirements: 1.2
 */
export interface BodyTypeSelectorProps {
  value: BodyType | null;
  onChange: (type: BodyType) => void;
  disabled?: boolean;
}

/**
 * BodyTypeSelector Component
 * Dropdown selector for car body types with RTL Arabic support
 * Requirements: 1.2 - THE Body_Type selector SHALL include 9 options
 */
export function BodyTypeSelector({
  value,
  onChange,
  disabled = false,
}: BodyTypeSelectorProps) {
  return (
    <div className="w-full max-w-sm" dir="rtl">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
        نوع الهيكل
      </label>
      <Select
        value={value ?? undefined}
        onValueChange={(val) => onChange(val as BodyType)}
        disabled={disabled}
        dir="rtl"
      >
        <SelectTrigger className="w-full text-right text-sm" data-testid="body-type-trigger">
          <SelectValue placeholder="اختر نوع الهيكل" />
        </SelectTrigger>
        <SelectContent className="text-right" dir="rtl">
          {ALL_BODY_TYPES.map((type) => (
            <SelectItem
              key={type}
              value={type}
              className="text-right"
              data-testid={`body-type-option-${type}`}
            >
              {BODY_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default BodyTypeSelector;
