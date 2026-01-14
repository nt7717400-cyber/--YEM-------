// PDF Generator Service for Vehicle Inspection Reports
// Requirements: 7.1, 7.4
// 
// Generates professional PDF reports for car inspections with:
// - Cover page with inspection title, date, and car photo
// - Vehicle information section with actual car images
// - SVG diagrams for each view angle with damage colors
// - Detailed damage table with part photos
// - Color legend
// - Support for Arabic and English languages

import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:http/http.dart' as http;
import '../models/inspection.dart';
import '../models/car.dart';
import '../constants/inspection_constants.dart';
import '../core/api/api_endpoints.dart';

/// PDF Report Options
class PDFReportOptions {
  final String language;
  final bool includeVehicleInfo;
  final bool includeCustomerInfo;
  final bool includeInspectorInfo;
  final bool includeDiagrams;
  final bool includeDamageTable;
  final bool includeCarPhotos;
  final bool includePartPhotos;
  final PdfPageFormat paperSize;
  final String? companyLogo;
  final String? companyName;
  final String? companyPhone;
  final String? companyAddress;

  const PDFReportOptions({
    this.language = 'ar',
    this.includeVehicleInfo = true,
    this.includeCustomerInfo = true,
    this.includeInspectorInfo = true,
    this.includeDiagrams = true,
    this.includeDamageTable = true,
    this.includeCarPhotos = true,
    this.includePartPhotos = true,
    this.paperSize = PdfPageFormat.a4,
    this.companyLogo,
    this.companyName,
    this.companyPhone,
    this.companyAddress,
  });

  PDFReportOptions copyWith({
    String? language,
    bool? includeVehicleInfo,
    bool? includeCustomerInfo,
    bool? includeInspectorInfo,
    bool? includeDiagrams,
    bool? includeDamageTable,
    bool? includeCarPhotos,
    bool? includePartPhotos,
    PdfPageFormat? paperSize,
    String? companyLogo,
    String? companyName,
    String? companyPhone,
    String? companyAddress,
  }) {
    return PDFReportOptions(
      language: language ?? this.language,
      includeVehicleInfo: includeVehicleInfo ?? this.includeVehicleInfo,
      includeCustomerInfo: includeCustomerInfo ?? this.includeCustomerInfo,
      includeInspectorInfo: includeInspectorInfo ?? this.includeInspectorInfo,
      includeDiagrams: includeDiagrams ?? this.includeDiagrams,
      includeDamageTable: includeDamageTable ?? this.includeDamageTable,
      includeCarPhotos: includeCarPhotos ?? this.includeCarPhotos,
      includePartPhotos: includePartPhotos ?? this.includePartPhotos,
      paperSize: paperSize ?? this.paperSize,
      companyLogo: companyLogo ?? this.companyLogo,
      companyName: companyName ?? this.companyName,
      companyPhone: companyPhone ?? this.companyPhone,
      companyAddress: companyAddress ?? this.companyAddress,
    );
  }
}

/// Default PDF options
const defaultPDFOptions = PDFReportOptions(
  language: 'ar',
  includeVehicleInfo: true,
  includeCustomerInfo: true,
  includeInspectorInfo: true,
  includeDiagrams: true,
  includeDamageTable: true,
  includeCarPhotos: true,
  includePartPhotos: true,
  companyName: 'معرض السيارات',
  companyPhone: '+967 XXX XXX XXX',
);

/// PDF Color constants
class PDFColors {
  static const primary = PdfColor.fromInt(0xFF1e40af);
  static const primaryLight = PdfColor.fromInt(0xFF3b82f6);
  static const secondary = PdfColor.fromInt(0xFF64748b);
  static const success = PdfColor.fromInt(0xFF22c55e);
  static const warning = PdfColor.fromInt(0xFFf59e0b);
  static const danger = PdfColor.fromInt(0xFFef4444);
  static const light = PdfColor.fromInt(0xFFf8fafc);
  static const dark = PdfColor.fromInt(0xFF1e293b);
  static const border = PdfColor.fromInt(0xFFe2e8f0);
  static const white = PdfColors.white;
  static const black = PdfColors.black;
  static const grey = PdfColor.fromInt(0xFF9ca3af);
  static const lightGrey = PdfColor.fromInt(0xFFf1f5f9);
}

/// Text labels for PDF
class PDFLabels {
  final String language;

  PDFLabels(this.language);

  bool get isArabic => language == 'ar';

  // Report titles
  String get reportTitle => isArabic ? 'تقرير فحص السيارة' : 'Vehicle Inspection Report';
  String get professionalReport => isArabic ? 'تقرير فحص احترافي' : 'Professional Inspection Report';
  
  // Section titles
  String get vehicleInfo => isArabic ? 'معلومات السيارة' : 'Vehicle Information';
  String get customerInfo => isArabic ? 'معلومات العميل' : 'Customer Information';
  String get inspectorInfo => isArabic ? 'معلومات الفاحص' : 'Inspector Information';
  String get bodyCondition => isArabic ? 'حالة الهيكل الخارجي' : 'Exterior Body Condition';
  String get colorLegend => isArabic ? 'دليل الألوان' : 'Color Legend';
  String get damageTable => isArabic ? 'تفاصيل الأضرار' : 'Damage Details';
  String get inspectionDiagrams => isArabic ? 'مخططات الفحص' : 'Inspection Diagrams';
  String get carPhotos => isArabic ? 'صور السيارة' : 'Car Photos';
  String get partPhotos => isArabic ? 'صور الأجزاء' : 'Part Photos';
  String get inspectionSummary => isArabic ? 'ملخص الفحص' : 'Inspection Summary';
  
  // Table headers
  String get part => isArabic ? 'الجزء' : 'Part';
  String get condition => isArabic ? 'الحالة' : 'Condition';
  String get severity => isArabic ? 'الشدة' : 'Severity';
  String get notes => isArabic ? 'ملاحظات' : 'Notes';
  
  // Vehicle info labels
  String get brand => isArabic ? 'الماركة' : 'Brand';
  String get model => isArabic ? 'الموديل' : 'Model';
  String get year => isArabic ? 'سنة الصنع' : 'Year';
  String get kilometers => isArabic ? 'عداد المسافة' : 'Odometer';
  String get bodyType => isArabic ? 'نوع الهيكل' : 'Body Type';
  String get vin => isArabic ? 'رقم الهيكل (VIN)' : 'VIN Number';
  String get plate => isArabic ? 'رقم اللوحة' : 'Plate Number';
  String get color => isArabic ? 'اللون' : 'Color';
  String get mileage => isArabic ? 'المسافة المقطوعة' : 'Mileage';
  
  // Customer/Inspector labels
  String get name => isArabic ? 'الاسم' : 'Name';
  String get phone => isArabic ? 'الهاتف' : 'Phone';
  String get email => isArabic ? 'البريد الإلكتروني' : 'Email';
  String get date => isArabic ? 'التاريخ' : 'Date';
  
  // Status labels
  String get status => isArabic ? 'الحالة' : 'Status';
  String get finalized => isArabic ? 'معتمد' : 'Finalized';
  String get draft => isArabic ? 'مسودة' : 'Draft';
  
  // Summary labels
  String get damagedParts => isArabic ? 'الأجزاء المتضررة' : 'Damaged Parts';
  String get goodParts => isArabic ? 'الأجزاء السليمة' : 'Good Parts';
  String get totalParts => isArabic ? 'إجمالي الأجزاء' : 'Total Parts';
  String get overallCondition => isArabic ? 'الحالة العامة' : 'Overall Condition';
  
  // View angles
  String get frontView => isArabic ? 'المنظر الأمامي' : 'Front View';
  String get rearView => isArabic ? 'المنظر الخلفي' : 'Rear View';
  String get leftView => isArabic ? 'الجانب الأيسر' : 'Left Side';
  String get rightView => isArabic ? 'الجانب الأيمن' : 'Right Side';
  
  // Footer
  String get page => isArabic ? 'صفحة' : 'Page';
  String get of => isArabic ? 'من' : 'of';
  String get generatedOn => isArabic ? 'تم إنشاء التقرير في' : 'Report generated on';
  String get confidential => isArabic ? 'سري - للاستخدام الرسمي فقط' : 'Confidential - For Official Use Only';
  
  // Messages
  String get noDefects => isArabic 
      ? 'لا توجد أضرار مسجلة - السيارة بحالة ممتازة' 
      : 'No damages recorded - Vehicle in excellent condition';
  String get excellentCondition => isArabic ? 'ممتازة' : 'Excellent';
  String get goodConditionLabel => isArabic ? 'جيدة' : 'Good';
  String get fairCondition => isArabic ? 'مقبولة' : 'Fair';
  String get poorCondition => isArabic ? 'سيئة' : 'Poor';
  String get noPhotos => isArabic ? 'لا توجد صور' : 'No photos available';
}


/// Enhanced Inspection PDF Generator with Images
class InspectionPDFGenerator {
  final VDSInspection inspection;
  final PDFReportOptions options;
  final PDFLabels labels;
  final List<ColorMappingEntry> colorMappings;
  final Car? car;
  final List<Uint8List>? carImages;
  final Map<String, Uint8List>? svgImages;
  
  late pw.Document _doc;
  late pw.Font _regularFont;
  late pw.Font _boldFont;
  late pw.Font _fallbackFont;
  late pw.TextDirection _textDirection;
  
  // Cached images
  final Map<String, pw.MemoryImage?> _imageCache = {};
  
  // Font sizes - LARGER for better readability
  static const double titleSize = 28;
  static const double headerSize = 18;
  static const double subHeaderSize = 14;
  static const double bodySize = 12;
  static const double smallSize = 10;
  static const double tinySize = 9;

  InspectionPDFGenerator({
    required this.inspection,
    PDFReportOptions? options,
    List<ColorMappingEntry>? colorMappings,
    this.car,
    this.carImages,
    this.svgImages,
  })  : options = options ?? defaultPDFOptions,
        labels = PDFLabels(options?.language ?? 'ar'),
        colorMappings = colorMappings ?? defaultColorMappings;

  /// Generate the PDF document
  Future<Uint8List> generate() async {
    await _loadFonts();
    
    _textDirection = options.language == 'ar' 
        ? pw.TextDirection.rtl 
        : pw.TextDirection.ltr;
    
    _doc = pw.Document(
      theme: pw.ThemeData.withFont(
        base: _regularFont,
        bold: _boldFont,
        fontFallback: [_fallbackFont],
      ),
      title: labels.reportTitle,
      author: options.companyName ?? 'Car Showroom',
      creator: 'Vehicle Inspection System',
      subject: 'Vehicle Inspection Report',
    );

    // Load car image first
    pw.MemoryImage? mainCarImage;
    if (car != null) {
      // Try thumbnail first
      if (car!.thumbnail != null && car!.thumbnail!.isNotEmpty) {
        debugPrint('Loading car thumbnail: ${car!.thumbnail}');
        mainCarImage = await _loadNetworkImage(car!.thumbnail!);
      }
      // If thumbnail failed or not available, try first image from images list
      if (mainCarImage == null && car!.images.isNotEmpty) {
        final firstImageUrl = car!.images.first.url;
        debugPrint('Thumbnail not available, trying first image: $firstImageUrl');
        mainCarImage = await _loadNetworkImage(firstImageUrl);
      }
    }

    // Add cover page
    await _addCoverPage(mainCarImage);
    
    // Add vehicle info page
    await _addVehicleInfoPage(mainCarImage);
    
    // Add inspection diagrams page
    if (options.includeDiagrams) {
      await _addDiagramsPage();
    }
    
    // Add damage details page
    if (options.includeDamageTable) {
      await _addDamageDetailsPage();
    }

    return _doc.save();
  }

  /// Load fonts for PDF
  Future<void> _loadFonts() async {
    // Load fallback font for Latin characters
    _fallbackFont = pw.Font.helvetica();
    
    try {
      // Use Cairo font which supports both Arabic and Latin characters
      debugPrint('Loading Cairo fonts from Google Fonts...');
      _regularFont = await PdfGoogleFonts.cairoRegular();
      _boldFont = await PdfGoogleFonts.cairoBold();
      debugPrint('Cairo fonts loaded successfully from Google Fonts');
    } catch (e) {
      debugPrint('Failed to load Cairo fonts: $e');
      // Try loading Noto Sans Arabic font
      try {
        debugPrint('Trying Noto Sans Arabic font as fallback...');
        _regularFont = await PdfGoogleFonts.notoSansArabicRegular();
        _boldFont = await PdfGoogleFonts.notoSansArabicBold();
        debugPrint('Noto Sans Arabic fonts loaded successfully');
      } catch (e2) {
        debugPrint('Failed to load Noto Sans Arabic fonts: $e2');
        // Try Amiri font as another fallback
        try {
          debugPrint('Trying Amiri font as fallback...');
          _regularFont = await PdfGoogleFonts.amiriRegular();
          _boldFont = await PdfGoogleFonts.amiriBold();
          debugPrint('Amiri fonts loaded successfully');
        } catch (e3) {
          debugPrint('Failed to load Amiri fonts: $e3');
          // Last resort - use Helvetica (won't support Arabic)
          debugPrint('WARNING: Using Helvetica - Arabic text will not display correctly');
          _regularFont = pw.Font.helvetica();
          _boldFont = pw.Font.helveticaBold();
        }
      }
    }
  }

  /// Load image from URL
  Future<pw.MemoryImage?> _loadNetworkImage(String url) async {
    if (_imageCache.containsKey(url)) {
      debugPrint('Image from cache: $url');
      return _imageCache[url];
    }
    
    try {
      String fullUrl = url;
      if (!url.startsWith('http')) {
        fullUrl = ApiEndpoints.getFullUrl(url);
      }
      
      debugPrint('=== Loading image ===');
      debugPrint('Original URL: $url');
      debugPrint('Full URL: $fullUrl');
      debugPrint('Static URL base: ${ApiEndpoints.staticUrl}');
      
      final response = await http.get(
        Uri.parse(fullUrl),
        headers: {'Accept': 'image/*'},
      ).timeout(const Duration(seconds: 15));
      
      debugPrint('Response status: ${response.statusCode}');
      debugPrint('Response content-type: ${response.headers['content-type']}');
      debugPrint('Response body length: ${response.bodyBytes.length} bytes');
      
      if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
        // Verify it's actually an image
        final contentType = response.headers['content-type'] ?? '';
        if (contentType.contains('image') || response.bodyBytes.length > 100) {
          final image = pw.MemoryImage(response.bodyBytes);
          _imageCache[url] = image;
          debugPrint('✓ Image loaded successfully: ${response.bodyBytes.length} bytes');
          return image;
        } else {
          debugPrint('✗ Response is not an image: $contentType');
        }
      } else {
        debugPrint('✗ Failed to load image: status=${response.statusCode}');
      }
    } catch (e, stackTrace) {
      debugPrint('✗ Error loading image: $e');
      debugPrint('Stack trace: $stackTrace');
    }
    _imageCache[url] = null;
    return null;
  }

  /// Add professional cover page
  Future<void> _addCoverPage(pw.MemoryImage? carImage) async {
    _doc.addPage(
      pw.Page(
        pageFormat: options.paperSize,
        textDirection: _textDirection,
        margin: pw.EdgeInsets.zero,
        build: (context) => pw.Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const pw.BoxDecoration(
            gradient: pw.LinearGradient(
              begin: pw.Alignment.topCenter,
              end: pw.Alignment.bottomCenter,
              colors: [PDFColors.primary, PDFColors.primaryLight],
            ),
          ),
          child: pw.Padding(
            padding: const pw.EdgeInsets.all(40),
            child: pw.Column(
              children: [
                // Header
                _buildCoverHeader(),
                pw.SizedBox(height: 30),
                
                // Title
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  decoration: pw.BoxDecoration(
                    color: PDFColors.white,
                    borderRadius: pw.BorderRadius.circular(12),
                  ),
                  child: pw.Text(
                    labels.reportTitle,
                    style: pw.TextStyle(
                      font: _boldFont,
                      fontSize: titleSize,
                      color: PDFColors.primary,
                    ),
                    textDirection: _textDirection,
                  ),
                ),
                pw.SizedBox(height: 30),
                
                // Car image
                pw.Expanded(
                  child: pw.Container(
                    width: double.infinity,
                    decoration: pw.BoxDecoration(
                      color: PDFColors.white,
                      borderRadius: pw.BorderRadius.circular(16),
                    ),
                    child: pw.ClipRRect(
                      horizontalRadius: 16,
                      verticalRadius: 16,
                      child: carImage != null
                          ? pw.Image(carImage, fit: pw.BoxFit.contain)
                          : pw.Center(
                              child: pw.Column(
                                mainAxisAlignment: pw.MainAxisAlignment.center,
                                children: [
                                  pw.Container(
                                    width: 100,
                                    height: 100,
                                    decoration: pw.BoxDecoration(
                                      color: PDFColors.lightGrey,
                                      borderRadius: pw.BorderRadius.circular(50),
                                    ),
                                    child: pw.Center(
                                      child: pw.Text(
                                        '🚗',
                                        style: const pw.TextStyle(fontSize: 50),
                                      ),
                                    ),
                                  ),
                                  pw.SizedBox(height: 20),
                                  pw.Text(
                                    labels.noPhotos,
                                    style: pw.TextStyle(
                                      font: _regularFont,
                                      fontSize: bodySize,
                                      color: PDFColors.grey,
                                    ),
                                    textDirection: _textDirection,
                                  ),
                                ],
                              ),
                            ),
                    ),
                  ),
                ),
                pw.SizedBox(height: 30),
                
                // Vehicle info summary
                _buildCoverVehicleInfo(),
                pw.SizedBox(height: 20),
                
                // Footer with status and date
                _buildCoverFooter(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Build cover page header
  pw.Widget _buildCoverHeader() {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
      children: [
        // Logo placeholder
        pw.Container(
          width: 70,
          height: 70,
          decoration: pw.BoxDecoration(
            color: PDFColors.white,
            borderRadius: pw.BorderRadius.circular(10),
          ),
          child: pw.Center(
            child: pw.Text(
              options.companyName?.isNotEmpty == true 
                  ? options.companyName!.substring(0, 1) 
                  : 'C',
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: 32,
                color: PDFColors.primary,
              ),
            ),
          ),
        ),
        
        // Company info
        pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.end,
          children: [
            pw.Text(
              options.companyName ?? '',
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: headerSize,
                color: PDFColors.white,
              ),
              textDirection: _textDirection,
            ),
            if (options.companyPhone != null)
              pw.Text(
                options.companyPhone!,
                style: pw.TextStyle(
                  font: _regularFont,
                  fontSize: bodySize,
                  color: PdfColor.fromInt(0xCCFFFFFF),
                ),
              ),
          ],
        ),
      ],
    );
  }

  /// Build cover page vehicle info
  pw.Widget _buildCoverVehicleInfo() {
    final vehicle = inspection.vehicle;
    
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(20),
      decoration: pw.BoxDecoration(
        color: PDFColors.white,
        borderRadius: pw.BorderRadius.circular(12),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
        children: [
          _buildCoverInfoItem(labels.brand, vehicle.make ?? '-'),
          _buildCoverInfoDivider(),
          _buildCoverInfoItem(labels.model, vehicle.model ?? '-'),
          _buildCoverInfoDivider(),
          _buildCoverInfoItem(labels.year, vehicle.year?.toString() ?? '-'),
          _buildCoverInfoDivider(),
          _buildCoverInfoItem(labels.bodyType, getCarTemplateLabel(inspection.templateType, language: options.language)),
        ],
      ),
    );
  }

  pw.Widget _buildCoverInfoItem(String label, String value) {
    return pw.Column(
      children: [
        pw.Text(
          label,
          style: pw.TextStyle(
            font: _regularFont,
            fontSize: smallSize,
            color: PDFColors.secondary,
          ),
          textDirection: _textDirection,
        ),
        pw.SizedBox(height: 6),
        pw.Text(
          value,
          style: pw.TextStyle(
            font: _boldFont,
            fontSize: subHeaderSize,
            color: PDFColors.dark,
          ),
          textDirection: _textDirection,
        ),
      ],
    );
  }

  pw.Widget _buildCoverInfoDivider() {
    return pw.Container(
      width: 1,
      height: 50,
      color: PDFColors.border,
    );
  }

  /// Build cover page footer
  pw.Widget _buildCoverFooter() {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
      children: [
        // Date
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: pw.BoxDecoration(
            color: PDFColors.white,
            borderRadius: pw.BorderRadius.circular(25),
          ),
          child: pw.Text(
            _formatDate(inspection.createdAt),
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: bodySize,
              color: PDFColors.dark,
            ),
            textDirection: _textDirection,
          ),
        ),
        
        // Status badge
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: pw.BoxDecoration(
            color: inspection.isFinalized ? PDFColors.success : PDFColors.warning,
            borderRadius: pw.BorderRadius.circular(25),
          ),
          child: pw.Text(
            inspection.isFinalized ? labels.finalized : labels.draft,
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: bodySize,
              color: PDFColors.white,
            ),
            textDirection: _textDirection,
          ),
        ),
        
        // Report ID
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: pw.BoxDecoration(
            color: PDFColors.white,
            borderRadius: pw.BorderRadius.circular(25),
          ),
          child: pw.Text(
            '#${inspection.id}',
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: bodySize,
              color: PDFColors.primary,
            ),
          ),
        ),
      ],
    );
  }


  /// Add vehicle info page
  Future<void> _addVehicleInfoPage(pw.MemoryImage? carImage) async {
    _doc.addPage(
      pw.Page(
        pageFormat: options.paperSize,
        textDirection: _textDirection,
        margin: const pw.EdgeInsets.all(30),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            // Page header
            _buildPageHeader(labels.vehicleInfo),
            pw.SizedBox(height: 20),
            
            // Main content
            pw.Expanded(
              child: pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Left column - Vehicle details
                  pw.Expanded(
                    flex: 1,
                    child: pw.Column(
                      children: [
                        _buildInfoCard(labels.vehicleInfo, _buildVehicleDetails()),
                        pw.SizedBox(height: 15),
                        if (_hasCustomerInfo())
                          _buildInfoCard(labels.customerInfo, _buildCustomerDetails()),
                        if (_hasCustomerInfo())
                          pw.SizedBox(height: 15),
                        if (_hasInspectorInfo())
                          _buildInfoCard(labels.inspectorInfo, _buildInspectorDetails()),
                      ],
                    ),
                  ),
                  pw.SizedBox(width: 20),
                  
                  // Right column - Photo and summary
                  pw.Expanded(
                    flex: 1,
                    child: pw.Column(
                      children: [
                        // Car photo
                        pw.Container(
                          height: 200,
                          width: double.infinity,
                          decoration: pw.BoxDecoration(
                            color: PDFColors.lightGrey,
                            borderRadius: pw.BorderRadius.circular(12),
                            border: pw.Border.all(color: PDFColors.border),
                          ),
                          child: pw.ClipRRect(
                            horizontalRadius: 12,
                            verticalRadius: 12,
                            child: carImage != null
                                ? pw.Image(carImage, fit: pw.BoxFit.cover)
                                : pw.Center(
                                    child: pw.Text(
                                      labels.noPhotos,
                                      style: pw.TextStyle(
                                        font: _regularFont,
                                        fontSize: bodySize,
                                        color: PDFColors.grey,
                                      ),
                                      textDirection: _textDirection,
                                    ),
                                  ),
                          ),
                        ),
                        pw.SizedBox(height: 15),
                        
                        // Inspection summary
                        _buildInspectionSummaryCard(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Page footer
            _buildPageFooter(context),
          ],
        ),
      ),
    );
  }

  /// Build page header
  pw.Widget _buildPageHeader(String title) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      decoration: const pw.BoxDecoration(
        color: PDFColors.primary,
        borderRadius: pw.BorderRadius.all(pw.Radius.circular(10)),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            title,
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: headerSize,
              color: PDFColors.white,
            ),
            textDirection: _textDirection,
          ),
          pw.Text(
            '#${inspection.id}',
            style: pw.TextStyle(
              font: _regularFont,
              fontSize: bodySize,
              color: PdfColor.fromInt(0xCCFFFFFF),
            ),
          ),
        ],
      ),
    );
  }

  /// Build info card
  pw.Widget _buildInfoCard(String title, pw.Widget content) {
    return pw.Container(
      width: double.infinity,
      decoration: pw.BoxDecoration(
        color: PDFColors.white,
        borderRadius: pw.BorderRadius.circular(10),
        border: pw.Border.all(color: PDFColors.border),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          // Card header
          pw.Container(
            width: double.infinity,
            padding: const pw.EdgeInsets.symmetric(horizontal: 15, vertical: 10),
            decoration: const pw.BoxDecoration(
              color: PDFColors.lightGrey,
              borderRadius: pw.BorderRadius.only(
                topLeft: pw.Radius.circular(9),
                topRight: pw.Radius.circular(9),
              ),
            ),
            child: pw.Text(
              title,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: subHeaderSize,
                color: PDFColors.dark,
              ),
              textDirection: _textDirection,
            ),
          ),
          // Card content
          pw.Padding(
            padding: const pw.EdgeInsets.all(15),
            child: content,
          ),
        ],
      ),
    );
  }

  /// Build vehicle details
  pw.Widget _buildVehicleDetails() {
    final vehicle = inspection.vehicle;
    return pw.Column(
      children: [
        if (vehicle.make != null) _buildDetailRow(labels.brand, vehicle.make!),
        if (vehicle.model != null) _buildDetailRow(labels.model, vehicle.model!),
        if (vehicle.year != null) _buildDetailRow(labels.year, vehicle.year.toString()),
        _buildDetailRow(labels.bodyType, getCarTemplateLabel(inspection.templateType, language: options.language)),
        if (vehicle.vin != null) _buildDetailRow(labels.vin, vehicle.vin!),
        if (vehicle.plate != null) _buildDetailRow(labels.plate, vehicle.plate!),
        if (vehicle.color != null) _buildDetailRow(labels.color, vehicle.color!),
        if (vehicle.mileage != null) _buildDetailRow(labels.mileage, '${vehicle.mileage} km'),
      ],
    );
  }

  /// Build customer details
  pw.Widget _buildCustomerDetails() {
    final customer = inspection.customer;
    return pw.Column(
      children: [
        if (customer.name != null) _buildDetailRow(labels.name, customer.name!),
        if (customer.phone != null) _buildDetailRow(labels.phone, customer.phone!),
        if (customer.email != null) _buildDetailRow(labels.email, customer.email!),
      ],
    );
  }

  /// Build inspector details
  pw.Widget _buildInspectorDetails() {
    final inspector = inspection.inspector;
    return pw.Column(
      children: [
        if (inspector.name != null) _buildDetailRow(labels.name, inspector.name!),
        _buildDetailRow(labels.date, _formatDate(inspection.createdAt)),
        _buildDetailRow(labels.status, inspection.isFinalized ? labels.finalized : labels.draft),
      ],
    );
  }

  /// Build detail row
  pw.Widget _buildDetailRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 100,
            child: pw.Text(
              '$label:',
              style: pw.TextStyle(
                font: _regularFont,
                fontSize: bodySize,
                color: PDFColors.secondary,
              ),
              textDirection: _textDirection,
            ),
          ),
          pw.Expanded(
            child: pw.Text(
              value,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: bodySize,
                color: PDFColors.dark,
              ),
              textDirection: _textDirection,
            ),
          ),
        ],
      ),
    );
  }

  /// Build inspection summary card
  pw.Widget _buildInspectionSummaryCard() {
    // Define all standard body parts (same as web)
    const standardParts = [
      'front_bumper', 'hood', 'headlight_left', 'headlight_right', 'front_windshield',
      'rear_bumper', 'trunk', 'taillight_left', 'taillight_right', 'rear_windshield',
      'left_front_door', 'left_rear_door', 'left_front_fender', 'left_rear_quarter', 'left_mirror',
      'right_front_door', 'right_rear_door', 'right_front_fender', 'right_rear_quarter', 'right_mirror',
      'roof',
    ];
    
    // Create a map of part conditions
    final partConditions = <String, VDSPartCondition>{};
    for (final part in inspection.parts) {
      partConditions[part.partKey] = part.condition;
    }
    
    // Count good and damaged parts from standard parts list
    int goodParts = 0;
    int damagedParts = 0;
    
    for (final partKey in standardParts) {
      final condition = partConditions[partKey] ?? VDSPartCondition.good; // Default to good if not inspected
      if (condition == VDSPartCondition.good || condition == VDSPartCondition.notInspected) {
        goodParts++;
      } else {
        damagedParts++;
      }
    }
    
    final totalParts = goodParts + damagedParts;
    
    // Calculate overall condition - matching web logic
    // 0 damaged = excellent, ≤3 damaged = good, >3 = fair
    String overallCondition;
    PdfColor conditionColor;
    if (damagedParts == 0) {
      overallCondition = labels.excellentCondition;
      conditionColor = PDFColors.success;
    } else if (damagedParts <= 3) {
      overallCondition = labels.goodConditionLabel;
      conditionColor = PDFColors.primaryLight;
    } else {
      overallCondition = labels.fairCondition;
      conditionColor = PDFColors.warning;
    }
    
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(15),
      decoration: pw.BoxDecoration(
        color: PDFColors.white,
        borderRadius: pw.BorderRadius.circular(10),
        border: pw.Border.all(color: PDFColors.border),
      ),
      child: pw.Column(
        children: [
          pw.Text(
            labels.inspectionSummary,
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: subHeaderSize,
              color: PDFColors.dark,
            ),
            textDirection: _textDirection,
          ),
          pw.SizedBox(height: 15),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryItem(labels.goodParts, goodParts.toString(), PDFColors.success),
              _buildSummaryItem(labels.damagedParts, damagedParts.toString(), PDFColors.danger),
              _buildSummaryItem(labels.totalParts, totalParts.toString(), PDFColors.primary),
            ],
          ),
          pw.SizedBox(height: 15),
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: pw.BoxDecoration(
              color: conditionColor,
              borderRadius: pw.BorderRadius.circular(25),
            ),
            child: pw.Text(
              '${labels.overallCondition}: $overallCondition',
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: bodySize,
                color: PDFColors.white,
              ),
              textDirection: _textDirection,
            ),
          ),
        ],
      ),
    );
  }

  pw.Widget _buildSummaryItem(String label, String value, PdfColor color) {
    return pw.Column(
      children: [
        pw.Container(
          width: 45,
          height: 45,
          decoration: pw.BoxDecoration(
            color: color,
            shape: pw.BoxShape.circle,
          ),
          child: pw.Center(
            child: pw.Text(
              value,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: headerSize,
                color: PDFColors.white,
              ),
            ),
          ),
        ),
        pw.SizedBox(height: 6),
        pw.Text(
          label,
          style: pw.TextStyle(
            font: _regularFont,
            fontSize: smallSize,
            color: PDFColors.secondary,
          ),
          textDirection: _textDirection,
        ),
      ],
    );
  }


  /// Add inspection diagrams page
  Future<void> _addDiagramsPage() async {
    _doc.addPage(
      pw.Page(
        pageFormat: options.paperSize,
        textDirection: _textDirection,
        margin: const pw.EdgeInsets.all(30),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            _buildPageHeader(labels.inspectionDiagrams),
            pw.SizedBox(height: 15),
            
            // 2x2 Grid for 4 views
            pw.Expanded(
              child: pw.Column(
                children: [
                  // Top row: Front and Rear
                  pw.Expanded(
                    child: pw.Row(
                      children: [
                        pw.Expanded(child: _buildDiagramCard(labels.frontView, ViewAngle.front)),
                        pw.SizedBox(width: 15),
                        pw.Expanded(child: _buildDiagramCard(labels.rearView, ViewAngle.rear)),
                      ],
                    ),
                  ),
                  pw.SizedBox(height: 15),
                  // Bottom row: Left and Right
                  pw.Expanded(
                    child: pw.Row(
                      children: [
                        pw.Expanded(child: _buildDiagramCard(labels.leftView, ViewAngle.leftSide)),
                        pw.SizedBox(width: 15),
                        pw.Expanded(child: _buildDiagramCard(labels.rightView, ViewAngle.rightSide)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 15),
            
            // Color legend
            _buildColorLegend(),
            pw.SizedBox(height: 10),
            _buildPageFooter(context),
          ],
        ),
      ),
    );
  }

  /// Build diagram card for a view angle
  pw.Widget _buildDiagramCard(String title, ViewAngle angle) {
    final partsForView = _getPartsForViewAngle(angle);
    
    return pw.Container(
      decoration: pw.BoxDecoration(
        color: PDFColors.white,
        borderRadius: pw.BorderRadius.circular(10),
        border: pw.Border.all(color: PDFColors.border),
      ),
      child: pw.Column(
        children: [
          // Title bar
          pw.Container(
            width: double.infinity,
            padding: const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const pw.BoxDecoration(
              color: PDFColors.primary,
              borderRadius: pw.BorderRadius.only(
                topLeft: pw.Radius.circular(9),
                topRight: pw.Radius.circular(9),
              ),
            ),
            child: pw.Text(
              title,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: subHeaderSize,
                color: PDFColors.white,
              ),
              textDirection: _textDirection,
              textAlign: pw.TextAlign.center,
            ),
          ),
          // Parts list
          pw.Expanded(
            child: pw.Padding(
              padding: const pw.EdgeInsets.all(10),
              child: pw.Column(
                mainAxisAlignment: pw.MainAxisAlignment.start,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  ...partsForView.map((part) => _buildPartStatusRow(part)),
                  if (partsForView.isEmpty)
                    pw.Center(
                      child: pw.Text(
                        options.language == 'ar' ? 'لا توجد أجزاء مفحوصة' : 'No inspected parts',
                        style: pw.TextStyle(
                          font: _regularFont,
                          fontSize: bodySize,
                          color: PDFColors.grey,
                        ),
                        textDirection: _textDirection,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Get parts for a specific view angle
  List<PartDamageData> _getPartsForViewAngle(ViewAngle angle) {
    final partKeysForAngle = <String>[];
    
    switch (angle) {
      case ViewAngle.front:
        partKeysForAngle.addAll(['front_bumper', 'hood', 'front_grille', 'headlight_left', 'headlight_right', 'front_windshield']);
        break;
      case ViewAngle.rear:
        partKeysForAngle.addAll(['rear_bumper', 'trunk', 'taillight_left', 'taillight_right', 'rear_windshield']);
        break;
      case ViewAngle.leftSide:
        partKeysForAngle.addAll(['left_front_door', 'left_rear_door', 'left_front_fender', 'left_rear_quarter', 'left_mirror', 'left_front_window', 'left_rear_window']);
        break;
      case ViewAngle.rightSide:
        partKeysForAngle.addAll(['right_front_door', 'right_rear_door', 'right_front_fender', 'right_rear_quarter', 'right_mirror', 'right_front_window', 'right_rear_window']);
        break;
      case ViewAngle.top:
        partKeysForAngle.addAll(['roof', 'sunroof']);
        break;
    }
    
    return inspection.parts.where((p) => partKeysForAngle.contains(p.partKey)).toList();
  }

  /// Build part status row
  pw.Widget _buildPartStatusRow(PartDamageData part) {
    final partLabel = getPartLabelByString(part.partKey, language: options.language);
    // Use tire-specific labels for wheel parts
    final conditionLabel = getPartConditionLabel(part.partKey, part.condition, language: options.language);
    final color = _getConditionPdfColor(part.condition);
    
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 3),
      child: pw.Row(
        children: [
          pw.Container(
            width: 12,
            height: 12,
            decoration: pw.BoxDecoration(
              color: color,
              borderRadius: pw.BorderRadius.circular(3),
            ),
          ),
          pw.SizedBox(width: 8),
          pw.Expanded(
            child: pw.Text(
              partLabel,
              style: pw.TextStyle(
                font: _regularFont,
                fontSize: smallSize,
                color: PDFColors.dark,
              ),
              textDirection: _textDirection,
            ),
          ),
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: pw.BoxDecoration(
              color: color.shade(0.1),
              borderRadius: pw.BorderRadius.circular(10),
            ),
            child: pw.Text(
              conditionLabel,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: tinySize,
                color: color,
              ),
              textDirection: _textDirection,
            ),
          ),
        ],
      ),
    );
  }

  /// Build color legend
  pw.Widget _buildColorLegend() {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(12),
      decoration: pw.BoxDecoration(
        color: PDFColors.lightGrey,
        borderRadius: pw.BorderRadius.circular(8),
        border: pw.Border.all(color: PDFColors.border),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            labels.colorLegend,
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: bodySize,
              color: PDFColors.dark,
            ),
            textDirection: _textDirection,
          ),
          pw.SizedBox(height: 10),
          pw.Wrap(
            spacing: 20,
            runSpacing: 8,
            children: colorMappings.map((mapping) => pw.Row(
              mainAxisSize: pw.MainAxisSize.min,
              children: [
                pw.Container(
                  width: 16,
                  height: 16,
                  decoration: pw.BoxDecoration(
                    color: _hexToPdfColor(mapping.colorHex),
                    borderRadius: pw.BorderRadius.circular(4),
                  ),
                ),
                pw.SizedBox(width: 6),
                pw.Text(
                  mapping.getLabel(options.language),
                  style: pw.TextStyle(
                    font: _regularFont,
                    fontSize: smallSize,
                    color: PDFColors.dark,
                  ),
                  textDirection: _textDirection,
                ),
              ],
            )).toList(),
          ),
        ],
      ),
    );
  }

  /// Add damage details page
  Future<void> _addDamageDetailsPage() async {
    final damagedParts = inspection.parts.where((p) => 
        p.condition != VDSPartCondition.good && 
        p.condition != VDSPartCondition.notInspected
    ).toList();
    
    _doc.addPage(
      pw.Page(
        pageFormat: options.paperSize,
        textDirection: _textDirection,
        margin: const pw.EdgeInsets.all(30),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            _buildPageHeader(labels.damageTable),
            pw.SizedBox(height: 20),
            
            if (damagedParts.isEmpty)
              pw.Expanded(
                child: pw.Center(
                  child: pw.Container(
                    padding: const pw.EdgeInsets.all(40),
                    decoration: pw.BoxDecoration(
                      color: PDFColors.success.shade(0.1),
                      borderRadius: pw.BorderRadius.circular(16),
                      border: pw.Border.all(color: PDFColors.success, width: 2),
                    ),
                    child: pw.Column(
                      mainAxisSize: pw.MainAxisSize.min,
                      children: [
                        pw.Container(
                          width: 80,
                          height: 80,
                          decoration: pw.BoxDecoration(
                            color: PDFColors.success,
                            borderRadius: pw.BorderRadius.circular(40),
                          ),
                          child: pw.Center(
                            child: pw.CustomPaint(
                              size: const PdfPoint(40, 40),
                              painter: (canvas, size) {
                                // Draw checkmark manually
                                canvas
                                  ..setStrokeColor(PDFColors.white)
                                  ..setLineWidth(5)
                                  ..setLineCap(PdfLineCap.round)
                                  ..setLineJoin(PdfLineJoin.round)
                                  ..moveTo(8, 20)
                                  ..lineTo(16, 28)
                                  ..lineTo(32, 12)
                                  ..strokePath();
                              },
                            ),
                          ),
                        ),
                        pw.SizedBox(height: 20),
                        pw.Text(
                          labels.noDefects,
                          style: pw.TextStyle(
                            font: _boldFont,
                            fontSize: headerSize,
                            color: PDFColors.success,
                          ),
                          textDirection: _textDirection,
                          textAlign: pw.TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              pw.Expanded(
                child: _buildDamageTable(damagedParts),
              ),
            
            pw.SizedBox(height: 15),
            _buildPageFooter(context),
          ],
        ),
      ),
    );
  }

  /// Build damage table
  pw.Widget _buildDamageTable(List<PartDamageData> parts) {
    // For Arabic, reverse column order (RTL)
    final isRTL = options.language == 'ar';
    
    final headers = [
      labels.part,
      labels.condition,
      labels.severity,
      labels.notes,
    ];
    
    // Reverse for RTL
    final orderedHeaders = isRTL ? headers.reversed.toList() : headers;
    
    return pw.Table(
      border: pw.TableBorder.all(color: PDFColors.border, width: 1),
      columnWidths: const {
        0: pw.FlexColumnWidth(3),
        1: pw.FlexColumnWidth(2),
        2: pw.FlexColumnWidth(2),
        3: pw.FlexColumnWidth(3),
      },
      children: [
        // Header row
        pw.TableRow(
          decoration: const pw.BoxDecoration(color: PDFColors.primary),
          children: orderedHeaders.map((h) => _buildTableHeader(h)).toList(),
        ),
        // Data rows
        ...parts.asMap().entries.map((entry) {
          final index = entry.key;
          final part = entry.value;
          final isEven = index % 2 == 0;
          
          final cells = [
            _buildTableCell(getPartLabelByString(part.partKey, language: options.language)),
            _buildTableCellWithColor(
              // Use tire-specific labels for wheel parts
              getPartConditionLabel(part.partKey, part.condition, language: options.language),
              _getConditionPdfColor(part.condition),
            ),
            _buildTableCell(
              part.severity != null 
                  ? getSeverityLabel(part.severity!, language: options.language)
                  : '-',
            ),
            _buildTableCell(part.notes ?? '-'),
          ];
          
          // Reverse for RTL
          final orderedCells = isRTL ? cells.reversed.toList() : cells;
          
          return pw.TableRow(
            decoration: pw.BoxDecoration(
              color: isEven ? PDFColors.white : PDFColors.lightGrey,
            ),
            children: orderedCells,
          );
        }),
      ],
    );
  }

  pw.Widget _buildTableHeader(String text) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(10),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          font: _boldFont,
          fontSize: bodySize,
          color: PDFColors.white,
        ),
        textDirection: _textDirection,
        textAlign: pw.TextAlign.center,
      ),
    );
  }

  pw.Widget _buildTableCell(String text) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          font: _regularFont,
          fontSize: smallSize,
          color: PDFColors.dark,
        ),
        textDirection: _textDirection,
      ),
    );
  }

  pw.Widget _buildTableCellWithColor(String text, PdfColor color) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      child: pw.Row(
        mainAxisSize: pw.MainAxisSize.min,
        children: [
          pw.Container(
            width: 10,
            height: 10,
            decoration: pw.BoxDecoration(
              color: color,
              borderRadius: pw.BorderRadius.circular(2),
            ),
          ),
          pw.SizedBox(width: 6),
          pw.Expanded(
            child: pw.Text(
              text,
              style: pw.TextStyle(
                font: _boldFont,
                fontSize: smallSize,
                color: color,
              ),
              textDirection: _textDirection,
            ),
          ),
        ],
      ),
    );
  }

  /// Build page footer
  pw.Widget _buildPageFooter(pw.Context context) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.only(top: 10),
      decoration: const pw.BoxDecoration(
        border: pw.Border(top: pw.BorderSide(color: PDFColors.border, width: 1)),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            '${labels.generatedOn}: ${_formatDate(DateTime.now())}',
            style: pw.TextStyle(
              font: _regularFont,
              fontSize: tinySize,
              color: PDFColors.grey,
            ),
            textDirection: _textDirection,
          ),
          pw.Text(
            '${labels.page} ${context.pageNumber} ${labels.of} ${context.pagesCount}',
            style: pw.TextStyle(
              font: _boldFont,
              fontSize: smallSize,
              color: PDFColors.primary,
            ),
          ),
          pw.Text(
            options.companyName ?? '',
            style: pw.TextStyle(
              font: _regularFont,
              fontSize: tinySize,
              color: PDFColors.grey,
            ),
            textDirection: _textDirection,
          ),
        ],
      ),
    );
  }

  // ==================== Helper Methods ====================

  bool _hasCustomerInfo() {
    final c = inspection.customer;
    return c.name != null || c.phone != null || c.email != null;
  }

  bool _hasInspectorInfo() {
    final i = inspection.inspector;
    return i.name != null || i.id != null;
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return '${date.year}/${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}';
  }

  PdfColor _hexToPdfColor(String hex) {
    final buffer = StringBuffer();
    if (hex.length == 6 || hex.length == 7) buffer.write('ff');
    buffer.write(hex.replaceFirst('#', ''));
    return PdfColor.fromInt(int.parse(buffer.toString(), radix: 16));
  }

  PdfColor _getConditionPdfColor(VDSPartCondition condition) {
    final hex = colorByCondition[condition] ?? '#9ca3af';
    return _hexToPdfColor(hex);
  }
}


// ==================== PDF Service ====================

/// Static service for PDF operations
class PDFService {
  /// Generate PDF bytes
  static Future<Uint8List> generatePDF(
    VDSInspection inspection, {
    PDFReportOptions? options,
    Car? car,
    List<Uint8List>? carImages,
    Map<String, Uint8List>? svgImages,
    List<ColorMappingEntry>? colorMappings,
  }) async {
    final generator = InspectionPDFGenerator(
      inspection: inspection,
      options: options,
      car: car,
      carImages: carImages,
      svgImages: svgImages,
      colorMappings: colorMappings,
    );
    return generator.generate();
  }

  /// Print PDF directly
  static Future<void> printPDF(
    VDSInspection inspection, {
    PDFReportOptions? options,
    Car? car,
    List<ColorMappingEntry>? colorMappings,
  }) async {
    final pdfBytes = await generatePDF(inspection, options: options, car: car, colorMappings: colorMappings);
    await Printing.layoutPdf(
      onLayout: (_) async => pdfBytes,
      name: 'inspection_${inspection.id}.pdf',
    );
  }

  /// Share PDF
  static Future<void> sharePDF(
    VDSInspection inspection, {
    PDFReportOptions? options,
    Car? car,
    List<ColorMappingEntry>? colorMappings,
  }) async {
    final pdfBytes = await generatePDF(inspection, options: options, car: car, colorMappings: colorMappings);
    await Printing.sharePdf(
      bytes: pdfBytes,
      filename: 'inspection_${inspection.id}.pdf',
    );
  }

  /// Preview PDF
  static Future<void> previewPDF(
    VDSInspection inspection, {
    PDFReportOptions? options,
    Car? car,
    List<ColorMappingEntry>? colorMappings,
  }) async {
    final pdfBytes = await generatePDF(inspection, options: options, car: car, colorMappings: colorMappings);
    await Printing.layoutPdf(
      onLayout: (_) async => pdfBytes,
      name: 'inspection_${inspection.id}.pdf',
    );
  }
}

/// Extension for VDSInspection to generate PDF
extension VDSInspectionPDFExtension on VDSInspection {
  /// Generate PDF report
  Future<Uint8List> generatePDF({
    PDFReportOptions? options,
    Car? car,
  }) async {
    return PDFService.generatePDF(this, options: options, car: car);
  }

  /// Print PDF report
  Future<void> printPDF({
    PDFReportOptions? options,
    Car? car,
  }) async {
    return PDFService.printPDF(this, options: options, car: car);
  }

  /// Share PDF report
  Future<void> sharePDF({
    PDFReportOptions? options,
    Car? car,
  }) async {
    return PDFService.sharePDF(this, options: options, car: car);
  }
}
