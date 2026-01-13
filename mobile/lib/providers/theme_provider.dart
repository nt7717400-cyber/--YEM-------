/// Theme Provider for Flutter Customer App
/// إدارة الوضع الداكن/الفاتح مع حفظ التفضيل محلياً
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// مفتاح حفظ وضع الثيم في Hive
const String _themeBoxName = 'settings';
const String _themeModeKey = 'theme_mode';

/// Theme Mode Notifier - مدير وضع الثيم
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.system) {
    _loadThemeMode();
  }

  /// تحميل وضع الثيم المحفوظ
  Future<void> _loadThemeMode() async {
    try {
      final box = await Hive.openBox(_themeBoxName);
      final savedMode = box.get(_themeModeKey, defaultValue: 'system');
      state = _stringToThemeMode(savedMode);
    } catch (e) {
      // في حالة الخطأ، استخدم وضع النظام
      state = ThemeMode.system;
    }
  }

  /// تغيير وضع الثيم
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    try {
      final box = await Hive.openBox(_themeBoxName);
      await box.put(_themeModeKey, _themeModeToString(mode));
    } catch (e) {
      // تجاهل أخطاء الحفظ
    }
  }

  /// تبديل بين الوضع الفاتح والداكن
  Future<void> toggleTheme() async {
    final newMode = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    await setThemeMode(newMode);
  }

  /// تحويل ThemeMode إلى نص
  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }

  /// تحويل نص إلى ThemeMode
  ThemeMode _stringToThemeMode(String mode) {
    switch (mode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }
}

/// Theme Mode Provider - مزود وضع الثيم
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>(
  (ref) => ThemeModeNotifier(),
);

/// Is Dark Mode Provider - مزود للتحقق من الوضع الداكن
final isDarkModeProvider = Provider<bool>((ref) {
  final themeMode = ref.watch(themeModeProvider);
  return themeMode == ThemeMode.dark;
});
