/**
 * VDS (Vehicle Damage System) Types
 * Types for the 2D SVG-based inspection system
 * Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 8.1
 */

// View Angles - زوايا العرض
export type ViewAngle = 'front' | 'rear' | 'left_side' | 'right_side' | 'top';

// Car Templates - قوالب السيارات
export type CarTemplate = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'van';

// Part Condition - حالة الجزء (VDS specific)
export type PartCondition = 'good' | 'scratch' | 'bodywork' | 'broken' | 'painted' | 'replaced' | 'not_inspected';

// Damage Severity - شدة الضرر
export type DamageSeverity = 'light' | 'medium' | 'severe';

// Part Key - معرف الجزء
export type PartKey =
  // Front
  | 'front_bumper'
  | 'hood'
  | 'front_grille'
  | 'headlight_left'
  | 'headlight_right'
  | 'front_windshield'
  // Rear
  | 'rear_bumper'
  | 'trunk'
  | 'taillight_left'
  | 'taillight_right'
  | 'rear_windshield'
  // Left Side
  | 'left_front_door'
  | 'left_rear_door'
  | 'left_front_fender'
  | 'left_rear_quarter'
  | 'left_mirror'
  | 'left_front_window'
  | 'left_rear_window'
  // Right Side
  | 'right_front_door'
  | 'right_rear_door'
  | 'right_front_fender'
  | 'right_rear_quarter'
  | 'right_mirror'
  | 'right_front_window'
  | 'right_rear_window'
  // Top
  | 'roof'
  | 'sunroof'
  // Wheels
  | 'wheel_front_left'
  | 'wheel_front_right'
  | 'wheel_rear_left'
  | 'wheel_rear_right';

// Part Damage Data - بيانات ضرر الجزء
export interface PartDamageData {
  partKey: PartKey;
  condition: PartCondition;
  severity?: DamageSeverity;
  notes?: string;
  photos?: string[];
  updatedAt?: string;
}

// Part Label - تسمية الجزء
export interface PartLabel {
  ar: string;
  en: string;
}

// Color Mapping Entry - إدخال خريطة الألوان
export interface ColorMappingEntry {
  condition: PartCondition;
  colorHex: string;
  labelAr: string;
  labelEn: string;
}

// SVG Inspection Viewer Props
export interface SVGInspectionViewerProps {
  templateType: CarTemplate;
  viewAngle: ViewAngle;
  partsStatus: Record<string, PartDamageData>;
  onPartClick?: (partKey: PartKey) => void;
  onPartHover?: (partKey: PartKey | null) => void;
  readOnly?: boolean;
  language?: 'ar' | 'en';
  showLegend?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  className?: string;
}

// View Angle Tabs Props
export interface ViewAngleTabsProps {
  currentAngle: ViewAngle;
  onAngleChange: (angle: ViewAngle) => void;
  availableAngles?: ViewAngle[];
  language?: 'ar' | 'en';
  className?: string;
}

// Part Damage Form Props
export interface PartDamageFormProps {
  partKey: PartKey;
  partLabel: PartLabel;
  currentData?: PartDamageData;
  onSave: (data: PartDamageData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  language?: 'ar' | 'en';
}

// Color Legend Props
export interface ColorLegendProps {
  colorMappings?: ColorMappingEntry[];
  language?: 'ar' | 'en';
  compact?: boolean;
  className?: string;
}


// ==================== VDS Admin Types ====================

// Template from API (list view - without SVG content)
export interface VDSTemplate {
  id: number;
  nameAr: string;
  nameEn: string;
  type: CarTemplate;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Template with full details (including SVG content)
export interface VDSTemplateDetail extends VDSTemplate {
  svgFront: string;
  svgRear: string;
  svgLeftSide: string;
  svgRightSide: string;
  svgTop?: string;
  partMappings: VDSPartMapping[];
}

// Part mapping for templates
export interface VDSPartMapping {
  partKey: string;
  svgElementId: string;
  viewAngles: ViewAngle[];
  isVisible: boolean;
  labelAr?: string;
  labelEn?: string;
  category?: string;
}

// Part Key from API
export interface VDSPartKey {
  id: number;
  partKey: string;
  labelAr: string;
  labelEn: string;
  category: 'front' | 'rear' | 'left' | 'right' | 'top' | 'wheels';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

// Color Mapping from API
export interface VDSColorMapping {
  id: number;
  conditionKey: PartCondition;
  colorHex: string;
  labelAr: string;
  labelEn: string;
  sortOrder: number;
  updatedAt: string;
}

// Create Template Input
export interface CreateTemplateInput {
  nameAr: string;
  nameEn: string;
  type: CarTemplate;
  isActive?: boolean;
  isDefault?: boolean;
  svgFront: string;
  svgRear: string;
  svgLeftSide: string;
  svgRightSide: string;
  svgTop?: string;
  partMappings?: Omit<VDSPartMapping, 'labelAr' | 'labelEn' | 'category'>[];
}

// Update Template Input
export interface UpdateTemplateInput {
  nameAr?: string;
  nameEn?: string;
  type?: CarTemplate;
  isActive?: boolean;
  isDefault?: boolean;
  svgFront?: string;
  svgRear?: string;
  svgLeftSide?: string;
  svgRightSide?: string;
  svgTop?: string;
  partMappings?: Omit<VDSPartMapping, 'labelAr' | 'labelEn' | 'category'>[];
}

// Create Part Key Input
export interface CreatePartKeyInput {
  partKey: string;
  labelAr: string;
  labelEn: string;
  category: 'front' | 'rear' | 'left' | 'right' | 'top' | 'wheels';
  sortOrder?: number;
  isActive?: boolean;
}

// Update Part Key Input
export interface UpdatePartKeyInput {
  labelAr?: string;
  labelEn?: string;
  category?: 'front' | 'rear' | 'left' | 'right' | 'top' | 'wheels';
  sortOrder?: number;
  isActive?: boolean;
}

// Update Color Mapping Input
export interface UpdateColorMappingInput {
  conditionKey: PartCondition;
  colorHex: string;
  labelAr: string;
  labelEn: string;
  sortOrder?: number;
}
