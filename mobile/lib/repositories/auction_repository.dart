// Auction Repository for Flutter Customer App
// Requirements: 6.1, 6.2, 6.3

import '../core/api/api_client.dart';
import '../models/auction.dart';

/// Abstract Auction Repository Interface
abstract class AuctionRepository {
  /// Get all auctions with optional status filter
  /// Requirements: 6.1
  Future<AuctionsResponse> getAuctions({String? status});

  /// Get auction by ID with bids
  /// Requirements: 6.2
  Future<Auction> getAuctionById(int id);

  /// Place a bid on an auction
  /// Requirements: 6.3
  Future<Bid> placeBid(int auctionId, PlaceBidInput input);

  /// Get active auctions sorted by ending soonest
  Future<List<Auction>> getActiveAuctions();

  /// Filter auctions by status locally
  List<Auction> filterByStatus(List<Auction> auctions, AuctionStatus status);

  /// Sort auctions by ending soonest
  List<Auction> sortByEndingSoonest(List<Auction> auctions);
}

/// Auction Repository Implementation
class AuctionRepositoryImpl implements AuctionRepository {
  final ApiClient _apiClient;

  AuctionRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  @override
  Future<AuctionsResponse> getAuctions({String? status}) async {
    return _apiClient.getAuctions(status: status);
  }

  @override
  Future<Auction> getAuctionById(int id) async {
    return _apiClient.getAuctionById(id);
  }

  @override
  Future<Bid> placeBid(int auctionId, PlaceBidInput input) async {
    return _apiClient.placeBid(auctionId, input);
  }

  @override
  Future<List<Auction>> getActiveAuctions() async {
    final response = await _apiClient.getAuctions(status: 'ACTIVE');
    return sortByEndingSoonest(response.auctions);
  }

  /// Filter auctions by status locally
  @override
  List<Auction> filterByStatus(List<Auction> auctions, AuctionStatus status) {
    return auctions.where((auction) => auction.status == status).toList();
  }

  /// Sort auctions by ending soonest first
  /// Requirements: 3.5
  @override
  List<Auction> sortByEndingSoonest(List<Auction> auctions) {
    final sorted = List<Auction>.from(auctions);
    sorted.sort((a, b) => a.endTime.compareTo(b.endTime));
    return sorted;
  }
}
