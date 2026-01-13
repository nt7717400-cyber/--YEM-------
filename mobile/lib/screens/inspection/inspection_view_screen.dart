// Inspection View Screen for Flutter Customer App
// Requirements: 15.1, 15.2, 15.3, 9.1, 9.2
// Displays interactive 2D car inspection diagrams with damage details
// Updated: Added full i18n support with RTL layout

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/inspection.dart';
import '../../models/car.dart';
import '../../constants/inspection_constants.dart';
import '../../constants/inspection_i18n.dart';
import '../../widgets/inspection/svg_inspection_viewer.dart';
import '../../widgets/inspection/view_angle_selector.dart';
import '../../widgets/inspection/part_details_sheet.dart';
import 'pdf_preview_screen.dart';

/// Inspection View Screen - شاشة عرض الفحص للعميل
/// Requirements: 15.1, 15.2, 15.3, 9.1, 9.2
class InspectionViewScreen extends ConsumerStatefulWidget {
  /// The inspection data to display
  final VDSInspection inspection;
  
  /// Optional car data for photos
  final Car? car;
  
  /// Optional template detail with SVG content
  final VDSTemplateDetail? templateDetail;
  
  /// Language for labels ('ar' or 'en')
  final String language;

  const InspectionViewScreen({
    super.key,
    required this.inspection,
    this.car,
    this.templateDetail,
    this.language = 'ar',
  });

  @override
  ConsumerState<InspectionViewScreen> createState() => _InspectionViewScreenState();
}

class _InspectionViewScreenState extends ConsumerState<InspectionViewScreen> {
  /// Current view angle
  ViewAngle _currentAngle = ViewAngle.front;
  
  /// Color mappings (loaded from API or defaults)
  List<ColorMappingEntry> _colorMappings = defaultColorMappings;
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(widget.language);
  
  /// Get text direction for current language
  TextDirection get _textDirection => getTextDirectionByCode(widget.language);

  @override
  void initState() {
    super.initState();
    _loadColorMappings();
  }

  /// Load color mappings from API or use defaults
  Future<void> _loadColorMappings() async {
    // For now, use default color mappings
    // In production, this would load from API via repository
    setState(() {
      _colorMappings = defaultColorMappings;
    });
  }

  /// Handle part click - show part details bottom sheet
  void _handlePartClick(String partKey) {
    _showPartDetailsSheet(partKey);
  }

  /// Show part details in a bottom sheet
  void _showPartDetailsSheet(String partKey) {
    final partData = widget.inspection.getPartData(partKey);
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PartDetailsBottomSheet(
        partKey: partKey,
        partData: partData,
        language: widget.language,
        colorMappings: _colorMappings,
      ),
    );
  }

  /// Handle view angle change
  void _handleAngleChange(ViewAngle angle) {
    setState(() {
      _currentAngle = angle;
    });
  }

  /// Get SVG content for current angle
  String? _getSvgContent() {
    if (widget.templateDetail != null) {
      return widget.templateDetail!.getSvgForAngle(_currentAngle);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Directionality(
      textDirection: _textDirection,
      child: Scaffold(
        appBar: _buildAppBar(isDark),
        body: SafeArea(
          child: Column(
            children: [
              // View angle selector
              _buildViewAngleSelector(isDark),
              
              // SVG Inspection Viewer
              Expanded(
                child: _buildInspectionViewer(isDark),
              ),
              
              // Damage summary
              _buildDamageSummary(isDark),
            ],
          ),
        ),
      ),
    );
  }

  /// Build app bar
  PreferredSizeWidget _buildAppBar(bool isDark) {
    return AppBar(
      title: Text(_t.inspectionReport),
      centerTitle: true,
      actions: [
        // PDF export button (placeholder for future implementation)
        IconButton(
          icon: const Icon(Icons.picture_as_pdf),
          onPressed: _handleExportPdf,
          tooltip: _t.downloadPdf,
        ),
      ],
    );
  }

  /// Build view angle selector
  Widget _buildViewAngleSelector(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.grey[50],
        border: Border(
          bottom: BorderSide(
            color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
          ),
        ),
      ),
      child: ViewAngleSelector(
        currentAngle: _currentAngle,
        onAngleChange: _handleAngleChange,
        language: widget.language,
        compact: false,
      ),
    );
  }

  /// Build the main inspection viewer
  Widget _buildInspectionViewer(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Instruction text
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: isDark ? Colors.blue[900]!.withAlpha(51) : Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isDark ? Colors.blue[700]! : Colors.blue[200]!,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.touch_app,
                  size: 18,
                  color: isDark ? Colors.blue[300] : Colors.blue[700],
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.language == 'ar' 
                        ? 'اضغط على أي جزء لعرض تفاصيله' 
                        : 'Tap any part to view its details',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.blue[300] : Colors.blue[700],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // SVG Viewer
          Expanded(
            child: SVGInspectionViewer(
              templateType: widget.inspection.templateType,
              viewAngle: _currentAngle,
              partsStatus: widget.inspection.partsStatusMap,
              onPartClick: _handlePartClick,
              readOnly: false, // Allow interaction for part details
              language: widget.language,
              showLegend: true,
              enableZoom: true,
              enablePan: true,
              svgContent: _getSvgContent(),
              colorMappings: _colorMappings,
            ),
          ),
        ],
      ),
    );
  }

  /// Build damage summary section
  Widget _buildDamageSummary(bool isDark) {
    final damagedCount = widget.inspection.damagedPartsCount;
    final totalParts = widget.inspection.parts.length;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Damage count
          Expanded(
            child: _buildSummaryItem(
              icon: Icons.warning_amber_rounded,
              iconColor: damagedCount > 0 ? Colors.orange : Colors.green,
              label: _t.damagedParts,
              value: '$damagedCount',
              isDark: isDark,
            ),
          ),
          
          // Divider
          Container(
            width: 1,
            height: 40,
            color: isDark ? Colors.grey[700] : Colors.grey[300],
          ),
          
          // Total inspected
          Expanded(
            child: _buildSummaryItem(
              icon: Icons.check_circle_outline,
              iconColor: Colors.blue,
              label: _t.totalParts,
              value: '$totalParts',
              isDark: isDark,
            ),
          ),
          
          // Divider
          Container(
            width: 1,
            height: 40,
            color: isDark ? Colors.grey[700] : Colors.grey[300],
          ),
          
          // Status
          Expanded(
            child: _buildSummaryItem(
              icon: widget.inspection.isFinalized 
                  ? Icons.lock_outline 
                  : Icons.edit_outlined,
              iconColor: widget.inspection.isFinalized 
                  ? Colors.green 
                  : Colors.grey,
              label: widget.language == 'ar' ? 'الحالة' : 'Status',
              value: widget.inspection.isFinalized
                  ? _t.statusFinalized
                  : _t.statusDraft,
              isDark: isDark,
            ),
          ),
        ],
      ),
    );
  }

  /// Build a summary item widget
  Widget _buildSummaryItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required bool isDark,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: iconColor),
            const SizedBox(width: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  /// Handle PDF export (placeholder)
  void _handleExportPdf() {
    // Navigate to PDF preview screen
    PDFPreviewScreen.show(
      context,
      inspection: widget.inspection,
      car: widget.car,
      templateDetail: widget.templateDetail,
      language: widget.language,
      colorMappings: _colorMappings,
    );
  }
}
