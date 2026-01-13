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
      <div className={cn('flex flex-wrap gap-2', className)}>
        {colorMappings.map((mapping) => (
          <div
            key={mapping.condition}
            className="flex items-center gap-1.5 text-xs"
            title={language === 'ar' ? mapping.labelAr : mapping.labelEn}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
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
    <div className={cn('bg-background border rounded-lg p-3', className)}>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {colorMappings.map((mapping) => (
          <div
            key={mapping.condition}
            className="flex items-center gap-2"
          >
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: mapping.colorHex }}
            />
            <span className="text-sm text-foreground">
              {language === 'ar' ? mapping.labelAr : mapping.labelEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorLegend;
