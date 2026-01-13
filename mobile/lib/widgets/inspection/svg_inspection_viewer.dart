// SVGInspectionViewer Widget
// Interactive SVG viewer for vehicle inspection
// Requirements: 4.1, 4.2, 9.1, 9.2
// Matches web frontend component: frontend/src/components/inspection/SVGInspectionViewer.tsx
// Updated: Added full i18n support with RTL layout

import 'package:flutter/material.dart';
import '../../models/inspection.dart';
import '../../constants/inspection_constants.dart';
import '../../constants/inspection_i18n.dart';
import 'interactive_svg.dart';
import 'color_legend.dart';

/// SVGInspectionViewer - Main widget for displaying car inspection SVG diagrams
/// Supports loading SVG from assets or network, applying colors based on part status
class SVGInspectionViewer extends StatefulWidget {
  /// The car template type (sedan, suv, pickup, etc.)
  final CarTemplateType templateType;
  
  /// Current view angle (front, rear, left_side, right_side)
  final ViewAngle viewAngle;
  
  /// Map of part keys to their damage data
  final Map<String, PartDamageData> partsStatus;
  
  /// Callback when a part is clicked/tapped
  final Function(String partKey)? onPartClick;
  
  /// Callback when a part is hovered (for desktop)
  final Function(String? partKey)? onPartHover;
  
  /// Whether the viewer is in read-only mode
  final bool readOnly;
  
  /// Language for labels ('ar' or 'en')
  final String language;
  
  /// Whether to show the color legend
  final bool showLegend;
  
  /// Whether to enable zoom functionality
  final bool enableZoom;
  
  /// Whether to enable pan functionality
  final bool enablePan;
  
  /// Optional SVG content (if provided, will use this instead of loading from assets/network)
  final String? svgContent;
  
  /// Optional base URL for loading SVG from network
  final String? networkBaseUrl;
  
  /// Custom color mappings (if not provided, uses defaults)
  final List<ColorMappingEntry>? colorMappings;

  const SVGInspectionViewer({
    super.key,
    required this.templateType,
    required this.viewAngle,
    this.partsStatus = const {},
    this.onPartClick,
    this.onPartHover,
    this.readOnly = false,
    this.language = 'ar',
    this.showLegend = true,
    this.enableZoom = true,
    this.enablePan = true,
    this.svgContent,
    this.networkBaseUrl,
    this.colorMappings,
  });

  @override
  State<SVGInspectionViewer> createState() => _SVGInspectionViewerState();
}

class _SVGInspectionViewerState extends State<SVGInspectionViewer> {
  String? _svgContent;
  bool _loading = true;
  String? _error;
  String? _hoveredPart;
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(widget.language);

  @override
  void initState() {
    super.initState();
    _loadSVG();
  }

  @override
  void didUpdateWidget(SVGInspectionViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reload SVG if template or angle changes
    if (oldWidget.templateType != widget.templateType ||
        oldWidget.viewAngle != widget.viewAngle ||
        oldWidget.svgContent != widget.svgContent ||
        oldWidget.networkBaseUrl != widget.networkBaseUrl) {
      _loadSVG();
    }
  }

  Future<void> _loadSVG() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      String content;
      
      if (widget.svgContent != null && widget.svgContent!.isNotEmpty) {
        // Use provided SVG content
        content = widget.svgContent!;
      } else if (widget.networkBaseUrl != null) {
        // Load from network - not implemented yet, would need http package
        // For now, fall back to assets
        content = await _loadFromAssets();
      } else {
        // Load from assets
        content = await _loadFromAssets();
      }

      if (mounted) {
        setState(() {
          _svgContent = content;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = _t.errorLoadingSvg;
          _loading = false;
        });
      }
    }
  }

  Future<String> _loadFromAssets() async {
    final assetPath = getSvgAssetPath(widget.templateType, widget.viewAngle);
    // Load SVG string from assets
    return await DefaultAssetBundle.of(context).loadString(assetPath);
  }

  void _handlePartTap(String partKey) {
    if (!widget.readOnly && widget.onPartClick != null) {
      widget.onPartClick!(partKey);
    }
  }

  void _handlePartHover(String? partKey) {
    setState(() {
      _hoveredPart = partKey;
    });
    widget.onPartHover?.call(partKey);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Main SVG viewer
        Expanded(
          child: _buildViewer(),
        ),
        
        // Color legend
        if (widget.showLegend) ...[
          const SizedBox(height: 12),
          ColorLegendWidget(
            colorMappings: widget.colorMappings ?? defaultColorMappings,
            language: widget.language,
            compact: true,
          ),
        ],
      ],
    );
  }

  Widget _buildViewer() {
    if (_loading) {
      return _buildLoadingState();
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_svgContent == null || _svgContent!.isEmpty) {
      return _buildErrorState();
    }

    return Stack(
      children: [
        // Interactive SVG
        InteractiveSVG(
          svgContent: _svgContent!,
          partsStatus: widget.partsStatus,
          onPartTap: _handlePartTap,
          onPartHover: _handlePartHover,
          readOnly: widget.readOnly,
          enableZoom: widget.enableZoom,
          enablePan: widget.enablePan,
          colorMappings: widget.colorMappings,
          language: widget.language,
        ),
        
        // Tooltip for hovered part
        if (_hoveredPart != null)
          Positioned(
            top: 8,
            left: 8,
            child: _buildTooltip(_hoveredPart!),
          ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(height: 8),
            Text(
              _t.loading,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.warning_amber_rounded,
              size: 32,
              color: Colors.red[600],
            ),
            const SizedBox(height: 8),
            Text(
              _error ?? _t.error,
              style: TextStyle(
                fontSize: 14,
                color: Colors.red[600],
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _loadSVG,
              child: Text(_t.reset),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTooltip(String partKey) {
    final label = getPartLabelByString(partKey, language: widget.language);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(204),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
        ),
      ),
    );
  }
}
