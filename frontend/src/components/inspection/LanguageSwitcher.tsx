'use client';

/**
 * LanguageSwitcher Component
 * Toggle between Arabic and English for inspection UI
 * Requirements: 9.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/constants/inspection-i18n';

export interface LanguageSwitcherProps {
  /** Current language */
  language: SupportedLanguage;
  /** Language change handler */
  onLanguageChange: (language: SupportedLanguage) => void;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (icon only) */
  compact?: boolean;
}

/**
 * LanguageSwitcher - Toggle between Arabic and English
 */
export function LanguageSwitcher({
  language,
  onLanguageChange,
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const handleToggle = () => {
    onLanguageChange(language === 'ar' ? 'en' : 'ar');
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          'bg-gray-100 hover:bg-gray-200 transition-colors',
          'text-sm font-medium text-gray-700',
          className
        )}
        title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        {language === 'ar' ? 'EN' : 'ع'}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className)}>
      <button
        type="button"
        onClick={() => onLanguageChange('ar')}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          language === 'ar'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
        aria-pressed={language === 'ar'}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          language === 'en'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
        aria-pressed={language === 'en'}
      >
        English
      </button>
    </div>
  );
}

export default LanguageSwitcher;
