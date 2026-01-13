/**
 * Inspection Constants for Car Inspection 3D System
 * Requirements: 4.4, 9.1, 9.2
 */

import type { BodyType, BodyPartId, PartStatus, EngineStatus, TransmissionStatus, ChassisStatus, TireStatus, TirePosition } from '@/types/inspection';

// Body Type Labels - تسميات أنواع الهياكل (ثنائية اللغة)
export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  sedan: 'سيدان',
  hatchback: 'هاتشباك',
  coupe: 'كوبيه',
  suv: 'SUV',
  crossover: 'كروس أوفر',
  pickup: 'بيك أب',
  van: 'فان',
  minivan: 'ميني فان',
  truck: 'شاحنة',
};

// Body Type Labels - Bilingual
export const BODY_TYPE_LABELS_BILINGUAL: Record<BodyType, { ar: string; en: string }> = {
  sedan: { ar: 'سيدان', en: 'Sedan' },
  hatchback: { ar: 'هاتشباك', en: 'Hatchback' },
  coupe: { ar: 'كوبيه', en: 'Coupe' },
  suv: { ar: 'SUV', en: 'SUV' },
  crossover: { ar: 'كروس أوفر', en: 'Crossover' },
  pickup: { ar: 'بيك أب', en: 'Pickup' },
  van: { ar: 'فان', en: 'Van' },
  minivan: { ar: 'ميني فان', en: 'Minivan' },
  truck: { ar: 'شاحنة', en: 'Truck' },
};

// Body Part Labels - تسميات أجزاء الهيكل بالعربية
export const BODY_PART_LABELS: Record<BodyPartId, string> = {
  front_bumper: 'الصدام الأمامي',
  rear_bumper: 'الصدام الخلفي',
  hood: 'الكبوت',
  roof: 'السقف',
  trunk: 'الشنطة',
  front_left_door: 'الباب الأمامي الأيسر',
  front_right_door: 'الباب الأمامي الأيمن',
  rear_left_door: 'الباب الخلفي الأيسر',
  rear_right_door: 'الباب الخلفي الأيمن',
  front_left_fender: 'الرفرف الأمامي الأيسر',
  front_right_fender: 'الرفرف الأمامي الأيمن',
  rear_left_quarter: 'الربع الخلفي الأيسر',
  rear_right_quarter: 'الربع الخلفي الأيمن',
};

// Body Part Labels - Bilingual
export const BODY_PART_LABELS_BILINGUAL: Record<BodyPartId, { ar: string; en: string }> = {
  front_bumper: { ar: 'الصدام الأمامي', en: 'Front Bumper' },
  rear_bumper: { ar: 'الصدام الخلفي', en: 'Rear Bumper' },
  hood: { ar: 'الكبوت', en: 'Hood' },
  roof: { ar: 'السقف', en: 'Roof' },
  trunk: { ar: 'الشنطة', en: 'Trunk' },
  front_left_door: { ar: 'الباب الأمامي الأيسر', en: 'Front Left Door' },
  front_right_door: { ar: 'الباب الأمامي الأيمن', en: 'Front Right Door' },
  rear_left_door: { ar: 'الباب الخلفي الأيسر', en: 'Rear Left Door' },
  rear_right_door: { ar: 'الباب الخلفي الأيمن', en: 'Rear Right Door' },
  front_left_fender: { ar: 'الرفرف الأمامي الأيسر', en: 'Front Left Fender' },
  front_right_fender: { ar: 'الرفرف الأمامي الأيمن', en: 'Front Right Fender' },
  rear_left_quarter: { ar: 'الربع الخلفي الأيسر', en: 'Rear Left Quarter' },
  rear_right_quarter: { ar: 'الربع الخلفي الأيمن', en: 'Rear Right Quarter' },
};

// Part Status Config - إعدادات حالات الأجزاء مع الألوان والأيقونات
export const PART_STATUS_CONFIG: Record<PartStatus, { label: string; labelEn: string; color: string; icon: string }> = {
  original: { label: 'سليم / وكالة', labelEn: 'Original', color: '#22c55e', icon: '✅' },
  painted: { label: 'رش', labelEn: 'Painted', color: '#eab308', icon: '🎨' },
  bodywork: { label: 'سمكرة + رش', labelEn: 'Bodywork', color: '#f97316', icon: '🔧' },
  accident: { label: 'حادث', labelEn: 'Accident', color: '#ef4444', icon: '💥' },
  replaced: { label: 'تم تغيير القطعة', labelEn: 'Replaced', color: '#3b82f6', icon: '🔄' },
  needs_check: { label: 'يحتاج فحص', labelEn: 'Needs Check', color: '#6b7280', icon: '⚠️' },
};

// Engine Status Labels - تسميات حالات المكينة
export const ENGINE_STATUS_LABELS: Record<EngineStatus, string> = {
  original: 'أصلية',
  replaced: 'تم تغييرها',
  refurbished: 'مجددة',
};

// Engine Status Labels - Bilingual
export const ENGINE_STATUS_LABELS_BILINGUAL: Record<EngineStatus, { ar: string; en: string }> = {
  original: { ar: 'أصلية', en: 'Original' },
  replaced: { ar: 'تم تغييرها', en: 'Replaced' },
  refurbished: { ar: 'مجددة', en: 'Refurbished' },
};

// Transmission Status Labels - تسميات حالات القير
export const TRANSMISSION_STATUS_LABELS: Record<TransmissionStatus, string> = {
  original: 'أصلي',
  replaced: 'تم تغييره',
};

// Transmission Status Labels - Bilingual
export const TRANSMISSION_STATUS_LABELS_BILINGUAL: Record<TransmissionStatus, { ar: string; en: string }> = {
  original: { ar: 'أصلي', en: 'Original' },
  replaced: { ar: 'تم تغييره', en: 'Replaced' },
};

// Chassis Status Labels - تسميات حالات الشاصي
export const CHASSIS_STATUS_LABELS: Record<ChassisStatus, string> = {
  intact: 'سليم',
  accident_affected: 'متأثر بحادث',
  modified: 'معدل',
};

// Chassis Status Labels - Bilingual
export const CHASSIS_STATUS_LABELS_BILINGUAL: Record<ChassisStatus, { ar: string; en: string }> = {
  intact: { ar: 'سليم', en: 'Intact' },
  accident_affected: { ar: 'متأثر بحادث', en: 'Accident Affected' },
  modified: { ar: 'معدل', en: 'Modified' },
};

// Tire Status Labels - تسميات حالات الإطارات
export const TIRE_STATUS_LABELS: Record<TireStatus, string> = {
  new: 'جديد',
  used_50: 'مستهلك 50%',
  damaged: 'تالف - يحتاج تغيير',
};

// Tire Status Labels - Bilingual
export const TIRE_STATUS_LABELS_BILINGUAL: Record<TireStatus, { ar: string; en: string }> = {
  new: { ar: 'جديد', en: 'New' },
  used_50: { ar: 'مستهلك 50%', en: '50% Used' },
  damaged: { ar: 'تالف - يحتاج تغيير', en: 'Damaged - Needs Replacement' },
};

// Tire Status Config - إعدادات حالات الإطارات مع الألوان والأيقونات
export const TIRE_STATUS_CONFIG: Record<TireStatus, { label: string; labelEn: string; color: string; icon: string }> = {
  new: { label: 'جديد', labelEn: 'New', color: '#22c55e', icon: '✅' },
  used_50: { label: 'مستهلك 50%', labelEn: '50% Used', color: '#f59e0b', icon: '⚠️' },
  damaged: { label: 'تالف - يحتاج تغيير', labelEn: 'Damaged', color: '#ef4444', icon: '❌' },
};

// Tire Position Labels - تسميات مواقع الإطارات
export const TIRE_POSITION_LABELS: Record<TirePosition, string> = {
  front_left: 'أمامي أيسر',
  front_right: 'أمامي أيمن',
  rear_left: 'خلفي أيسر',
  rear_right: 'خلفي أيمن',
  spare: 'الاحتياطي',
};

// Tire Position Labels - Bilingual
export const TIRE_POSITION_LABELS_BILINGUAL: Record<TirePosition, { ar: string; en: string }> = {
  front_left: { ar: 'أمامي أيسر', en: 'Front Left' },
  front_right: { ar: 'أمامي أيمن', en: 'Front Right' },
  rear_left: { ar: 'خلفي أيسر', en: 'Rear Left' },
  rear_right: { ar: 'خلفي أيمن', en: 'Rear Right' },
  spare: { ar: 'الاحتياطي', en: 'Spare' },
};

// All Tire Statuses Array - قائمة جميع حالات الإطارات
export const ALL_TIRE_STATUSES: TireStatus[] = ['new', 'used_50', 'damaged'];

// All Tire Positions Array - قائمة جميع مواقع الإطارات
export const ALL_TIRE_POSITIONS: TirePosition[] = ['front_left', 'front_right', 'rear_left', 'rear_right', 'spare'];

// All Body Types Array - قائمة جميع أنواع الهياكل
export const ALL_BODY_TYPES: BodyType[] = [
  'sedan',
  'hatchback',
  'coupe',
  'suv',
  'crossover',
  'pickup',
  'van',
  'minivan',
  'truck',
];

// All Body Part IDs Array - قائمة جميع معرفات أجزاء الهيكل
export const ALL_BODY_PART_IDS: BodyPartId[] = [
  'front_bumper',
  'rear_bumper',
  'hood',
  'roof',
  'trunk',
  'front_left_door',
  'front_right_door',
  'rear_left_door',
  'rear_right_door',
  'front_left_fender',
  'front_right_fender',
  'rear_left_quarter',
  'rear_right_quarter',
];

// All Part Statuses Array - قائمة جميع حالات الأجزاء
export const ALL_PART_STATUSES: PartStatus[] = [
  'original',
  'painted',
  'bodywork',
  'accident',
  'replaced',
  'needs_check',
];

// Helper function to get color for a part status
export function getPartStatusColor(status: PartStatus): string {
  return PART_STATUS_CONFIG[status].color;
}

// Helper function to get label for a part status
export function getPartStatusLabel(status: PartStatus): string {
  return PART_STATUS_CONFIG[status].label;
}

// Helper function to get icon for a part status
export function getPartStatusIcon(status: PartStatus): string {
  return PART_STATUS_CONFIG[status].icon;
}


// Helper function to get body type label by language
export function getBodyTypeLabel(bodyType: BodyType, language: 'ar' | 'en' = 'ar'): string {
  return BODY_TYPE_LABELS_BILINGUAL[bodyType]?.[language] || bodyType;
}

// Helper function to get body part label by language
export function getBodyPartLabel(partId: BodyPartId, language: 'ar' | 'en' = 'ar'): string {
  return BODY_PART_LABELS_BILINGUAL[partId]?.[language] || partId;
}

// Helper function to get part status label by language
export function getPartStatusLabelByLang(status: PartStatus, language: 'ar' | 'en' = 'ar'): string {
  const config = PART_STATUS_CONFIG[status];
  return language === 'ar' ? config.label : config.labelEn;
}

// Helper function to get engine status label by language
export function getEngineStatusLabel(status: EngineStatus, language: 'ar' | 'en' = 'ar'): string {
  return ENGINE_STATUS_LABELS_BILINGUAL[status]?.[language] || status;
}

// Helper function to get transmission status label by language
export function getTransmissionStatusLabel(status: TransmissionStatus, language: 'ar' | 'en' = 'ar'): string {
  return TRANSMISSION_STATUS_LABELS_BILINGUAL[status]?.[language] || status;
}

// Helper function to get chassis status label by language
export function getChassisStatusLabel(status: ChassisStatus, language: 'ar' | 'en' = 'ar'): string {
  return CHASSIS_STATUS_LABELS_BILINGUAL[status]?.[language] || status;
}

// Helper function to get tire status label by language
export function getTireStatusLabel(status: TireStatus, language: 'ar' | 'en' = 'ar'): string {
  return TIRE_STATUS_LABELS_BILINGUAL[status]?.[language] || status;
}

// Helper function to get tire position label by language
export function getTirePositionLabel(position: TirePosition, language: 'ar' | 'en' = 'ar'): string {
  return TIRE_POSITION_LABELS_BILINGUAL[position]?.[language] || position;
}

// Helper function to get tire status color
export function getTireStatusColor(status: TireStatus): string {
  return TIRE_STATUS_CONFIG[status].color;
}

// Helper function to get tire status icon
export function getTireStatusIcon(status: TireStatus): string {
  return TIRE_STATUS_CONFIG[status].icon;
}
