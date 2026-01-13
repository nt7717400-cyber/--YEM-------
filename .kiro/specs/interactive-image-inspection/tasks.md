# Implementation Plan: نظام فحص المركبات التفاعلي (VDS)

## Overview

خطة تنفيذ شاملة لنظام فحص المركبات ثنائي الأبعاد. يتم التنفيذ بشكل تدريجي بدءاً من إزالة النظام القديم، ثم إنشاء قاعدة البيانات، ثم المكونات المشتركة، ثم الواجهات.

## Tasks

- [x] 1. إزالة نظام الفحص ثلاثي الأبعاد
  - [x] 1.1 إزالة مكونات Three.js من Frontend
    - حذف `frontend/src/components/admin/inspection/Car3DViewer.tsx`
    - حذف `frontend/src/components/admin/inspection/RealisticCarModel.tsx`
    - حذف `frontend/src/components/admin/inspection/EnvironmentSetup.tsx`
    - حذف `frontend/src/components/admin/inspection/LightingSystem.tsx`
    - حذف `frontend/src/components/admin/inspection/ShadowSystem.tsx`
    - حذف `frontend/src/components/admin/inspection/QualitySelector.tsx`
    - _Requirements: 11.1, 11.2_

  - [x] 1.2 إزالة مكتبات Three.js
    - إزالة `three`, `@react-three/fiber`, `@react-three/drei` من package.json
    - حذف ملفات `frontend/src/lib/modelLoader.ts`, `materialPresets.ts`, `carGeometries.ts`
    - حذف مجلد `frontend/public/models/`
    - _Requirements: 11.2_

  - [x] 1.3 تحديث المكونات المتأثرة
    - تحديث `frontend/src/components/admin/inspection/index.ts`
    - تحديث `frontend/src/components/admin/inspection/InspectionSection.tsx` (مؤقتاً)
    - تحديث `frontend/src/components/cars/InspectionViewer.tsx` (مؤقتاً)
    - _Requirements: 11.4_

- [x] 2. إنشاء قاعدة البيانات الجديدة
  - [x] 2.1 إنشاء جداول VDS
    - إنشاء `api/database/migration_vds.sql`
    - جدول `car_templates` للقوالب
    - جدول `part_keys` لقاموس الأجزاء
    - جدول `template_part_mappings` لربط الأجزاء بالقوالب
    - جدول `color_mappings` لخريطة الألوان
    - _Requirements: 5.1, 6.1, 4.1_

  - [x] 2.2 تحديث جدول الفحص
    - تحديث `inspections` table مع الحقول الجديدة
    - إنشاء `inspection_parts` للأضرار
    - إنشاء `inspection_part_photos` للصور
    - _Requirements: 8.1_

  - [x] 2.3 إدخال البيانات الافتراضية
    - إدخال Part Keys الافتراضية (25 جزء)
    - إدخال Color Mappings الافتراضية (7 ألوان)
    - _Requirements: 5.1, 4.1_

- [x] 3. إنشاء API Endpoints
  - [x] 3.1 إنشاء Templates API
    - `GET /api/templates` - قائمة القوالب
    - `GET /api/templates/{id}` - تفاصيل قالب
    - `POST /api/templates` - إنشاء قالب جديد
    - `PUT /api/templates/{id}` - تحديث قالب
    - `DELETE /api/templates/{id}` - حذف قالب
    - إنشاء `api/controllers/TemplatesController.php`
    - _Requirements: 6.1, 14.1_

  - [x] 3.2 إنشاء Part Keys API
    - `GET /api/part-keys` - قائمة الأجزاء
    - `POST /api/part-keys` - إضافة جزء جديد
    - `PUT /api/part-keys/{key}` - تحديث جزء
    - إنشاء `api/controllers/PartKeysController.php`
    - _Requirements: 5.1, 13.3_

  - [x] 3.3 إنشاء Color Mappings API
    - `GET /api/color-mappings` - قائمة الألوان
    - `PUT /api/color-mappings` - تحديث الألوان
    - إنشاء `api/controllers/ColorMappingsController.php`
    - _Requirements: 4.1, 13.4_

  - [x] 3.4 تحديث Inspections API
    - تحديث `GET /api/inspections` مع البيانات الجديدة
    - تحديث `POST /api/inspections` للهيكل الجديد
    - إضافة `POST /api/inspections/{id}/finalize`
    - إضافة `POST /api/inspections/{id}/parts/{partKey}/photos`
    - تحديث `api/controllers/InspectionsController.php`
    - _Requirements: 8.1, 8.3, 8.4_

- [x] 4. Checkpoint - قاعدة البيانات و API
  - تشغيل migration
  - اختبار جميع endpoints
  - التأكد من عمل CRUD للقوالب والأجزاء

- [x] 5. إنشاء رسومات SVG للقوالب
  - [x] 5.1 إنشاء SVG لقالب Sedan
    - إنشاء `frontend/public/svg/templates/sedan/front.svg`
    - إنشاء `frontend/public/svg/templates/sedan/rear.svg`
    - إنشاء `frontend/public/svg/templates/sedan/left_side.svg`
    - إنشاء `frontend/public/svg/templates/sedan/right_side.svg`
    - كل path يحمل ID مطابق لـ Part_Key
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 5.2 إنشاء SVG لقالب SUV
    - نفس الملفات لـ SUV مع تعديل الشكل
    - _Requirements: 6.1_

  - [x] 5.3 إنشاء SVG لقالب Pickup
    - نفس الملفات لـ Pickup (بدون trunk)
    - _Requirements: 6.1, 6.3_

- [x] 6. إنشاء مكون SVG Viewer للويب
  - [x] 6.1 إنشاء SVGInspectionViewer Component
    - إنشاء `frontend/src/components/inspection/SVGInspectionViewer.tsx`
    - تحميل SVG حسب القالب والزاوية
    - تطبيق الألوان على الأجزاء
    - دعم hover effects
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 6.2 إنشاء ViewAngleTabs Component
    - إنشاء `frontend/src/components/inspection/ViewAngleTabs.tsx`
    - تبويبات للتنقل بين الزوايا (أمام، خلف، يسار، يمين)
    - _Requirements: 1.1, 1.6_

  - [x] 6.3 إنشاء PartDamageForm Component
    - إنشاء `frontend/src/components/inspection/PartDamageForm.tsx`
    - نموذج إدخال الحالة والشدة والملاحظات
    - دعم رفع الصور
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 6.4 إنشاء ColorLegend Component
    - إنشاء `frontend/src/components/inspection/ColorLegend.tsx`
    - عرض دليل الألوان
    - _Requirements: 4.2_

  - [x] 6.5 كتابة Property Test لـ Color Mapping

    - **Property 3: Color Mapping Consistency**
    - **Validates: Requirements 2.4, 3.2, 4.1**

- [x] 7. تحديث InspectionSection للويب
  - [x] 7.1 إعادة بناء InspectionSection
    - تحديث `frontend/src/components/admin/inspection/InspectionSection.tsx`
    - استخدام SVGInspectionViewer بدلاً من Car3DViewer
    - دمج ViewAngleTabs و PartDamageForm
    - _Requirements: 2.3, 3.1_

  - [x] 7.2 تحديث InspectionViewer للعملاء
    - تحديث `frontend/src/components/cars/InspectionViewer.tsx`
    - وضع القراءة فقط مع عرض التفاصيل
    - _Requirements: 15.1, 15.3, 15.5_

  - [x] 7.3 كتابة Property Test لـ Part Status Persistence

    - **Property 2: Part Status Persistence Across Views**
    - **Validates: Requirements 1.2**

- [x] 8. Checkpoint - مكونات الويب
  - اختبار SVG Viewer مع جميع القوالب
  - اختبار تغيير الألوان
  - اختبار نموذج الإدخال

- [x] 9. إنشاء لوحة التحكم الإدارية
  - [x] 9.1 إنشاء صفحة إدارة القوالب
    - إنشاء `frontend/src/app/admin/templates/page.tsx`
    - عرض قائمة القوالب
    - إضافة/تعديل/حذف القوالب
    - _Requirements: 13.2, 14.1_

  - [x] 9.2 إنشاء محرر القوالب
    - إنشاء `frontend/src/app/admin/templates/[id]/edit/page.tsx`
    - رفع ملفات SVG
    - ربط الأجزاء بـ paths
    - معاينة القالب
    - _Requirements: 14.2, 14.3_

  - [x] 9.3 إنشاء صفحة إدارة الأجزاء
    - إنشاء `frontend/src/app/admin/part-keys/page.tsx`
    - عرض وتعديل قاموس الأجزاء
    - _Requirements: 13.3_

  - [x] 9.4 إنشاء صفحة إدارة الألوان
    - إنشاء `frontend/src/app/admin/color-mappings/page.tsx`
    - تعديل ألوان الحالات
    - معاينة الألوان
    - _Requirements: 13.4_

  - [x] 9.5 كتابة Property Test لـ Template Validation

    - **Property 9: Template CRUD Validation**
    - **Validates: Requirements 14.1, 14.2**

- [x] 10. إنشاء مولد PDF
  - [x] 10.1 إنشاء PDF Generator للويب
    - إنشاء `frontend/src/lib/pdfGenerator.ts`
    - استخدام مكتبة `@react-pdf/renderer` أو `jspdf`
    - تصميم صفحات التقرير
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 10.2 إنشاء PDF Preview Component
    - إنشاء `frontend/src/components/inspection/PDFPreview.tsx`
    - معاينة التقرير قبل التحميل
    - خيارات التخصيص
    - _Requirements: 16.3_

  - [x] 10.3 إنشاء PDF Download/Print
    - زر تحميل PDF
    - زر طباعة مباشرة
    - _Requirements: 16.4_

  - [x] 10.4 كتابة Property Test لـ PDF Content

    - **Property 8: PDF Report Content Completeness**
    - **Validates: Requirements 7.1, 16.1**

- [x] 11. Checkpoint - الويب مكتمل
  - اختبار سير العمل الكامل
  - اختبار لوحة التحكم
  - اختبار توليد PDF

- [x] 12. تطوير Flutter - الأنواع والثوابت
  - [x] 12.1 إنشاء Types و Constants
    - إنشاء `mobile/lib/models/inspection.dart`
    - إنشاء `mobile/lib/constants/inspection_constants.dart`
    - تعريف Part_Keys, Conditions, Severities
    - _Requirements: 5.1, 4.1_

  - [x] 12.2 إنشاء API Client للفحص
    - تحديث `mobile/lib/core/api/api_endpoints.dart`
    - إنشاء `mobile/lib/repositories/inspection_repository.dart`
    - _Requirements: 8.4_

  - [x] 12.3 كتابة Property Test لـ Data Schema

    - **Property 6: Inspection Data Schema Validation**
    - **Validates: Requirements 8.1, 8.2**

- [x] 13. تطوير Flutter - SVG Viewer
  - [x] 13.1 إنشاء SVGInspectionViewer Widget
    - إنشاء `mobile/lib/widgets/inspection/svg_inspection_viewer.dart`
    - استخدام `flutter_svg` package
    - تحميل SVG من assets أو network
    - _Requirements: 4.1, 4.2_

  - [x] 13.2 إنشاء InteractiveSVG Widget
    - إنشاء `mobile/lib/widgets/inspection/interactive_svg.dart`
    - دعم tap على الأجزاء
    - تطبيق الألوان
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 13.3 إنشاء ViewAngleSelector Widget
    - إنشاء `mobile/lib/widgets/inspection/view_angle_selector.dart`
    - تبويبات الزوايا
    - _Requirements: 1.1_

  - [x] 13.4 دعم Zoom و Pan
    - إضافة `InteractiveViewer` wrapper
    - دعم pinch-to-zoom
    - _Requirements: 8.2, 8.3, 10.5_

- [x] 14. تطوير Flutter - شاشات الفحص
  - [x] 14.1 إنشاء شاشة عرض الفحص للعميل
    - إنشاء `mobile/lib/screens/inspection/inspection_view_screen.dart`
    - عرض SVG مع الألوان
    - عرض تفاصيل الأجزاء عند النقر
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 14.2 إنشاء PartDetailsBottomSheet
    - إنشاء `mobile/lib/widgets/inspection/part_details_sheet.dart`
    - عرض اسم الجزء والحالة والملاحظات والصور
    - _Requirements: 15.3_

  - [x] 14.3 إنشاء ColorLegend Widget
    - إنشاء `mobile/lib/widgets/inspection/color_legend.dart`
    - دليل الألوان
    - _Requirements: 4.2_

- [x] 15. تطوير Flutter - PDF Generation
  - [x] 15.1 إنشاء PDF Generator
    - إنشاء `mobile/lib/services/pdf_generator.dart`
    - استخدام `pdf` و `printing` packages
    - نفس تصميم الويب
    - _Requirements: 7.1, 7.4_

  - [x] 15.2 إنشاء PDF Preview Screen
    - إنشاء `mobile/lib/screens/inspection/pdf_preview_screen.dart`
    - معاينة وطباعة ومشاركة
    - _Requirements: 16.3, 16.4_

- [x] 16. Checkpoint - Flutter مكتمل
  - اختبار على Android Emulator
  - اختبار عرض الفحص
  - اختبار توليد PDF

- [x] 17. دعم اللغات
  - [x] 17.1 تحديث ترجمات الويب
    - إضافة strings للفحص في الويب
    - دعم RTL
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 17.2 تحديث ترجمات Flutter
    - إضافة strings للفحص في Flutter
    - دعم RTL
    - _Requirements: 9.1, 9.2_

  - [x] 17.3 كتابة Property Test لـ Bilingual Labels

    - **Property 10: Bilingual Label Availability**
    - **Validates: Requirements 5.4, 9.1, 9.5**

- [x] 18. اختبارات التكامل
  - [x] 18.1 اختبار سير العمل الكامل
    - إنشاء فحص جديد
    - تسجيل أضرار
    - اعتماد الفحص
    - توليد PDF
    - _Requirements: 17.1-17.5_

  - [x] 18.2 كتابة Property Test لـ Finalized Immutability

    - **Property 7: Finalized Inspection Immutability**
    - **Validates: Requirements 8.3**

- [x] 19. Checkpoint النهائي
  - اختبار شامل على الويب
  - اختبار شامل على Flutter
  - مراجعة الأداء
  - التأكد من تطابق المخرجات

## Notes

- المهام المعلمة بـ `*` اختيارية (اختبارات Property)
- يجب الحفاظ على التوافق مع بيانات الفحص القديمة
- ملفات SVG يجب أن تكون أقل من 50KB لكل ملف
- PDF يجب أن يدعم العربية بشكل صحيح (RTL)
- استخدام نفس Color Mapping في Flutter والويب

## Dependencies

### Web (Frontend)
- `@react-pdf/renderer` أو `jspdf` + `html2canvas` لتوليد PDF
- `react-zoom-pan-pinch` للتكبير والتحريك

### Flutter (Mobile)
- `flutter_svg: ^2.0.0` لعرض SVG
- `pdf: ^3.10.0` لتوليد PDF
- `printing: ^5.11.0` للطباعة والمشاركة

