/**
 * Inspection Internationalization (i18n) Constants
 * ثوابت الترجمة لنظام الفحص
 * 
 * Requirements: 9.1, 9.2, 9.3
 * - Full Arabic interface with RTL layout
 * - Full English interface with LTR layout
 * - All labels, buttons, and messages in both languages
 */

export type SupportedLanguage = 'ar' | 'en';

/**
 * Translation dictionary type
 */
export interface TranslationDictionary {
  // General UI
  loading: string;
  error: string;
  save: string;
  cancel: string;
  delete: string;
  close: string;
  confirm: string;
  back: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  reset: string;
  apply: string;
  edit: string;
  view: string;
  add: string;
  remove: string;
  upload: string;
  download: string;
  print: string;
  share: string;
  preview: string;
  generating: string;
  uploading: string;
  
  // Inspection Section Titles
  inspectionReport: string;
  bodyTypeSection: string;
  exteriorInspection: string;
  mechanicalStatus: string;
  inspectionSummary: string;
  colorLegend: string;
  carDiagram: string;
  
  // Instructions
  clickPartToInspect: string;
  clickPartToViewDetails: string;
  selectBodyType: string;
  selectCondition: string;
  selectSeverity: string;
  
  // Part Damage Form
  recordPartCondition: string;
  condition: string;
  severity: string;
  notes: string;
  notesPlaceholder: string;
  photos: string;
  addPhoto: string;
  removePhoto: string;
  
  // View Angles
  viewAngles: string;
  front: string;
  rear: string;
  leftSide: string;
  rightSide: string;
  top: string;
  
  // Part Conditions
  conditionGood: string;
  conditionScratch: string;
  conditionBodywork: string;
  conditionBroken: string;
  conditionPainted: string;
  conditionReplaced: string;
  conditionNotInspected: string;
  
  // Damage Severities
  severityLight: string;
  severityMedium: string;
  severitySevere: string;
  
  // Car Templates
  templateSedan: string;
  templateSuv: string;
  templateHatchback: string;
  templateCoupe: string;
  templatePickup: string;
  templateVan: string;
  
  // Body Types
  bodyTypeSedan: string;
  bodyTypeHatchback: string;
  bodyTypeCoupe: string;
  bodyTypeSuv: string;
  bodyTypeCrossover: string;
  bodyTypePickup: string;
  bodyTypeVan: string;
  bodyTypeMinivan: string;
  bodyTypeTruck: string;
  
  // Mechanical Status
  engine: string;
  transmission: string;
  chassis: string;
  technicalNotes: string;
  engineOriginal: string;
  engineReplaced: string;
  engineRefurbished: string;
  transmissionOriginal: string;
  transmissionReplaced: string;
  chassisIntact: string;
  chassisAccidentAffected: string;
  chassisModified: string;
  
  // PDF Report
  pdfReportTitle: string;
  pdfPreviewTitle: string;
  vehicleInformation: string;
  customerInformation: string;
  inspectorInformation: string;
  damageTable: string;
  damagePhotos: string;
  includedSections: string;
  paperSize: string;
  reportLanguage: string;
  downloadPdf: string;
  printReport: string;
  previewReport: string;
  
  // Vehicle Info Labels
  brand: string;
  model: string;
  year: string;
  color: string;
  kilometers: string;
  plateNumber: string;
  vin: string;
  
  // Customer Info Labels
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Inspector Info Labels
  inspectorName: string;
  inspectionDate: string;
  inspectionTime: string;
  
  // Summary Labels
  bodyConditionSummary: string;
  totalParts: string;
  damagedParts: string;
  goodParts: string;
  
  // Part Names (abbreviated - full list in PART_LABELS)
  partFrontBumper: string;
  partRearBumper: string;
  partHood: string;
  partRoof: string;
  partTrunk: string;
  
  // Error Messages
  errorLoadingSvg: string;
  errorGeneratingPdf: string;
  errorUploadingPhoto: string;
  errorSavingInspection: string;
  
  // Success Messages
  successSaved: string;
  successUploaded: string;
  successGenerated: string;
  
  // Confirmation Messages
  confirmDelete: string;
  confirmReset: string;
  confirmFinalize: string;
  
  // Status Labels
  statusDraft: string;
  statusFinalized: string;
  statusPending: string;
  
  // Admin Labels
  manageTemplates: string;
  managePartKeys: string;
  manageColorMappings: string;
  addTemplate: string;
  editTemplate: string;
  deleteTemplate: string;
  templateName: string;
  templateType: string;
  uploadSvg: string;
  partMappings: string;
}

/**
 * Arabic translations - الترجمة العربية
 */
export const AR_TRANSLATIONS: TranslationDictionary = {
  // General UI
  loading: 'جاري التحميل...',
  error: 'خطأ',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  close: 'إغلاق',
  confirm: 'تأكيد',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  search: 'بحث',
  filter: 'تصفية',
  reset: 'إعادة تعيين',
  apply: 'تطبيق',
  edit: 'تعديل',
  view: 'عرض',
  add: 'إضافة',
  remove: 'إزالة',
  upload: 'رفع',
  download: 'تحميل',
  print: 'طباعة',
  share: 'مشاركة',
  preview: 'معاينة',
  generating: 'جاري الإنشاء...',
  uploading: 'جاري الرفع...',
  
  // Inspection Section Titles
  inspectionReport: 'تقرير فحص السيارة',
  bodyTypeSection: 'نوع الهيكل',
  exteriorInspection: 'فحص الهيكل الخارجي',
  mechanicalStatus: 'الحالة الميكانيكية',
  inspectionSummary: 'ملخص الفحص',
  colorLegend: 'دليل الألوان',
  carDiagram: 'مخطط السيارة',
  
  // Instructions
  clickPartToInspect: 'انقر على أي جزء من السيارة لتحديد حالته',
  clickPartToViewDetails: 'انقر على أي جزء لعرض تفاصيل حالته',
  selectBodyType: 'اختر نوع الهيكل',
  selectCondition: 'اختر الحالة',
  selectSeverity: 'اختر الشدة',
  
  // Part Damage Form
  recordPartCondition: 'تسجيل حالة الجزء',
  condition: 'الحالة',
  severity: 'الشدة',
  notes: 'ملاحظات',
  notesPlaceholder: 'أضف ملاحظات إضافية...',
  photos: 'الصور',
  addPhoto: 'إضافة صورة',
  removePhoto: 'إزالة الصورة',
  
  // View Angles
  viewAngles: 'زوايا العرض',
  front: 'أمام',
  rear: 'خلف',
  leftSide: 'الجانب الأيسر',
  rightSide: 'الجانب الأيمن',
  top: 'أعلى',
  
  // Part Conditions
  conditionGood: 'سليم',
  conditionScratch: 'خدش',
  conditionBodywork: 'سمكرة',
  conditionBroken: 'كسر',
  conditionPainted: 'رش',
  conditionReplaced: 'تغيير',
  conditionNotInspected: 'غير محدد',
  
  // Damage Severities
  severityLight: 'خفيف',
  severityMedium: 'متوسط',
  severitySevere: 'شديد',
  
  // Car Templates
  templateSedan: 'سيدان',
  templateSuv: 'SUV',
  templateHatchback: 'هاتشباك',
  templateCoupe: 'كوبيه',
  templatePickup: 'بيك أب',
  templateVan: 'فان',
  
  // Body Types
  bodyTypeSedan: 'سيدان',
  bodyTypeHatchback: 'هاتشباك',
  bodyTypeCoupe: 'كوبيه',
  bodyTypeSuv: 'SUV',
  bodyTypeCrossover: 'كروس أوفر',
  bodyTypePickup: 'بيك أب',
  bodyTypeVan: 'فان',
  bodyTypeMinivan: 'ميني فان',
  bodyTypeTruck: 'شاحنة',
  
  // Mechanical Status
  engine: 'المكينة',
  transmission: 'القير',
  chassis: 'الشاصي',
  technicalNotes: 'ملاحظات فنية',
  engineOriginal: 'أصلية',
  engineReplaced: 'تم تغييرها',
  engineRefurbished: 'مجددة',
  transmissionOriginal: 'أصلي',
  transmissionReplaced: 'تم تغييره',
  chassisIntact: 'سليم',
  chassisAccidentAffected: 'متأثر بحادث',
  chassisModified: 'معدل',
  
  // PDF Report
  pdfReportTitle: 'تقرير فحص السيارة',
  pdfPreviewTitle: 'معاينة تقرير الفحص',
  vehicleInformation: 'معلومات السيارة',
  customerInformation: 'معلومات العميل',
  inspectorInformation: 'معلومات الفاحص',
  damageTable: 'جدول الأضرار',
  damagePhotos: 'صور الأضرار',
  includedSections: 'الأقسام المضمنة',
  paperSize: 'حجم الورق',
  reportLanguage: 'لغة التقرير',
  downloadPdf: 'تحميل PDF',
  printReport: 'طباعة',
  previewReport: 'معاينة التقرير',
  
  // Vehicle Info Labels
  brand: 'الماركة',
  model: 'الموديل',
  year: 'السنة',
  color: 'اللون',
  kilometers: 'الكيلومترات',
  plateNumber: 'رقم اللوحة',
  vin: 'رقم الهيكل',
  
  // Customer Info Labels
  customerName: 'اسم العميل',
  customerPhone: 'رقم الهاتف',
  customerEmail: 'البريد الإلكتروني',
  
  // Inspector Info Labels
  inspectorName: 'اسم الفاحص',
  inspectionDate: 'تاريخ الفحص',
  inspectionTime: 'وقت الفحص',
  
  // Summary Labels
  bodyConditionSummary: 'ملخص حالة الهيكل',
  totalParts: 'إجمالي الأجزاء',
  damagedParts: 'الأجزاء المتضررة',
  goodParts: 'الأجزاء السليمة',
  
  // Part Names
  partFrontBumper: 'الصدام الأمامي',
  partRearBumper: 'الصدام الخلفي',
  partHood: 'الكبوت',
  partRoof: 'السقف',
  partTrunk: 'الشنطة',
  
  // Error Messages
  errorLoadingSvg: 'فشل تحميل الرسم',
  errorGeneratingPdf: 'فشل إنشاء التقرير',
  errorUploadingPhoto: 'فشل رفع الصورة',
  errorSavingInspection: 'فشل حفظ الفحص',
  
  // Success Messages
  successSaved: 'تم الحفظ بنجاح',
  successUploaded: 'تم الرفع بنجاح',
  successGenerated: 'تم الإنشاء بنجاح',
  
  // Confirmation Messages
  confirmDelete: 'هل أنت متأكد من الحذف؟',
  confirmReset: 'هل أنت متأكد من إعادة التعيين؟',
  confirmFinalize: 'هل أنت متأكد من اعتماد الفحص؟ لن تتمكن من التعديل بعد ذلك.',
  
  // Status Labels
  statusDraft: 'مسودة',
  statusFinalized: 'معتمد',
  statusPending: 'قيد الانتظار',
  
  // Admin Labels
  manageTemplates: 'إدارة القوالب',
  managePartKeys: 'إدارة الأجزاء',
  manageColorMappings: 'إدارة الألوان',
  addTemplate: 'إضافة قالب',
  editTemplate: 'تعديل القالب',
  deleteTemplate: 'حذف القالب',
  templateName: 'اسم القالب',
  templateType: 'نوع القالب',
  uploadSvg: 'رفع ملف SVG',
  partMappings: 'ربط الأجزاء',
};

/**
 * English translations
 */
export const EN_TRANSLATIONS: TranslationDictionary = {
  // General UI
  loading: 'Loading...',
  error: 'Error',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  close: 'Close',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  search: 'Search',
  filter: 'Filter',
  reset: 'Reset',
  apply: 'Apply',
  edit: 'Edit',
  view: 'View',
  add: 'Add',
  remove: 'Remove',
  upload: 'Upload',
  download: 'Download',
  print: 'Print',
  share: 'Share',
  preview: 'Preview',
  generating: 'Generating...',
  uploading: 'Uploading...',
  
  // Inspection Section Titles
  inspectionReport: 'Car Inspection Report',
  bodyTypeSection: 'Body Type',
  exteriorInspection: 'Exterior Body Inspection',
  mechanicalStatus: 'Mechanical Status',
  inspectionSummary: 'Inspection Summary',
  colorLegend: 'Color Legend',
  carDiagram: 'Car Diagram',
  
  // Instructions
  clickPartToInspect: 'Click on any part of the car to set its condition',
  clickPartToViewDetails: 'Click on any part to view its condition details',
  selectBodyType: 'Select body type',
  selectCondition: 'Select condition',
  selectSeverity: 'Select severity',
  
  // Part Damage Form
  recordPartCondition: 'Record Part Condition',
  condition: 'Condition',
  severity: 'Severity',
  notes: 'Notes',
  notesPlaceholder: 'Add additional notes...',
  photos: 'Photos',
  addPhoto: 'Add Photo',
  removePhoto: 'Remove Photo',
  
  // View Angles
  viewAngles: 'View Angles',
  front: 'Front',
  rear: 'Rear',
  leftSide: 'Left Side',
  rightSide: 'Right Side',
  top: 'Top',
  
  // Part Conditions
  conditionGood: 'Good',
  conditionScratch: 'Scratch',
  conditionBodywork: 'Bodywork',
  conditionBroken: 'Broken',
  conditionPainted: 'Painted',
  conditionReplaced: 'Replaced',
  conditionNotInspected: 'Not Inspected',
  
  // Damage Severities
  severityLight: 'Light',
  severityMedium: 'Medium',
  severitySevere: 'Severe',
  
  // Car Templates
  templateSedan: 'Sedan',
  templateSuv: 'SUV',
  templateHatchback: 'Hatchback',
  templateCoupe: 'Coupe',
  templatePickup: 'Pickup',
  templateVan: 'Van',
  
  // Body Types
  bodyTypeSedan: 'Sedan',
  bodyTypeHatchback: 'Hatchback',
  bodyTypeCoupe: 'Coupe',
  bodyTypeSuv: 'SUV',
  bodyTypeCrossover: 'Crossover',
  bodyTypePickup: 'Pickup',
  bodyTypeVan: 'Van',
  bodyTypeMinivan: 'Minivan',
  bodyTypeTruck: 'Truck',
  
  // Mechanical Status
  engine: 'Engine',
  transmission: 'Transmission',
  chassis: 'Chassis',
  technicalNotes: 'Technical Notes',
  engineOriginal: 'Original',
  engineReplaced: 'Replaced',
  engineRefurbished: 'Refurbished',
  transmissionOriginal: 'Original',
  transmissionReplaced: 'Replaced',
  chassisIntact: 'Intact',
  chassisAccidentAffected: 'Accident Affected',
  chassisModified: 'Modified',
  
  // PDF Report
  pdfReportTitle: 'Car Inspection Report',
  pdfPreviewTitle: 'Inspection Report Preview',
  vehicleInformation: 'Vehicle Information',
  customerInformation: 'Customer Information',
  inspectorInformation: 'Inspector Information',
  damageTable: 'Damage Table',
  damagePhotos: 'Damage Photos',
  includedSections: 'Included Sections',
  paperSize: 'Paper Size',
  reportLanguage: 'Report Language',
  downloadPdf: 'Download PDF',
  printReport: 'Print',
  previewReport: 'Preview Report',
  
  // Vehicle Info Labels
  brand: 'Brand',
  model: 'Model',
  year: 'Year',
  color: 'Color',
  kilometers: 'Kilometers',
  plateNumber: 'Plate Number',
  vin: 'VIN',
  
  // Customer Info Labels
  customerName: 'Customer Name',
  customerPhone: 'Phone Number',
  customerEmail: 'Email',
  
  // Inspector Info Labels
  inspectorName: 'Inspector Name',
  inspectionDate: 'Inspection Date',
  inspectionTime: 'Inspection Time',
  
  // Summary Labels
  bodyConditionSummary: 'Body Condition Summary',
  totalParts: 'Total Parts',
  damagedParts: 'Damaged Parts',
  goodParts: 'Good Parts',
  
  // Part Names
  partFrontBumper: 'Front Bumper',
  partRearBumper: 'Rear Bumper',
  partHood: 'Hood',
  partRoof: 'Roof',
  partTrunk: 'Trunk',
  
  // Error Messages
  errorLoadingSvg: 'Failed to load diagram',
  errorGeneratingPdf: 'Failed to generate report',
  errorUploadingPhoto: 'Failed to upload photo',
  errorSavingInspection: 'Failed to save inspection',
  
  // Success Messages
  successSaved: 'Saved successfully',
  successUploaded: 'Uploaded successfully',
  successGenerated: 'Generated successfully',
  
  // Confirmation Messages
  confirmDelete: 'Are you sure you want to delete?',
  confirmReset: 'Are you sure you want to reset?',
  confirmFinalize: 'Are you sure you want to finalize? You won\'t be able to edit after this.',
  
  // Status Labels
  statusDraft: 'Draft',
  statusFinalized: 'Finalized',
  statusPending: 'Pending',
  
  // Admin Labels
  manageTemplates: 'Manage Templates',
  managePartKeys: 'Manage Parts',
  manageColorMappings: 'Manage Colors',
  addTemplate: 'Add Template',
  editTemplate: 'Edit Template',
  deleteTemplate: 'Delete Template',
  templateName: 'Template Name',
  templateType: 'Template Type',
  uploadSvg: 'Upload SVG File',
  partMappings: 'Part Mappings',
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: SupportedLanguage): TranslationDictionary {
  return language === 'ar' ? AR_TRANSLATIONS : EN_TRANSLATIONS;
}

/**
 * Get a specific translation key
 */
export function t(key: keyof TranslationDictionary, language: SupportedLanguage = 'ar'): string {
  const translations = getTranslations(language);
  return translations[key] || key;
}

/**
 * Get text direction for language
 */
export function getTextDirection(language: SupportedLanguage): 'rtl' | 'ltr' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Get locale for date/number formatting
 */
export function getLocale(language: SupportedLanguage): string {
  return language === 'ar' ? 'ar-SA' : 'en-US';
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, language: SupportedLanguage): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string, language: SupportedLanguage): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number for display
 */
export function formatNumber(num: number, language: SupportedLanguage): string {
  return num.toLocaleString(getLocale(language));
}

export default {
  AR_TRANSLATIONS,
  EN_TRANSLATIONS,
  getTranslations,
  t,
  getTextDirection,
  getLocale,
  formatDate,
  formatTime,
  formatNumber,
};
