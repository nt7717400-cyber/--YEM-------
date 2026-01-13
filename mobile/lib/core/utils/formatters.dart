/// Formatters for Flutter Customer App
/// Requirements: 8.3 - Arabic format numbers and currency (YER)

import 'package:intl/intl.dart';

/// Currency and number formatting utilities for Arabic locale
class Formatters {
  Formatters._();

  /// Format price in Yemeni Rial (YER) with Arabic numerals
  /// Example: 1500000 -> "١٬٥٠٠٬٠٠٠ ر.ي"
  static String formatCurrency(double price) {
    final formatter = NumberFormat('#,##0', 'ar');
    final formattedNumber = formatter.format(price);
    return '$formattedNumber ر.ي';
  }

  /// Format price in Yemeni Rial (YER) with Western numerals
  /// Example: 1500000 -> "1,500,000 YER"
  static String formatCurrencyWestern(double price) {
    final formatter = NumberFormat('#,##0', 'en');
    final formattedNumber = formatter.format(price);
    return '$formattedNumber YER';
  }

  /// Format number with Arabic numerals and thousand separators
  /// Example: 150000 -> "١٥٠٬٠٠٠"
  static String formatNumber(num number) {
    final formatter = NumberFormat('#,##0', 'ar');
    return formatter.format(number);
  }

  /// Format number with Western numerals and thousand separators
  /// Example: 150000 -> "150,000"
  static String formatNumberWestern(num number) {
    final formatter = NumberFormat('#,##0', 'en');
    return formatter.format(number);
  }

  /// Format kilometers with Arabic numerals
  /// Example: 50000 -> "٥٠٬٠٠٠ كم"
  static String formatKilometers(int kilometers) {
    final formattedNumber = formatNumber(kilometers);
    return '$formattedNumber كم';
  }

  /// Format year in Arabic numerals
  /// Example: 2023 -> "٢٠٢٣"
  static String formatYear(int year) {
    return _toArabicNumerals(year.toString());
  }

  /// Format date in Arabic format
  /// Example: DateTime(2024, 1, 15) -> "١٥ يناير ٢٠٢٤"
  static String formatDate(DateTime date) {
    final formatter = DateFormat('d MMMM yyyy', 'ar');
    return formatter.format(date);
  }

  /// Format date in short Arabic format
  /// Example: DateTime(2024, 1, 15) -> "١٥/١/٢٠٢٤"
  static String formatDateShort(DateTime date) {
    final formatter = DateFormat('d/M/yyyy', 'ar');
    return formatter.format(date);
  }

  /// Format relative time in Arabic
  /// Example: 2 hours ago -> "منذ ساعتين"
  static String formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 30) {
      return formatDate(dateTime);
    } else if (difference.inDays > 0) {
      final days = difference.inDays;
      if (days == 1) return 'منذ يوم';
      if (days == 2) return 'منذ يومين';
      if (days <= 10) return 'منذ $days أيام';
      return 'منذ $days يوم';
    } else if (difference.inHours > 0) {
      final hours = difference.inHours;
      if (hours == 1) return 'منذ ساعة';
      if (hours == 2) return 'منذ ساعتين';
      if (hours <= 10) return 'منذ $hours ساعات';
      return 'منذ $hours ساعة';
    } else if (difference.inMinutes > 0) {
      final minutes = difference.inMinutes;
      if (minutes == 1) return 'منذ دقيقة';
      if (minutes == 2) return 'منذ دقيقتين';
      if (minutes <= 10) return 'منذ $minutes دقائق';
      return 'منذ $minutes دقيقة';
    } else {
      return 'الآن';
    }
  }

  /// Format view count with Arabic text
  /// Example: 1500 -> "١٬٥٠٠ مشاهدة"
  static String formatViewCount(int count) {
    final formattedNumber = formatNumber(count);
    if (count == 1) return 'مشاهدة واحدة';
    if (count == 2) return 'مشاهدتان';
    if (count <= 10) return '$formattedNumber مشاهدات';
    return '$formattedNumber مشاهدة';
  }

  /// Format car count with Arabic text
  /// Example: 5 -> "٥ سيارات"
  static String formatCarCount(int count) {
    final formattedNumber = formatNumber(count);
    if (count == 0) return 'لا توجد سيارات';
    if (count == 1) return 'سيارة واحدة';
    if (count == 2) return 'سيارتان';
    if (count <= 10) return '$formattedNumber سيارات';
    return '$formattedNumber سيارة';
  }

  /// Convert Western numerals to Arabic numerals
  static String _toArabicNumerals(String input) {
    const western = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    String result = input;
    for (int i = 0; i < western.length; i++) {
      result = result.replaceAll(western[i], arabic[i]);
    }
    return result;
  }

  /// Convert Arabic numerals to Western numerals
  static String toWesternNumerals(String input) {
    const western = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    String result = input;
    for (int i = 0; i < arabic.length; i++) {
      result = result.replaceAll(arabic[i], western[i]);
    }
    return result;
  }
}
