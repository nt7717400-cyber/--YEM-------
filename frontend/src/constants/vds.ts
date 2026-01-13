/**
 * VDS (Vehicle Damage System) Constants
 * Constants for the 2D SVG-based inspection system
 * Requirements: 4.1, 5.1, 9.1
 */

import type {
  ViewAngle,
  CarTemplate,
  PartCondition,
  DamageSeverity,
  PartKey,
  PartLabel,
  ColorMappingEntry,
} from '@/types/vds';

// Default Color Mappings - خريطة الألوان الافتراضية
export const DEFAULT_COLOR_MAPPINGS: ColorMappingEntry[] = [
  { condition: 'good', colorHex: '#22c55e', labelAr: 'سليم', labelEn: 'Good' },
  { condition: 'scratch', colorHex: '#eab308', labelAr: 'خدش', labelEn: 'Scratch' },
  { condition: 'bodywork', colorHex: '#f97316', labelAr: 'سمكرة', labelEn: 'Bodywork' },
  { condition: 'broken', colorHex: '#ef4444', labelAr: 'كسر', labelEn: 'Broken' },
  { condition: 'painted', colorHex: '#3b82f6', labelAr: 'رش', labelEn: 'Painted' },
  { condition: 'replaced', colorHex: '#8b5cf6', labelAr: 'تغيير', labelEn: 'Replaced' },
  { condition: 'not_inspected', colorHex: '#9ca3af', labelAr: 'غير محدد', labelEn: 'Not Inspected' },
];

// Color Mapping by Condition - خريطة الألوان حسب الحالة
export const COLOR_BY_CONDITION: Record<PartCondition, string> = {
  good: '#22c55e',
  scratch: '#eab308',
  bodywork: '#f97316',
  broken: '#ef4444',
  painted: '#3b82f6',
  replaced: '#8b5cf6',
  not_inspected: '#9ca3af',
};

// Wheel Part Keys - مفاتيح أجزاء العجلات
export const WHEEL_PART_KEYS: Set<string> = new Set([
  'wheel_front_left',
  'wheel_front_right',
  'wheel_rear_left',
  'wheel_rear_right',
]);

// Wheel Condition Colors - ألوان حالات العجلات (فريدة ومختلفة عن ألوان الهيكل)
export const WHEEL_COLOR_BY_CONDITION: Record<PartCondition, string> = {
  good: '#10b981',      // Emerald - أخضر زمردي
  scratch: '#f59e0b',   // Amber - كهرماني
  bodywork: '#f97316',  // Orange - برتقالي
  broken: '#dc2626',    // Red-600 - أحمر داكن
  painted: '#6366f1',   // Indigo - نيلي
  replaced: '#a855f7',  // Purple - بنفسجي فاتح
  not_inspected: '#6b7280', // Gray-500 - رمادي
};

/**
 * Check if a part key is a wheel
 */
export function isWheelPart(partKey: string): boolean {
  return WHEEL_PART_KEYS.has(partKey);
}

/**
 * Get color for wheel condition
 */
export function getWheelConditionColor(condition: PartCondition): string {
  return WHEEL_COLOR_BY_CONDITION[condition] || WHEEL_COLOR_BY_CONDITION.not_inspected;
}

// Condition Labels - تسميات الحالات
export const CONDITION_LABELS: Record<PartCondition, { ar: string; en: string }> = {
  good: { ar: 'سليم', en: 'Good' },
  scratch: { ar: 'خدش', en: 'Scratch' },
  bodywork: { ar: 'سمكرة', en: 'Bodywork' },
  broken: { ar: 'كسر', en: 'Broken' },
  painted: { ar: 'رش', en: 'Painted' },
  replaced: { ar: 'تغيير', en: 'Replaced' },
  not_inspected: { ar: 'غير محدد', en: 'Not Inspected' },
};

// Severity Labels - تسميات الشدة
export const SEVERITY_LABELS: Record<DamageSeverity, { ar: string; en: string }> = {
  light: { ar: 'خفيف', en: 'Light' },
  medium: { ar: 'متوسط', en: 'Medium' },
  severe: { ar: 'شديد', en: 'Severe' },
};

// View Angle Labels - تسميات زوايا العرض
export const VIEW_ANGLE_LABELS: Record<ViewAngle, { ar: string; en: string }> = {
  front: { ar: 'أمام', en: 'Front' },
  rear: { ar: 'خلف', en: 'Rear' },
  left_side: { ar: 'الجانب الأيسر', en: 'Left Side' },
  right_side: { ar: 'الجانب الأيمن', en: 'Right Side' },
  top: { ar: 'أعلى', en: 'Top' },
};

// Car Template Labels - تسميات قوالب السيارات
export const CAR_TEMPLATE_LABELS: Record<CarTemplate, { ar: string; en: string }> = {
  sedan: { ar: 'سيدان', en: 'Sedan' },
  suv: { ar: 'SUV', en: 'SUV' },
  hatchback: { ar: 'هاتشباك', en: 'Hatchback' },
  coupe: { ar: 'كوبيه', en: 'Coupe' },
  pickup: { ar: 'بيك أب', en: 'Pickup' },
  van: { ar: 'فان', en: 'Van' },
};

// Part Labels - تسميات الأجزاء
export const PART_LABELS: Record<PartKey, PartLabel> = {
  // Front
  front_bumper: { ar: 'الصدام الأمامي', en: 'Front Bumper' },
  hood: { ar: 'الكبوت', en: 'Hood' },
  front_grille: { ar: 'الشبك الأمامي', en: 'Front Grille' },
  headlight_left: { ar: 'المصباح الأمامي الأيسر', en: 'Left Headlight' },
  headlight_right: { ar: 'المصباح الأمامي الأيمن', en: 'Right Headlight' },
  front_windshield: { ar: 'الزجاج الأمامي', en: 'Front Windshield' },
  // Rear
  rear_bumper: { ar: 'الصدام الخلفي', en: 'Rear Bumper' },
  trunk: { ar: 'الشنطة', en: 'Trunk' },
  taillight_left: { ar: 'المصباح الخلفي الأيسر', en: 'Left Taillight' },
  taillight_right: { ar: 'المصباح الخلفي الأيمن', en: 'Right Taillight' },
  rear_windshield: { ar: 'الزجاج الخلفي', en: 'Rear Windshield' },
  // Left Side
  left_front_door: { ar: 'الباب الأمامي الأيسر', en: 'Left Front Door' },
  left_rear_door: { ar: 'الباب الخلفي الأيسر', en: 'Left Rear Door' },
  left_front_fender: { ar: 'الرفرف الأمامي الأيسر', en: 'Left Front Fender' },
  left_rear_quarter: { ar: 'الربع الخلفي الأيسر', en: 'Left Rear Quarter' },
  left_mirror: { ar: 'المرآة اليسرى', en: 'Left Mirror' },
  left_front_window: { ar: 'النافذة الأمامية اليسرى', en: 'Left Front Window' },
  left_rear_window: { ar: 'النافذة الخلفية اليسرى', en: 'Left Rear Window' },
  // Right Side
  right_front_door: { ar: 'الباب الأمامي الأيمن', en: 'Right Front Door' },
  right_rear_door: { ar: 'الباب الخلفي الأيمن', en: 'Right Rear Door' },
  right_front_fender: { ar: 'الرفرف الأمامي الأيمن', en: 'Right Front Fender' },
  right_rear_quarter: { ar: 'الربع الخلفي الأيمن', en: 'Right Rear Quarter' },
  right_mirror: { ar: 'المرآة اليمنى', en: 'Right Mirror' },
  right_front_window: { ar: 'النافذة الأمامية اليمنى', en: 'Right Front Window' },
  right_rear_window: { ar: 'النافذة الخلفية اليمنى', en: 'Right Rear Window' },
  // Top
  roof: { ar: 'السقف', en: 'Roof' },
  sunroof: { ar: 'الفتحة السقفية', en: 'Sunroof' },
  // Wheels
  wheel_front_left: { ar: 'العجلة الأمامية اليسرى', en: 'Front Left Wheel' },
  wheel_front_right: { ar: 'العجلة الأمامية اليمنى', en: 'Front Right Wheel' },
  wheel_rear_left: { ar: 'العجلة الخلفية اليسرى', en: 'Rear Left Wheel' },
  wheel_rear_right: { ar: 'العجلة الخلفية اليمنى', en: 'Rear Right Wheel' },
};


// All View Angles - جميع زوايا العرض
export const ALL_VIEW_ANGLES: ViewAngle[] = ['front', 'rear', 'left_side', 'right_side'];

// All Car Templates - جميع قوالب السيارات
export const ALL_CAR_TEMPLATES: CarTemplate[] = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van'];

// All Part Conditions - جميع حالات الأجزاء
export const ALL_PART_CONDITIONS: PartCondition[] = [
  'good',
  'scratch',
  'bodywork',
  'broken',
  'painted',
  'replaced',
  'not_inspected',
];

// All Damage Severities - جميع شدات الضرر
export const ALL_DAMAGE_SEVERITIES: DamageSeverity[] = ['light', 'medium', 'severe'];

// All Part Keys - جميع معرفات الأجزاء
export const ALL_PART_KEYS: PartKey[] = [
  // Front
  'front_bumper',
  'hood',
  'front_grille',
  'headlight_left',
  'headlight_right',
  'front_windshield',
  // Rear
  'rear_bumper',
  'trunk',
  'taillight_left',
  'taillight_right',
  'rear_windshield',
  // Left Side
  'left_front_door',
  'left_rear_door',
  'left_front_fender',
  'left_rear_quarter',
  'left_mirror',
  'left_front_window',
  'left_rear_window',
  // Right Side
  'right_front_door',
  'right_rear_door',
  'right_front_fender',
  'right_rear_quarter',
  'right_mirror',
  'right_front_window',
  'right_rear_window',
  // Top
  'roof',
  'sunroof',
  // Wheels
  'wheel_front_left',
  'wheel_front_right',
  'wheel_rear_left',
  'wheel_rear_right',
];

// Helper Functions

/**
 * Get color for a part condition
 */
export function getConditionColor(condition: PartCondition, partKey?: string): string {
  // Use wheel-specific colors for wheel parts
  if (partKey && isWheelPart(partKey)) {
    return getWheelConditionColor(condition);
  }
  return COLOR_BY_CONDITION[condition] || COLOR_BY_CONDITION.not_inspected;
}

/**
 * Get label for a part condition
 */
export function getConditionLabel(condition: PartCondition, language: 'ar' | 'en' = 'ar'): string {
  return CONDITION_LABELS[condition]?.[language] || CONDITION_LABELS.not_inspected[language];
}

/**
 * Get label for a severity
 */
export function getSeverityLabel(severity: DamageSeverity, language: 'ar' | 'en' = 'ar'): string {
  return SEVERITY_LABELS[severity]?.[language] || '';
}

/**
 * Get label for a view angle
 */
export function getViewAngleLabel(angle: ViewAngle, language: 'ar' | 'en' = 'ar'): string {
  return VIEW_ANGLE_LABELS[angle]?.[language] || '';
}

/**
 * Get label for a part key
 */
export function getPartLabel(partKey: PartKey, language: 'ar' | 'en' = 'ar'): string {
  return PART_LABELS[partKey]?.[language] || partKey;
}

/**
 * Get SVG path for a template and view angle
 */
export function getSVGPath(template: CarTemplate, angle: ViewAngle): string {
  // Map template to available SVG folders
  const templateFolder = template === 'hatchback' || template === 'coupe' || template === 'van' 
    ? 'sedan' // Fallback to sedan for templates without SVG
    : template;
  return `/svg/templates/${templateFolder}/${angle}.svg`;
}

/**
 * Check if a condition requires severity
 */
export function conditionRequiresSeverity(condition: PartCondition): boolean {
  return condition !== 'good' && condition !== 'not_inspected';
}
