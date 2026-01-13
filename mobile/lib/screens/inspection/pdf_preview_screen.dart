// PDF Preview Screen for Flutter Customer App
// Requirements: 16.3, 16.4, 9.1, 9.2
// Displays PDF preview with print and share options
// Updated: Added full i18n support with RTL layout

import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import '../../models/inspection.dart';
import '../../models/car.dart';
import '../../constants/inspection_constants.dart';
import '../../constants/inspection_i18n.dart';
import '../../services/pdf_generator.dart';

/// PDF Preview Screen - معاينة تقرير PDF
/// Requirements: 16.3, 16.4
class PDFPreviewScreen extends StatefulWidget {
  /// The inspection data to generate PDF from
  final VDSInspection inspection;
  
  /// Optional car data for photos
  final Car? car;
  
  /// Optional template detail with SVG content
  final VDSTemplateDetail? templateDetail;
  
  /// Language for labels ('ar' or 'en')
  final String language;
  
  /// Color mappings for conditions
  final List<ColorMappingEntry>? colorMappings;

  const PDFPreviewScreen({
    super.key,
    required this.inspection,
    this.car,
    this.templateDetail,
    this.language = 'ar',
    this.colorMappings,
  });

  /// Navigate to PDF preview screen
  static Future<void> show(
    BuildContext context, {
    required VDSInspection inspection,
    Car? car,
    VDSTemplateDetail? templateDetail,
    String language = 'ar',
    List<ColorMappingEntry>? colorMappings,
  }) {
    return Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => PDFPreviewScreen(
          inspection: inspection,
          car: car,
          templateDetail: templateDetail,
          language: language,
          colorMappings: colorMappings,
        ),
      ),
    );
  }

  @override
  State<PDFPreviewScreen> createState() => _PDFPreviewScreenState();
}

class _PDFPreviewScreenState extends State<PDFPreviewScreen> {
  /// PDF report options
  late PDFReportOptions _options;
  
  /// Loading state
  bool _isLoading = false;
  
  /// Error message
  String? _errorMessage;
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(widget.language);
  
  /// Get text direction for current language
  TextDirection get _textDirection => getTextDirectionByCode(widget.language);

  @override
  void initState() {
    super.initState();
    _options = PDFReportOptions(
      language: widget.language,
      companyName: widget.language == 'ar' ? 'معرض السيارات' : 'Car Showroom',
    );
  }

  /// Generate PDF bytes
  Future<Uint8List> _generatePDF(PdfPageFormat format) async {
    try {
      final generator = InspectionPDFGenerator(
        inspection: widget.inspection,
        options: _options.copyWith(paperSize: format),
        colorMappings: widget.colorMappings ?? defaultColorMappings,
        car: widget.car,
      );
      return generator.generate();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
      rethrow;
    }
  }

  /// Handle share action
  Future<void> _handleShare() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      await PDFService.sharePDF(
        widget.inspection,
        options: _options,
        car: widget.car,
        colorMappings: widget.colorMappings ?? defaultColorMappings,
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
      if (mounted) {
        _showErrorSnackBar();
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Show error snackbar
  void _showErrorSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_t.errorGeneratingPdf),
        backgroundColor: Colors.red,
        action: SnackBarAction(
          label: _t.reset,
          textColor: Colors.white,
          onPressed: _handleShare,
        ),
      ),
    );
  }

  /// Show options bottom sheet
  void _showOptionsSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _PDFOptionsSheet(
        options: _options,
        language: widget.language,
        onOptionsChanged: (newOptions) {
          setState(() {
            _options = newOptions;
          });
          Navigator.pop(context);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: _textDirection,
      child: Scaffold(
        appBar: AppBar(
          title: Text(_t.pdfPreviewTitle),
          centerTitle: true,
          actions: [
            // Options button
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: _showOptionsSheet,
              tooltip: _t.filter,
            ),
            // Share button
            IconButton(
              icon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.share),
              onPressed: _isLoading ? null : _handleShare,
              tooltip: _t.share,
            ),
          ],
        ),
        body: _errorMessage != null
            ? _buildErrorView()
            : PdfPreview(
                build: _generatePDF,
                canChangeOrientation: false,
                canChangePageFormat: true,
                canDebug: false,
                allowPrinting: true,
                allowSharing: true,
                maxPageWidth: 700,
                pdfFileName: _getFileName(),
                loadingWidget: _buildLoadingWidget(),
                onError: (context, error) => _buildErrorWidget(error),
                actions: const [], // We use custom actions in app bar
              ),
      ),
    );
  }

  /// Build loading widget
  Widget _buildLoadingWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            _t.generating,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  /// Build error widget
  Widget _buildErrorWidget(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              _t.errorGeneratingPdf,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  /// Build error view
  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              _t.error,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? '',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _errorMessage = null;
                });
              },
              icon: const Icon(Icons.refresh),
              label: Text(_t.reset),
            ),
          ],
        ),
      ),
    );
  }

  /// Get filename for PDF
  String _getFileName() {
    final vehicle = widget.inspection.vehicle;
    if (vehicle.make != null && vehicle.model != null) {
      return 'inspection_${vehicle.make}_${vehicle.model}_${widget.inspection.id}.pdf';
    }
    return 'inspection_report_${widget.inspection.id}.pdf';
  }
}


/// PDF Options Bottom Sheet
class _PDFOptionsSheet extends StatefulWidget {
  final PDFReportOptions options;
  final String language;
  final Function(PDFReportOptions) onOptionsChanged;

  const _PDFOptionsSheet({
    required this.options,
    required this.language,
    required this.onOptionsChanged,
  });

  @override
  State<_PDFOptionsSheet> createState() => _PDFOptionsSheetState();
}

class _PDFOptionsSheetState extends State<_PDFOptionsSheet> {
  late PDFReportOptions _options;
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(widget.language);

  @override
  void initState() {
    super.initState();
    _options = widget.options;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[400],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Title
          Text(
            _t.includedSections,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          
          // Language option
          _buildOptionTile(
            title: _t.reportLanguage,
            subtitle: _options.language == 'ar' ? 'العربية' : 'English',
            icon: Icons.language,
            onTap: () {
              setState(() {
                _options = _options.copyWith(
                  language: _options.language == 'ar' ? 'en' : 'ar',
                );
              });
            },
            isDark: isDark,
          ),
          
          // Divider
          const Divider(),
          
          // Section toggles
          Text(
            _t.includedSections,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          
          _buildSwitchTile(
            title: _t.vehicleInformation,
            value: _options.includeVehicleInfo,
            onChanged: (value) {
              setState(() {
                _options = _options.copyWith(includeVehicleInfo: value);
              });
            },
            isDark: isDark,
          ),
          
          _buildSwitchTile(
            title: _t.customerInformation,
            value: _options.includeCustomerInfo,
            onChanged: (value) {
              setState(() {
                _options = _options.copyWith(includeCustomerInfo: value);
              });
            },
            isDark: isDark,
          ),
          
          _buildSwitchTile(
            title: _t.inspectorInformation,
            value: _options.includeInspectorInfo,
            onChanged: (value) {
              setState(() {
                _options = _options.copyWith(includeInspectorInfo: value);
              });
            },
            isDark: isDark,
          ),
          
          _buildSwitchTile(
            title: _t.damageTable,
            value: _options.includeDamageTable,
            onChanged: (value) {
              setState(() {
                _options = _options.copyWith(includeDamageTable: value);
              });
            },
            isDark: isDark,
          ),
          
          const SizedBox(height: 16),
          
          // Apply button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => widget.onOptionsChanged(_options),
              child: Text(_t.apply),
            ),
          ),
          
          // Safe area padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildOptionTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: Theme.of(context).primaryColor),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required bool value,
    required Function(bool) onChanged,
    required bool isDark,
  }) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title),
      value: value,
      onChanged: onChanged,
    );
  }
}
