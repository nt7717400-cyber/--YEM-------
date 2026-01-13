/// CountdownTimer Widget for Flutter Customer App
/// Requirements: 3.2, 3.4 - Real-time countdown to auction end

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:customer_app/core/constants/app_colors.dart';

/// Real-time countdown timer widget for auctions
/// Displays remaining time until auction ends
class CountdownTimer extends StatefulWidget {
  final DateTime endTime;
  final bool compact;
  final TextStyle? textStyle;
  final VoidCallback? onEnd;
  final bool showIcon;

  const CountdownTimer({
    super.key,
    required this.endTime,
    this.compact = false,
    this.textStyle,
    this.onEnd,
    this.showIcon = true,
  });

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _calculateRemaining();
    _startTimer();
  }

  @override
  void didUpdateWidget(CountdownTimer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.endTime != widget.endTime) {
      _calculateRemaining();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _calculateRemaining() {
    final now = DateTime.now();
    if (now.isBefore(widget.endTime)) {
      _remaining = widget.endTime.difference(now);
    } else {
      _remaining = Duration.zero;
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      setState(() {
        _calculateRemaining();
      });

      if (_remaining == Duration.zero) {
        timer.cancel();
        widget.onEnd?.call();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_remaining == Duration.zero) {
      return _buildEndedText(isDark);
    }

    if (widget.compact) {
      return _buildCompactTimer(isDark);
    }

    return _buildFullTimer(isDark);
  }

  Widget _buildEndedText(bool isDark) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.showIcon) ...[
          Icon(
            Icons.timer_off,
            size: widget.compact ? 12 : 16,
            color: AppColors.soldBadge,
          ),
          const SizedBox(width: 4),
        ],
        Text(
          'انتهى المزاد',
          style: widget.textStyle ?? TextStyle(
            fontSize: widget.compact ? 11 : 14,
            fontWeight: FontWeight.bold,
            color: AppColors.soldBadge,
          ),
        ),
      ],
    );
  }

  Widget _buildCompactTimer(bool isDark) {
    final timeText = _formatCompactTime();
    final isUrgent = _remaining.inHours < 1;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.showIcon) ...[
          Icon(
            Icons.timer,
            size: 12,
            color: isUrgent ? AppColors.warning : (isDark ? AppColors.textHintDark : AppColors.textHintLight),
          ),
          const SizedBox(width: 4),
        ],
        Text(
          timeText,
          style: widget.textStyle ?? TextStyle(
            fontSize: 11,
            fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal,
            color: isUrgent ? AppColors.warning : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
          ),
        ),
      ],
    );
  }

  Widget _buildFullTimer(bool isDark) {
    final days = _remaining.inDays;
    final hours = _remaining.inHours % 24;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;
    final isUrgent = _remaining.inHours < 1;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isUrgent 
            ? AppColors.warning.withValues(alpha: 0.1) 
            : (isDark ? AppColors.surfaceDark : AppColors.shimmerBase),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isUrgent ? AppColors.warning : AppColors.borderLight,
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.timer,
                size: 16,
                color: isUrgent ? AppColors.warning : AppColors.primary,
              ),
              const SizedBox(width: 6),
              Text(
                'الوقت المتبقي',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (days > 0) ...[
                _buildTimeUnit(days, 'يوم', isDark, isUrgent),
                const SizedBox(width: 8),
              ],
              _buildTimeUnit(hours, 'ساعة', isDark, isUrgent),
              const SizedBox(width: 8),
              _buildTimeUnit(minutes, 'دقيقة', isDark, isUrgent),
              const SizedBox(width: 8),
              _buildTimeUnit(seconds, 'ثانية', isDark, isUrgent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeUnit(int value, String label, bool isDark, bool isUrgent) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isUrgent ? AppColors.warning : AppColors.primary,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            value.toString().padLeft(2, '0'),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }

  String _formatCompactTime() {
    final days = _remaining.inDays;
    final hours = _remaining.inHours % 24;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;

    if (days > 0) {
      return '$days يوم ${hours}س';
    } else if (hours > 0) {
      return '${hours}س ${minutes}د';
    } else if (minutes > 0) {
      return '${minutes}د ${seconds}ث';
    } else {
      return '${seconds}ث';
    }
  }
}

/// Inline countdown timer for use in text
class InlineCountdownTimer extends StatefulWidget {
  final DateTime endTime;
  final TextStyle? style;
  final VoidCallback? onEnd;

  const InlineCountdownTimer({
    super.key,
    required this.endTime,
    this.style,
    this.onEnd,
  });

  @override
  State<InlineCountdownTimer> createState() => _InlineCountdownTimerState();
}

class _InlineCountdownTimerState extends State<InlineCountdownTimer> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _calculateRemaining();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _calculateRemaining() {
    final now = DateTime.now();
    if (now.isBefore(widget.endTime)) {
      _remaining = widget.endTime.difference(now);
    } else {
      _remaining = Duration.zero;
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      setState(() {
        _calculateRemaining();
      });

      if (_remaining == Duration.zero) {
        timer.cancel();
        widget.onEnd?.call();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_remaining == Duration.zero) {
      return Text(
        'انتهى',
        style: widget.style?.copyWith(color: AppColors.soldBadge) ??
            const TextStyle(color: AppColors.soldBadge),
      );
    }

    return Text(
      _formatTime(),
      style: widget.style,
    );
  }

  String _formatTime() {
    final days = _remaining.inDays;
    final hours = _remaining.inHours % 24;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;

    if (days > 0) {
      return '${days}d ${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h ${minutes}m ${seconds}s';
    } else if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }
}
