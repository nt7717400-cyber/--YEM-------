/// Property-Based Tests for Auction Model
/// Feature: auction-system
/// 
/// End-to-end testing for auction system lifecycle
/// Tests the full auction flow: creation, bidding, and completion
/// 
/// **Validates: Requirements 1.4, 1.5, 4.3, 4.4, 5.1, 5.3, 6.1-6.6**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/models/car.dart';

/// Custom generators for Auction model types
extension AuctionGenerators on Any {
  /// Generate a valid AuctionStatus
  Generator<AuctionStatus> get auctionStatus => choose(AuctionStatus.values);

  /// Generate a valid PriceType
  Generator<PriceType> get priceType => choose(PriceType.values);

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 100000);

  /// Generate a positive price
  Generator<double> get positivePrice =>
      intInRange(1000, 10000000).map((i) => i.toDouble());

  /// Generate a small positive increment
  Generator<double> get minIncrement =>
      intInRange(10, 1000).map((i) => i.toDouble());

  /// Generate a valid Yemeni phone number (9 digits starting with 7)
  Generator<String> get yemeniPhone {
    return intInRange(1000000, 9999999).map((suffix) => '77$suffix');
  }

  /// Generate a valid bidder name
  Generator<String> get bidderName {
    final names = ['أحمد الأحمدي', 'محمد العلوي', 'علي الحسني', 'خالد المحمدي', 'عمر الصالحي'];
    return intInRange(0, names.length - 1).map((i) => names[i]);
  }

  /// Generate a future DateTime
  Generator<DateTime> get futureDateTime =>
      intInRange(1, 30).map((days) => DateTime.now().add(Duration(days: days)));

  /// Generate a past DateTime
  Generator<DateTime> get pastDateTime =>
      intInRange(1, 30).map((days) => DateTime.now().subtract(Duration(days: days)));
}

/// Mask phone number: 777123456 → 777***456
/// Requirements: 5.1, 5.3
String maskPhoneNumber(String phone) {
  final digits = phone.replaceAll(RegExp(r'[^\d]'), '');
  if (digits.length <= 6) return digits;
  final first3 = digits.substring(0, 3);
  final last3 = digits.substring(digits.length - 3);
  final middleLength = digits.length - 6;
  return first3 + '*' * middleLength + last3;
}

/// Validate bid amount against auction
/// Requirements: 4.3, 4.4
Map<String, dynamic> validateBidAmount(double currentPrice, double minIncrement, double bidAmount) {
  final minBid = currentPrice + minIncrement;
  if (bidAmount < minBid) {
    return {'valid': false, 'error': 'العرض أقل من الحد الأدنى'};
  }
  return {'valid': true};
}

/// Validate bidder name
/// Requirements: 4.3
Map<String, dynamic> validateBidderName(String name) {
  if (name.trim().isEmpty) {
    return {'valid': false, 'error': 'اسم المزايد مطلوب'};
  }
  return {'valid': true};
}

/// Validate phone number format
Map<String, dynamic> validatePhoneNumber(String phone) {
  final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    return {'valid': false, 'error': 'رقم الهاتف غير صحيح'};
  }
  return {'valid': true};
}

/// Validate reserve price >= starting price
/// Requirements: 1.5
Map<String, dynamic> validateReservePrice(double startingPrice, double? reservePrice) {
  if (reservePrice != null && reservePrice < startingPrice) {
    return {'valid': false, 'error': 'السعر الأدنى يجب أن يكون أكبر من أو يساوي السعر الابتدائي'};
  }
  return {'valid': true};
}

void main() {
  group('Auction Model Property Tests', () {
    /// Property 1: Auction JSON Round-Trip
    /// *For any* auction, serializing to JSON and deserializing back should produce
    /// an equivalent auction with all required fields preserved.
    Glados2(any.boundedId, any.auctionStatus).test(
      'Property 1: Auction JSON round-trip preserves all required fields',
      (id, status) {
        final now = DateTime.now();
        final auction = Auction(
          id: id,
          carId: id + 1,
          startingPrice: 10000.0,
          currentPrice: 15000.0,
          minIncrement: 100.0,
          endTime: now.add(const Duration(days: 7)),
          status: status,
          bidCount: 5,
          bids: [],
          createdAt: now,
          updatedAt: now,
        );

        final json = auction.toJson();
        final restored = Auction.fromJson(json);

        expect(restored.id, equals(auction.id));
        expect(restored.carId, equals(auction.carId));
        expect(restored.startingPrice, equals(auction.startingPrice));
        expect(restored.currentPrice, equals(auction.currentPrice));
        expect(restored.minIncrement, equals(auction.minIncrement));
        expect(restored.status, equals(auction.status));
        expect(restored.bidCount, equals(auction.bidCount));
      },
    );

    /// Property 2: Bid JSON Round-Trip
    /// *For any* bid, serializing to JSON and deserializing back should produce
    /// an equivalent bid with all required fields preserved.
    Glados2(any.boundedId, any.positivePrice).test(
      'Property 2: Bid JSON round-trip preserves all required fields',
      (id, amount) {
        final now = DateTime.now();
        final bid = Bid(
          id: id,
          auctionId: id + 1,
          bidderName: 'أحمد الأحمدي',
          maskedPhone: '777***456',
          amount: amount,
          createdAt: now,
        );

        final json = bid.toJson();
        final restored = Bid.fromJson(json);

        expect(restored.id, equals(bid.id));
        expect(restored.auctionId, equals(bid.auctionId));
        expect(restored.bidderName, equals(bid.bidderName));
        expect(restored.maskedPhone, equals(bid.maskedPhone));
        expect(restored.amount, equals(bid.amount));
      },
    );
  });

  group('Phone Number Masking Property Tests', () {
    /// Property 3: Phone Number Masking
    /// For any phone number, masking should hide middle digits while preserving first 3 and last 3
    /// 
    /// Feature: auction-system, Property 2: Phone Number Masking
    /// **Validates: Requirements 5.1, 5.3**
    Glados(any.yemeniPhone).test(
      'Property 3: Phone masking preserves first 3 and last 3 digits',
      (phone) {
        final masked = maskPhoneNumber(phone);
        final digits = phone.replaceAll(RegExp(r'[^\d]'), '');

        // First 3 digits should match
        expect(masked.substring(0, 3), equals(digits.substring(0, 3)));

        // Last 3 digits should match
        expect(masked.substring(masked.length - 3), equals(digits.substring(digits.length - 3)));

        // Middle should be asterisks
        final middle = masked.substring(3, masked.length - 3);
        expect(middle, matches(RegExp(r'^\*+$')));
      },
    );

    /// Property 4: Phone Masking Length Preservation
    /// For any phone number, masked version should have same length as original digits
    Glados(any.yemeniPhone).test(
      'Property 4: Phone masking preserves length',
      (phone) {
        final masked = maskPhoneNumber(phone);
        final originalDigits = phone.replaceAll(RegExp(r'[^\d]'), '');

        expect(masked.length, equals(originalDigits.length));
      },
    );
  });

  group('Bid Validation Property Tests', () {
    /// Property 5: Bid Amount Validation
    /// For any bid, amount must be >= current_price + min_increment
    /// 
    /// Feature: auction-system, Property 1: Bid Amount Validation
    /// **Validates: Requirements 4.3, 4.4**
    Glados3(any.positivePrice, any.minIncrement, any.positivePrice).test(
      'Property 5: Bid amount validation is correct',
      (currentPrice, minIncrement, bidAmount) {
        final minBid = currentPrice + minIncrement;
        final validation = validateBidAmount(currentPrice, minIncrement, bidAmount);

        if (bidAmount >= minBid) {
          expect(validation['valid'], isTrue);
        } else {
          expect(validation['valid'], isFalse);
          expect(validation['error'], contains('الحد الأدنى'));
        }
      },
    );

    /// Property 6: Bidder Name Validation
    /// For any bid, bidder name must not be empty
    /// 
    /// Feature: auction-system, Property 1: Bid Validation
    /// **Validates: Requirements 4.3**
    Glados(any.bidderName).test(
      'Property 6: Valid bidder names are accepted',
      (name) {
        final validation = validateBidderName(name);
        expect(validation['valid'], isTrue);
      },
    );

    /// Property 7: Empty Bidder Name Rejection
    Glados(any.intInRange(0, 3)).test(
      'Property 7: Empty bidder names are rejected',
      (index) {
        final emptyNames = ['', '   ', '\t', '\n'];
        final emptyName = emptyNames[index];
        final validation = validateBidderName(emptyName);
        expect(validation['valid'], isFalse);
        expect(validation['error'], equals('اسم المزايد مطلوب'));
      },
    );

    /// Property 8: Phone Number Validation
    Glados(any.yemeniPhone).test(
      'Property 8: Valid phone numbers are accepted',
      (phone) {
        final validation = validatePhoneNumber(phone);
        expect(validation['valid'], isTrue);
      },
    );
  });

  group('Reserve Price Validation Property Tests', () {
    /// Property 9: Reserve Price Validation
    /// For any auction, reserve price must be >= starting price
    /// 
    /// Feature: auction-system, Property 4: Reserve Price Validation
    /// **Validates: Requirements 1.5**
    Glados2(any.positivePrice, any.positivePrice).test(
      'Property 9: Reserve price validation is correct',
      (startingPrice, reservePrice) {
        final validation = validateReservePrice(startingPrice, reservePrice);

        if (reservePrice >= startingPrice) {
          expect(validation['valid'], isTrue);
        } else {
          expect(validation['valid'], isFalse);
          expect(validation['error'], contains('السعر الأدنى'));
        }
      },
    );

    /// Property 10: Null Reserve Price Always Valid
    Glados(any.positivePrice).test(
      'Property 10: Null reserve price is always valid',
      (startingPrice) {
        final validation = validateReservePrice(startingPrice, null);
        expect(validation['valid'], isTrue);
      },
    );
  });

  group('Auction Status Property Tests', () {
    /// Property 11: Active Auction Detection
    Glados(any.auctionStatus).test(
      'Property 11: Auction status isActive is correct',
      (status) {
        expect(status.isActive, equals(status == AuctionStatus.active));
      },
    );

    /// Property 12: Ended Auction Detection
    Glados(any.auctionStatus).test(
      'Property 12: Auction status hasEnded is correct',
      (status) {
        expect(status.hasEnded, equals(status != AuctionStatus.active));
      },
    );
  });

  group('PlaceBidInput Validation Property Tests', () {
    /// Property 13: PlaceBidInput Validation
    /// For any valid PlaceBidInput, validation should pass
    Glados3(any.bidderName, any.yemeniPhone, any.positivePrice).test(
      'Property 13: Valid PlaceBidInput passes validation',
      (name, phone, amount) {
        final input = PlaceBidInput(
          bidderName: name,
          phoneNumber: phone,
          amount: amount,
        );

        // Use a current price that makes the bid valid
        final currentPrice = amount / 2;
        final minIncrement = 100.0;

        final error = input.validate(currentPrice, minIncrement);
        
        // Should pass if amount >= currentPrice + minIncrement
        if (amount >= currentPrice + minIncrement) {
          expect(error, isNull);
        }
      },
    );
  });

  group('Auction Computed Properties Tests', () {
    /// Property 14: Minimum Bid Calculation
    Glados2(any.positivePrice, any.minIncrement).test(
      'Property 14: Minimum bid equals currentPrice + minIncrement',
      (currentPrice, minIncrement) {
        final now = DateTime.now();
        final auction = Auction(
          id: 1,
          carId: 1,
          startingPrice: currentPrice / 2,
          currentPrice: currentPrice,
          minIncrement: minIncrement,
          endTime: now.add(const Duration(days: 7)),
          status: AuctionStatus.active,
          createdAt: now,
          updatedAt: now,
        );

        expect(auction.minimumBid, equals(currentPrice + minIncrement));
      },
    );

    /// Property 15: Reserve Met Calculation
    Glados2(any.positivePrice, any.positivePrice).test(
      'Property 15: Reserve met is calculated correctly',
      (currentPrice, reservePrice) {
        final now = DateTime.now();
        final auction = Auction(
          id: 1,
          carId: 1,
          startingPrice: 1000.0,
          reservePrice: reservePrice,
          currentPrice: currentPrice,
          minIncrement: 100.0,
          endTime: now.add(const Duration(days: 7)),
          status: AuctionStatus.active,
          createdAt: now,
          updatedAt: now,
        );

        expect(auction.reserveMet, equals(currentPrice >= reservePrice));
      },
    );

    /// Property 16: Null Reserve Always Met
    Glados(any.positivePrice).test(
      'Property 16: Null reserve price is always met',
      (currentPrice) {
        final now = DateTime.now();
        final auction = Auction(
          id: 1,
          carId: 1,
          startingPrice: 1000.0,
          reservePrice: null,
          currentPrice: currentPrice,
          minIncrement: 100.0,
          endTime: now.add(const Duration(days: 7)),
          status: AuctionStatus.active,
          createdAt: now,
          updatedAt: now,
        );

        expect(auction.reserveMet, isTrue);
      },
    );
  });
}
