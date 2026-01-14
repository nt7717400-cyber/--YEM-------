// API Client for Flutter Customer App
// Requirements: 1.1, 1.5, 3.6, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 10.1

import 'package:dio/dio.dart';
import '../../../models/car.dart';
import '../../../models/banner.dart' as app_banner;
import '../../../models/settings.dart';
import '../../../models/car_filter.dart';
import '../../../models/auction.dart';
import 'api_endpoints.dart';
import 'api_exceptions.dart';

/// API Client - عميل الـ API
class ApiClient {
  final Dio _dio;
  final String baseUrl;

  ApiClient({
    required this.baseUrl,
    Dio? dio,
  }) : _dio = dio ?? Dio() {
    _configureDio();
  }

  /// Configure Dio with interceptors
  void _configureDio() {
    _dio.options = BaseOptions(
      baseUrl: baseUrl,
      // Reduced timeouts for faster failure detection
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Enable compression for faster data transfer
        'Accept-Encoding': 'gzip, deflate',
      },
      // Enable response validation
      validateStatus: (status) => status != null && status < 500,
    );

    // Add error handling interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (error, handler) {
        handler.next(_handleDioError(error));
      },
    ));
  }

  /// Handle Dio errors and convert to ApiException
  DioException _handleDioError(DioException error) {
    // The error will be caught and converted in the API methods
    return error;
  }

  /// Parse API response
  T _parseResponse<T>(Response response, T Function(dynamic) parser) {
    final data = response.data;
    
    if (data is Map<String, dynamic>) {
      if (data['success'] == true && data.containsKey('data')) {
        return parser(data['data']);
      } else if (data['success'] == false) {
        throw ApiException(
          message: data['error']?['message'] ?? 'حدث خطأ غير متوقع',
          statusCode: response.statusCode,
          errorCode: data['error']?['code'],
          errors: data['error']?['errors'],
        );
      }
    }
    
    return parser(data);
  }

  /// Handle API errors
  Never _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          throw const TimeoutException();
        
        case DioExceptionType.connectionError:
          throw const NetworkException();
        
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final data = error.response?.data;
          
          if (data is Map<String, dynamic> && data['error'] != null) {
            throw ApiException(
              message: data['error']['message'] ?? 'حدث خطأ',
              statusCode: statusCode,
              errorCode: data['error']['code'],
              errors: data['error']['errors'],
            );
          }
          
          if (statusCode == 404) {
            throw const NotFoundException();
          }
          
          if (statusCode == 400) {
            throw ValidationException(
              message: data?['error']?['message'] ?? 'يرجى التحقق من البيانات',
              errors: data?['error']?['errors'],
            );
          }
          
          throw ServerException(
            message: data?['error']?['message'] ?? 'حدث خطأ في الخادم',
            statusCode: statusCode,
          );
        
        default:
          throw ApiException(
            message: error.message ?? 'حدث خطأ غير متوقع',
          );
      }
    }
    
    if (error is ApiException) {
      throw error;
    }
    
    throw ApiException(message: error.toString());
  }


  // ============================================
  // Cars API Methods
  // Requirements: 1.1, 3.6, 10.1
  // ============================================

  /// Get all cars with optional filters
  /// Requirements: 1.1
  Future<CarsResponse> getCars({CarFilter? filter}) async {
    try {
      final queryParams = <String, dynamic>{};
      
      if (filter != null) {
        if (filter.search != null && filter.search!.isNotEmpty) {
          queryParams['search'] = filter.search;
        }
        if (filter.brand != null && filter.brand!.isNotEmpty) {
          queryParams['brand'] = filter.brand;
        }
        if (filter.condition != null) {
          queryParams['condition'] = filter.condition!.toJson();
        }
        if (filter.minPrice != null) {
          queryParams['minPrice'] = filter.minPrice;
        }
        if (filter.maxPrice != null) {
          queryParams['maxPrice'] = filter.maxPrice;
        }
        if (filter.year != null) {
          queryParams['year'] = filter.year;
        }
        if (filter.sortBy != SortBy.newest) {
          queryParams['sortBy'] = filter.sortBy.toJson();
        }
        if (filter.page != null) {
          queryParams['page'] = filter.page;
        }
        if (filter.perPage != null) {
          queryParams['perPage'] = filter.perPage;
        }
        if (filter.featured != null) {
          queryParams['featured'] = filter.featured;
        }
      }

      final response = await _dio.get(
        ApiEndpoints.cars,
        queryParameters: queryParams,
      );

      return _parseResponse(response, (data) {
        final responseData = response.data as Map<String, dynamic>;
        final cars = (data as List<dynamic>)
            .map((json) => Car.fromJson(json as Map<String, dynamic>))
            .toList();
        
        return CarsResponse(
          cars: cars,
          total: responseData['pagination']?['total'] ?? cars.length,
          page: responseData['pagination']?['page'] ?? 1,
          perPage: responseData['pagination']?['perPage'] ?? cars.length,
          totalPages: responseData['pagination']?['totalPages'] ?? 1,
        );
      });
    } catch (e) {
      _handleError(e);
    }
  }

  /// Get car by ID
  /// Requirements: 3.6
  Future<Car> getCarById(int id) async {
    try {
      final response = await _dio.get(ApiEndpoints.carById(id));
      return _parseResponse(response, (data) => Car.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }

  /// Get all brands
  /// Requirements: 10.1
  Future<List<String>> getBrands() async {
    try {
      final response = await _dio.get(ApiEndpoints.brands);
      return _parseResponse(response, (data) {
        return (data as List<dynamic>).map((e) => e.toString()).toList();
      });
    } catch (e) {
      _handleError(e);
    }
  }

  /// Increment car view count
  /// Requirements: 3.6
  Future<void> incrementViewCount(int carId) async {
    try {
      await _dio.post(ApiEndpoints.carView(carId));
    } catch (e) {
      // Silently fail for view count - not critical
      // Log error but don't throw
    }
  }


  // ============================================
  // Banners API Methods
  // Requirements: 5.1, 5.2, 5.3
  // ============================================

  /// Get banners by position
  /// Requirements: 5.1
  Future<List<app_banner.Banner>> getBannersByPosition(String position) async {
    try {
      final response = await _dio.get(ApiEndpoints.bannersByPosition(position));
      return _parseResponse(response, (data) {
        return (data as List<dynamic>)
            .map((json) => app_banner.Banner.fromJson(json as Map<String, dynamic>))
            .toList();
      });
    } catch (e) {
      _handleError(e);
    }
  }

  /// Track banner view
  /// Requirements: 5.2
  Future<void> trackBannerView(int bannerId) async {
    try {
      await _dio.post(ApiEndpoints.bannerView(bannerId));
    } catch (e) {
      // Silently fail for tracking - not critical
    }
  }

  /// Track banner click
  /// Requirements: 5.3
  Future<void> trackBannerClick(int bannerId) async {
    try {
      await _dio.post(ApiEndpoints.bannerClick(bannerId));
    } catch (e) {
      // Silently fail for tracking - not critical
    }
  }


  // ============================================
  // Settings API Methods
  // Requirements: 6.1
  // ============================================

  /// Get showroom settings
  /// Requirements: 6.1
  Future<ShowroomSettings> getSettings() async {
    try {
      final response = await _dio.get(ApiEndpoints.settings);
      return _parseResponse(response, (data) => ShowroomSettings.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }


  // ============================================
  // Auctions API Methods
  // Requirements: 6.1, 6.2, 6.3
  // ============================================

  /// Get all auctions
  /// Requirements: 6.1
  Future<AuctionsResponse> getAuctions({String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) {
        queryParams['status'] = status;
      }

      final response = await _dio.get(
        ApiEndpoints.auctions,
        queryParameters: queryParams,
      );

      return _parseResponse(response, (data) {
        final responseData = response.data as Map<String, dynamic>;
        final auctions = (data as List<dynamic>)
            .map((json) => Auction.fromJson(json as Map<String, dynamic>))
            .toList();
        
        return AuctionsResponse(
          auctions: auctions,
          total: responseData['pagination']?['total'] ?? auctions.length,
          page: responseData['pagination']?['page'] ?? 1,
          perPage: responseData['pagination']?['perPage'] ?? auctions.length,
          totalPages: responseData['pagination']?['totalPages'] ?? 1,
        );
      });
    } catch (e) {
      _handleError(e);
    }
  }

  /// Get auction by ID
  /// Requirements: 6.2
  Future<Auction> getAuctionById(int id) async {
    try {
      final response = await _dio.get(ApiEndpoints.auctionById(id));
      return _parseResponse(response, (data) => Auction.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }

  /// Place a bid on an auction
  /// Requirements: 6.3
  Future<Bid> placeBid(int auctionId, PlaceBidInput input) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.auctionBids(auctionId),
        data: input.toJson(),
      );
      return _parseResponse(response, (data) => Bid.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }
}

/// Cars Response - استجابة السيارات مع التصفح
class CarsResponse {
  final List<Car> cars;
  final int total;
  final int page;
  final int perPage;
  final int totalPages;

  const CarsResponse({
    required this.cars,
    required this.total,
    required this.page,
    required this.perPage,
    required this.totalPages,
  });
}
