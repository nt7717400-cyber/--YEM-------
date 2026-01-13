/// Auction Providers for Flutter Customer App
/// Requirements: 3.1, 3.3, 6.1, 6.2, 6.3
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/auction.dart';
import '../repositories/auction_repository.dart';
import 'car_provider.dart';

// ============================================
// Repository Provider
// ============================================

/// Auction Repository Provider - مزود مستودع المزادات
final auctionRepositoryProvider = Provider<AuctionRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuctionRepositoryImpl(apiClient: apiClient);
});

// ============================================
// Auction Filter State
// ============================================

/// Auction Filter State - حالة فلتر المزادات
class AuctionFilterNotifier extends StateNotifier<AuctionStatus?> {
  AuctionFilterNotifier() : super(null);

  /// Set status filter
  void setStatus(AuctionStatus? status) {
    state = status;
  }

  /// Clear filter (show all)
  void clearFilter() {
    state = null;
  }
}

/// Auction Filter Provider - مزود فلتر المزادات
final auctionFilterProvider = StateNotifierProvider<AuctionFilterNotifier, AuctionStatus?>((ref) {
  return AuctionFilterNotifier();
});

// ============================================
// Auctions Providers
// ============================================

/// All Auctions Provider - مزود جميع المزادات
/// Requirements: 3.1
final auctionsProvider = FutureProvider.family<AuctionsResponse, String?>((ref, status) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getAuctions(status: status);
});

/// Active Auctions Provider - مزود المزادات النشطة
/// Requirements: 3.1, 3.5
final activeAuctionsProvider = FutureProvider<List<Auction>>((ref) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getActiveAuctions();
});

/// Filtered Auctions Provider - مزود المزادات المفلترة
/// Uses the current filter state
final filteredAuctionsProvider = FutureProvider<AuctionsResponse>((ref) async {
  final filter = ref.watch(auctionFilterProvider);
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getAuctions(status: filter?.toJson());
});

/// Auction Details Provider - مزود تفاصيل المزاد
/// Requirements: 3.3
final auctionDetailsProvider = FutureProvider.family<Auction, int>((ref, id) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getAuctionById(id);
});

// ============================================
// Bid State Management
// ============================================

/// Bid State - حالة تقديم العرض
class BidState {
  final bool isLoading;
  final String? error;
  final Bid? lastBid;

  const BidState({
    this.isLoading = false,
    this.error,
    this.lastBid,
  });

  BidState copyWith({
    bool? isLoading,
    String? error,
    Bid? lastBid,
  }) {
    return BidState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastBid: lastBid ?? this.lastBid,
    );
  }
}

/// Bid State Notifier - مدير حالة تقديم العرض
class BidStateNotifier extends StateNotifier<BidState> {
  final AuctionRepository _repository;
  final Ref _ref;

  BidStateNotifier(this._repository, this._ref) : super(const BidState());

  /// Place a bid on an auction
  /// Requirements: 6.3
  Future<bool> placeBid(int auctionId, PlaceBidInput input) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final bid = await _repository.placeBid(auctionId, input);
      state = state.copyWith(isLoading: false, lastBid: bid);
      
      // Invalidate auction details to refresh data
      _ref.invalidate(auctionDetailsProvider(auctionId));
      _ref.invalidate(activeAuctionsProvider);
      
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Clear error state
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Reset state
  void reset() {
    state = const BidState();
  }
}

/// Bid State Provider - مزود حالة تقديم العرض
final bidStateProvider = StateNotifierProvider<BidStateNotifier, BidState>((ref) {
  final repository = ref.watch(auctionRepositoryProvider);
  return BidStateNotifier(repository, ref);
});

// ============================================
// Utility Providers
// ============================================

/// Auction Countdown Provider - مزود العد التنازلي للمزاد
/// This provider can be used to get remaining time for an auction
final auctionCountdownProvider = Provider.family<Duration, DateTime>((ref, endTime) {
  final now = DateTime.now();
  if (now.isAfter(endTime)) {
    return Duration.zero;
  }
  return endTime.difference(now);
});
