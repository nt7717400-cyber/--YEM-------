/**
 * useInspectionI18n Hook
 * React hook for inspection internationalization
 * 
 * Requirements: 9.1, 9.2, 9.3
 * - Language switching support
 * - RTL/LTR direction handling
 * - Date/number formatting
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  type SupportedLanguage,
  type TranslationDictionary,
  getTranslations,
  t as translate,
  getTextDirection,
  getLocale,
  formatDate as formatDateUtil,
  formatTime as formatTimeUtil,
  formatNumber as formatNumberUtil,
} from '@/constants/inspection-i18n';

/**
 * Hook result interface
 */
export interface UseInspectionI18nResult {
  /** Current language */
  language: SupportedLanguage;
  /** Set language */
  setLanguage: (lang: SupportedLanguage) => void;
  /** Toggle between Arabic and English */
  toggleLanguage: () => void;
  /** Text direction (rtl/ltr) */
  direction: 'rtl' | 'ltr';
  /** Is RTL */
  isRTL: boolean;
  /** Get translation for key */
  t: (key: keyof TranslationDictionary) => string;
  /** All translations for current language */
  translations: TranslationDictionary;
  /** Format date */
  formatDate: (date: Date | string) => string;
  /** Format time */
  formatTime: (date: Date | string) => string;
  /** Format number */
  formatNumber: (num: number) => string;
  /** Locale string */
  locale: string;
}

/**
 * Storage key for language preference
 */
const LANGUAGE_STORAGE_KEY = 'inspection-language';

/**
 * Get initial language from storage or default
 */
function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'ar'; // Default to Arabic on server
  }
  
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  
  // Check document language
  const docLang = document.documentElement.lang;
  if (docLang?.startsWith('en')) {
    return 'en';
  }
  
  return 'ar'; // Default to Arabic
}

/**
 * useInspectionI18n - Hook for inspection internationalization
 * 
 * @example
 * ```tsx
 * const { t, language, setLanguage, direction } = useInspectionI18n();
 * 
 * return (
 *   <div dir={direction}>
 *     <h1>{t('inspectionReport')}</h1>
 *     <button onClick={() => setLanguage('en')}>English</button>
 *   </div>
 * );
 * ```
 */
export function useInspectionI18n(): UseInspectionI18nResult {
  const [language, setLanguageState] = useState<SupportedLanguage>('ar');
  
  // Initialize language on mount
  useEffect(() => {
    setLanguageState(getInitialLanguage());
  }, []);
  
  // Set language and persist to storage
  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
  }, []);
  
  // Toggle between Arabic and English
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);
  
  // Get direction
  const direction = useMemo(() => getTextDirection(language), [language]);
  
  // Is RTL
  const isRTL = direction === 'rtl';
  
  // Get translation function
  const t = useCallback(
    (key: keyof TranslationDictionary) => translate(key, language),
    [language]
  );
  
  // Get all translations
  const translations = useMemo(() => getTranslations(language), [language]);
  
  // Get locale
  const locale = useMemo(() => getLocale(language), [language]);
  
  // Format date
  const formatDate = useCallback(
    (date: Date | string) => formatDateUtil(date, language),
    [language]
  );
  
  // Format time
  const formatTime = useCallback(
    (date: Date | string) => formatTimeUtil(date, language),
    [language]
  );
  
  // Format number
  const formatNumber = useCallback(
    (num: number) => formatNumberUtil(num, language),
    [language]
  );
  
  return {
    language,
    setLanguage,
    toggleLanguage,
    direction,
    isRTL,
    t,
    translations,
    formatDate,
    formatTime,
    formatNumber,
    locale,
  };
}

/**
 * useInspectionLanguage - Simplified hook for just language state
 */
export function useInspectionLanguage(): [SupportedLanguage, (lang: SupportedLanguage) => void] {
  const { language, setLanguage } = useInspectionI18n();
  return [language, setLanguage];
}

export default useInspectionI18n;
