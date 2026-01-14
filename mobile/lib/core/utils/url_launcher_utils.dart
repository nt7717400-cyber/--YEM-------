/// URL Launcher Utilities for Flutter Customer App
/// Requirements: 4.1, 4.2, 6.3 - WhatsApp, Phone, and Maps URL generation

import 'package:url_launcher/url_launcher.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/settings.dart';

/// URL generation and launching utilities
class UrlLauncherUtils {
  UrlLauncherUtils._();

  /// Generate WhatsApp URL with pre-filled message about a car
  /// Requirements: 4.1, 4.3
  static String generateWhatsAppUrl({
    required String phoneNumber,
    required Car car,
  }) {
    // Clean phone number - remove spaces, dashes, and ensure proper format
    final cleanPhone = _cleanPhoneNumber(phoneNumber);
    
    // Create pre-filled message about the car
    final message = _generateCarInquiryMessage(car);
    
    // Encode message for URL
    final encodedMessage = Uri.encodeComponent(message);
    
    return 'https://wa.me/$cleanPhone?text=$encodedMessage';
  }

  /// Generate WhatsApp URL with custom message
  static String generateWhatsAppUrlWithMessage({
    required String phoneNumber,
    required String message,
  }) {
    final cleanPhone = _cleanPhoneNumber(phoneNumber);
    final encodedMessage = Uri.encodeComponent(message);
    return 'https://wa.me/$cleanPhone?text=$encodedMessage';
  }

  /// Generate WhatsApp URL without message
  static String generateWhatsAppUrlSimple(String phoneNumber) {
    final cleanPhone = _cleanPhoneNumber(phoneNumber);
    return 'https://wa.me/$cleanPhone';
  }

  /// Generate phone call URL
  /// Requirements: 4.2, 4.3
  static String generatePhoneUrl(String phoneNumber) {
    final cleanPhone = _cleanPhoneNumber(phoneNumber);
    return 'tel:$cleanPhone';
  }

  /// Generate Google Maps URL for coordinates
  /// Requirements: 6.3
  static String generateMapsUrl({
    required double latitude,
    required double longitude,
    String? label,
  }) {
    if (label != null && label.isNotEmpty) {
      final encodedLabel = Uri.encodeComponent(label);
      return 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude&query_place_id=$encodedLabel';
    }
    return 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
  }

  /// Generate Google Maps URL for address search
  static String generateMapsUrlFromAddress(String address) {
    final encodedAddress = Uri.encodeComponent(address);
    return 'https://www.google.com/maps/search/?api=1&query=$encodedAddress';
  }

  /// Generate Apple Maps URL for coordinates (iOS)
  static String generateAppleMapsUrl({
    required double latitude,
    required double longitude,
    String? label,
  }) {
    if (label != null && label.isNotEmpty) {
      final encodedLabel = Uri.encodeComponent(label);
      return 'https://maps.apple.com/?q=$encodedLabel&ll=$latitude,$longitude';
    }
    return 'https://maps.apple.com/?ll=$latitude,$longitude';
  }

  /// Launch WhatsApp with car inquiry
  static Future<bool> launchWhatsApp({
    required String phoneNumber,
    required Car car,
  }) async {
    final url = generateWhatsAppUrl(phoneNumber: phoneNumber, car: car);
    return _launchUrl(url);
  }

  /// Launch WhatsApp with custom message
  static Future<bool> launchWhatsAppWithMessage({
    required String phoneNumber,
    required String message,
  }) async {
    final url = generateWhatsAppUrlWithMessage(
      phoneNumber: phoneNumber,
      message: message,
    );
    return _launchUrl(url);
  }

  /// Launch phone call
  static Future<bool> launchPhoneCall(String phoneNumber) async {
    final url = generatePhoneUrl(phoneNumber);
    return _launchUrl(url);
  }

  /// Launch maps with coordinates
  static Future<bool> launchMaps({
    required double latitude,
    required double longitude,
    String? label,
  }) async {
    final url = generateMapsUrl(
      latitude: latitude,
      longitude: longitude,
      label: label,
    );
    return _launchUrl(url);
  }

  /// Launch maps with address
  static Future<bool> launchMapsWithAddress(String address) async {
    final url = generateMapsUrlFromAddress(address);
    return _launchUrl(url);
  }

  /// Launch maps from showroom settings
  static Future<bool> launchMapsFromSettings(ShowroomSettings settings) async {
    if (settings.hasMapCoordinates) {
      return launchMaps(
        latitude: settings.mapLatitude!,
        longitude: settings.mapLongitude!,
        label: settings.name,
      );
    } else if (settings.address.isNotEmpty) {
      return launchMapsWithAddress(settings.address);
    }
    return false;
  }

  /// Check if WhatsApp can be launched
  static Future<bool> canLaunchWhatsApp() async {
    return canLaunchUrl(Uri.parse('https://wa.me/'));
  }

  /// Check if phone calls can be made
  static Future<bool> canLaunchPhone() async {
    return canLaunchUrl(Uri.parse('tel:'));
  }

  /// Check if maps can be launched
  static Future<bool> canLaunchMaps() async {
    return canLaunchUrl(Uri.parse('https://www.google.com/maps'));
  }

  /// Clean phone number by removing non-numeric characters except +
  static String _cleanPhoneNumber(String phoneNumber) {
    // Remove all non-numeric characters except +
    String cleaned = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');
    
    // If number doesn't start with +, assume it needs country code
    // Yemen country code is +967
    if (!cleaned.startsWith('+')) {
      // If starts with 0, remove it and add country code
      if (cleaned.startsWith('0')) {
        cleaned = '+967${cleaned.substring(1)}';
      } else if (!cleaned.startsWith('967')) {
        cleaned = '+967$cleaned';
      } else {
        cleaned = '+$cleaned';
      }
    }
    
    return cleaned;
  }

  /// Generate car inquiry message in Arabic with product link
  static String _generateCarInquiryMessage(Car car) {
    // رابط المنتج على الويب
    final productUrl = 'https://fazaacaetg.com/cars/${car.id}';
    
    final buffer = StringBuffer();
    buffer.writeln('مرحباً،');
    buffer.writeln('أرغب في الاستفسار عن السيارة التالية:');
    buffer.writeln('');
    buffer.writeln('🚗 ${car.name}');
    buffer.writeln('📌 الماركة: ${car.brand}');
    buffer.writeln('📋 الموديل: ${car.model}');
    buffer.writeln('📅 السنة: ${car.year}');
    buffer.writeln('💰 السعر: ${car.price.toStringAsFixed(0)} ر.ي');
    if (car.kilometers != null) {
      buffer.writeln('🛣️ المسافة: ${car.kilometers} كم');
    }
    buffer.writeln('');
    buffer.writeln('🔗 رابط المنتج:');
    buffer.writeln(productUrl);
    buffer.writeln('');
    buffer.writeln('شكراً لكم');
    
    return buffer.toString();
  }

  /// Launch URL helper
  static Future<bool> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      return launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
