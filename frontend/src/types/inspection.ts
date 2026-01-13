/**
 * Inspection Types for Car Inspection 3D System
 * Requirements: 1.2, 3.2, 4.2, 5.2, 5.3, 5.4
 */

// Body Type - نوع هيكل السيارة
export type BodyType =
  | 'sedan'
  | 'hatchback'
  | 'coupe'
  | 'suv'
  | 'crossover'
  | 'pickup'
  | 'van'
  | 'minivan'
  | 'truck';

// Body Part ID - معرف جزء الهيكل (13 منطقة)
export type BodyPartId =
  | 'front_bumper'      // الصدام الأمامي
  | 'rear_bumper'       // الصدام الخلفي
  | 'hood'              // الكبوت
  | 'roof'              // السقف
  | 'trunk'             // الشنطة
  | 'front_left_door'   // الباب الأمامي الأيسر
  | 'front_right_door'  // الباب الأمامي الأيمن
  | 'rear_left_door'    // الباب الخلفي الأيسر
  | 'rear_right_door'   // الباب الخلفي الأيمن
  | 'front_left_fender' // الرفرف الأمامي الأيسر
  | 'front_right_fender'// الرفرف الأمامي الأيمن
  | 'rear_left_quarter' // الربع الخلفي الأيسر
  | 'rear_right_quarter';// الربع الخلفي الأيمن

// Part Status - حالة الجزء (6 حالات)
export type PartStatus =
  | 'original'     // سليم / وكالة
  | 'painted'      // رش
  | 'bodywork'     // سمكرة + رش
  | 'accident'     // حادث
  | 'replaced'     // تم تغيير القطعة
  | 'needs_check'; // يحتاج فحص

// Engine Status - حالة المكينة
export type EngineStatus = 'original' | 'replaced' | 'refurbished';

// Transmission Status - حالة القير
export type TransmissionStatus = 'original' | 'replaced';

// Chassis Status - حالة الشاصي
export type ChassisStatus = 'intact' | 'accident_affected' | 'modified';

// Tire Status - حالة الإطار (3 مستويات)
export type TireStatus = 'new' | 'used_50' | 'damaged';

// Tire Position - موقع الإطار
export type TirePosition = 'front_left' | 'front_right' | 'rear_left' | 'rear_right' | 'spare';

// Tires Status Interface - حالة الإطارات
export interface TiresStatus {
  front_left: TireStatus;
  front_right: TireStatus;
  rear_left: TireStatus;
  rear_right: TireStatus;
  spare?: TireStatus;
}

// Mechanical Status Interface - الحالة الميكانيكية
export interface MechanicalStatus {
  engine: EngineStatus;
  transmission: TransmissionStatus;
  chassis: ChassisStatus;
  tires?: TiresStatus;
  technicalNotes: string;
}

// Body Part Status - حالة جزء الهيكل
export interface BodyPartStatus {
  partId: BodyPartId;
  status: PartStatus;
}

// Car Inspection Interface - بيانات الفحص الكاملة
export interface CarInspection {
  id: number;
  carId: number;
  bodyType: BodyType;
  bodyParts: BodyPartStatus[];
  mechanical: MechanicalStatus;
  damageDetails?: Record<string, DamageDetail>;
  createdAt: string;
  updatedAt: string;
}

// Save Inspection Request - طلب حفظ الفحص
export interface SaveInspectionRequest {
  bodyType: BodyType;
  bodyParts: Array<{ partId: BodyPartId; status: PartStatus }>;
  engine: EngineStatus;
  transmission: TransmissionStatus;
  chassis: ChassisStatus;
  tires?: TiresStatus;
  technicalNotes?: string;
  damageDetails?: Record<string, DamageDetail>;
}

// Inspection Data - بيانات الفحص للعرض
export interface InspectionData {
  bodyType: BodyType;
  bodyParts: Record<BodyPartId, PartStatus>;
  mechanical: MechanicalStatus;
  // Extended damage data with photos and notes
  damageDetails?: Record<string, DamageDetail>;
}

// Damage Detail - تفاصيل الضرر مع الصور والملاحظات
export interface DamageDetail {
  partKey: string;
  condition: string;
  severity?: string;
  notes?: string;
  photos?: string[];
  updatedAt: string;
}
