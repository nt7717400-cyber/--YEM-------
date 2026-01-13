// Inspection Internationalization (i18n) Constants for Flutter
// Requirements: 9.1, 9.2, 9.3
// - Full Arabic interface with RTL layout
// - Full English interface with LTR layout
// - All labels, buttons, and messages in both languages

import 'package:flutter/material.dart';

/// Supported languages
enum SupportedLanguage {
  ar('ar', 'العربية', TextDirection.rtl),
  en('en', 'English', TextDirection.ltr);

  final String code;
  final String displayName;
  final TextDirection direction;

  const SupportedLanguage(this.code, this.displayName, this.direction);

  static SupportedLanguage fromCode(String code) {
    return SupportedLanguage.values.firstWhere(
      (e) => e.code == code,
      orElse: () => SupportedLanguage.ar,
    );
  }

  bool get isRTL => direction == TextDirection.rtl;
}

/// Translation dictionary class
class InspectionTranslations {
  // General UI
  final String loading;
  final String error;
  final String save;
  final String cancel;
  final String delete;
  final String close;
  final String confirm;
  final String back;
  final String next;
  final String previous;
  final String search;
  final String filter;
  final String reset;
  final String apply;
  final String edit;
  final String view;
  final String add;
  final String remove;
  final String upload;
  final String download;
  final String print;
  final String share;
  final String preview;
  final String generating;
  final String uploading;

  // Inspection Section Titles
  final String inspectionReport;
  final String bodyTypeSection;
  final String exteriorInspection;
  final String mechanicalStatus;
  final String inspectionSummary;
  final String colorLegend;
  final String carDiagram;

  // Instructions
  final String clickPartToInspect;
  final String clickPartToViewDetails;
  final String selectBodyType;
  final String selectCondition;
  final String selectSeverity;

  // Part Damage Form
  final String recordPartCondition;
  final String condition;
  final String severity;
  final String notes;
  final String notesPlaceholder;
  final String photos;
  final String addPhoto;
  final String removePhoto;

  // View Angles
  final String viewAngles;
  final String front;
  final String rear;
  final String leftSide;
  final String rightSide;
  final String top;

  // PDF Report
  final String pdfReportTitle;
  final String pdfPreviewTitle;
  final String vehicleInformation;
  final String customerInformation;
  final String inspectorInformation;
  final String damageTable;
  final String damagePhotos;
  final String includedSections;
  final String paperSize;
  final String reportLanguage;
  final String downloadPdf;
  final String printReport;
  final String previewReport;

  // Vehicle Info Labels
  final String brand;
  final String model;
  final String year;
  final String color;
  final String kilometers;
  final String plateNumber;
  final String vin;

  // Customer Info Labels
  final String customerName;
  final String customerPhone;
  final String customerEmail;

  // Inspector Info Labels
  final String inspectorName;
  final String inspectionDate;
  final String inspectionTime;

  // Summary Labels
  final String bodyConditionSummary;
  final String totalParts;
  final String damagedParts;
  final String goodParts;

  // Mechanical Status
  final String engine;
  final String transmission;
  final String chassis;
  final String technicalNotes;

  // Error Messages
  final String errorLoadingSvg;
  final String errorGeneratingPdf;
  final String errorUploadingPhoto;
  final String errorSavingInspection;

  // Success Messages
  final String successSaved;
  final String successUploaded;
  final String successGenerated;

  // Confirmation Messages
  final String confirmDelete;
  final String confirmReset;
  final String confirmFinalize;

  // Status Labels
  final String statusDraft;
  final String statusFinalized;
  final String statusPending;

  const InspectionTranslations({
    required this.loading,
    required this.error,
    required this.save,
    required this.cancel,
    required this.delete,
    required this.close,
    required this.confirm,
    required this.back,
    required this.next,
    required this.previous,
    required this.search,
    required this.filter,
    required this.reset,
    required this.apply,
    required this.edit,
    required this.view,
    required this.add,
    required this.remove,
    required this.upload,
    required this.download,
    required this.print,
    required this.share,
    required this.preview,
    required this.generating,
    required this.uploading,
    required this.inspectionReport,
    required this.bodyTypeSection,
    required this.exteriorInspection,
    required this.mechanicalStatus,
    required this.inspectionSummary,
    required this.colorLegend,
    required this.carDiagram,
    required this.clickPartToInspect,
    required this.clickPartToViewDetails,
    required this.selectBodyType,
    required this.selectCondition,
    required this.selectSeverity,
    required this.recordPartCondition,
    required this.condition,
    required this.severity,
    required this.notes,
    required this.notesPlaceholder,
    required this.photos,
    required this.addPhoto,
    required this.removePhoto,
    required this.viewAngles,
    required this.front,
    required this.rear,
    required this.leftSide,
    required this.rightSide,
    required this.top,
    required this.pdfReportTitle,
    required this.pdfPreviewTitle,
    required this.vehicleInformation,
    required this.customerInformation,
    required this.inspectorInformation,
    required this.damageTable,
    required this.damagePhotos,
    required this.includedSections,
    required this.paperSize,
    required this.reportLanguage,
    required this.downloadPdf,
    required this.printReport,
    required this.previewReport,
    required this.brand,
    required this.model,
    required this.year,
    required this.color,
    required this.kilometers,
    required this.plateNumber,
    required this.vin,
    required this.customerName,
    required this.customerPhone,
    required this.customerEmail,
    required this.inspectorName,
    required this.inspectionDate,
    required this.inspectionTime,
    required this.bodyConditionSummary,
    required this.totalParts,
    required this.damagedParts,
    required this.goodParts,
    required this.engine,
    required this.transmission,
    required this.chassis,
    required this.technicalNotes,
    required this.errorLoadingSvg,
    required this.errorGeneratingPdf,
    required this.errorUploadingPhoto,
    required this.errorSavingInspection,
    required this.successSaved,
    required this.successUploaded,
    required this.successGenerated,
    required this.confirmDelete,
    required this.confirmReset,
    required this.confirmFinalize,
    required this.statusDraft,
    required this.statusFinalized,
    required this.statusPending,
  });
}


/// Arabic translations - الترجمة العربية
const arTranslations = InspectionTranslations(
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

  // Mechanical Status
  engine: 'المكينة',
  transmission: 'القير',
  chassis: 'الشاصي',
  technicalNotes: 'ملاحظات فنية',

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
);

/// English translations
const enTranslations = InspectionTranslations(
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

  // Mechanical Status
  engine: 'Engine',
  transmission: 'Transmission',
  chassis: 'Chassis',
  technicalNotes: 'Technical Notes',

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
);

/// Get translations for a specific language
InspectionTranslations getTranslations(SupportedLanguage language) {
  return language == SupportedLanguage.ar ? arTranslations : enTranslations;
}

/// Get translations by language code
InspectionTranslations getTranslationsByCode(String languageCode) {
  return languageCode == 'ar' ? arTranslations : enTranslations;
}

/// Get text direction for language
TextDirection getTextDirection(SupportedLanguage language) {
  return language.direction;
}

/// Get text direction by language code
TextDirection getTextDirectionByCode(String languageCode) {
  return languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;
}

/// Get locale for date/number formatting
Locale getLocale(SupportedLanguage language) {
  return language == SupportedLanguage.ar
      ? const Locale('ar', 'SA')
      : const Locale('en', 'US');
}

/// Get locale by language code
Locale getLocaleByCode(String languageCode) {
  return languageCode == 'ar'
      ? const Locale('ar', 'SA')
      : const Locale('en', 'US');
}
