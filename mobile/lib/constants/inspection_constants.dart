// VDS (Vehicle Damage System) Constants for Flutter Customer App
// Requirements: 4.1, 5.1, 9.1
// Matches web frontend constants in frontend/src/constants/vds.ts

import 'package:flutter/material.dart';
import '../models/inspection.dart';

/// Wheel Part Keys - مفاتيح أجزاء العجلات
const Set<String> wheelPartKeys = {
  'wheel_front_left',
  'wheel_front_right',
  'wheel_rear_left',
  'wheel_rear_right',
};

/// Check if a part key is a wheel
bool isWheelPart(String partKey) => wheelPartKeys.contains(partKey);

/// Wheel Condition Colors - ألوان حالات العجلات (فريدة ومختلفة عن ألوان الهيكل)
const Map<String, String> wheelConditionColors = {
  'good': '#10b981',      // Emerald - أخضر زمردي
  'scratch': '#f59e0b',   // Amber - كهرماني
  'bodywork': '#f97316',  // Orange - برتقالي
  'broken': '#dc2626',    // Red-600 - أحمر داكن
  'painted': '#6366f1',   // Indigo - نيلي
  'replaced': '#a855f7',  // Purple - بنفسجي فاتح
  'not_inspected': '#6b7280', // Gray-500 - رمادي
};

/// Tire/Wheel Condition Labels - تسميات حالات الإطارات (مختلفة عن أجزاء الهيكل)
/// Requirements: 15.3 - Tire-specific labels for VDS wheel parts
/// Synced with frontend/src/components/cars/InspectionViewer.tsx
const Map<VDSPartCondition, PartLabel> tireConditionLabels = {
  VDSPartCondition.good: PartLabel(ar: 'جديد', en: 'New'),
  VDSPartCondition.scratch: PartLabel(ar: 'مستهلك 50%', en: '50% Used'),
  VDSPartCondition.bodywork: PartLabel(ar: 'سمكرة', en: 'Bodywork'),
  VDSPartCondition.broken: PartLabel(ar: 'تالف', en: 'Damaged'),
  VDSPartCondition.painted: PartLabel(ar: 'رش', en: 'Painted'),
  VDSPartCondition.replaced: PartLabel(ar: 'تغيير', en: 'Replaced'),
  VDSPartCondition.notInspected: PartLabel(ar: 'غير مفحوص', en: 'Not Inspected'),
};

/// Get wheel condition color
String getWheelConditionColorHex(String condition) {
  return wheelConditionColors[condition] ?? wheelConditionColors['not_inspected']!;
}

/// Get wheel condition color from VDSPartCondition
String getWheelConditionColorHexFromCondition(VDSPartCondition condition) {
  switch (condition) {
    case VDSPartCondition.good:
      return wheelConditionColors['good']!;
    case VDSPartCondition.scratch:
      return wheelConditionColors['scratch']!;
    case VDSPartCondition.bodywork:
      return wheelConditionColors['bodywork']!;
    case VDSPartCondition.broken:
      return wheelConditionColors['broken']!;
    case VDSPartCondition.painted:
      return wheelConditionColors['painted']!;
    case VDSPartCondition.replaced:
      return wheelConditionColors['replaced']!;
    case VDSPartCondition.notInspected:
      return wheelConditionColors['not_inspected']!;
  }
}

/// Default Color Mappings - خريطة الألوان الافتراضية
const List<ColorMappingEntry> defaultColorMappings = [
  ColorMappingEntry(
    condition: VDSPartCondition.good,
    colorHex: '#22c55e',
    labelAr: 'سليم',
    labelEn: 'Good',
    sortOrder: 1,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.scratch,
    colorHex: '#eab308',
    labelAr: 'خدش',
    labelEn: 'Scratch',
    sortOrder: 2,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.bodywork,
    colorHex: '#f97316',
    labelAr: 'سمكرة',
    labelEn: 'Bodywork',
    sortOrder: 3,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.broken,
    colorHex: '#ef4444',
    labelAr: 'كسر',
    labelEn: 'Broken',
    sortOrder: 4,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.painted,
    colorHex: '#3b82f6',
    labelAr: 'رش',
    labelEn: 'Painted',
    sortOrder: 5,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.replaced,
    colorHex: '#8b5cf6',
    labelAr: 'تغيير',
    labelEn: 'Replaced',
    sortOrder: 6,
  ),
  ColorMappingEntry(
    condition: VDSPartCondition.notInspected,
    colorHex: '#9ca3af',
    labelAr: 'غير محدد',
    labelEn: 'Not Inspected',
    sortOrder: 7,
  ),
];

/// Color by Condition - الألوان حسب الحالة
const Map<VDSPartCondition, String> colorByCondition = {
  VDSPartCondition.good: '#22c55e',
  VDSPartCondition.scratch: '#eab308',
  VDSPartCondition.bodywork: '#f97316',
  VDSPartCondition.broken: '#ef4444',
  VDSPartCondition.painted: '#3b82f6',
  VDSPartCondition.replaced: '#8b5cf6',
  VDSPartCondition.notInspected: '#9ca3af',
};

/// Condition Labels - تسميات الحالات
const Map<VDSPartCondition, PartLabel> conditionLabels = {
  VDSPartCondition.good: PartLabel(ar: 'سليم', en: 'Good'),
  VDSPartCondition.scratch: PartLabel(ar: 'خدش', en: 'Scratch'),
  VDSPartCondition.bodywork: PartLabel(ar: 'سمكرة', en: 'Bodywork'),
  VDSPartCondition.broken: PartLabel(ar: 'كسر', en: 'Broken'),
  VDSPartCondition.painted: PartLabel(ar: 'رش', en: 'Painted'),
  VDSPartCondition.replaced: PartLabel(ar: 'تغيير', en: 'Replaced'),
  VDSPartCondition.notInspected: PartLabel(ar: 'غير محدد', en: 'Not Inspected'),
};

/// Severity Labels - تسميات الشدة
const Map<DamageSeverity, PartLabel> severityLabels = {
  DamageSeverity.light: PartLabel(ar: 'خفيف', en: 'Light'),
  DamageSeverity.medium: PartLabel(ar: 'متوسط', en: 'Medium'),
  DamageSeverity.severe: PartLabel(ar: 'شديد', en: 'Severe'),
};

/// View Angle Labels - تسميات زوايا العرض
const Map<ViewAngle, PartLabel> viewAngleLabels = {
  ViewAngle.front: PartLabel(ar: 'أمام', en: 'Front'),
  ViewAngle.rear: PartLabel(ar: 'خلف', en: 'Rear'),
  ViewAngle.leftSide: PartLabel(ar: 'الجانب الأيسر', en: 'Left Side'),
  ViewAngle.rightSide: PartLabel(ar: 'الجانب الأيمن', en: 'Right Side'),
  ViewAngle.top: PartLabel(ar: 'أعلى', en: 'Top'),
};

/// Car Template Labels - تسميات قوالب السيارات
const Map<CarTemplateType, PartLabel> carTemplateLabels = {
  CarTemplateType.sedan: PartLabel(ar: 'سيدان', en: 'Sedan'),
  CarTemplateType.suv: PartLabel(ar: 'SUV', en: 'SUV'),
  CarTemplateType.hatchback: PartLabel(ar: 'هاتشباك', en: 'Hatchback'),
  CarTemplateType.coupe: PartLabel(ar: 'كوبيه', en: 'Coupe'),
  CarTemplateType.pickup: PartLabel(ar: 'بيك أب', en: 'Pickup'),
  CarTemplateType.van: PartLabel(ar: 'فان', en: 'Van'),
};


/// Part Labels - تسميات الأجزاء
const Map<VDSPartKey, PartLabel> partLabels = {
  // Front
  VDSPartKey.frontBumper: PartLabel(ar: 'الصدام الأمامي', en: 'Front Bumper'),
  VDSPartKey.hood: PartLabel(ar: 'الكبوت', en: 'Hood'),
  VDSPartKey.frontGrille: PartLabel(ar: 'الشبك الأمامي', en: 'Front Grille'),
  VDSPartKey.headlightLeft: PartLabel(ar: 'المصباح الأمامي الأيسر', en: 'Left Headlight'),
  VDSPartKey.headlightRight: PartLabel(ar: 'المصباح الأمامي الأيمن', en: 'Right Headlight'),
  VDSPartKey.frontWindshield: PartLabel(ar: 'الزجاج الأمامي', en: 'Front Windshield'),
  // Rear
  VDSPartKey.rearBumper: PartLabel(ar: 'الصدام الخلفي', en: 'Rear Bumper'),
  VDSPartKey.trunk: PartLabel(ar: 'الشنطة', en: 'Trunk'),
  VDSPartKey.taillightLeft: PartLabel(ar: 'المصباح الخلفي الأيسر', en: 'Left Taillight'),
  VDSPartKey.taillightRight: PartLabel(ar: 'المصباح الخلفي الأيمن', en: 'Right Taillight'),
  VDSPartKey.rearWindshield: PartLabel(ar: 'الزجاج الخلفي', en: 'Rear Windshield'),
  // Left Side
  VDSPartKey.leftFrontDoor: PartLabel(ar: 'الباب الأمامي الأيسر', en: 'Left Front Door'),
  VDSPartKey.leftRearDoor: PartLabel(ar: 'الباب الخلفي الأيسر', en: 'Left Rear Door'),
  VDSPartKey.leftFrontFender: PartLabel(ar: 'الرفرف الأمامي الأيسر', en: 'Left Front Fender'),
  VDSPartKey.leftRearQuarter: PartLabel(ar: 'الربع الخلفي الأيسر', en: 'Left Rear Quarter'),
  VDSPartKey.leftMirror: PartLabel(ar: 'المرآة اليسرى', en: 'Left Mirror'),
  VDSPartKey.leftFrontWindow: PartLabel(ar: 'النافذة الأمامية اليسرى', en: 'Left Front Window'),
  VDSPartKey.leftRearWindow: PartLabel(ar: 'النافذة الخلفية اليسرى', en: 'Left Rear Window'),
  // Right Side
  VDSPartKey.rightFrontDoor: PartLabel(ar: 'الباب الأمامي الأيمن', en: 'Right Front Door'),
  VDSPartKey.rightRearDoor: PartLabel(ar: 'الباب الخلفي الأيمن', en: 'Right Rear Door'),
  VDSPartKey.rightFrontFender: PartLabel(ar: 'الرفرف الأمامي الأيمن', en: 'Right Front Fender'),
  VDSPartKey.rightRearQuarter: PartLabel(ar: 'الربع الخلفي الأيمن', en: 'Right Rear Quarter'),
  VDSPartKey.rightMirror: PartLabel(ar: 'المرآة اليمنى', en: 'Right Mirror'),
  VDSPartKey.rightFrontWindow: PartLabel(ar: 'النافذة الأمامية اليمنى', en: 'Right Front Window'),
  VDSPartKey.rightRearWindow: PartLabel(ar: 'النافذة الخلفية اليمنى', en: 'Right Rear Window'),
  // Top
  VDSPartKey.roof: PartLabel(ar: 'السقف', en: 'Roof'),
  VDSPartKey.sunroof: PartLabel(ar: 'الفتحة السقفية', en: 'Sunroof'),
  // Wheels
  VDSPartKey.wheelFrontLeft: PartLabel(ar: 'العجلة الأمامية اليسرى', en: 'Front Left Wheel'),
  VDSPartKey.wheelFrontRight: PartLabel(ar: 'العجلة الأمامية اليمنى', en: 'Front Right Wheel'),
  VDSPartKey.wheelRearLeft: PartLabel(ar: 'العجلة الخلفية اليسرى', en: 'Rear Left Wheel'),
  VDSPartKey.wheelRearRight: PartLabel(ar: 'العجلة الخلفية اليمنى', en: 'Rear Right Wheel'),
};

/// All View Angles - جميع زوايا العرض (primary 4)
const List<ViewAngle> allViewAngles = [
  ViewAngle.front,
  ViewAngle.rear,
  ViewAngle.leftSide,
  ViewAngle.rightSide,
];

/// All Car Templates - جميع قوالب السيارات
const List<CarTemplateType> allCarTemplates = [
  CarTemplateType.sedan,
  CarTemplateType.suv,
  CarTemplateType.hatchback,
  CarTemplateType.coupe,
  CarTemplateType.pickup,
  CarTemplateType.van,
];

/// All Part Conditions - جميع حالات الأجزاء
const List<VDSPartCondition> allPartConditions = [
  VDSPartCondition.good,
  VDSPartCondition.scratch,
  VDSPartCondition.bodywork,
  VDSPartCondition.broken,
  VDSPartCondition.painted,
  VDSPartCondition.replaced,
  VDSPartCondition.notInspected,
];

/// All Damage Severities - جميع شدات الضرر
const List<DamageSeverity> allDamageSeverities = [
  DamageSeverity.light,
  DamageSeverity.medium,
  DamageSeverity.severe,
];

/// All Part Keys - جميع معرفات الأجزاء
const List<VDSPartKey> allPartKeys = VDSPartKey.values;


// ==================== Helper Functions ====================

/// Parse hex color string to Color
Color hexToColor(String hexString) {
  final buffer = StringBuffer();
  if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
  buffer.write(hexString.replaceFirst('#', ''));
  return Color(int.parse(buffer.toString(), radix: 16));
}

/// Get color for a part condition
Color getConditionColor(VDSPartCondition condition) {
  final hex = colorByCondition[condition] ?? colorByCondition[VDSPartCondition.notInspected]!;
  return hexToColor(hex);
}

/// Get hex color string for a part condition
String getConditionColorHex(VDSPartCondition condition) {
  return colorByCondition[condition] ?? colorByCondition[VDSPartCondition.notInspected]!;
}

/// Get label for a part condition
String getConditionLabel(VDSPartCondition condition, {String language = 'ar'}) {
  final label = conditionLabels[condition] ?? conditionLabels[VDSPartCondition.notInspected]!;
  return label.getLabel(language);
}

/// Get label for a tire/wheel condition (different labels than body parts)
/// Requirements: 15.3 - Tire-specific labels
String getTireConditionLabel(VDSPartCondition condition, {String language = 'ar'}) {
  final label = tireConditionLabels[condition] ?? tireConditionLabels[VDSPartCondition.notInspected]!;
  return label.getLabel(language);
}

/// Get condition label based on part type (wheel vs body part)
/// Requirements: 15.3 - Returns tire-specific labels for wheel parts
String getPartConditionLabel(String partKey, VDSPartCondition condition, {String language = 'ar'}) {
  if (isWheelPart(partKey)) {
    return getTireConditionLabel(condition, language: language);
  }
  return getConditionLabel(condition, language: language);
}

/// Get label for a severity
String getSeverityLabel(DamageSeverity severity, {String language = 'ar'}) {
  final label = severityLabels[severity];
  return label?.getLabel(language) ?? '';
}

/// Get label for a view angle
String getViewAngleLabel(ViewAngle angle, {String language = 'ar'}) {
  final label = viewAngleLabels[angle];
  return label?.getLabel(language) ?? '';
}

/// Get label for a car template
String getCarTemplateLabel(CarTemplateType template, {String language = 'ar'}) {
  final label = carTemplateLabels[template];
  return label?.getLabel(language) ?? '';
}

/// Get label for a part key
String getPartLabel(VDSPartKey partKey, {String language = 'ar'}) {
  final label = partLabels[partKey];
  return label?.getLabel(language) ?? partKey.value;
}

/// Get label for a part key string
String getPartLabelByString(String partKeyString, {String language = 'ar'}) {
  try {
    final partKey = VDSPartKey.values.firstWhere((e) => e.value == partKeyString);
    return getPartLabel(partKey, language: language);
  } catch (_) {
    return partKeyString;
  }
}

/// Get SVG asset path for a template and view angle
String getSvgAssetPath(CarTemplateType template, ViewAngle angle) {
  // Map template to available SVG folders
  String templateFolder;
  switch (template) {
    case CarTemplateType.sedan:
    case CarTemplateType.hatchback:
    case CarTemplateType.coupe:
    case CarTemplateType.van:
      templateFolder = 'sedan'; // Fallback to sedan for templates without SVG
      break;
    case CarTemplateType.suv:
      templateFolder = 'suv';
      break;
    case CarTemplateType.pickup:
      templateFolder = 'pickup';
      break;
  }
  return 'assets/svg/templates/$templateFolder/${angle.value}.svg';
}

/// Get SVG network URL for a template and view angle
String getSvgNetworkUrl(String baseUrl, CarTemplateType template, ViewAngle angle) {
  // Map template to available SVG folders
  String templateFolder;
  switch (template) {
    case CarTemplateType.sedan:
    case CarTemplateType.hatchback:
    case CarTemplateType.coupe:
    case CarTemplateType.van:
      templateFolder = 'sedan'; // Fallback to sedan for templates without SVG
      break;
    case CarTemplateType.suv:
      templateFolder = 'suv';
      break;
    case CarTemplateType.pickup:
      templateFolder = 'pickup';
      break;
  }
  return '$baseUrl/svg/templates/$templateFolder/${angle.value}.svg';
}

/// Check if a condition requires severity
bool conditionRequiresSeverity(VDSPartCondition condition) {
  return condition != VDSPartCondition.good && condition != VDSPartCondition.notInspected;
}

/// Get color mapping entry for a condition
ColorMappingEntry? getColorMappingEntry(VDSPartCondition condition) {
  try {
    return defaultColorMappings.firstWhere((e) => e.condition == condition);
  } catch (_) {
    return null;
  }
}
