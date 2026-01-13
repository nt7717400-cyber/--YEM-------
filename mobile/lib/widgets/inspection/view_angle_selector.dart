// ViewAngleSelector Widget
// Navigation tabs for switching between view angles
// Requirements: 1.1, 9.1, 9.2
// Updated: Uses bilingual labels from inspection_constants.dart

import 'package:flutter/material.dart';
import '../../models/inspection.dart';
import '../../constants/inspection_constants.dart';

/// ViewAngleSelector - Tab navigation for switching between car view angles
class ViewAngleSelector extends StatelessWidget {
  /// Currently selected view angle
  final ViewAngle currentAngle;
  
  /// Callback when angle is changed
  final Function(ViewAngle) onAngleChange;
  
  /// Available angles to show (defaults to all 4 primary angles)
  final List<ViewAngle> availableAngles;
  
  /// Language for labels ('ar' or 'en')
  final String language;
  
  /// Whether to use compact mode (icons only)
  final bool compact;

  const ViewAngleSelector({
    super.key,
    required this.currentAngle,
    required this.onAngleChange,
    this.availableAngles = allViewAngles,
    this.language = 'ar',
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: availableAngles.map((angle) {
          final isSelected = currentAngle == angle;
          final label = getViewAngleLabel(angle, language: language);
          
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: _ViewAngleButton(
              angle: angle,
              label: label,
              isSelected: isSelected,
              compact: compact,
              onTap: () => onAngleChange(angle),
              theme: theme,
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ViewAngleButton extends StatelessWidget {
  final ViewAngle angle;
  final String label;
  final bool isSelected;
  final bool compact;
  final VoidCallback onTap;
  final ThemeData theme;

  const _ViewAngleButton({
    required this.angle,
    required this.label,
    required this.isSelected,
    required this.compact,
    required this.onTap,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = theme.colorScheme.primary;
    final backgroundColor = isSelected 
        ? primaryColor 
        : theme.colorScheme.surface;
    final foregroundColor = isSelected 
        ? theme.colorScheme.onPrimary 
        : theme.colorScheme.onSurface;
    final borderColor = isSelected 
        ? primaryColor 
        : theme.colorScheme.outline.withAlpha(77);

    return Material(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 12 : 16,
            vertical: compact ? 8 : 10,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _getAngleIcon(angle, foregroundColor),
              if (!compact) ...[
                const SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(
                    color: foregroundColor,
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _getAngleIcon(ViewAngle angle, Color color) {
    IconData iconData;
    
    switch (angle) {
      case ViewAngle.front:
        iconData = Icons.directions_car;
        break;
      case ViewAngle.rear:
        iconData = Icons.directions_car_outlined;
        break;
      case ViewAngle.leftSide:
        iconData = Icons.arrow_back;
        break;
      case ViewAngle.rightSide:
        iconData = Icons.arrow_forward;
        break;
      case ViewAngle.top:
        iconData = Icons.vertical_align_top;
        break;
    }
    
    return Icon(
      iconData,
      size: 20,
      color: color,
    );
  }
}

/// ViewAngleTabBar - Alternative implementation using TabBar style
class ViewAngleTabBar extends StatelessWidget {
  /// Currently selected view angle
  final ViewAngle currentAngle;
  
  /// Callback when angle is changed
  final Function(ViewAngle) onAngleChange;
  
  /// Available angles to show
  final List<ViewAngle> availableAngles;
  
  /// Language for labels
  final String language;

  const ViewAngleTabBar({
    super.key,
    required this.currentAngle,
    required this.onAngleChange,
    this.availableAngles = allViewAngles,
    this.language = 'ar',
  });

  @override
  Widget build(BuildContext context) {
    final currentIndex = availableAngles.indexOf(currentAngle);
    
    return DefaultTabController(
      length: availableAngles.length,
      initialIndex: currentIndex >= 0 ? currentIndex : 0,
      child: TabBar(
        onTap: (index) {
          if (index >= 0 && index < availableAngles.length) {
            onAngleChange(availableAngles[index]);
          }
        },
        isScrollable: true,
        labelColor: Theme.of(context).colorScheme.primary,
        unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withAlpha(153),
        indicatorSize: TabBarIndicatorSize.label,
        tabs: availableAngles.map((angle) {
          final label = getViewAngleLabel(angle, language: language);
          return Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _getAngleIcon(angle),
                const SizedBox(width: 8),
                Text(label),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _getAngleIcon(ViewAngle angle) {
    IconData iconData;
    
    switch (angle) {
      case ViewAngle.front:
        iconData = Icons.directions_car;
        break;
      case ViewAngle.rear:
        iconData = Icons.directions_car_outlined;
        break;
      case ViewAngle.leftSide:
        iconData = Icons.arrow_back;
        break;
      case ViewAngle.rightSide:
        iconData = Icons.arrow_forward;
        break;
      case ViewAngle.top:
        iconData = Icons.vertical_align_top;
        break;
    }
    
    return Icon(iconData, size: 18);
  }
}

/// ViewAngleChips - Chip-based selector for view angles
class ViewAngleChips extends StatelessWidget {
  /// Currently selected view angle
  final ViewAngle currentAngle;
  
  /// Callback when angle is changed
  final Function(ViewAngle) onAngleChange;
  
  /// Available angles to show
  final List<ViewAngle> availableAngles;
  
  /// Language for labels
  final String language;

  const ViewAngleChips({
    super.key,
    required this.currentAngle,
    required this.onAngleChange,
    this.availableAngles = allViewAngles,
    this.language = 'ar',
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: availableAngles.map((angle) {
        final isSelected = currentAngle == angle;
        final label = getViewAngleLabel(angle, language: language);
        
        return ChoiceChip(
          label: Text(label),
          selected: isSelected,
          onSelected: (_) => onAngleChange(angle),
          avatar: _getAngleIcon(angle, isSelected),
        );
      }).toList(),
    );
  }

  Widget _getAngleIcon(ViewAngle angle, bool isSelected) {
    IconData iconData;
    
    switch (angle) {
      case ViewAngle.front:
        iconData = Icons.directions_car;
        break;
      case ViewAngle.rear:
        iconData = Icons.directions_car_outlined;
        break;
      case ViewAngle.leftSide:
        iconData = Icons.arrow_back;
        break;
      case ViewAngle.rightSide:
        iconData = Icons.arrow_forward;
        break;
      case ViewAngle.top:
        iconData = Icons.vertical_align_top;
        break;
    }
    
    return Icon(iconData, size: 16);
  }
}
