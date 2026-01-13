/**
 * Inspection Components Index
 * Export all VDS inspection-related components
 * Requirements: 9.1, 9.2, 9.3 - Bilingual support
 */

export { SVGInspectionViewer } from './SVGInspectionViewer';
export { ViewAngleTabs } from './ViewAngleTabs';
export { PartDamageForm } from './PartDamageForm';
export { ColorLegend } from './ColorLegend';
export { PDFPreview } from './PDFPreview';
export { LanguageSwitcher } from './LanguageSwitcher';

// Re-export types
export type {
  SVGInspectionViewerProps,
  ViewAngleTabsProps,
  PartDamageFormProps,
  ColorLegendProps,
  ViewAngle,
  CarTemplate,
  PartCondition,
  DamageSeverity,
  PartKey,
  PartDamageData,
  PartLabel,
  ColorMappingEntry,
} from '@/types/vds';

export type { PDFPreviewProps } from './PDFPreview';
export type { LanguageSwitcherProps } from './LanguageSwitcher';

// Re-export i18n utilities
export {
  type SupportedLanguage,
  type TranslationDictionary,
  getTranslations,
  t,
  getTextDirection,
  getLocale,
  formatDate,
  formatTime,
  formatNumber,
  AR_TRANSLATIONS,
  EN_TRANSLATIONS,
} from '@/constants/inspection-i18n';
