# Implementation Plan: نظام فحص السيارات المستعملة بمجسم ثلاثي الأبعاد

## Overview

خطة تنفيذ نظام الفحص البصري التفاعلي للسيارات المستعملة. يتم التنفيذ على مراحل تبدأ بقاعدة البيانات ثم الـ API ثم الواجهة الأمامية.

## Tasks

- [x] 1. تحديث قاعدة البيانات
  - [x] 1.1 إضافة عمود body_type لجدول cars
    - تنفيذ ALTER TABLE لإضافة العمود
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 إنشاء جدول car_inspection
    - إنشاء الجدول مع الأعمدة: engine_status, transmission_status, chassis_status, technical_notes
    - إضافة FOREIGN KEY مع CASCADE DELETE
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 6.5_
  - [x] 1.3 إنشاء جدول car_body_parts
    - إنشاء الجدول مع الأعمدة: car_id, part_id, status
    - إضافة UNIQUE constraint على (car_id, part_id)
    - إضافة FOREIGN KEY مع CASCADE DELETE
    - _Requirements: 3.1, 3.2, 4.2, 6.5_

- [x] 2. إنشاء API للفحص
  - [x] 2.1 إنشاء InspectionController.php
    - إنشاء الملف مع constructor يستقبل $db
    - _Requirements: 6.1_
  - [x] 2.2 تنفيذ getInspection($carId)
    - جلب بيانات الفحص من car_inspection و car_body_parts
    - تنسيق البيانات للـ JSON response
    - _Requirements: 6.2_
  - [x] 2.3 تنفيذ saveInspection($carId, $data)
    - حفظ/تحديث بيانات الفحص
    - استخدام transaction للحفاظ على تكامل البيانات
    - _Requirements: 6.1, 6.3_
  - [x] 2.4 تنفيذ validateInspection($data)
    - التحقق من صحة body_type
    - التحقق من صحة part statuses
    - التحقق من صحة mechanical statuses
    - _Requirements: 6.4_
  - [x] 2.5 كتابة property test للتحقق من صحة البيانات
    - **Property 8: Inspection data validation**
    - **Validates: Requirements 6.4**
  - [x] 2.6 تحديث routes في index.php
    - إضافة routes للـ inspection endpoints
    - _Requirements: 6.1, 6.2_

- [x] 3. تحديث CarsController
  - [x] 3.1 تحديث create() لدعم body_type
    - إضافة body_type للـ INSERT query
    - _Requirements: 1.1_
  - [x] 3.2 تحديث update() لدعم body_type
    - إضافة body_type للـ UPDATE query
    - _Requirements: 1.1_
  - [x] 3.3 تحديث getById() لتضمين inspection data
    - جلب بيانات الفحص مع بيانات السيارة
    - _Requirements: 6.2_
  - [x] 3.4 تحديث validateCarData() للتحقق من body_type
    - إلزامية body_type للسيارات المستعملة
    - _Requirements: 1.4_
  - [x] 3.5 كتابة property test للتحقق من body_type
    - **Property 3: Used car validation requires body type**
    - **Validates: Requirements 1.4**

- [x] 4. Checkpoint - التأكد من عمل الـ API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. إنشاء Types للـ Frontend
  - [x] 5.1 إنشاء ملف types/inspection.ts
    - تعريف BodyType enum
    - تعريف BodyPartId enum
    - تعريف PartStatus enum
    - تعريف MechanicalStatus interface
    - تعريف CarInspection interface
    - _Requirements: 1.2, 3.2, 4.2, 5.2, 5.3, 5.4_
  - [x] 5.2 إنشاء constants/inspection.ts
    - تعريف BODY_TYPE_LABELS
    - تعريف BODY_PART_LABELS
    - تعريف PART_STATUS_CONFIG مع الألوان والأيقونات
    - _Requirements: 4.4_
  - [x] 5.3 كتابة property test لـ color mapping
    - **Property 4: Part status to color mapping**
    - **Validates: Requirements 2.6, 4.3, 4.4**

- [x] 6. إنشاء مكون BodyTypeSelector
  - [x] 6.1 إنشاء ملف components/admin/inspection/BodyTypeSelector.tsx
    - عرض dropdown مع 9 أنواع هياكل
    - دعم RTL للعربية
    - _Requirements: 1.2_
  - [x] 6.2 كتابة unit tests للمكون
    - اختبار عرض جميع الخيارات
    - اختبار onChange callback
    - _Requirements: 1.2_

- [x] 7. إنشاء مكون Car3DViewer
  - [x] 7.1 تثبيت dependencies
    - تثبيت @react-three/fiber و @react-three/drei
    - _Requirements: 2.1_
  - [x] 7.2 إنشاء ملف components/admin/inspection/Car3DViewer.tsx
    - إعداد Canvas مع OrbitControls
    - دعم الدوران 360 درجة
    - دعم التكبير والتصغير
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 7.3 إنشاء CarModel component
    - تحميل GLTF model حسب bodyType
    - تقسيم المجسم إلى 13 منطقة
    - _Requirements: 1.3, 3.1, 3.2_
  - [x] 7.4 تنفيذ part highlighting و click detection
    - تغيير لون الجزء عند hover
    - استدعاء onPartClick عند النقر
    - _Requirements: 2.4, 2.5_
  - [x] 7.5 تنفيذ تلوين الأجزاء حسب الحالة
    - تطبيق الألوان من PART_STATUS_CONFIG
    - _Requirements: 2.6, 4.3_
  - [x] 7.6 كتابة property test لـ part click
    - **Property 5: Part click triggers popup**
    - **Validates: Requirements 2.5, 4.1**

- [x] 8. إنشاء مكون PartStatusPopup
  - [x] 8.1 إنشاء ملف components/admin/inspection/PartStatusPopup.tsx
    - عرض اسم الجزء بالعربية
    - عرض 6 خيارات للحالة مع الألوان والأيقونات
    - زر إغلاق
    - _Requirements: 4.1, 4.2_
  - [x] 8.2 كتابة unit tests للمكون
    - اختبار عرض جميع الخيارات
    - اختبار onStatusSelect callback
    - _Requirements: 4.2_

- [x] 9. إنشاء مكون MechanicalStatusForm
  - [x] 9.1 إنشاء ملف components/admin/inspection/MechanicalStatusForm.tsx
    - dropdown لحالة المكينة (3 خيارات)
    - dropdown لحالة القير (2 خيارات)
    - dropdown لحالة الشاصي (3 خيارات)
    - textarea للملاحظات الفنية
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [x] 9.2 كتابة unit tests للمكون
    - اختبار عرض جميع الحقول
    - اختبار onChange callbacks
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 10. إنشاء مكون InspectionSummary
  - [x] 10.1 إنشاء ملف components/admin/inspection/InspectionSummary.tsx
    - عرض ملخص حالة جميع الأجزاء
    - عرض الألوان مع legend
    - عرض ملخص الحالة الميكانيكية
    - _Requirements: 7.3, 7.4, 8.4_

- [x] 11. Checkpoint - التأكد من عمل المكونات
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. تكامل InspectionSection مع CarForm
  - [x] 12.1 إنشاء ملف components/admin/inspection/InspectionSection.tsx
    - تجميع جميع مكونات الفحص
    - إدارة state للفحص
    - _Requirements: 1.1, 5.1_
  - [x] 12.2 تحديث CarForm.tsx
    - إضافة state للـ inspection data
    - عرض InspectionSection عند condition === 'USED'
    - تضمين inspection data في submit
    - _Requirements: 1.1, 5.1, 6.1_
  - [x] 12.3 كتابة property test لـ UI visibility
    - **Property 1: Condition-based UI visibility**
    - **Validates: Requirements 1.1, 5.1**
  - [x] 12.4 كتابة property test لـ status updates
    - **Property 6: Status selection updates state**
    - **Validates: Requirements 4.5, 4.6**

- [x] 13. تحديث API client
  - [x] 13.1 تحديث lib/api.ts
    - إضافة getInspection(carId)
    - إضافة saveInspection(carId, data)
    - تحديث createCar و updateCar لتضمين inspection
    - _Requirements: 6.1, 6.2_
  - [x] 13.2 كتابة property test لـ round-trip
    - **Property 7: Inspection data round-trip**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 14. إنشاء عرض الفحص للعملاء
  - [x] 14.1 إنشاء ملف components/car/InspectionViewer.tsx
    - عرض Car3DViewer في وضع readOnly
    - عرض legend للألوان
    - عرض ملخص الحالة الميكانيكية
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 14.2 تحديث CarDetailsClient.tsx
    - عرض InspectionViewer للسيارات المستعملة
    - _Requirements: 7.1_

- [x] 15. إنشاء/تحضير ملفات 3D Models
  - [x] 15.1 إنشاء مجلد public/models
    - إضافة placeholder models أو low-poly GLTF files
    - _Requirements: 2.1_
  - [x] 15.2 إنشاء fallback 2D diagram
    - SVG diagram للسيارة مع مناطق قابلة للنقر
    - يُستخدم عند فشل تحميل 3D
    - _Requirements: Error Handling_

- [x] 16. Checkpoint النهائي
  - Ensure all tests pass, ask the user if questions arise.
  - اختبار التدفق الكامل: إضافة سيارة مستعملة → فحص → حفظ → عرض

## Notes

- All tasks are required including tests for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- يُفضل استخدام مجسمات Low-poly لتحسين الأداء
- يجب اختبار التوافق مع المتصفحات المختلفة
