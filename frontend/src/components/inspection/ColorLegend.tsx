'use client';

/**
 * ColorLegend Component
 * Displays color legend for part conditions
 * Requirements: 4.2
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ColorLegendProps } from '@/types/vds';
import { DEFAULT_COLOR_MAPPINGS } from '@/constants/vds';

/**
 * ColorLegend - Displays color legend for part conditions
 */
export function ColorLegend({
  colorMappings = DEFAULT_COLOR_MAPPINGS,
  language = 'ar',
  compact = false,
  className,
}: ColorLegendProps) {
  const title = language === 'ar' ? 'دليل الألوان' : 'Color Legend';

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-2', className)}>
        {colorMappings.map((mapping) => (
          <div
            key={mapping.condition}
            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs"
            title={language === 'ar' ? mapping.labelAr : mapping.labelEn}
          >
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: mapping.colorHex }}
            />
            <span className="text-muted-foreground">
              {language === 'ar' ? mapping.labelAr : mapping.labelEn}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('bg-background border rounded-lg p-2 sm:p-3', className)}>
      <h4 className="text-xs sm:text-sm font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
        {colorMappings.map((mapping) => (
          <div
            key={mapping.condition}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <span
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: mapping.colorHex }}
            />
            <span className="text-xs sm:text-sm text-foreground truncate">
              {language === 'ar' ? mapping.labelAr : mapping.labelEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorLegend;
