# Implementation Plan: Web UI/UX Enhancement

## Overview

خطة تنفيذ تحسين واجهة الويب لمعرض SHAS Motors. تشمل الخطة تطوير واجهة المتجر للعملاء ولوحة التحكم للإدارة مع التركيز على تجربة مستخدم سلسة وواجهة أنيقة.

---

## Tasks

### Phase 1: نظام التصميم الأساسي (Design System Foundation)

- [x] 1. إعداد نظام الألوان والثيمات
  - [x] 1.1 تحديث ملف globals.css بمتغيرات الألوان الجديدة
    - إضافة ألوان semantic (success, warning, info)
    - تحسين تباين الألوان لـ WCAG AA
    - _Requirements: 16.1, 16.2, 16.3_
  - [x] 1.2 إنشاء ملف theme.ts لإدارة الثيمات
    - تعريف color palette مع الدرجات
    - _Requirements: 16.4_
  - [x] 1.3 كتابة property test لتباين الألوان
    - **Property 27: Color Contrast Accessibility**
    - **Validates: Requirements 16.3**

- [x] 2. تحسين نظام الخطوط
  - [x] 2.1 التأكد من تحميل خط Cairo بشكل صحيح
    - تحسين font loading strategy
    - _Requirements: 17.1, 17.2_
  - [x] 2.2 كتابة property test لحجم الخط على الموبايل
    - **Property 24: Mobile Font Size**
    - **Validates: Requirements 17.3**

- [x] 3. Checkpoint - التأكد من عمل نظام التصميم
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 2: مكونات UI الأساسية (Core UI Components)

- [x] 4. تحسين مكون Button
  - [x] 4.1 إضافة variants جديدة (ghost, outline)
    - تحسين hover و focus states
    - إضافة loading state
    - _Requirements: 18.1_
  - [x] 4.2 كتابة property test للـ keyboard navigation
    - **Property 28: Component Keyboard Navigation**
    - **Validates: Requirements 18.8**

- [x] 5. إنشاء مكون Toast للإشعارات
  - [x] 5.1 إنشاء ملف components/ui/toast.tsx
    - دعم أنواع مختلفة (success, error, warning, info)
    - أيقونات مناسبة لكل نوع
    - _Requirements: 13.1, 13.4_
  - [x] 5.2 إنشاء ToastProvider و useToast hook
    - إدارة stacking للإشعارات المتعددة
    - _Requirements: 13.5_
  - [x] 5.3 تنفيذ auto-dismiss و manual dismiss
    - 5 ثواني للـ success، بدون auto-dismiss للـ error
    - _Requirements: 13.2, 13.3, 13.6_
  - [x] 5.4 كتابة property tests للـ Toast
    - **Property 9: Toast Notification Styling**
    - **Property 10: Toast Stacking**
    - **Validates: Requirements 13.1, 13.3, 13.4, 13.5**

- [x] 6. تحسين مكون Modal
  - [x] 6.1 تحسين ملف components/ui/modal.tsx
    - إضافة focus trap
    - دعم Escape للإغلاق
    - _Requirements: 14.5, 14.6_
  - [x] 6.2 إنشاء ConfirmDialog component
    - للإجراءات التدميرية
    - _Requirements: 14.1, 14.2, 14.3_
  - [x] 6.3 كتابة property tests للـ Modal
    - **Property 11: Modal Keyboard Accessibility**
    - **Property 12: Destructive Action Confirmation**
    - **Validates: Requirements 14.4, 14.5, 14.6, 14.1**

- [x] 7. إنشاء مكون Skeleton للتحميل
  - [x] 7.1 إنشاء ملف components/ui/skeleton.tsx
    - variants: text, circular, rectangular, card
    - _Requirements: 18.7_

- [x] 8. Checkpoint - التأكد من عمل مكونات UI
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 3: واجهة المتجر - التنقل (Storefront Navigation)

- [x] 9. تحسين Header Component
  - [x] 9.1 تحديث components/layout/Header.tsx
    - Sticky header مع تصغير عند التمرير
    - عرض Logo, menu items, search icon
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 9.2 إضافة active state للصفحة الحالية
    - تمييز العنصر النشط في القائمة
    - _Requirements: 1.6_
  - [x] 9.3 كتابة property test للـ active state
    - **Property 4: Navigation Active State**
    - **Validates: Requirements 1.6**

- [x] 10. إنشاء MobileMenu Component
  - [x] 10.1 إنشاء ملف components/layout/MobileMenu.tsx
    - قائمة full-screen مع animation
    - hamburger menu icon
    - _Requirements: 1.4, 1.5_
  - [x] 10.2 كتابة property test للـ toggle
    - **Property 5: Mobile Menu Toggle**
    - **Validates: Requirements 1.5**

- [x] 11. إنشاء Breadcrumb Component
  - [x] 11.1 إنشاء ملف components/layout/Breadcrumb.tsx
    - عرض مسار التنقل
    - دعم RTL
    - _Requirements: 3.6_
  - [x] 11.2 كتابة property test للـ breadcrumb
    - **Property 6: Breadcrumb Path Accuracy**
    - **Validates: Requirements 3.6**

- [x] 12. Checkpoint - التأكد من عمل التنقل
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 4: واجهة المتجر - عرض السيارات (Car Display)

- [x] 13. تحسين CarCard Component
  - [x] 13.1 تحديث components/cars/CarCard.tsx
    - عرض الصورة، الاسم، السعر، السنة، الحالة
    - تنسيق السعر بـ ر.ي
    - _Requirements: 2.1, 2.6_
  - [x] 13.2 إضافة badges للسيارات المميزة والمباعة
    - شارة "مميزة" و "مباعة"
    - _Requirements: 2.3, 2.4_
  - [x] 13.3 إضافة hover effects و skeleton loading
    - lift effect مع shadow
    - skeleton أثناء تحميل الصورة
    - _Requirements: 2.2, 2.5_
  - [x] 13.4 كتابة property test لعرض البطاقة
    - **Property 1: Car Card Information Display**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.6**

- [x] 14. تحسين CarGallery Component
  - [x] 14.1 تحديث components/cars/CarGallery.tsx
    - معرض صور مع thumbnails
    - lightbox للعرض الكامل
    - _Requirements: 3.1, 3.2_
  - [x] 14.2 إضافة swipe gestures للموبايل
    - التنقل بين الصور بالسحب
    - _Requirements: 3.3_

- [x] 15. تحسين CarSpecs Component
  - [x] 15.1 تحديث components/cars/CarSpecs.tsx
    - عرض المواصفات في أقسام منظمة
    - أيقونات لكل مواصفة
    - _Requirements: 3.4_
  - [x] 15.2 كتابة property test للمواصفات
    - **Property 7: Car Specifications Rendering**
    - **Validates: Requirements 3.4**

- [x] 16. Checkpoint - التأكد من عمل عرض السيارات
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 5: واجهة المتجر - البحث والفلترة (Search & Filtering)

- [x] 17. تحسين SearchBar Component
  - [x] 17.1 تحديث components/search/SearchBar.tsx
    - اقتراحات فورية أثناء الكتابة
    - _Requirements: 4.1_
  - [x] 17.2 كتابة property test للاقتراحات
    - **Property 3: Search Suggestions Relevance**
    - **Validates: Requirements 4.1**

- [x] 18. تحسين CarFilters Component
  - [x] 18.1 تحديث components/cars/CarFilters.tsx
    - sidebar قابل للطي على desktop
    - bottom sheet على mobile
    - _Requirements: 4.2, 4.3_
  - [x] 18.2 إضافة filter chips قابلة للإزالة
    - عرض الفلاتر النشطة كـ chips
    - تحديث النتائج عند الإزالة
    - _Requirements: 4.5, 4.6_
  - [x] 18.3 عرض عدد النتائج و empty state
    - رسالة ودية عند عدم وجود نتائج
    - _Requirements: 4.7, 4.8_
  - [x] 18.4 كتابة property test لمزامنة الفلاتر
    - **Property 2: Filter State Synchronization**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7**

- [x] 19. Checkpoint - التأكد من عمل البحث والفلترة
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 6: واجهة المتجر - التجاوب والأداء (Responsive & Performance)

- [x] 20. تحسين التجاوب
  - [x] 20.1 تحديث grid السيارات للتجاوب
    - 4 أعمدة desktop، 2 tablet، 1 mobile
    - _Requirements: 6.1_
  - [x] 20.2 التأكد من touch targets
    - حد أدنى 44x44 pixels
    - _Requirements: 6.3, 6.6_
  - [x] 20.3 كتابة property tests للتجاوب
    - **Property 22: Touch Target Minimum Size**
    - **Property 23: Responsive Grid Columns**
    - **Validates: Requirements 6.1, 6.3, 6.6**

- [x] 21. تحسين الأداء البصري
  - [x] 21.1 إضافة دعم reduced motion
    - تعطيل الحركات لمن يفضل ذلك
    - _Requirements: 7.4_
  - [x] 21.2 كتابة property test للـ reduced motion
    - **Property 25: Reduced Motion Preference**
    - **Validates: Requirements 7.4**

- [x] 22. تحسين دعم RTL
  - [x] 22.1 مراجعة وتحسين RTL styles
    - استخدام logical properties
    - _Requirements: 16.5_
  - [x] 22.2 كتابة property test للـ RTL
    - **Property 26: RTL Layout Support**
    - **Validates: Requirements 16.5**

- [x] 23. Checkpoint - التأكد من التجاوب والأداء
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 7: لوحة التحكم - التخطيط (Admin Layout)

- [x] 24. تحسين Admin Sidebar
  - [x] 24.1 تحديث components/admin/Sidebar.tsx
    - sidebar قابل للطي (icons only)
    - تجميع العناصر في مجموعات
    - _Requirements: 8.1, 8.4_
  - [x] 24.2 إضافة حفظ حالة الـ sidebar
    - حفظ في localStorage
    - _Requirements: 8.6_
  - [x] 24.3 تحسين للموبايل (overlay)
    - عرض كـ overlay على الشاشات الصغيرة
    - _Requirements: 8.5_
  - [x] 24.4 كتابة property tests للـ Sidebar
    - **Property 15: Sidebar State Persistence**
    - **Property 30: Sidebar Toggle Behavior**
    - **Validates: Requirements 8.2, 8.6**

- [x] 25. تحسين Admin Header
  - [x] 25.1 تحديث admin layout header
    - عرض عنوان الصفحة الحالية
    - معلومات المستخدم و quick actions
    - _Requirements: 8.3, 8.7_
  - [x] 25.2 كتابة property test لعنوان الصفحة
    - **Property 16: Admin Page Title**
    - **Validates: Requirements 8.7**

- [x] 26. Checkpoint - التأكد من تخطيط لوحة التحكم
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 8: لوحة التحكم - الإحصائيات (Statistics)

- [x] 27. تحسين StatsCard Component
  - [x] 27.1 إنشاء/تحديث components/admin/StatsCard.tsx
    - عرض المقاييس مع أيقونات
    - مؤشرات الاتجاه (أسهم)
    - _Requirements: 9.1, 9.2_
  - [x] 27.2 كتابة property test لمؤشرات الاتجاه
    - **Property 17: Statistics Trend Indicators**
    - **Validates: Requirements 9.2**

- [x] 28. تحسين صفحة الإحصائيات
  - [x] 28.1 تحديث app/admin/page.tsx
    - عرض charts و activity feed
    - skeleton loaders أثناء التحميل
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

- [x] 29. Checkpoint - التأكد من صفحة الإحصائيات
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 9: لوحة التحكم - جداول البيانات (Data Tables)

- [x] 30. إنشاء DataTable Component
  - [x] 30.1 إنشاء ملف components/admin/DataTable.tsx
    - أعمدة قابلة للفرز
    - pagination مع خيارات حجم الصفحة
    - _Requirements: 10.1, 10.3_
  - [x] 30.2 إضافة البحث والفلترة
    - input للبحث فوق الجدول
    - _Requirements: 10.4_
  - [x] 30.3 إضافة row actions و bulk actions
    - dropdown للإجراءات (Edit, Delete, View)
    - bulk actions عند تحديد صفوف متعددة
    - _Requirements: 10.5, 10.6_
  - [x] 30.4 تحسين للموبايل
    - horizontal scroll مع إبقاء actions مرئية
    - _Requirements: 10.8_
  - [x] 30.5 كتابة property tests للجدول
    - **Property 13: Data Table Sorting**
    - **Property 14: Bulk Selection Actions**
    - **Validates: Requirements 10.1, 10.2, 10.6**

- [x] 31. Checkpoint - التأكد من جداول البيانات
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 10: لوحة التحكم - النماذج (Forms)

- [x] 32. تحسين Form Components
  - [x] 32.1 تحسين Input component
    - labels واضحة و placeholders
    - مؤشرات الحقول المطلوبة
    - _Requirements: 11.1, 11.4_
  - [x] 32.2 إضافة real-time validation
    - عرض أخطاء تحت الحقل
    - _Requirements: 11.2, 11.3_
  - [x] 32.3 إضافة form submission states
    - loading على زر الإرسال
    - حفظ البيانات عند الفشل
    - _Requirements: 11.6, 11.8_
  - [x] 32.4 كتابة property test للـ validation
    - **Property 8: Form Validation Behavior**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.8**

- [x] 33. تحسين تجاوب النماذج
  - [x] 33.1 تحويل النماذج لـ single-column على الموبايل
    - _Requirements: 15.2_
  - [x] 33.2 كتابة property test لتخطيط النماذج
    - **Property 29: Responsive Form Layout**
    - **Validates: Requirements 15.2**

- [x] 34. Checkpoint - التأكد من النماذج
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 11: لوحة التحكم - رفع الملفات (File Upload)

- [x] 35. إنشاء FileUpload Component
  - [x] 35.1 إنشاء ملف components/admin/FileUpload.tsx
    - دعم drag-and-drop
    - عرض progress لكل ملف
    - _Requirements: 12.1, 12.2_
  - [x] 35.2 إضافة image previews
    - عرض preview قبل اكتمال الرفع
    - عرض حجم الملف والأبعاد
    - _Requirements: 12.3, 12.6_
  - [x] 35.3 إضافة validation و error handling
    - رسائل خطأ للملفات غير الصالحة
    - _Requirements: 12.4_
  - [x] 35.4 إضافة reorder و delete
    - إعادة ترتيب بالسحب
    - تأكيد قبل الحذف
    - _Requirements: 12.5, 12.7_
  - [x] 35.5 كتابة property tests لرفع الملفات
    - **Property 18: File Upload Validation**
    - **Property 19: File Upload Preview**
    - **Property 20: File Upload Progress**
    - **Property 21: File Metadata Display**
    - **Validates: Requirements 12.2, 12.3, 12.4, 12.6**

- [x] 36. Checkpoint - التأكد من رفع الملفات
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 12: التكامل النهائي (Final Integration)

- [x] 37. تكامل المكونات في الصفحات
  - [x] 37.1 تحديث صفحة قائمة السيارات
    - دمج CarCard, CarFilters, SearchBar
    - _Requirements: 2.1-2.7, 4.1-4.8_
  - [x] 37.2 تحديث صفحة تفاصيل السيارة
    - دمج CarGallery, CarSpecs, Breadcrumb
    - أزرار التواصل الثابتة على الموبايل
    - _Requirements: 3.1-3.8_
  - [x] 37.3 تحديث صفحات لوحة التحكم
    - دمج DataTable, FileUpload, Forms
    - _Requirements: 8.1-15.5_

- [x] 38. اختبارات التكامل
  - [x] 38.1 كتابة integration tests للصفحات الرئيسية
    - اختبار تدفق المستخدم الكامل
    - _Requirements: All_

- [x] 39. Final Checkpoint - المراجعة النهائية
  - Ensure all tests pass, ask the user if questions arise.
  - مراجعة شاملة للتجاوب والأداء
  - التأكد من دعم RTL الكامل

---

## Notes

- جميع المهام إلزامية بما في ذلك الاختبارات
- كل مهمة تشير إلى المتطلبات المحددة للتتبع
- Checkpoints تضمن التحقق التدريجي من الجودة
- Property tests تتحقق من خصائص الصحة العامة
- Unit tests تتحقق من الحالات المحددة والحدود
