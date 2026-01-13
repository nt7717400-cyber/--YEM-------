// Auction Models for Flutter Customer App
// Requirements: 3.1, 4.1

import 'car.dart';

/// Price Type - نوع التسعير
enum PriceType {
  fixed('FIXED'),
  auction('AUCTION');

  final String value;
  const PriceType(this.value);

  static PriceType fromString(String value) {
    return PriceType.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => PriceType.fixed,
    );
  }

  String toJson() => value;
}

/// Auction Status - حالة المزاد
enum AuctionStatus {
  active('ACTIVE'),
  ended('ENDED'),
  cancelled('CANCELLED'),
  sold('SOLD');

  final String value;
  const AuctionStatus(this.value);

  static AuctionStatus fromString(String value) {
    return AuctionStatus.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => AuctionStatus.active,
    );
  }

  String toJson() => value;

  /// Check if auction is still active
  bool get isActive => this == AuctionStatus.active;

  /// Check if auction has ended (any end state)
  bool get hasEnded => this != AuctionStatus.active;
}

/// Bid - عرض المزايدة
class Bid {
  final int id;
  final int auctionId;
  final String bidderName;
  final String maskedPhone;
  final double amount;
  final DateTime createdAt;

  const Bid({
    required this.id,
    required this.auctionId,
    required this.bidderName,
    required this.maskedPhone,
    required this.amount,
    required this.createdAt,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    return Bid(
      id: json['id'] as int? ?? 0,
      auctionId: json['auctionId'] as int? ?? json['auction_id'] as int? ?? 0,
      bidderName: json['bidderName'] as String? ?? json['bidder_name'] as String? ?? '',
      maskedPhone: json['maskedPhone'] as String? ?? json['masked_phone'] as String? ?? '',
      amount: _parseAmount(json['amount']),
      createdAt: _parseCreatedAt(json['createdAt'] ?? json['created_at']),
    );
  }

  /// Helper to safely parse amount
  static double _parseAmount(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Helper to safely parse createdAt
  static DateTime _parseCreatedAt(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'auctionId': auctionId,
    'bidderName': bidderName,
    'maskedPhone': maskedPhone,
    'amount': amount,
    'createdAt': createdAt.toIso8601String(),
  };

  Bid copyWith({
    int? id,
    int? auctionId,
    String? bidderName,
    String? maskedPhone,
    double? amount,
    DateTime? createdAt,
  }) {
    return Bid(
      id: id ?? this.id,
      auctionId: auctionId ?? this.auctionId,
      bidderName: bidderName ?? this.bidderName,
      maskedPhone: maskedPhone ?? this.maskedPhone,
      amount: amount ?? this.amount,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Bid &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          auctionId == other.auctionId &&
          amount == other.amount;

  @override
  int get hashCode => id.hashCode ^ auctionId.hashCode ^ amount.hashCode;
}

/// Place Bid Input - بيانات تقديم عرض
class PlaceBidInput {
  final String bidderName;
  final String phoneNumber;
  final double amount;

  const PlaceBidInput({
    required this.bidderName,
    required this.phoneNumber,
    required this.amount,
  });

  Map<String, dynamic> toJson() => {
    'bidderName': bidderName,
    'phoneNumber': phoneNumber,
    'amount': amount,
  };

  /// Validate bid input
  String? validate(double currentPrice, double minIncrement) {
    if (bidderName.trim().isEmpty) {
      return 'يرجى إدخال اسم المزايد';
    }
    if (phoneNumber.trim().isEmpty) {
      return 'يرجى إدخال رقم الهاتف';
    }
    if (!_isValidPhoneNumber(phoneNumber)) {
      return 'رقم الهاتف غير صحيح';
    }
    final minBid = currentPrice + minIncrement;
    if (amount < minBid) {
      return 'الحد الأدنى للمزايدة هو $minBid';
    }
    return null;
  }

  bool _isValidPhoneNumber(String phone) {
    // Yemen phone number validation (7xxxxxxxx)
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    return cleaned.length >= 9 && cleaned.length <= 12;
  }
}

/// Auction - المزاد
class Auction {
  final int id;
  final int carId;
  final double startingPrice;
  final double? reservePrice;
  final double currentPrice;
  final double minIncrement;
  final DateTime endTime;
  final AuctionStatus status;
  final String? winnerPhone;
  final int bidCount;
  final List<Bid> bids;
  final Car? car;
  final String? thumbnail; // Direct thumbnail from API
  final String? carName;   // Direct car name from API
  final String? brand;     // Direct brand from API
  final String? model;     // Direct model from API
  final DateTime createdAt;
  final DateTime updatedAt;

  const Auction({
    required this.id,
    required this.carId,
    required this.startingPrice,
    this.reservePrice,
    required this.currentPrice,
    required this.minIncrement,
    required this.endTime,
    required this.status,
    this.winnerPhone,
    this.bidCount = 0,
    this.bids = const [],
    this.car,
    this.thumbnail,
    this.carName,
    this.brand,
    this.model,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'] as int? ?? 0,
      carId: json['carId'] as int? ?? json['car_id'] as int? ?? 0,
      startingPrice: _parseDouble(json['startingPrice'] ?? json['starting_price']),
      reservePrice: _parseNullableDouble(json['reservePrice'] ?? json['reserve_price']),
      currentPrice: _parseDouble(json['currentPrice'] ?? json['current_price']),
      minIncrement: _parseDouble(json['minIncrement'] ?? json['min_increment'] ?? 100),
      endTime: _parseDateTimeRequired(json['endTime'] ?? json['end_time']),
      status: AuctionStatus.fromString(json['status'] as String? ?? 'ACTIVE'),
      winnerPhone: json['winnerPhone'] as String? ?? json['winner_phone'] as String?,
      bidCount: json['bidCount'] as int? ?? json['bid_count'] as int? ?? 0,
      bids: (json['bids'] as List<dynamic>?)
              ?.map((e) => Bid.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      car: json['car'] != null
          ? Car.fromJson(json['car'] as Map<String, dynamic>)
          : null,
      thumbnail: json['thumbnail'] as String?,
      carName: json['carName'] as String? ?? json['car_name'] as String?,
      brand: json['brand'] as String?,
      model: json['model'] as String?,
      createdAt: _parseDateTime(json['createdAt'] ?? json['created_at']),
      updatedAt: _parseDateTime(json['updatedAt'] ?? json['updated_at']),
    );
  }

  /// Helper to safely parse double from dynamic value
  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Helper to safely parse nullable double
  static double? _parseNullableDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  /// Helper to safely parse DateTime (required)
  static DateTime _parseDateTimeRequired(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  /// Helper to safely parse DateTime from dynamic value
  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    return DateTime.now();
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'carId': carId,
    'startingPrice': startingPrice,
    'reservePrice': reservePrice,
    'currentPrice': currentPrice,
    'minIncrement': minIncrement,
    'endTime': endTime.toIso8601String(),
    'status': status.toJson(),
    'winnerPhone': winnerPhone,
    'bidCount': bidCount,
    'bids': bids.map((e) => e.toJson()).toList(),
    'car': car?.toJson(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  Auction copyWith({
    int? id,
    int? carId,
    double? startingPrice,
    double? reservePrice,
    double? currentPrice,
    double? minIncrement,
    DateTime? endTime,
    AuctionStatus? status,
    String? winnerPhone,
    int? bidCount,
    List<Bid>? bids,
    Car? car,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Auction(
      id: id ?? this.id,
      carId: carId ?? this.carId,
      startingPrice: startingPrice ?? this.startingPrice,
      reservePrice: reservePrice ?? this.reservePrice,
      currentPrice: currentPrice ?? this.currentPrice,
      minIncrement: minIncrement ?? this.minIncrement,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      winnerPhone: winnerPhone ?? this.winnerPhone,
      bidCount: bidCount ?? this.bidCount,
      bids: bids ?? this.bids,
      car: car ?? this.car,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  /// Check if auction is still active
  bool get isActive => status.isActive && DateTime.now().isBefore(endTime);

  /// Check if auction has ended
  bool get hasEnded => status.hasEnded || DateTime.now().isAfter(endTime);

  /// Get time remaining until auction ends
  Duration get timeRemaining {
    if (hasEnded) return Duration.zero;
    return endTime.difference(DateTime.now());
  }

  /// Get minimum bid amount
  double get minimumBid => currentPrice + minIncrement;

  /// Check if reserve price is met
  bool get reserveMet => reservePrice == null || currentPrice >= reservePrice!;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Auction &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          carId == other.carId;

  @override
  int get hashCode => id.hashCode ^ carId.hashCode;
}

/// Auctions Response - استجابة المزادات مع التصفح
class AuctionsResponse {
  final List<Auction> auctions;
  final int total;
  final int page;
  final int perPage;
  final int totalPages;

  const AuctionsResponse({
    required this.auctions,
    required this.total,
    required this.page,
    required this.perPage,
    required this.totalPages,
  });
}
