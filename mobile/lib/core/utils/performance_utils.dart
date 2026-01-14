/// Performance Utilities for Flutter Customer App
/// Optimizations for smooth animations and fast loading
library;

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

/// Debouncer for search and filter operations
class Debouncer {
  final Duration delay;
  Timer? _timer;

  Debouncer({this.delay = const Duration(milliseconds: 300)});

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void cancel() {
    _timer?.cancel();
  }

  void dispose() {
    _timer?.cancel();
    _timer = null;
  }
}

/// Throttler for scroll and frequent events
class Throttler {
  final Duration duration;
  DateTime? _lastRun;

  Throttler({this.duration = const Duration(milliseconds: 100)});

  void run(VoidCallback action) {
    final now = DateTime.now();
    if (_lastRun == null || now.difference(_lastRun!) >= duration) {
      _lastRun = now;
      action();
    }
  }
}

/// Smooth scroll physics for better UX
class SmoothScrollPhysics extends BouncingScrollPhysics {
  const SmoothScrollPhysics({super.parent});

  @override
  SmoothScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return SmoothScrollPhysics(parent: buildParent(ancestor));
  }

  @override
  double get dragStartDistanceMotionThreshold => 3.5;
}

/// Frame callback helper for post-frame operations
class FrameCallback {
  static void onNextFrame(VoidCallback callback) {
    SchedulerBinding.instance.addPostFrameCallback((_) => callback());
  }

  static Future<void> waitForFrame() async {
    await Future.delayed(Duration.zero);
  }
}

/// Memory-efficient list builder
class EfficientListBuilder {
  /// Build list with automatic disposal
  static Widget buildList<T>({
    required List<T> items,
    required Widget Function(BuildContext, T, int) itemBuilder,
    ScrollController? controller,
    EdgeInsets? padding,
    bool shrinkWrap = false,
  }) {
    return ListView.builder(
      controller: controller,
      padding: padding,
      shrinkWrap: shrinkWrap,
      physics: const SmoothScrollPhysics(),
      itemCount: items.length,
      cacheExtent: 500, // Cache more items for smoother scrolling
      itemBuilder: (context, index) => itemBuilder(context, items[index], index),
    );
  }

  /// Build grid with automatic disposal
  static Widget buildGrid<T>({
    required List<T> items,
    required Widget Function(BuildContext, T, int) itemBuilder,
    required int crossAxisCount,
    double crossAxisSpacing = 12,
    double mainAxisSpacing = 12,
    double childAspectRatio = 0.75,
    ScrollController? controller,
    EdgeInsets? padding,
    bool shrinkWrap = false,
  }) {
    return GridView.builder(
      controller: controller,
      padding: padding,
      shrinkWrap: shrinkWrap,
      physics: const SmoothScrollPhysics(),
      cacheExtent: 500,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: crossAxisSpacing,
        mainAxisSpacing: mainAxisSpacing,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) => itemBuilder(context, items[index], index),
    );
  }
}

/// Animation helper for smooth transitions
class SmoothAnimation {
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);

  static const Curve defaultCurve = Curves.easeOutCubic;
  static const Curve bounceCurve = Curves.elasticOut;
}

/// Lazy loading helper
class LazyLoader<T> {
  T? _value;
  final T Function() _factory;

  LazyLoader(this._factory);

  T get value {
    _value ??= _factory();
    return _value!;
  }

  bool get isLoaded => _value != null;

  void reset() {
    _value = null;
  }
}
