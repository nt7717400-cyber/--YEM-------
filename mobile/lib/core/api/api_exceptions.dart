// API Exceptions for Flutter Customer App
// Requirements: 1.5

/// Base API Exception - استثناء الـ API الأساسي
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? errorCode;
  final Map<String, dynamic>? errors;

  const ApiException({
    required this.message,
    this.statusCode,
    this.errorCode,
    this.errors,
  });

  @override
  String toString() => 'ApiException: $message (code: $errorCode, status: $statusCode)';
}

/// Network Exception - استثناء الشبكة
class NetworkException extends ApiException {
  const NetworkException({
    super.message = 'لا يوجد اتصال بالإنترنت',
    super.statusCode,
    super.errorCode = 'NETWORK_ERROR',
  });
}

/// Server Exception - استثناء الخادم
class ServerException extends ApiException {
  const ServerException({
    super.message = 'حدث خطأ في الخادم',
    super.statusCode = 500,
    super.errorCode = 'SRV_001',
  });
}

/// Not Found Exception - استثناء غير موجود
class NotFoundException extends ApiException {
  const NotFoundException({
    super.message = 'المورد غير موجود',
    super.statusCode = 404,
    super.errorCode = 'NOT_FOUND',
  });
}

/// Validation Exception - استثناء التحقق
class ValidationException extends ApiException {
  const ValidationException({
    super.message = 'يرجى التحقق من البيانات المدخلة',
    super.statusCode = 400,
    super.errorCode = 'VAL_001',
    super.errors,
  });
}

/// Timeout Exception - استثناء انتهاء المهلة
class TimeoutException extends ApiException {
  const TimeoutException({
    super.message = 'انتهت مهلة الاتصال',
    super.statusCode,
    super.errorCode = 'TIMEOUT',
  });
}
