/// ContactButtons Widget for Flutter Customer App
/// Requirements: 4.1, 4.2 - WhatsApp and Call buttons

import 'package:flutter/material.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/settings.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/url_launcher_utils.dart';

/// Contact buttons widget for WhatsApp and phone call
class ContactButtons extends StatelessWidget {
  final Car? car;
  final ShowroomSettings settings;
  final bool expanded;
  final VoidCallback? onWhatsAppPressed;
  final VoidCallback? onCallPressed;

  const ContactButtons({
    super.key,
    this.car,
    required this.settings,
    this.expanded = true,
    this.onWhatsAppPressed,
    this.onCallPressed,
  });

  Future<void> _handleWhatsApp(BuildContext context) async {
    if (onWhatsAppPressed != null) {
      onWhatsAppPressed!();
      return;
    }

    bool success;
    if (car != null) {
      success = await UrlLauncherUtils.launchWhatsApp(
        phoneNumber: settings.whatsapp,
        car: car!,
      );
    } else {
      success = await UrlLauncherUtils.launchWhatsAppWithMessage(
        phoneNumber: settings.whatsapp,
        message: 'مرحباً، أرغب في الاستفسار عن السيارات المتاحة.',
      );
    }

    if (!success && context.mounted) {
      _showErrorSnackBar(context, AppStrings.whatsappNotInstalled);
    }
  }

  Future<void> _handleCall(BuildContext context) async {
    if (onCallPressed != null) {
      onCallPressed!();
      return;
    }

    final success = await UrlLauncherUtils.launchPhoneCall(settings.phone);
    
    if (!success && context.mounted) {
      _showErrorSnackBar(context, 'لا يمكن إجراء المكالمة');
    }
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (expanded) {
      return _buildExpandedButtons(context);
    }
    return _buildCompactButtons(context);
  }

  Widget _buildExpandedButtons(BuildContext context) {
    return Row(
      children: [
        // WhatsApp button
        Expanded(
          child: _WhatsAppButton(
            onPressed: () => _handleWhatsApp(context),
          ),
        ),
        const SizedBox(width: 12),
        // Call button
        Expanded(
          child: _CallButton(
            onPressed: () => _handleCall(context),
          ),
        ),
      ],
    );
  }

  Widget _buildCompactButtons(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // WhatsApp button
        _WhatsAppIconButton(
          onPressed: () => _handleWhatsApp(context),
        ),
        const SizedBox(width: 8),
        // Call button
        _CallIconButton(
          onPressed: () => _handleCall(context),
        ),
      ],
    );
  }
}

/// WhatsApp button with text
class _WhatsAppButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _WhatsAppButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF25D366), // WhatsApp green
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 2,
      ),
      icon: const Icon(Icons.chat, size: 20),
      label: const Text(
        AppStrings.whatsapp,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

/// Call button with text
class _CallButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _CallButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 2,
      ),
      icon: const Icon(Icons.phone, size: 20),
      label: const Text(
        AppStrings.call,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

/// WhatsApp icon button (compact)
class _WhatsAppIconButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _WhatsAppIconButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF25D366),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF25D366).withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: const Icon(Icons.chat, color: Colors.white),
        tooltip: AppStrings.whatsapp,
      ),
    );
  }
}

/// Call icon button (compact)
class _CallIconButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _CallIconButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: const Icon(Icons.phone, color: Colors.white),
        tooltip: AppStrings.call,
      ),
    );
  }
}

/// Floating contact buttons for bottom of screen
class FloatingContactButtons extends StatelessWidget {
  final Car? car;
  final ShowroomSettings settings;

  const FloatingContactButtons({
    super.key,
    this.car,
    required this.settings,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: ContactButtons(
          car: car,
          settings: settings,
          expanded: true,
        ),
      ),
    );
  }
}

/// Single WhatsApp FAB
class WhatsAppFAB extends StatelessWidget {
  final Car? car;
  final ShowroomSettings settings;

  const WhatsAppFAB({
    super.key,
    this.car,
    required this.settings,
  });

  Future<void> _handleWhatsApp(BuildContext context) async {
    bool success;
    if (car != null) {
      success = await UrlLauncherUtils.launchWhatsApp(
        phoneNumber: settings.whatsapp,
        car: car!,
      );
    } else {
      success = await UrlLauncherUtils.launchWhatsAppWithMessage(
        phoneNumber: settings.whatsapp,
        message: 'مرحباً، أرغب في الاستفسار عن السيارات المتاحة.',
      );
    }

    if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(AppStrings.whatsappNotInstalled),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () => _handleWhatsApp(context),
      backgroundColor: const Color(0xFF25D366),
      child: const Icon(Icons.chat, color: Colors.white),
    );
  }
}
