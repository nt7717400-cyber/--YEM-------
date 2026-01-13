/// Settings Model for Flutter Customer App
/// Requirements: 6.1

/// Showroom Settings - إعدادات المعرض
class ShowroomSettings {
  final String id;
  final String name;
  final String description;
  final String address;
  final String phone;
  final String whatsapp;
  final String workingHours;
  final double? mapLatitude;
  final double? mapLongitude;
  final DateTime updatedAt;

  const ShowroomSettings({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.phone,
    required this.whatsapp,
    required this.workingHours,
    this.mapLatitude,
    this.mapLongitude,
    required this.updatedAt,
  });

  factory ShowroomSettings.fromJson(Map<String, dynamic> json) {
    return ShowroomSettings(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      address: json['address'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      whatsapp: json['whatsapp'] as String? ?? '',
      workingHours: json['workingHours'] as String? ?? '',
      mapLatitude: _parseNullableDouble(json['mapLatitude']),
      mapLongitude: _parseNullableDouble(json['mapLongitude']),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  /// Helper to safely parse nullable double
  static double? _parseNullableDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'address': address,
    'phone': phone,
    'whatsapp': whatsapp,
    'workingHours': workingHours,
    'mapLatitude': mapLatitude,
    'mapLongitude': mapLongitude,
    'updatedAt': updatedAt.toIso8601String(),
  };

  /// Check if map coordinates are available
  bool get hasMapCoordinates => mapLatitude != null && mapLongitude != null;

  /// Check if settings data is complete
  bool get isComplete =>
      name.isNotEmpty &&
      description.isNotEmpty &&
      address.isNotEmpty &&
      phone.isNotEmpty &&
      whatsapp.isNotEmpty &&
      workingHours.isNotEmpty;

  ShowroomSettings copyWith({
    String? id,
    String? name,
    String? description,
    String? address,
    String? phone,
    String? whatsapp,
    String? workingHours,
    double? mapLatitude,
    double? mapLongitude,
    DateTime? updatedAt,
  }) {
    return ShowroomSettings(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      whatsapp: whatsapp ?? this.whatsapp,
      workingHours: workingHours ?? this.workingHours,
      mapLatitude: mapLatitude ?? this.mapLatitude,
      mapLongitude: mapLongitude ?? this.mapLongitude,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ShowroomSettings &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          address == other.address &&
          phone == other.phone &&
          whatsapp == other.whatsapp;

  @override
  int get hashCode =>
      id.hashCode ^
      name.hashCode ^
      address.hashCode ^
      phone.hashCode ^
      whatsapp.hashCode;
}
