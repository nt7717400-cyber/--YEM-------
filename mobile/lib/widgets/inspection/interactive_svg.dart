// InteractiveSVG Widget
// Handles SVG rendering with interactive tap support and color application
// Requirements: 2.2, 2.3, 2.4
// Updated: Enhanced to match web frontend interactive experience

import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:xml/xml.dart';
import '../../models/inspection.dart';
import '../../constants/inspection_constants.dart';

/// InteractiveSVG - Widget that renders SVG with interactive parts
/// Supports tap detection on parts and applies colors based on condition
/// Enhanced to provide direct part clicking similar to web frontend
class InteractiveSVG extends StatefulWidget {
  /// Raw SVG content string
  final String svgContent;
  
  /// Map of part keys to their damage data
  final Map<String, PartDamageData> partsStatus;
  
  /// Callback when a part is tapped
  final Function(String partKey)? onPartTap;
  
  /// Callback when a part is hovered (desktop only)
  final Function(String? partKey)? onPartHover;
  
  /// Whether the SVG is in read-only mode
  final bool readOnly;
  
  /// Whether to enable zoom
  final bool enableZoom;
  
  /// Whether to enable pan
  final bool enablePan;
  
  /// Custom color mappings
  final List<ColorMappingEntry>? colorMappings;
  
  /// Language for labels
  final String language;

  const InteractiveSVG({
    super.key,
    required this.svgContent,
    this.partsStatus = const {},
    this.onPartTap,
    this.onPartHover,
    this.readOnly = false,
    this.enableZoom = true,
    this.enablePan = true,
    this.colorMappings,
    this.language = 'ar',
  });

  @override
  State<InteractiveSVG> createState() => _InteractiveSVGState();
}

class _InteractiveSVGState extends State<InteractiveSVG> {
  final TransformationController _transformationController = TransformationController();
  
  // Track detected part IDs from SVG with their bounding boxes
  Map<String, _PartBounds> _partBounds = {};
  
  // Currently selected/highlighted part
  String? _highlightedPart;
  
  // SVG dimensions
  double _svgWidth = 400;
  double _svgHeight = 300;
  
  @override
  void initState() {
    super.initState();
    _parseSvgStructure();
  }
  
  @override
  void didUpdateWidget(InteractiveSVG oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.svgContent != widget.svgContent) {
      _parseSvgStructure();
    }
  }
  
  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }
  
  /// Parse SVG content to extract part IDs and their approximate bounds
  void _parseSvgStructure() {
    _partBounds = {};
    
    try {
      final document = XmlDocument.parse(widget.svgContent);
      final svgElement = document.rootElement;
      
      // Get SVG dimensions
      final viewBox = svgElement.getAttribute('viewBox');
      if (viewBox != null) {
        final parts = viewBox.split(' ');
        if (parts.length >= 4) {
          _svgWidth = double.tryParse(parts[2]) ?? 400;
          _svgHeight = double.tryParse(parts[3]) ?? 300;
        }
      }
      
      // Find all elements with body-part class or valid part IDs
      _findPartElements(svgElement);
    } catch (e) {
      debugPrint('Error parsing SVG: $e');
    }
  }
  
  /// Recursively find part elements in SVG
  void _findPartElements(XmlElement element) {
    final id = element.getAttribute('id');
    final className = element.getAttribute('class') ?? '';
    
    // Check if this is a body part
    if (id != null && (className.contains('body-part') || _isValidPartKey(id))) {
      // Try to extract bounds from transform or position attributes
      final bounds = _extractBounds(element);
      if (bounds != null) {
        _partBounds[id] = bounds;
      }
    }
    
    // Recurse into children
    for (final child in element.children.whereType<XmlElement>()) {
      _findPartElements(child);
    }
  }
  
  /// Extract bounds from an SVG element
  _PartBounds? _extractBounds(XmlElement element) {
    // Try to get bounds from common SVG attributes (rect, image, etc.)
    final x = double.tryParse(element.getAttribute('x') ?? '');
    final y = double.tryParse(element.getAttribute('y') ?? '');
    final width = double.tryParse(element.getAttribute('width') ?? '');
    final height = double.tryParse(element.getAttribute('height') ?? '');
    
    if (x != null && y != null && width != null && height != null) {
      return _PartBounds(x: x, y: y, width: width, height: height);
    }
    
    // Try to get bounds from ellipse/circle attributes (wheels, etc.)
    final cx = double.tryParse(element.getAttribute('cx') ?? '');
    final cy = double.tryParse(element.getAttribute('cy') ?? '');
    final rx = double.tryParse(element.getAttribute('rx') ?? element.getAttribute('r') ?? '');
    final ry = double.tryParse(element.getAttribute('ry') ?? element.getAttribute('r') ?? '');
    
    if (cx != null && cy != null && rx != null && ry != null) {
      return _PartBounds(
        x: cx - rx,
        y: cy - ry,
        width: rx * 2,
        height: ry * 2,
      );
    }
    
    // Try to parse path data for approximate bounds
    final d = element.getAttribute('d');
    if (d != null) {
      return _parsePath(d);
    }
    
    // Try transform attribute
    final transform = element.getAttribute('transform');
    if (transform != null) {
      final translateMatch = RegExp(r'translate\(([^,]+),?\s*([^)]*)\)').firstMatch(transform);
      if (translateMatch != null) {
        final tx = double.tryParse(translateMatch.group(1) ?? '') ?? 0;
        final ty = double.tryParse(translateMatch.group(2) ?? '') ?? 0;
        // Use a default size for transformed elements
        return _PartBounds(x: tx, y: ty, width: 50, height: 50);
      }
    }
    
    return null;
  }
  
  /// Parse SVG path to get approximate bounds
  _PartBounds? _parsePath(String d) {
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = double.negativeInfinity;
    double maxY = double.negativeInfinity;
    
    // Simple regex to extract coordinates from path
    final coordRegex = RegExp(r'[MLCQZmlcqz]?\s*(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)');
    final matches = coordRegex.allMatches(d);
    
    for (final match in matches) {
      final x = double.tryParse(match.group(1) ?? '');
      final y = double.tryParse(match.group(2) ?? '');
      if (x != null && y != null) {
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
      }
    }
    
    if (minX != double.infinity && minY != double.infinity) {
      return _PartBounds(
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      );
    }
    
    return null;
  }
  
  /// Check if an ID is a valid part key
  bool _isValidPartKey(String id) {
    return VDSPartKey.values.any((key) => key.value == id);
  }
  
  /// Get color for a part based on its condition
  String _getPartColor(String partKey) {
    final partData = widget.partsStatus[partKey];
    final condition = partData?.condition ?? VDSPartCondition.notInspected;
    
    // Use special colors for wheel parts
    if (isWheelPart(partKey)) {
      return getWheelConditionColorHexFromCondition(condition);
    }
    
    if (widget.colorMappings != null) {
      final mapping = widget.colorMappings!.firstWhere(
        (m) => m.condition == condition,
        orElse: () => widget.colorMappings!.last,
      );
      return mapping.colorHex;
    }
    
    return getConditionColorHex(condition);
  }
  
  /// Apply colors to SVG content
  String _applyColorsToSvg(String svgContent) {
    String modifiedSvg = svgContent;
    
    // Combine part IDs from both _partBounds and partsStatus
    final allPartIds = <String>{
      ..._partBounds.keys,
      ...widget.partsStatus.keys,
    };
    
    for (final partId in allPartIds) {
      final color = _getPartColor(partId);
      final isHighlighted = _highlightedPart == partId;
      
      // Check if this part exists in SVG
      if (!modifiedSvg.contains('id="$partId"')) continue;
      
      // Match the entire element and replace fill
      final elementRegex = RegExp(
        r'(<(?:ellipse|circle|path|rect)[^>]*id="' + RegExp.escape(partId) + r'"[^>]*>)',
        multiLine: true,
        dotAll: true,
      );
      
      if (elementRegex.hasMatch(modifiedSvg)) {
        modifiedSvg = modifiedSvg.replaceAllMapped(elementRegex, (match) {
          String element = match.group(1)!;
          
          // Replace fill attribute
          if (element.contains('fill="')) {
            element = element.replaceFirst(RegExp(r'fill="[^"]*"'), 'fill="$color"');
          } else {
            // Add fill attribute before the closing >
            element = element.replaceFirst('>', ' fill="$color">');
          }
          
          // Apply highlight stroke if selected
          if (isHighlighted) {
            if (element.contains('stroke="')) {
              element = element.replaceFirst(RegExp(r'stroke="[^"]*"'), 'stroke="#1f2937"');
            }
            if (element.contains('stroke-width="')) {
              element = element.replaceFirst(RegExp(r'stroke-width="[^"]*"'), 'stroke-width="2.5"');
            }
          }
          
          return element;
        });
      }
    }
    
    return modifiedSvg;
  }
  
  /// Find which part was tapped based on position
  String? _findPartAtPosition(Offset localPosition, Size widgetSize) {
    // Convert widget position to SVG coordinates
    final scaleX = _svgWidth / widgetSize.width;
    final scaleY = _svgHeight / widgetSize.height;
    final scale = scaleX > scaleY ? scaleX : scaleY;
    
    final svgX = localPosition.dx * scale;
    final svgY = localPosition.dy * scale;
    
    // Find the part that contains this point
    for (final entry in _partBounds.entries) {
      final bounds = entry.value;
      if (svgX >= bounds.x && 
          svgX <= bounds.x + bounds.width &&
          svgY >= bounds.y && 
          svgY <= bounds.y + bounds.height) {
        return entry.key;
      }
    }
    
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final coloredSvg = _applyColorsToSvg(widget.svgContent);
    
    return LayoutBuilder(
      builder: (context, constraints) {
        Widget svgWidget = GestureDetector(
          onTapUp: (details) => _handleTap(details, constraints),
          onLongPressStart: (details) => _handleLongPress(details, constraints),
          child: MouseRegion(
            onHover: (event) => _handleHover(event, constraints),
            onExit: (_) => _handleHoverExit(),
            child: SvgPicture.string(
              coloredSvg,
              fit: BoxFit.contain,
            ),
          ),
        );
        
        if (widget.enableZoom || widget.enablePan) {
          svgWidget = InteractiveViewer(
            transformationController: _transformationController,
            panEnabled: widget.enablePan,
            scaleEnabled: widget.enableZoom,
            minScale: 0.5,
            maxScale: 4.0,
            boundaryMargin: const EdgeInsets.all(20),
            child: svgWidget,
          );
        }
        
        return Stack(
          children: [
            svgWidget,
            // Tooltip for highlighted part
            if (_highlightedPart != null)
              Positioned(
                top: 8,
                left: 8,
                child: _buildTooltip(_highlightedPart!),
              ),
          ],
        );
      },
    );
  }
  
  /// Handle tap on SVG
  void _handleTap(TapUpDetails details, BoxConstraints constraints) {
    if (widget.readOnly && widget.onPartTap == null) return;
    
    final widgetSize = Size(constraints.maxWidth, constraints.maxHeight);
    final partKey = _findPartAtPosition(details.localPosition, widgetSize);
    
    if (partKey != null) {
      widget.onPartTap?.call(partKey);
    } else if (_partBounds.isNotEmpty) {
      // If no part found at position, show selection dialog as fallback
      _showPartSelectionDialog();
    }
  }
  
  /// Handle long press to show part selection
  void _handleLongPress(LongPressStartDetails details, BoxConstraints constraints) {
    if (widget.readOnly) return;
    _showPartSelectionDialog();
  }
  
  /// Handle hover (desktop)
  void _handleHover(PointerHoverEvent event, BoxConstraints constraints) {
    final widgetSize = Size(constraints.maxWidth, constraints.maxHeight);
    final partKey = _findPartAtPosition(event.localPosition, widgetSize);
    
    if (partKey != _highlightedPart) {
      setState(() {
        _highlightedPart = partKey;
      });
      widget.onPartHover?.call(partKey);
    }
  }
  
  /// Handle hover exit
  void _handleHoverExit() {
    if (_highlightedPart != null) {
      setState(() {
        _highlightedPart = null;
      });
      widget.onPartHover?.call(null);
    }
  }
  
  /// Build tooltip widget
  Widget _buildTooltip(String partKey) {
    final label = getPartLabelByString(partKey, language: widget.language);
    final partData = widget.partsStatus[partKey];
    final condition = partData?.condition ?? VDSPartCondition.notInspected;
    final conditionLabel = getConditionLabel(condition, language: widget.language);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(204),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(51),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: hexToColor(_getPartColor(partKey)),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                conditionLabel,
                style: TextStyle(
                  color: Colors.white.withAlpha(204),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  /// Show a dialog to select which part was tapped (fallback)
  void _showPartSelectionDialog() {
    if (_partBounds.isEmpty) return;
    
    final sortedParts = _partBounds.keys.toList()
      ..sort((a, b) => getPartLabelByString(a, language: widget.language)
          .compareTo(getPartLabelByString(b, language: widget.language)));
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Title
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.touch_app, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    widget.language == 'ar' ? 'اختر الجزء للتفاصيل' : 'Select Part for Details',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            // Parts list
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                itemCount: sortedParts.length,
                itemBuilder: (context, index) {
                  final partId = sortedParts[index];
                  final partData = widget.partsStatus[partId];
                  final condition = partData?.condition ?? VDSPartCondition.notInspected;
                  final color = hexToColor(_getPartColor(partId));
                  
                  return ListTile(
                    leading: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: color.withAlpha(51),
                        shape: BoxShape.circle,
                        border: Border.all(color: color, width: 2),
                      ),
                      child: Icon(
                        _getConditionIcon(condition),
                        color: color,
                        size: 16,
                      ),
                    ),
                    title: Text(
                      getPartLabelByString(partId, language: widget.language),
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    subtitle: Text(
                      getConditionLabel(condition, language: widget.language),
                      style: TextStyle(color: color, fontSize: 12),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.pop(context);
                      widget.onPartTap?.call(partId);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  /// Get icon for condition
  IconData _getConditionIcon(VDSPartCondition condition) {
    switch (condition) {
      case VDSPartCondition.good:
        return Icons.check_circle;
      case VDSPartCondition.scratch:
        return Icons.auto_fix_high;
      case VDSPartCondition.bodywork:
        return Icons.build;
      case VDSPartCondition.broken:
        return Icons.broken_image;
      case VDSPartCondition.painted:
        return Icons.format_paint;
      case VDSPartCondition.replaced:
        return Icons.swap_horiz;
      case VDSPartCondition.notInspected:
        return Icons.help_outline;
    }
  }
}

/// Helper class to store part bounds
class _PartBounds {
  final double x;
  final double y;
  final double width;
  final double height;
  
  _PartBounds({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });
}
