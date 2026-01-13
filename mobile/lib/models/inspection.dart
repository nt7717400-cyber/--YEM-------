// VDS (Vehicle Damage System) Models for Flutter Customer App
// Requirements: 5.1, 4.1, 8.1
// Matches web frontend types in frontend/src/types/vds.ts

/// View Angle - زاوية العرض
enum ViewAngle {
  front('front'),
  rear('rear'),
  leftSide('left_side'),
  rightSide('right_side'),
  top('top');

  final String value;
  const ViewAngle(this.value);

  static ViewAngle fromString(String value) {
    return ViewAngle.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ViewAngle.front,
    );
  }

  String toJson() => value;
}

/// Car Template - قالب السيارة
enum CarTemplateType {
  sedan('sedan'),
  suv('suv'),
  hatchback('hatchback'),
  coupe('coupe'),
  pickup('pickup'),
  van('van');

  final String value;
  const CarTemplateType(this.value);

  static CarTemplateType fromString(String value) {
    return CarTemplateType.values.firstWhere(
      (e) => e.value == value.toLowerCase(),
      orElse: () => CarTemplateType.sedan,
    );
  }

  String toJson() => value;
}

/// Part Condition - حالة الجزء (VDS specific)
enum VDSPartCondition {
  good('good'),
  scratch('scratch'),
  bodywork('bodywork'),
  broken('broken'),
  painted('painted'),
  replaced('replaced'),
  notInspected('not_inspected');

  final String value;
  const VDSPartCondition(this.value);

  static VDSPartCondition fromString(String value) {
    return VDSPartCondition.values.firstWhere(
      (e) => e.value == value,
      orElse: () => VDSPartCondition.notInspected,
    );
  }

  String toJson() => value;

  /// Check if this condition requires severity
  bool get requiresSeverity => this != good && this != notInspected;
}

/// Damage Severity - شدة الضرر
enum DamageSeverity {
  light('light'),
  medium('medium'),
  severe('severe');

  final String value;
  const DamageSeverity(this.value);

  static DamageSeverity? fromString(String? value) {
    if (value == null) return null;
    return DamageSeverity.values.firstWhere(
      (e) => e.value == value,
      orElse: () => DamageSeverity.light,
    );
  }

  String toJson() => value;
}

/// Part Key - معرف الجزء
enum VDSPartKey {
  // Front
  frontBumper('front_bumper'),
  hood('hood'),
  frontGrille('front_grille'),
  headlightLeft('headlight_left'),
  headlightRight('headlight_right'),
  frontWindshield('front_windshield'),
  // Rear
  rearBumper('rear_bumper'),
  trunk('trunk'),
  taillightLeft('taillight_left'),
  taillightRight('taillight_right'),
  rearWindshield('rear_windshield'),
  // Left Side
  leftFrontDoor('left_front_door'),
  leftRearDoor('left_rear_door'),
  leftFrontFender('left_front_fender'),
  leftRearQuarter('left_rear_quarter'),
  leftMirror('left_mirror'),
  leftFrontWindow('left_front_window'),
  leftRearWindow('left_rear_window'),
  // Right Side
  rightFrontDoor('right_front_door'),
  rightRearDoor('right_rear_door'),
  rightFrontFender('right_front_fender'),
  rightRearQuarter('right_rear_quarter'),
  rightMirror('right_mirror'),
  rightFrontWindow('right_front_window'),
  rightRearWindow('right_rear_window'),
  // Top
  roof('roof'),
  sunroof('sunroof'),
  // Wheels
  wheelFrontLeft('wheel_front_left'),
  wheelFrontRight('wheel_front_right'),
  wheelRearLeft('wheel_rear_left'),
  wheelRearRight('wheel_rear_right');

  final String value;
  const VDSPartKey(this.value);

  static VDSPartKey fromString(String value) {
    return VDSPartKey.values.firstWhere(
      (e) => e.value == value,
      orElse: () => VDSPartKey.frontBumper,
    );
  }

  String toJson() => value;
}

/// Inspection Status - حالة الفحص
enum InspectionStatus {
  draft('draft'),
  finalized('finalized');

  final String value;
  const InspectionStatus(this.value);

  static InspectionStatus fromString(String value) {
    return InspectionStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => InspectionStatus.draft,
    );
  }

  String toJson() => value;
}

/// Part Category - فئة الجزء
enum PartCategory {
  front('front'),
  rear('rear'),
  left('left'),
  right('right'),
  top('top'),
  wheels('wheels');

  final String value;
  const PartCategory(this.value);

  static PartCategory fromString(String value) {
    return PartCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => PartCategory.front,
    );
  }

  String toJson() => value;
}


// ==================== Data Classes ====================

/// Part Label - تسمية الجزء
class PartLabel {
  final String ar;
  final String en;

  const PartLabel({required this.ar, required this.en});

  factory PartLabel.fromJson(Map<String, dynamic> json) {
    return PartLabel(
      ar: json['ar'] as String? ?? '',
      en: json['en'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'ar': ar, 'en': en};

  String getLabel(String language) => language == 'ar' ? ar : en;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PartLabel &&
          runtimeType == other.runtimeType &&
          ar == other.ar &&
          en == other.en;

  @override
  int get hashCode => ar.hashCode ^ en.hashCode;
}

/// Color Mapping Entry - إدخال خريطة الألوان
class ColorMappingEntry {
  final VDSPartCondition condition;
  final String colorHex;
  final String labelAr;
  final String labelEn;
  final int sortOrder;

  const ColorMappingEntry({
    required this.condition,
    required this.colorHex,
    required this.labelAr,
    required this.labelEn,
    this.sortOrder = 0,
  });

  factory ColorMappingEntry.fromJson(Map<String, dynamic> json) {
    return ColorMappingEntry(
      condition: VDSPartCondition.fromString(
        json['conditionKey'] as String? ?? json['condition'] as String? ?? 'not_inspected',
      ),
      colorHex: json['colorHex'] as String? ?? json['color_hex'] as String? ?? '#9ca3af',
      labelAr: json['labelAr'] as String? ?? json['label_ar'] as String? ?? '',
      labelEn: json['labelEn'] as String? ?? json['label_en'] as String? ?? '',
      sortOrder: json['sortOrder'] as int? ?? json['sort_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'conditionKey': condition.toJson(),
    'colorHex': colorHex,
    'labelAr': labelAr,
    'labelEn': labelEn,
    'sortOrder': sortOrder,
  };

  String getLabel(String language) => language == 'ar' ? labelAr : labelEn;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ColorMappingEntry &&
          runtimeType == other.runtimeType &&
          condition == other.condition &&
          colorHex == other.colorHex;

  @override
  int get hashCode => condition.hashCode ^ colorHex.hashCode;
}

/// Part Damage Data - بيانات ضرر الجزء
class PartDamageData {
  final String partKey;
  final VDSPartCondition condition;
  final DamageSeverity? severity;
  final String? notes;
  final List<String> photos;
  final DateTime? updatedAt;

  const PartDamageData({
    required this.partKey,
    required this.condition,
    this.severity,
    this.notes,
    this.photos = const [],
    this.updatedAt,
  });

  factory PartDamageData.fromJson(Map<String, dynamic> json) {
    return PartDamageData(
      partKey: json['partKey'] as String? ?? json['part_key'] as String? ?? '',
      condition: VDSPartCondition.fromString(json['condition'] as String? ?? 'not_inspected'),
      severity: DamageSeverity.fromString(json['severity'] as String?),
      notes: json['notes'] as String?,
      photos: (json['photos'] as List<dynamic>?)?.cast<String>() ?? [],
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'partKey': partKey,
    'condition': condition.toJson(),
    if (severity != null) 'severity': severity!.toJson(),
    if (notes != null) 'notes': notes,
    'photos': photos,
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };

  PartDamageData copyWith({
    String? partKey,
    VDSPartCondition? condition,
    DamageSeverity? severity,
    String? notes,
    List<String>? photos,
    DateTime? updatedAt,
  }) {
    return PartDamageData(
      partKey: partKey ?? this.partKey,
      condition: condition ?? this.condition,
      severity: severity ?? this.severity,
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PartDamageData &&
          runtimeType == other.runtimeType &&
          partKey == other.partKey &&
          condition == other.condition &&
          severity == other.severity;

  @override
  int get hashCode => partKey.hashCode ^ condition.hashCode ^ severity.hashCode;
}


/// VDS Part Key (from API) - معرف الجزء من الـ API
class VDSPartKeyData {
  final int id;
  final String partKey;
  final String labelAr;
  final String labelEn;
  final PartCategory category;
  final int sortOrder;
  final bool isActive;
  final DateTime? createdAt;

  const VDSPartKeyData({
    required this.id,
    required this.partKey,
    required this.labelAr,
    required this.labelEn,
    required this.category,
    this.sortOrder = 0,
    this.isActive = true,
    this.createdAt,
  });

  factory VDSPartKeyData.fromJson(Map<String, dynamic> json) {
    return VDSPartKeyData(
      id: json['id'] as int? ?? 0,
      partKey: json['partKey'] as String? ?? json['part_key'] as String? ?? '',
      labelAr: json['labelAr'] as String? ?? json['label_ar'] as String? ?? '',
      labelEn: json['labelEn'] as String? ?? json['label_en'] as String? ?? '',
      category: PartCategory.fromString(json['category'] as String? ?? 'front'),
      sortOrder: json['sortOrder'] as int? ?? json['sort_order'] as int? ?? 0,
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'partKey': partKey,
    'labelAr': labelAr,
    'labelEn': labelEn,
    'category': category.toJson(),
    'sortOrder': sortOrder,
    'isActive': isActive,
    if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
  };

  String getLabel(String language) => language == 'ar' ? labelAr : labelEn;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VDSPartKeyData &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          partKey == other.partKey;

  @override
  int get hashCode => id.hashCode ^ partKey.hashCode;
}

/// VDS Template (from API) - قالب السيارة من الـ API
class VDSTemplate {
  final int id;
  final String nameAr;
  final String nameEn;
  final CarTemplateType type;
  final bool isActive;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  const VDSTemplate({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.type,
    this.isActive = true,
    this.isDefault = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory VDSTemplate.fromJson(Map<String, dynamic> json) {
    return VDSTemplate(
      id: json['id'] as int? ?? 0,
      nameAr: json['nameAr'] as String? ?? json['name_ar'] as String? ?? '',
      nameEn: json['nameEn'] as String? ?? json['name_en'] as String? ?? '',
      type: CarTemplateType.fromString(json['type'] as String? ?? 'sedan'),
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      isDefault: json['isDefault'] as bool? ?? json['is_default'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? json['created_at'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? json['updated_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nameAr': nameAr,
    'nameEn': nameEn,
    'type': type.toJson(),
    'isActive': isActive,
    'isDefault': isDefault,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  String getName(String language) => language == 'ar' ? nameAr : nameEn;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VDSTemplate &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

/// VDS Part Mapping - ربط الجزء بالقالب
class VDSPartMapping {
  final String partKey;
  final String svgElementId;
  final List<ViewAngle> viewAngles;
  final bool isVisible;
  final String? labelAr;
  final String? labelEn;
  final String? category;

  const VDSPartMapping({
    required this.partKey,
    required this.svgElementId,
    required this.viewAngles,
    this.isVisible = true,
    this.labelAr,
    this.labelEn,
    this.category,
  });

  factory VDSPartMapping.fromJson(Map<String, dynamic> json) {
    return VDSPartMapping(
      partKey: json['partKey'] as String? ?? json['part_key'] as String? ?? '',
      svgElementId: json['svgElementId'] as String? ?? json['svg_element_id'] as String? ?? '',
      viewAngles: (json['viewAngles'] as List<dynamic>?)
              ?.map((e) => ViewAngle.fromString(e as String))
              .toList() ??
          [],
      isVisible: json['isVisible'] as bool? ?? json['is_visible'] as bool? ?? true,
      labelAr: json['labelAr'] as String? ?? json['label_ar'] as String?,
      labelEn: json['labelEn'] as String? ?? json['label_en'] as String?,
      category: json['category'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'partKey': partKey,
    'svgElementId': svgElementId,
    'viewAngles': viewAngles.map((e) => e.toJson()).toList(),
    'isVisible': isVisible,
    if (labelAr != null) 'labelAr': labelAr,
    if (labelEn != null) 'labelEn': labelEn,
    if (category != null) 'category': category,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VDSPartMapping &&
          runtimeType == other.runtimeType &&
          partKey == other.partKey &&
          svgElementId == other.svgElementId;

  @override
  int get hashCode => partKey.hashCode ^ svgElementId.hashCode;
}


/// VDS Template Detail (with SVG content) - تفاصيل القالب مع محتوى SVG
class VDSTemplateDetail extends VDSTemplate {
  final String svgFront;
  final String svgRear;
  final String svgLeftSide;
  final String svgRightSide;
  final String? svgTop;
  final List<VDSPartMapping> partMappings;

  const VDSTemplateDetail({
    required super.id,
    required super.nameAr,
    required super.nameEn,
    required super.type,
    super.isActive,
    super.isDefault,
    required super.createdAt,
    required super.updatedAt,
    required this.svgFront,
    required this.svgRear,
    required this.svgLeftSide,
    required this.svgRightSide,
    this.svgTop,
    this.partMappings = const [],
  });

  factory VDSTemplateDetail.fromJson(Map<String, dynamic> json) {
    return VDSTemplateDetail(
      id: json['id'] as int? ?? 0,
      nameAr: json['nameAr'] as String? ?? json['name_ar'] as String? ?? '',
      nameEn: json['nameEn'] as String? ?? json['name_en'] as String? ?? '',
      type: CarTemplateType.fromString(json['type'] as String? ?? 'sedan'),
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      isDefault: json['isDefault'] as bool? ?? json['is_default'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? json['created_at'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? json['updated_at'] as String? ?? '') ?? DateTime.now(),
      svgFront: json['svgFront'] as String? ?? json['svg_front'] as String? ?? '',
      svgRear: json['svgRear'] as String? ?? json['svg_rear'] as String? ?? '',
      svgLeftSide: json['svgLeftSide'] as String? ?? json['svg_left_side'] as String? ?? '',
      svgRightSide: json['svgRightSide'] as String? ?? json['svg_right_side'] as String? ?? '',
      svgTop: json['svgTop'] as String? ?? json['svg_top'] as String?,
      partMappings: (json['partMappings'] as List<dynamic>?)
              ?.map((e) => VDSPartMapping.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  @override
  Map<String, dynamic> toJson() => {
    ...super.toJson(),
    'svgFront': svgFront,
    'svgRear': svgRear,
    'svgLeftSide': svgLeftSide,
    'svgRightSide': svgRightSide,
    if (svgTop != null) 'svgTop': svgTop,
    'partMappings': partMappings.map((e) => e.toJson()).toList(),
  };

  /// Get SVG content for a specific view angle
  String? getSvgForAngle(ViewAngle angle) {
    switch (angle) {
      case ViewAngle.front:
        return svgFront;
      case ViewAngle.rear:
        return svgRear;
      case ViewAngle.leftSide:
        return svgLeftSide;
      case ViewAngle.rightSide:
        return svgRightSide;
      case ViewAngle.top:
        return svgTop;
    }
  }
}

/// Vehicle Info - معلومات المركبة
class VehicleInfo {
  final String? make;
  final String? model;
  final int? year;
  final String? vin;
  final String? plate;
  final String? color;
  final int? mileage;

  const VehicleInfo({
    this.make,
    this.model,
    this.year,
    this.vin,
    this.plate,
    this.color,
    this.mileage,
  });

  factory VehicleInfo.fromJson(Map<String, dynamic> json) {
    return VehicleInfo(
      make: json['make'] as String?,
      model: json['model'] as String?,
      year: json['year'] as int?,
      vin: json['vin'] as String?,
      plate: json['plate'] as String?,
      color: json['color'] as String?,
      mileage: json['mileage'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
    if (make != null) 'make': make,
    if (model != null) 'model': model,
    if (year != null) 'year': year,
    if (vin != null) 'vin': vin,
    if (plate != null) 'plate': plate,
    if (color != null) 'color': color,
    if (mileage != null) 'mileage': mileage,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VehicleInfo &&
          runtimeType == other.runtimeType &&
          make == other.make &&
          model == other.model &&
          year == other.year &&
          vin == other.vin &&
          plate == other.plate;

  @override
  int get hashCode =>
      make.hashCode ^ model.hashCode ^ year.hashCode ^ vin.hashCode ^ plate.hashCode;
}

/// Customer Info - معلومات العميل
class CustomerInfo {
  final String? name;
  final String? phone;
  final String? email;

  const CustomerInfo({
    this.name,
    this.phone,
    this.email,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    if (name != null) 'name': name,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CustomerInfo &&
          runtimeType == other.runtimeType &&
          name == other.name &&
          phone == other.phone &&
          email == other.email;

  @override
  int get hashCode => name.hashCode ^ phone.hashCode ^ email.hashCode;
}

/// Inspector Info - معلومات الفاحص
class InspectorInfo {
  final int? id;
  final String? name;

  const InspectorInfo({
    this.id,
    this.name,
  });

  factory InspectorInfo.fromJson(Map<String, dynamic> json) {
    return InspectorInfo(
      id: json['id'] as int?,
      name: json['name'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    if (name != null) 'name': name,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InspectorInfo &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name;

  @override
  int get hashCode => id.hashCode ^ name.hashCode;
}


/// VDS Inspection - بيانات الفحص الكاملة
class VDSInspection {
  final int id;
  final int? carId;
  final int templateId;
  final CarTemplateType templateType;
  final VehicleInfo vehicle;
  final CustomerInfo customer;
  final InspectorInfo inspector;
  final List<PartDamageData> parts;
  final String? generalNotes;
  final InspectionStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? finalizedAt;

  const VDSInspection({
    required this.id,
    this.carId,
    required this.templateId,
    required this.templateType,
    required this.vehicle,
    required this.customer,
    required this.inspector,
    this.parts = const [],
    this.generalNotes,
    this.status = InspectionStatus.draft,
    required this.createdAt,
    required this.updatedAt,
    this.finalizedAt,
  });

  factory VDSInspection.fromJson(Map<String, dynamic> json) {
    return VDSInspection(
      id: json['id'] as int? ?? 0,
      carId: json['carId'] as int? ?? json['car_id'] as int?,
      templateId: json['templateId'] as int? ?? json['template_id'] as int? ?? 0,
      templateType: CarTemplateType.fromString(json['templateType'] as String? ?? json['template_type'] as String? ?? 'sedan'),
      vehicle: json['vehicle'] != null
          ? VehicleInfo.fromJson(json['vehicle'] as Map<String, dynamic>)
          : const VehicleInfo(),
      customer: json['customer'] != null
          ? CustomerInfo.fromJson(json['customer'] as Map<String, dynamic>)
          : const CustomerInfo(),
      inspector: json['inspector'] != null
          ? InspectorInfo.fromJson(json['inspector'] as Map<String, dynamic>)
          : const InspectorInfo(),
      parts: (json['parts'] as List<dynamic>?)
              ?.map((e) => PartDamageData.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      generalNotes: json['generalNotes'] as String? ?? json['general_notes'] as String?,
      status: InspectionStatus.fromString(json['status'] as String? ?? 'draft'),
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? json['created_at'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? json['updated_at'] as String? ?? '') ?? DateTime.now(),
      finalizedAt: json['finalizedAt'] != null
          ? DateTime.tryParse(json['finalizedAt'] as String)
          : json['finalized_at'] != null
              ? DateTime.tryParse(json['finalized_at'] as String)
              : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    if (carId != null) 'carId': carId,
    'templateId': templateId,
    'templateType': templateType.toJson(),
    'vehicle': vehicle.toJson(),
    'customer': customer.toJson(),
    'inspector': inspector.toJson(),
    'parts': parts.map((e) => e.toJson()).toList(),
    if (generalNotes != null) 'generalNotes': generalNotes,
    'status': status.toJson(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    if (finalizedAt != null) 'finalizedAt': finalizedAt!.toIso8601String(),
  };

  VDSInspection copyWith({
    int? id,
    int? carId,
    int? templateId,
    CarTemplateType? templateType,
    VehicleInfo? vehicle,
    CustomerInfo? customer,
    InspectorInfo? inspector,
    List<PartDamageData>? parts,
    String? generalNotes,
    InspectionStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? finalizedAt,
  }) {
    return VDSInspection(
      id: id ?? this.id,
      carId: carId ?? this.carId,
      templateId: templateId ?? this.templateId,
      templateType: templateType ?? this.templateType,
      vehicle: vehicle ?? this.vehicle,
      customer: customer ?? this.customer,
      inspector: inspector ?? this.inspector,
      parts: parts ?? this.parts,
      generalNotes: generalNotes ?? this.generalNotes,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      finalizedAt: finalizedAt ?? this.finalizedAt,
    );
  }

  /// Check if inspection is finalized (locked)
  bool get isFinalized => status == InspectionStatus.finalized;

  /// Get part damage data by part key
  PartDamageData? getPartData(String partKey) {
    try {
      return parts.firstWhere((p) => p.partKey == partKey);
    } catch (_) {
      return null;
    }
  }

  /// Get parts status as a map (for SVG viewer)
  Map<String, PartDamageData> get partsStatusMap {
    return {for (var part in parts) part.partKey: part};
  }

  /// Get count of damaged parts (non-good condition)
  int get damagedPartsCount {
    return parts.where((p) => p.condition != VDSPartCondition.good && p.condition != VDSPartCondition.notInspected).length;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VDSInspection &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
