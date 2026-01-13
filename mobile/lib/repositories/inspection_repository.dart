// VDS Inspection Repository for Flutter Customer App
// Requirements: 8.4, 15.1, 15.2, 15.3

import 'package:dio/dio.dart';
import '../core/api/api_endpoints.dart';
import '../core/api/api_exceptions.dart';
import '../models/inspection.dart';
import '../constants/inspection_constants.dart';

/// Abstract Inspection Repository Interface
abstract class InspectionRepository {
  /// Get inspection by ID
  Future<VDSInspection> getInspectionById(int id);

  /// Get inspection by car ID
  Future<VDSInspection?> getInspectionByCarId(int carId);

  /// Get all templates
  Future<List<VDSTemplate>> getTemplates();

  /// Get template by ID with full details
  Future<VDSTemplateDetail> getTemplateById(int id);

  /// Get all part keys
  Future<List<VDSPartKeyData>> getPartKeys();

  /// Get color mappings
  Future<List<ColorMappingEntry>> getColorMappings();

  /// Get part label by key
  String getPartLabelByKey(String partKey, {String language = 'ar'});

  /// Get condition color
  String getConditionColorHex(VDSPartCondition condition);
}

/// Inspection Repository Implementation
class InspectionRepositoryImpl implements InspectionRepository {
  final Dio _dio;
  final String baseUrl;

  // Cache for part keys and color mappings
  List<VDSPartKeyData>? _cachedPartKeys;
  List<ColorMappingEntry>? _cachedColorMappings;

  InspectionRepositoryImpl({
    required this.baseUrl,
    Dio? dio,
  }) : _dio = dio ?? Dio() {
    _configureDio();
  }

  /// Configure Dio with interceptors
  void _configureDio() {
    _dio.options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // Add logging interceptor for debug
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
    ));
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
  // Inspection API Methods
  // Requirements: 8.4, 15.1
  // ============================================

  @override
  Future<VDSInspection> getInspectionById(int id) async {
    try {
      final response = await _dio.get(ApiEndpoints.vdsInspectionById(id));
      return _parseResponse(response, (data) => VDSInspection.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }

  @override
  Future<VDSInspection?> getInspectionByCarId(int carId) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.vdsInspections,
        queryParameters: {'carId': carId},
      );
      
      return _parseResponse(response, (data) {
        if (data is List && data.isNotEmpty) {
          return VDSInspection.fromJson(data.first as Map<String, dynamic>);
        }
        return null;
      });
    } catch (e) {
      // Return null if not found
      if (e is NotFoundException) {
        return null;
      }
      _handleError(e);
    }
  }

  // ============================================
  // Templates API Methods
  // Requirements: 6.1, 6.2
  // ============================================

  @override
  Future<List<VDSTemplate>> getTemplates() async {
    try {
      final response = await _dio.get(ApiEndpoints.vdsTemplates);
      return _parseResponse(response, (data) {
        return (data as List<dynamic>)
            .map((json) => VDSTemplate.fromJson(json as Map<String, dynamic>))
            .toList();
      });
    } catch (e) {
      _handleError(e);
    }
  }

  @override
  Future<VDSTemplateDetail> getTemplateById(int id) async {
    try {
      final response = await _dio.get(ApiEndpoints.vdsTemplateById(id));
      return _parseResponse(response, (data) => VDSTemplateDetail.fromJson(data as Map<String, dynamic>));
    } catch (e) {
      _handleError(e);
    }
  }

  // ============================================
  // Part Keys API Methods
  // Requirements: 5.1
  // ============================================

  @override
  Future<List<VDSPartKeyData>> getPartKeys() async {
    // Return cached data if available
    if (_cachedPartKeys != null) {
      return _cachedPartKeys!;
    }

    try {
      final response = await _dio.get(ApiEndpoints.vdsPartKeys);
      _cachedPartKeys = _parseResponse(response, (data) {
        return (data as List<dynamic>)
            .map((json) => VDSPartKeyData.fromJson(json as Map<String, dynamic>))
            .toList();
      });
      return _cachedPartKeys!;
    } catch (e) {
      _handleError(e);
    }
  }

  // ============================================
  // Color Mappings API Methods
  // Requirements: 4.1
  // ============================================

  @override
  Future<List<ColorMappingEntry>> getColorMappings() async {
    // Return cached data if available
    if (_cachedColorMappings != null) {
      return _cachedColorMappings!;
    }

    try {
      final response = await _dio.get(ApiEndpoints.vdsColorMappings);
      _cachedColorMappings = _parseResponse(response, (data) {
        return (data as List<dynamic>)
            .map((json) => ColorMappingEntry.fromJson(json as Map<String, dynamic>))
            .toList();
      });
      return _cachedColorMappings!;
    } catch (e) {
      // Return default color mappings if API fails
      return defaultColorMappings;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  @override
  String getPartLabelByKey(String partKey, {String language = 'ar'}) {
    // First try to get from cached part keys
    if (_cachedPartKeys != null) {
      try {
        final partData = _cachedPartKeys!.firstWhere((p) => p.partKey == partKey);
        return partData.getLabel(language);
      } catch (_) {
        // Not found in cache, fall through to constants
      }
    }

    // Fall back to constants
    return getPartLabelByString(partKey, language: language);
  }

  @override
  String getConditionColorHex(VDSPartCondition condition) {
    // First try to get from cached color mappings
    if (_cachedColorMappings != null) {
      try {
        final mapping = _cachedColorMappings!.firstWhere((m) => m.condition == condition);
        return mapping.colorHex;
      } catch (_) {
        // Not found in cache, fall through to constants
      }
    }

    // Fall back to constants
    return colorByCondition[condition] ?? colorByCondition[VDSPartCondition.notInspected]!;
  }

  /// Clear cached data (useful for refresh)
  void clearCache() {
    _cachedPartKeys = null;
    _cachedColorMappings = null;
  }

  /// Preload part keys and color mappings
  Future<void> preloadData() async {
    await Future.wait([
      getPartKeys(),
      getColorMappings(),
    ]);
  }
}
