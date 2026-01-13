/// Modern Countdown Timer - 2025 Design System
/// Animated countdown with multiple styles
library;

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';

/// Countdown display style
enum CountdownStyle {
  full,     // Days, hours, minutes, seconds in boxes
  compact,  // HH:MM:SS inline
  minimal,  // Xس Xد text only
}

/// Modern Countdown Timer Widget
class ModernCountdown extends StatefulWidget {
  final DateTime endTime;
  final CountdownStyle style;
  final VoidCallback? onEnd;
  final Color? accentColor;

  const ModernCountdown({
    super.key,
    required this.endTime,
    this.style = CountdownStyle.full,
    this.onEnd,
    this.accentColor,
  });

  @override
  State<ModernCountdown> createState() => _ModernCountdownState();
}

class _ModernCountdownState extends State<ModernCountdown> {
  late Timer _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateRemaining());
  }

  @override
  void didUpdateWidget(ModernCountdown oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.endTime != widget.endTime) {
      _updateRemaining();
    }
  }

  void _updateRemaining() {
    final now = DateTime.now();
    setState(() {
      _remaining = widget.endTime.difference(now);
      if (_remaining.isNegative) {
        _remaining = Duration.zero;
        _timer.cancel();
        widget.onEnd?.call();
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  bool get _isUrgent => _remaining.inHours < 1 && _remaining.inDays == 0;
  bool get _hasEnded => _remaining == Duration.zero;

  Color get _color => widget.accentColor ?? AppColors.accent;

  @override
  Widget build(BuildContext context) {
    if (_hasEnded) {
      return _buildEndedState();
    }

    switch (widget.style) {
      case CountdownStyle.full:
        return _buildFullTimer();
      case CountdownStyle.compact:
        return _buildCompactTimer();
      case CountdownStyle.minimal:
        return _buildMinimalTimer();
    }
  }

  /// Full timer with boxes
  Widget _buildFullTimer() {
    final days = _remaining.inDays;
    final hours = _remaining.inHours % 24;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        _TimeBox(
          value: days,
          label: 'يوم',
          isUrgent: _isUrgent,
          color: _color,
        ),
        const SizedBox(width: AppSpacing.sm),
        _TimeBox(
          value: hours,
          label: 'ساعة',
          isUrgent: _isUrgent && days == 0,
          color: _color,
        ),
        const SizedBox(width: AppSpacing.sm),
        _TimeBox(
          value: minutes,
          label: 'دقيقة',
          isUrgent: _isUrgent && days == 0 && hours == 0,
          color: _color,
        ),
        const SizedBox(width: AppSpacing.sm),
        _TimeBox(
          value: seconds,
          label: 'ثانية',
          isUrgent: _isUrgent,
          color: _color,
          animated: true,
        ),
      ],
    );
  }

  /// Compact inline timer
  Widget _buildCompactTimer() {
    final hours = _remaining.inHours;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: _isUrgent
            ? AppColors.errorSurface
            : Colors.white.withValues(alpha: 0.9),
        borderRadius: AppSpacing.borderRadiusSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: 16,
            color: _isUrgent ? AppColors.error : AppColors.textSecondaryLight,
          ),
          const SizedBox(width: 6),
          Text(
            '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
            style: AppTypography.labelMedium.copyWith(
              color: _isUrgent ? AppColors.error : AppColors.textPrimaryLight,
              fontWeight: FontWeight.w700,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }

  /// Minimal text timer
  Widget _buildMinimalTimer() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hours = _remaining.inHours;
    final minutes = _remaining.inMinutes % 60;

    String text;
    if (_remaining.inDays > 0) {
      text = '${_remaining.inDays}ي ${hours % 24}س';
    } else if (hours > 0) {
      text = '${hours}س ${minutes}د';
    } else {
      text = '${minutes}د ${_remaining.inSeconds % 60}ث';
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.timer_outlined,
          size: 14,
          color: _isUrgent
              ? AppColors.error
              : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: AppTypography.labelSmall.copyWith(
            color: _isUrgent
                ? AppColors.error
                : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
            fontWeight: _isUrgent ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ],
    );
  }

  /// Ended state
  Widget _buildEndedState() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.errorSurface,
        borderRadius: AppSpacing.borderRadiusSm,
        border: Border.all(
          color: AppColors.error.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_off_outlined,
            size: 16,
            color: AppColors.error,
          ),
          const SizedBox(width: 6),
          Text(
            'انتهى المزاد',
            style: AppTypography.labelMedium.copyWith(
              color: AppColors.error,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// Time box for full countdown
class _TimeBox extends StatefulWidget {
  final int value;
  final String label;
  final bool isUrgent;
  final Color color;
  final bool animated;

  const _TimeBox({
    required this.value,
    required this.label,
    this.isUrgent = false,
    required this.color,
    this.animated = false,
  });

  @override
  State<_TimeBox> createState() => _TimeBoxState();
}

class _TimeBoxState extends State<_TimeBox> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  int _previousValue = 0;

  @override
  void initState() {
    super.initState();
    _previousValue = widget.value;
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.1), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.1, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void didUpdateWidget(_TimeBox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animated && widget.value != _previousValue) {
      _previousValue = widget.value;
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = widget.isUrgent
        ? AppColors.errorSurface
        : widget.color.withValues(alpha: 0.1);
    final borderColor = widget.isUrgent
        ? AppColors.error.withValues(alpha: 0.3)
        : widget.color.withValues(alpha: 0.3);
    final textColor = widget.isUrgent ? AppColors.error : widget.color;

    Widget box = Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: AppSpacing.borderRadiusSm,
        border: Border.all(color: borderColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            widget.value.toString().padLeft(2, '0'),
            style: AppTypography.headlineMedium.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          Text(
            widget.label,
            style: AppTypography.labelSmall.copyWith(
              color: widget.isUrgent
                  ? AppColors.error.withValues(alpha: 0.7)
                  : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );

    if (widget.animated) {
      return AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: child,
          );
        },
        child: box,
      );
    }

    return box;
  }
}

/// Countdown with progress ring
class CountdownRing extends StatefulWidget {
  final DateTime endTime;
  final DateTime startTime;
  final double size;
  final Color? color;
  final VoidCallback? onEnd;

  const CountdownRing({
    super.key,
    required this.endTime,
    required this.startTime,
    this.size = 80,
    this.color,
    this.onEnd,
  });

  @override
  State<CountdownRing> createState() => _CountdownRingState();
}

class _CountdownRingState extends State<CountdownRing> {
  late Timer _timer;
  double _progress = 1.0;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateProgress();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateProgress());
  }

  void _updateProgress() {
    final now = DateTime.now();
    final total = widget.endTime.difference(widget.startTime);
    final elapsed = now.difference(widget.startTime);

    setState(() {
      _remaining = widget.endTime.difference(now);
      if (_remaining.isNegative) {
        _remaining = Duration.zero;
        _progress = 0;
        _timer.cancel();
        widget.onEnd?.call();
      } else {
        _progress = 1 - (elapsed.inSeconds / total.inSeconds);
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? AppColors.accent;
    final isUrgent = _remaining.inHours < 1;

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background ring
          SizedBox(
            width: widget.size,
            height: widget.size,
            child: CircularProgressIndicator(
              value: 1,
              strokeWidth: 6,
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation(
                (isUrgent ? AppColors.error : color).withValues(alpha: 0.2),
              ),
            ),
          ),
          // Progress ring
          SizedBox(
            width: widget.size,
            height: widget.size,
            child: CircularProgressIndicator(
              value: _progress,
              strokeWidth: 6,
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation(
                isUrgent ? AppColors.error : color,
              ),
            ),
          ),
          // Time text
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _formatTime(),
                style: AppTypography.titleLarge.copyWith(
                  color: isUrgent ? AppColors.error : color,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'متبقي',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatTime() {
    if (_remaining.inDays > 0) {
      return '${_remaining.inDays}ي';
    } else if (_remaining.inHours > 0) {
      return '${_remaining.inHours}س';
    } else {
      return '${_remaining.inMinutes}د';
    }
  }
}
