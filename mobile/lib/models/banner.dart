/// Banner Model for Flutter Customer App
/// Requirements: 5.1

/// Banner Position - مواقع ظهور البانر
enum BannerPosition {
  heroTop('hero_top'),
  heroBottom('hero_bottom'),
  sidebar('sidebar'),
  carsBetween('cars_between'),
  carDetail('car_detail'),
  footerAbove('footer_above'),
  popup('popup');

  final String value;
  const BannerPosition(this.value);

  static BannerPosition fromString(String value) {
    return BannerPosition.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BannerPosition.heroTop,
    );
  }

  String toJson() => value;
}

/// Link Target - هدف الرابط
enum LinkTarget {
  self('_self'),
  blank('_blank');

  final String value;
  const LinkTarget(this.value);

  static LinkTarget fromString(String value) {
    return LinkTarget.values.firstWhere(
      (e) => e.value == value,
      orElse: () => LinkTarget.self,
    );
  }

  String toJson() => value;
}

/// Banner - البانر الإعلاني
class Banner {
  final int id;
  final String title;
  final String imageUrl;
  final String? imageMobileUrl;
  final String? linkUrl;
  final LinkTarget linkTarget;
  final BannerPosition position;
  final int displayOrder;
  final bool isActive;
  final DateTime? startDate;
  final DateTime? endDate;
  final int clickCount;
  final int viewCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Banner({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.imageMobileUrl,
    this.linkUrl,
    this.linkTarget = LinkTarget.self,
    required this.position,
    this.displayOrder = 0,
    this.isActive = true,
    this.startDate,
    this.endDate,
    this.clickCount = 0,
    this.viewCount = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Banner.fromJson(Map<String, dynamic> json) {
    return Banner(
      id: json['id'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      imageMobileUrl: json['imageMobileUrl'] as String?,
      linkUrl: json['linkUrl'] as String?,
      linkTarget: LinkTarget.fromString(json['linkTarget'] as String? ?? '_self'),
      position: BannerPosition.fromString(json['position'] as String? ?? 'hero_top'),
      displayOrder: json['displayOrder'] as int? ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      startDate: json['startDate'] != null
          ? DateTime.tryParse(json['startDate'] as String)
          : null,
      endDate: json['endDate'] != null
          ? DateTime.tryParse(json['endDate'] as String)
          : null,
      clickCount: json['clickCount'] as int? ?? 0,
      viewCount: json['viewCount'] as int? ?? 0,
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
    'title': title,
    'imageUrl': imageUrl,
    'imageMobileUrl': imageMobileUrl,
    'linkUrl': linkUrl,
    'linkTarget': linkTarget.toJson(),
    'position': position.toJson(),
    'displayOrder': displayOrder,
    'isActive': isActive,
    'startDate': startDate?.toIso8601String(),
    'endDate': endDate?.toIso8601String(),
    'clickCount': clickCount,
    'viewCount': viewCount,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  /// Check if banner is currently within schedule
  bool isWithinSchedule([DateTime? now]) {
    final currentTime = now ?? DateTime.now();
    
    if (startDate != null && currentTime.isBefore(startDate!)) {
      return false;
    }
    
    if (endDate != null && currentTime.isAfter(endDate!)) {
      return false;
    }
    
    return true;
  }

  /// Check if banner should be displayed
  bool get shouldDisplay => isActive && isWithinSchedule();

  Banner copyWith({
    int? id,
    String? title,
    String? imageUrl,
    String? imageMobileUrl,
    String? linkUrl,
    LinkTarget? linkTarget,
    BannerPosition? position,
    int? displayOrder,
    bool? isActive,
    DateTime? startDate,
    DateTime? endDate,
    int? clickCount,
    int? viewCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Banner(
      id: id ?? this.id,
      title: title ?? this.title,
      imageUrl: imageUrl ?? this.imageUrl,
      imageMobileUrl: imageMobileUrl ?? this.imageMobileUrl,
      linkUrl: linkUrl ?? this.linkUrl,
      linkTarget: linkTarget ?? this.linkTarget,
      position: position ?? this.position,
      displayOrder: displayOrder ?? this.displayOrder,
      isActive: isActive ?? this.isActive,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      clickCount: clickCount ?? this.clickCount,
      viewCount: viewCount ?? this.viewCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Banner &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          imageUrl == other.imageUrl &&
          position == other.position;

  @override
  int get hashCode =>
      id.hashCode ^ title.hashCode ^ imageUrl.hashCode ^ position.hashCode;
}
