// ColorLegend Widget
// Displays color legend for part conditions
// Requirements: 4.2, 9.1, 9.2
// Updated: Added full i18n support with RTL layout

import 'package:flutter/material.dart';
import '../../models/inspection.dart';
import '../../constants/inspection_constants.dart';
import '../../constants/inspection_i18n.dart';

/// ColorLegendWidget - Displays color legend for part conditions
class ColorLegendWidget extends StatelessWidget {
  /// Color mappings to display
  final List<ColorMappingEntry> colorMappings;
  
  /// Language for labels ('ar' or 'en')
  final String language;
  
  /// Whether to use compact mode
  final bool compact;
  
  /// Whether to show title
  final bool showTitle;

  const ColorLegendWidget({
    super.key,
    this.colorMappings = defaultColorMappings,
    this.language = 'ar',
    this.compact = false,
    this.showTitle = true,
  });
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(language);

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return _buildCompactLegend();
    }
    
    return _buildFullLegend(context, _t.colorLegend);
  }

  Widget _buildCompactLegend() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: colorMappings.map((mapping) {
          final label = mapping.getLabel(language);
          final color = hexToColor(mapping.colorHex);
          
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFullLegend(BuildContext context, String title) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withAlpha(51),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showTitle) ...[
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
          ],
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: colorMappings.map((mapping) {
              final label = mapping.getLabel(language);
              final color = hexToColor(mapping.colorHex);
              
              return _LegendItem(
                color: color,
                label: label,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({
    required this.color,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.grey[300]!,
              width: 1,
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 13),
        ),
      ],
    );
  }
}

/// ColorLegendCard - Card-style color legend
class ColorLegendCard extends StatelessWidget {
  /// Color mappings to display
  final List<ColorMappingEntry> colorMappings;
  
  /// Language for labels
  final String language;

  const ColorLegendCard({
    super.key,
    this.colorMappings = defaultColorMappings,
    this.language = 'ar',
  });
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(language);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _t.colorLegend,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 4,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: colorMappings.length,
              itemBuilder: (context, index) {
                final mapping = colorMappings[index];
                final label = mapping.getLabel(language);
                final color = hexToColor(mapping.colorHex);
                
                return Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: Colors.grey[300]!,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        label,
                        style: const TextStyle(fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// ColorLegendBottomSheet - Bottom sheet style color legend
class ColorLegendBottomSheet extends StatelessWidget {
  /// Color mappings to display
  final List<ColorMappingEntry> colorMappings;
  
  /// Language for labels
  final String language;

  const ColorLegendBottomSheet({
    super.key,
    this.colorMappings = defaultColorMappings,
    this.language = 'ar',
  });
  
  /// Get translations for current language
  InspectionTranslations get _t => getTranslationsByCode(language);

  /// Show the bottom sheet
  static void show(BuildContext context, {
    List<ColorMappingEntry> colorMappings = defaultColorMappings,
    String language = 'ar',
  }) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => ColorLegendBottomSheet(
        colorMappings: colorMappings,
        language: language,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          // Title
          Text(
            _t.colorLegend,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 16),
          // Legend items
          ...colorMappings.map((mapping) {
            final label = mapping.getLabel(language);
            final color = hexToColor(mapping.colorHex);
            
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: const TextStyle(fontSize: 15),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
