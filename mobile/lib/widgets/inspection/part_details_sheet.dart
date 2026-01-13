// Part Details Bottom Sheet Widget
// Requirements: 15.3, 9.1, 9.2
// Displays part name, condition, severity, notes, and photos
// Updated: Added full i18n support with RTL layout

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../models/inspection.dart';
import '../../constants/inspection_constants.dart';
import '../../constants/inspection_i18n.dart';
import '../../core/api/api_endpoints.dart';

/// PartDetailsBottomSheet - Shows detailed information about a car part
/// Requirements: 15.3, 9.1, 9.2
class PartDetailsBottomSheet extends StatelessWidget {
  /// The part key identifier
  final String partKey;
  
  /// The part damage data (null if not inspected)
  final PartDamageData? partData;
  
  /// Language for labels ('ar' or 'en')
  final String language;
  
  /// Color mappings for conditions
  final List<ColorMappingEntry>? colorMappings;

  const PartDetailsBottomSheet({
    super.key,
    required this.partKey,
    this.partData,
    this.language = 'ar',
    this.colorMappings,
  });
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(language);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final condition = partData?.condition ?? VDSPartCondition.notInspected;
    final conditionColor = _getConditionColor(condition);
    
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            // Handle bar
            _buildHandleBar(),
            
            // Header with part name and condition
            _buildHeader(isDark, conditionColor),
            
            // Divider
            Divider(
              height: 1,
              color: isDark ? Colors.grey[800] : Colors.grey[200],
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Condition and severity
                    _buildConditionSection(isDark, conditionColor),
                    
                    // Notes section
                    if (partData?.notes != null && partData!.notes!.isNotEmpty)
                      _buildNotesSection(isDark),
                    
                    // Photos section
                    if (partData?.photos != null && partData!.photos.isNotEmpty)
                      _buildPhotosSection(isDark, context),
                    
                    // No data message
                    if (partData == null || condition == VDSPartCondition.notInspected)
                      _buildNoDataMessage(isDark),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build the handle bar at the top
  Widget _buildHandleBar() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: Colors.grey[400],
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  /// Build the header with part name and condition badge
  Widget _buildHeader(bool isDark, Color conditionColor) {
    final partLabel = getPartLabelByString(partKey, language: language);
    final condition = partData?.condition ?? VDSPartCondition.notInspected;
    // Use tire-specific labels for wheel parts
    final conditionLabel = isWheelPart(partKey) 
        ? getTireConditionLabel(condition, language: language)
        : getConditionLabel(condition, language: language);
    
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        children: [
          // Condition color indicator
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: conditionColor.withAlpha(26),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: conditionColor, width: 2),
            ),
            child: Icon(
              _getConditionIcon(condition),
              color: conditionColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          
          // Part name and condition
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  partLabel,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: conditionColor.withAlpha(26),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    conditionLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: conditionColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Build the condition and severity section
  Widget _buildConditionSection(bool isDark, Color conditionColor) {
    final condition = partData?.condition ?? VDSPartCondition.notInspected;
    final severity = partData?.severity;
    // Use tire-specific labels for wheel parts
    final conditionLabel = isWheelPart(partKey) 
        ? getTireConditionLabel(condition, language: language)
        : getConditionLabel(condition, language: language);
    
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
        ),
      ),
      child: Column(
        children: [
          // Condition row
          _buildDetailRow(
            icon: Icons.info_outline,
            label: _t.condition,
            value: conditionLabel,
            valueColor: conditionColor,
            isDark: isDark,
          ),
          
          // Severity row (if applicable)
          if (severity != null && condition.requiresSeverity) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.speed,
              label: _t.severity,
              value: getSeverityLabel(severity, language: language),
              valueColor: _getSeverityColor(severity),
              isDark: isDark,
            ),
          ],
        ],
      ),
    );
  }

  /// Build a detail row
  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    required Color valueColor,
    required bool isDark,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: isDark ? Colors.grey[400] : Colors.grey[600],
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: valueColor.withAlpha(26),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: valueColor,
            ),
          ),
        ),
      ],
    );
  }

  /// Build the notes section
  Widget _buildNotesSection(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.notes,
                size: 20,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
              const SizedBox(width: 8),
              Text(
                _t.notes,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            partData!.notes!,
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  /// Build the photos section
  Widget _buildPhotosSection(bool isDark, BuildContext context) {
    final photos = partData!.photos;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.photo_library_outlined,
              size: 20,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            const SizedBox(width: 8),
            Text(
              '${_t.photos} (${photos.length})',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: photos.length,
            itemBuilder: (context, index) {
              return _buildPhotoThumbnail(
                photos[index],
                index,
                isDark,
                context,
              );
            },
          ),
        ),
      ],
    );
  }

  /// Build a photo thumbnail
  Widget _buildPhotoThumbnail(
    String photoUrl,
    int index,
    bool isDark,
    BuildContext context,
  ) {
    final fullUrl = ApiEndpoints.getFullUrl(photoUrl);
    
    return GestureDetector(
      onTap: () => _showPhotoViewer(context, fullUrl, index),
      child: Container(
        width: 120,
        height: 120,
        margin: EdgeInsets.only(right: index < partData!.photos.length - 1 ? 8 : 0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(11),
          child: CachedNetworkImage(
            imageUrl: fullUrl,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              color: isDark ? Colors.grey[800] : Colors.grey[200],
              child: const Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
            errorWidget: (context, url, error) => Container(
              color: isDark ? Colors.grey[800] : Colors.grey[200],
              child: Icon(
                Icons.broken_image_outlined,
                color: isDark ? Colors.grey[600] : Colors.grey[400],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Show full-screen photo viewer
  void _showPhotoViewer(BuildContext context, String photoUrl, int index) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _PhotoViewerScreen(
          photoUrl: photoUrl,
          title: '${_t.photos} ${index + 1}',
        ),
      ),
    );
  }

  /// Build no data message
  Widget _buildNoDataMessage(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.info_outline,
            size: 48,
            color: isDark ? Colors.grey[600] : Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            language == 'ar' 
                ? 'لم يتم فحص هذا الجزء بعد' 
                : 'This part has not been inspected yet',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.grey[500] : Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  /// Get color for a condition
  Color _getConditionColor(VDSPartCondition condition) {
    if (colorMappings != null) {
      try {
        final mapping = colorMappings!.firstWhere((m) => m.condition == condition);
        return hexToColor(mapping.colorHex);
      } catch (_) {
        // Fall through to default
      }
    }
    return getConditionColor(condition);
  }

  /// Get icon for a condition
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

  /// Get color for severity
  Color _getSeverityColor(DamageSeverity severity) {
    switch (severity) {
      case DamageSeverity.light:
        return Colors.yellow[700]!;
      case DamageSeverity.medium:
        return Colors.orange;
      case DamageSeverity.severe:
        return Colors.red;
    }
  }
}

/// Full-screen photo viewer
class _PhotoViewerScreen extends StatelessWidget {
  final String photoUrl;
  final String title;

  const _PhotoViewerScreen({
    required this.photoUrl,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(title),
      ),
      body: InteractiveViewer(
        minScale: 0.5,
        maxScale: 4.0,
        child: Center(
          child: CachedNetworkImage(
            imageUrl: photoUrl,
            fit: BoxFit.contain,
            placeholder: (context, url) => const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
            errorWidget: (context, url, error) => const Center(
              child: Icon(
                Icons.broken_image_outlined,
                color: Colors.white54,
                size: 64,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
