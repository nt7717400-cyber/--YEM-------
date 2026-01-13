// API Endpoints for Flutter Customer App
// Requirements: 1.1, 1.5, 6.1, 6.2, 6.3

/// API Endpoints - نقاط نهاية الـ API
class ApiEndpoints {
  // Base URL - يتم تعيينها من الإعدادات
  // Use 10.0.2.2 for Android emulator (maps to host's localhost)
  // Use localhost for web/desktop
  // Using PHP built-in server on port 8000
  static String baseUrl = 'http://10.0.2.2:8000';
  
  // Static files URL (images, videos) - Python server on port 8001
  static String staticUrl = 'http://10.0.2.2:8001';

  // Cars endpoints
  static const String cars = '/cars';
  static String carById(int id) => '/cars/$id';
  static String carView(int id) => '/cars/$id/view';
  static const String brands = '/brands';

  // Banners endpoints
  static const String banners = '/banners';
  static String bannerById(int id) => '/banners/$id';
  static String bannersByPosition(String position) => '/banners/position/$position';
  static String bannerClick(int id) => '/banners/$id/click';
  static String bannerView(int id) => '/banners/$id/view';

  // Auctions endpoints - نقاط نهاية المزادات
  // Requirements: 6.1, 6.2, 6.3
  static const String auctions = '/auctions';
  static String auctionById(int id) => '/auctions/$id';
  static String auctionBids(int id) => '/auctions/$id/bids';

  // Settings endpoints
  static const String settings = '/settings';

  // VDS Inspection endpoints - نقاط نهاية فحص المركبات
  // Requirements: 8.4
  static const String vdsInspections = '/vds/inspections';
  static String vdsInspectionById(int id) => '/vds/inspections/$id';
  static String vdsInspectionFinalize(int id) => '/vds/inspections/$id/finalize';
  static String vdsInspectionPartPhotos(int inspectionId, String partKey) => 
      '/vds/inspections/$inspectionId/parts/$partKey/photos';
  
  // VDS Templates endpoints
  static const String vdsTemplates = '/templates';
  static String vdsTemplateById(int id) => '/templates/$id';
  
  // VDS Part Keys endpoints
  static const String vdsPartKeys = '/part-keys';
  
  // VDS Color Mappings endpoints
  static const String vdsColorMappings = '/color-mappings';

  /// Convert relative URL to full URL
  /// Handles URLs like /uploads/images/... and /uploads/videos/...
  static String getFullUrl(String? relativeUrl) {
    if (relativeUrl == null || relativeUrl.isEmpty) {
      return '';
    }
    // If already a full URL, return as is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    // Use static server for uploads (images, videos)
    if (relativeUrl.contains('/uploads/')) {
      final path = relativeUrl.startsWith('/') ? relativeUrl : '/$relativeUrl';
      return '$staticUrl$path';
    }
    // Remove leading slash if present for proper concatenation
    final path = relativeUrl.startsWith('/') ? relativeUrl : '/$relativeUrl';
    return '$baseUrl$path';
  }
}
