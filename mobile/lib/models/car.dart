// Car Models for Flutter Customer App
// Requirements: 1.1, 1.2, 3.3

import 'auction.dart';

// Body Type - نوع هيكل السيارة
enum BodyType {
  sedan,
  hatchback,
  coupe,
  suv,
  crossover,
  pickup,
  van,
  minivan,
  truck;

  static BodyType? fromString(String? value) {
    if (value == null) return null;
    return BodyType.values.firstWhere(
      (e) => e.name == value.toLowerCase(),
      orElse: () => BodyType.sedan,
    );
  }

  String toJson() => name;
}

// Body Part ID - معرف جزء الهيكل (13 منطقة)
enum BodyPartId {
  frontBumper('front_bumper'),
  rearBumper('rear_bumper'),
  hood('hood'),
  roof('roof'),
  trunk('trunk'),
  frontLeftDoor('front_left_door'),
  frontRightDoor('front_right_door'),
  rearLeftDoor('rear_left_door'),
  rearRightDoor('rear_right_door'),
  frontLeftFender('front_left_fender'),
  frontRightFender('front_right_fender'),
  rearLeftQuarter('rear_left_quarter'),
  rearRightQuarter('rear_right_quarter');

  final String value;
  const BodyPartId(this.value);

  static BodyPartId fromString(String value) {
    return BodyPartId.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BodyPartId.frontBumper,
    );
  }

  String toJson() => value;
}


// Part Status - حالة الجزء (6 حالات)
enum PartStatus {
  original('original'),
  painted('painted'),
  bodywork('bodywork'),
  accident('accident'),
  replaced('replaced'),
  needsCheck('needs_check');

  final String value;
  const PartStatus(this.value);

  static PartStatus fromString(String value) {
    return PartStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => PartStatus.original,
    );
  }

  String toJson() => value;
}

// Engine Status - حالة المكينة
enum EngineStatus {
  original('original'),
  replaced('replaced'),
  refurbished('refurbished');

  final String value;
  const EngineStatus(this.value);

  static EngineStatus fromString(String value) {
    return EngineStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => EngineStatus.original,
    );
  }

  String toJson() => value;
}

// Transmission Status - حالة القير
enum TransmissionStatus {
  original('original'),
  replaced('replaced');

  final String value;
  const TransmissionStatus(this.value);

  static TransmissionStatus fromString(String value) {
    return TransmissionStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => TransmissionStatus.original,
    );
  }

  String toJson() => value;
}

// Chassis Status - حالة الشاصي
enum ChassisStatus {
  intact('intact'),
  accidentAffected('accident_affected'),
  modified('modified');

  final String value;
  const ChassisStatus(this.value);

  static ChassisStatus fromString(String value) {
    return ChassisStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ChassisStatus.intact,
    );
  }

  String toJson() => value;
}


/// Body Part Status - حالة جزء الهيكل
class BodyPartStatus {
  final BodyPartId partId;
  final PartStatus status;

  const BodyPartStatus({
    required this.partId,
    required this.status,
  });

  factory BodyPartStatus.fromJson(Map<String, dynamic> json) {
    return BodyPartStatus(
      partId: BodyPartId.fromString(json['partId'] as String),
      status: PartStatus.fromString(json['status'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'partId': partId.toJson(),
    'status': status.toJson(),
  };

  BodyPartStatus copyWith({
    BodyPartId? partId,
    PartStatus? status,
  }) {
    return BodyPartStatus(
      partId: partId ?? this.partId,
      status: status ?? this.status,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BodyPartStatus &&
          runtimeType == other.runtimeType &&
          partId == other.partId &&
          status == other.status;

  @override
  int get hashCode => partId.hashCode ^ status.hashCode;
}

/// Mechanical Status - الحالة الميكانيكية
class MechanicalStatus {
  final EngineStatus engine;
  final TransmissionStatus transmission;
  final ChassisStatus chassis;
  final String technicalNotes;

  const MechanicalStatus({
    required this.engine,
    required this.transmission,
    required this.chassis,
    this.technicalNotes = '',
  });

  factory MechanicalStatus.fromJson(Map<String, dynamic> json) {
    return MechanicalStatus(
      engine: EngineStatus.fromString(json['engine'] as String),
      transmission: TransmissionStatus.fromString(json['transmission'] as String),
      chassis: ChassisStatus.fromString(json['chassis'] as String),
      technicalNotes: json['technicalNotes'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'engine': engine.toJson(),
    'transmission': transmission.toJson(),
    'chassis': chassis.toJson(),
    'technicalNotes': technicalNotes,
  };

  MechanicalStatus copyWith({
    EngineStatus? engine,
    TransmissionStatus? transmission,
    ChassisStatus? chassis,
    String? technicalNotes,
  }) {
    return MechanicalStatus(
      engine: engine ?? this.engine,
      transmission: transmission ?? this.transmission,
      chassis: chassis ?? this.chassis,
      technicalNotes: technicalNotes ?? this.technicalNotes,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MechanicalStatus &&
          runtimeType == other.runtimeType &&
          engine == other.engine &&
          transmission == other.transmission &&
          chassis == other.chassis &&
          technicalNotes == other.technicalNotes;

  @override
  int get hashCode =>
      engine.hashCode ^
      transmission.hashCode ^
      chassis.hashCode ^
      technicalNotes.hashCode;
}


/// Damage Detail - تفاصيل الضرر (VDS style)
class DamageDetail {
  final String partKey;
  final String condition;
  final String? severity;
  final String? notes;
  final List<String> photos;
  final DateTime? updatedAt;

  const DamageDetail({
    required this.partKey,
    required this.condition,
    this.severity,
    this.notes,
    this.photos = const [],
    this.updatedAt,
  });

  factory DamageDetail.fromJson(Map<String, dynamic> json) {
    return DamageDetail(
      partKey: json['partKey'] as String? ?? '',
      condition: json['condition'] as String? ?? 'good',
      severity: json['severity'] as String?,
      notes: json['notes'] as String?,
      photos: (json['photos'] as List<dynamic>?)?.cast<String>() ?? [],
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'partKey': partKey,
    'condition': condition,
    if (severity != null) 'severity': severity,
    if (notes != null) 'notes': notes,
    'photos': photos,
    if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
  };
}

/// Tire Status - حالة الإطار
class TireStatusData {
  final String frontLeft;
  final String frontRight;
  final String rearLeft;
  final String rearRight;
  final String? spare;

  const TireStatusData({
    required this.frontLeft,
    required this.frontRight,
    required this.rearLeft,
    required this.rearRight,
    this.spare,
  });

  factory TireStatusData.fromJson(Map<String, dynamic> json) {
    return TireStatusData(
      frontLeft: json['front_left'] as String? ?? 'new',
      frontRight: json['front_right'] as String? ?? 'new',
      rearLeft: json['rear_left'] as String? ?? 'new',
      rearRight: json['rear_right'] as String? ?? 'new',
      spare: json['spare'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'front_left': frontLeft,
    'front_right': frontRight,
    'rear_left': rearLeft,
    'rear_right': rearRight,
    if (spare != null) 'spare': spare,
  };
}

/// Car Inspection - بيانات الفحص الكاملة
class CarInspection {
  final int id;
  final int carId;
  final BodyType bodyType;
  final List<BodyPartStatus> bodyParts;
  final MechanicalStatus mechanical;
  final Map<String, DamageDetail>? damageDetails;
  final TireStatusData? tiresStatus;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CarInspection({
    required this.id,
    required this.carId,
    required this.bodyType,
    required this.bodyParts,
    required this.mechanical,
    this.damageDetails,
    this.tiresStatus,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CarInspection.fromJson(Map<String, dynamic> json) {
    // Handle bodyParts as either List or Map format from API
    final bodyPartsData = json['bodyParts'];
    List<BodyPartStatus> bodyParts = [];
    
    if (bodyPartsData is Map) {
      bodyParts = bodyPartsData.entries.map((entry) {
        return BodyPartStatus(
          partId: BodyPartId.fromString(entry.key as String),
          status: PartStatus.fromString(entry.value as String),
        );
      }).toList();
    } else if (bodyPartsData is List) {
      bodyParts = bodyPartsData
          .map((e) => BodyPartStatus.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    // Parse damage details
    Map<String, DamageDetail>? damageDetails;
    if (json['damageDetails'] != null && json['damageDetails'] is Map) {
      damageDetails = {};
      (json['damageDetails'] as Map).forEach((key, value) {
        if (value is Map<String, dynamic>) {
          damageDetails![key as String] = DamageDetail.fromJson(value);
        }
      });
    }

    // Parse tires status
    TireStatusData? tiresStatus;
    final mechanicalData = json['mechanical'];
    if (mechanicalData != null && mechanicalData['tires'] != null) {
      tiresStatus = TireStatusData.fromJson(mechanicalData['tires'] as Map<String, dynamic>);
    }

    return CarInspection(
      id: json['id'] as int? ?? 0,
      carId: json['carId'] as int? ?? json['car_id'] as int? ?? 0,
      bodyType: BodyType.fromString(json['bodyType'] as String?) ?? BodyType.sedan,
      bodyParts: bodyParts,
      mechanical: json['mechanical'] != null
          ? MechanicalStatus.fromJson(json['mechanical'] as Map<String, dynamic>)
          : const MechanicalStatus(
              engine: EngineStatus.original,
              transmission: TransmissionStatus.original,
              chassis: ChassisStatus.intact,
            ),
      damageDetails: damageDetails,
      tiresStatus: tiresStatus,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'carId': carId,
    'bodyType': bodyType.toJson(),
    'bodyParts': bodyParts.map((e) => e.toJson()).toList(),
    'mechanical': mechanical.toJson(),
    if (damageDetails != null) 'damageDetails': damageDetails!.map((k, v) => MapEntry(k, v.toJson())),
    if (tiresStatus != null) 'tiresStatus': tiresStatus!.toJson(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  CarInspection copyWith({
    int? id,
    int? carId,
    BodyType? bodyType,
    List<BodyPartStatus>? bodyParts,
    MechanicalStatus? mechanical,
    Map<String, DamageDetail>? damageDetails,
    TireStatusData? tiresStatus,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CarInspection(
      id: id ?? this.id,
      carId: carId ?? this.carId,
      bodyType: bodyType ?? this.bodyType,
      bodyParts: bodyParts ?? this.bodyParts,
      mechanical: mechanical ?? this.mechanical,
      damageDetails: damageDetails ?? this.damageDetails,
      tiresStatus: tiresStatus ?? this.tiresStatus,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CarInspection &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          carId == other.carId &&
          bodyType == other.bodyType &&
          _listEquals(bodyParts, other.bodyParts) &&
          mechanical == other.mechanical;

  @override
  int get hashCode =>
      id.hashCode ^
      carId.hashCode ^
      bodyType.hashCode ^
      bodyParts.hashCode ^
      mechanical.hashCode;
}

bool _listEquals<T>(List<T>? a, List<T>? b) {
  if (a == null) return b == null;
  if (b == null || a.length != b.length) return false;
  for (int i = 0; i < a.length; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}


/// Car Image - صورة السيارة
class CarImage {
  final int id;
  final int? carId;
  final String url;
  final int order;
  final DateTime? createdAt;

  const CarImage({
    required this.id,
    this.carId,
    required this.url,
    required this.order,
    this.createdAt,
  });

  factory CarImage.fromJson(Map<String, dynamic> json) {
    return CarImage(
      id: json['id'] as int? ?? 0,
      carId: json['carId'] as int? ?? json['car_id'] as int?,
      url: json['url'] as String? ?? '',
      order: json['order'] as int? ?? 0,
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'carId': carId,
    'url': url,
    'order': order,
    'createdAt': createdAt?.toIso8601String(),
  };

  CarImage copyWith({
    int? id,
    int? carId,
    String? url,
    int? order,
    DateTime? createdAt,
  }) {
    return CarImage(
      id: id ?? this.id,
      carId: carId ?? this.carId,
      url: url ?? this.url,
      order: order ?? this.order,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CarImage &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          carId == other.carId &&
          url == other.url &&
          order == other.order;

  @override
  int get hashCode => id.hashCode ^ carId.hashCode ^ url.hashCode ^ order.hashCode;
}

/// Car Video Type - نوع الفيديو
enum CarVideoType {
  youtube('YOUTUBE'),
  upload('UPLOAD');

  final String value;
  const CarVideoType(this.value);

  static CarVideoType fromString(String value) {
    return CarVideoType.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => CarVideoType.upload,
    );
  }

  String toJson() => value;
}

/// Car Video - فيديو السيارة
class CarVideo {
  final int id;
  final int? carId;
  final CarVideoType type;
  final String url;
  final DateTime? createdAt;

  const CarVideo({
    required this.id,
    this.carId,
    required this.type,
    required this.url,
    this.createdAt,
  });

  factory CarVideo.fromJson(Map<String, dynamic> json) {
    return CarVideo(
      id: json['id'] as int? ?? 0,
      carId: json['carId'] as int? ?? json['car_id'] as int?,
      type: CarVideoType.fromString(json['type'] as String? ?? 'UPLOAD'),
      url: json['url'] as String? ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'carId': carId,
    'type': type.toJson(),
    'url': url,
    'createdAt': createdAt?.toIso8601String(),
  };

  CarVideo copyWith({
    int? id,
    int? carId,
    CarVideoType? type,
    String? url,
    DateTime? createdAt,
  }) {
    return CarVideo(
      id: id ?? this.id,
      carId: carId ?? this.carId,
      type: type ?? this.type,
      url: url ?? this.url,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CarVideo &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          carId == other.carId &&
          type == other.type &&
          url == other.url;

  @override
  int get hashCode => id.hashCode ^ carId.hashCode ^ type.hashCode ^ url.hashCode;
}


/// Car Condition - حالة السيارة
enum CarCondition {
  newCar('NEW'),
  used('USED');

  final String value;
  const CarCondition(this.value);

  static CarCondition fromString(String value) {
    return CarCondition.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => CarCondition.used,
    );
  }

  String toJson() => value;
}

/// Car Status - حالة البيع
enum CarStatus {
  available('AVAILABLE'),
  sold('SOLD');

  final String value;
  const CarStatus(this.value);

  static CarStatus fromString(String value) {
    return CarStatus.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => CarStatus.available,
    );
  }

  String toJson() => value;
}

/// Car - السيارة
class Car {
  final int id;
  final String name;
  final String brand;
  final String model;
  final int year;
  final double price;
  final CarCondition condition;
  final String? origin;
  final int? kilometers;
  final String description;
  final String specifications;
  final CarStatus status;
  final bool isFeatured;
  final int viewCount;
  final String? thumbnail;
  final BodyType? bodyType;
  final PriceType priceType;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<CarImage> images;
  final CarVideo? video;
  final CarInspection? inspection;
  final Auction? auction;

  const Car({
    required this.id,
    required this.name,
    required this.brand,
    required this.model,
    required this.year,
    required this.price,
    required this.condition,
    this.origin,
    this.kilometers,
    this.description = '',
    this.specifications = '',
    this.status = CarStatus.available,
    this.isFeatured = false,
    this.viewCount = 0,
    this.thumbnail,
    this.bodyType,
    this.priceType = PriceType.fixed,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
    this.video,
    this.inspection,
    this.auction,
  });

  factory Car.fromJson(Map<String, dynamic> json) {
    return Car(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      brand: json['brand'] as String? ?? '',
      model: json['model'] as String? ?? '',
      year: json['year'] as int? ?? 0,
      price: _safeParseDouble(json['price']),
      condition: CarCondition.fromString(json['condition'] as String? ?? 'USED'),
      origin: json['origin'] as String?,
      kilometers: json['kilometers'] as int?,
      description: json['description'] as String? ?? '',
      specifications: json['specifications'] as String? ?? '',
      status: CarStatus.fromString(json['status'] as String? ?? 'AVAILABLE'),
      isFeatured: json['isFeatured'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      thumbnail: json['thumbnail'] as String?,
      bodyType: BodyType.fromString(json['bodyType'] as String?),
      priceType: PriceType.fromString(json['priceType'] as String? ?? json['price_type'] as String? ?? 'FIXED'),
      createdAt: _safeParseDateTimeRequired(json['createdAt']),
      updatedAt: _safeParseDateTimeRequired(json['updatedAt']),
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => CarImage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      video: json['video'] != null
          ? CarVideo.fromJson(json['video'] as Map<String, dynamic>)
          : null,
      inspection: json['inspection'] != null
          ? _parseInspection(json['inspection'])
          : null,
      auction: json['auction'] != null
          ? _parseAuction(json['auction'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Safely parse double from dynamic value
  static double _safeParseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Safely parse DateTime (required field)
  static DateTime _safeParseDateTimeRequired(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  /// Parse inspection data - handles both object format and map format from API
  static CarInspection? _parseInspection(dynamic inspectionData) {
    if (inspectionData == null) return null;
    try {
      final json = inspectionData as Map<String, dynamic>;
      // API returns bodyParts as a map, not a list
      final bodyPartsData = json['bodyParts'];
      List<BodyPartStatus> bodyParts = [];
      
      if (bodyPartsData is Map) {
        bodyParts = bodyPartsData.entries.map((entry) {
          return BodyPartStatus(
            partId: BodyPartId.fromString(entry.key as String),
            status: PartStatus.fromString(entry.value as String),
          );
        }).toList();
      } else if (bodyPartsData is List) {
        bodyParts = bodyPartsData
            .map((e) => BodyPartStatus.fromJson(e as Map<String, dynamic>))
            .toList();
      }

      // Parse damage details
      Map<String, DamageDetail>? damageDetails;
      if (json['damageDetails'] != null && json['damageDetails'] is Map) {
        damageDetails = {};
        (json['damageDetails'] as Map).forEach((key, value) {
          if (value is Map<String, dynamic>) {
            damageDetails![key as String] = DamageDetail.fromJson(value);
          }
        });
      }

      // Parse tires status from mechanical.tires
      TireStatusData? tiresStatus;
      final mechanicalData = json['mechanical'];
      if (mechanicalData != null && mechanicalData['tires'] != null) {
        tiresStatus = TireStatusData.fromJson(mechanicalData['tires'] as Map<String, dynamic>);
      }

      return CarInspection(
        id: json['id'] as int? ?? 0,
        carId: json['carId'] as int? ?? json['car_id'] as int? ?? 0,
        bodyType: BodyType.fromString(json['bodyType'] as String?) ?? BodyType.sedan,
        bodyParts: bodyParts,
        mechanical: json['mechanical'] != null
            ? MechanicalStatus.fromJson(json['mechanical'] as Map<String, dynamic>)
            : const MechanicalStatus(
                engine: EngineStatus.original,
                transmission: TransmissionStatus.original,
                chassis: ChassisStatus.intact,
              ),
        damageDetails: damageDetails,
        tiresStatus: tiresStatus,
        createdAt: _parseInspectionDateTime(json['createdAt']),
        updatedAt: _parseInspectionDateTime(json['updatedAt']),
      );
    } catch (e) {
      print('Error parsing inspection: $e');
      return null;
    }
  }

  /// Helper to safely parse DateTime for inspection
  static DateTime _parseInspectionDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  /// Parse auction data from API
  static Auction? _parseAuction(Map<String, dynamic> json) {
    try {
      return Auction(
        id: json['id'] as int,
        carId: json['carId'] as int? ?? json['car_id'] as int? ?? 0,
        startingPrice: _parseAuctionDouble(json['startingPrice'] ?? json['starting_price']),
        reservePrice: json['reservePrice'] != null
            ? (json['reservePrice'] as num).toDouble()
            : json['reserve_price'] != null
                ? (json['reserve_price'] as num).toDouble()
                : null,
        currentPrice: _parseAuctionDouble(json['currentPrice'] ?? json['current_price']),
        minIncrement: _parseAuctionDouble(json['minIncrement'] ?? json['min_increment'] ?? 100),
        endTime: _parseAuctionDateTime(json['endTime'] ?? json['end_time']),
        status: AuctionStatus.fromString(json['status'] as String? ?? 'ACTIVE'),
        winnerPhone: json['winnerPhone'] as String? ?? json['winner_phone'] as String?,
        bidCount: json['bidCount'] as int? ?? json['bid_count'] as int? ?? 0,
        bids: [], // Bids are loaded separately
        car: null,
        createdAt: _parseAuctionDateTime(json['createdAt'] ?? json['created_at']),
        updatedAt: _parseAuctionDateTime(json['updatedAt'] ?? json['updated_at']),
      );
    } catch (e) {
      print('Error parsing auction: $e');
      return null;
    }
  }

  /// Helper to safely parse double for auction
  static double _parseAuctionDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Helper to safely parse DateTime for auction
  static DateTime _parseAuctionDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'brand': brand,
    'model': model,
    'year': year,
    'price': price,
    'condition': condition.toJson(),
    'origin': origin,
    'kilometers': kilometers,
    'description': description,
    'specifications': specifications,
    'status': status.toJson(),
    'isFeatured': isFeatured,
    'viewCount': viewCount,
    'thumbnail': thumbnail,
    'bodyType': bodyType?.toJson(),
    'priceType': priceType.toJson(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'images': images.map((e) => e.toJson()).toList(),
    'video': video?.toJson(),
    'inspection': inspection?.toJson(),
    'auction': auction?.toJson(),
  };

  Car copyWith({
    int? id,
    String? name,
    String? brand,
    String? model,
    int? year,
    double? price,
    CarCondition? condition,
    String? origin,
    int? kilometers,
    String? description,
    String? specifications,
    CarStatus? status,
    bool? isFeatured,
    int? viewCount,
    String? thumbnail,
    BodyType? bodyType,
    PriceType? priceType,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<CarImage>? images,
    CarVideo? video,
    CarInspection? inspection,
    Auction? auction,
  }) {
    return Car(
      id: id ?? this.id,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      model: model ?? this.model,
      year: year ?? this.year,
      price: price ?? this.price,
      condition: condition ?? this.condition,
      origin: origin ?? this.origin,
      kilometers: kilometers ?? this.kilometers,
      description: description ?? this.description,
      specifications: specifications ?? this.specifications,
      status: status ?? this.status,
      isFeatured: isFeatured ?? this.isFeatured,
      viewCount: viewCount ?? this.viewCount,
      thumbnail: thumbnail ?? this.thumbnail,
      bodyType: bodyType ?? this.bodyType,
      priceType: priceType ?? this.priceType,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      images: images ?? this.images,
      video: video ?? this.video,
      inspection: inspection ?? this.inspection,
      auction: auction ?? this.auction,
    );
  }

  /// Check if car is an auction type
  bool get isAuction => priceType == PriceType.auction;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Car &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          brand == other.brand &&
          model == other.model &&
          year == other.year &&
          price == other.price &&
          condition == other.condition;

  @override
  int get hashCode =>
      id.hashCode ^
      name.hashCode ^
      brand.hashCode ^
      model.hashCode ^
      year.hashCode ^
      price.hashCode ^
      condition.hashCode;
}
