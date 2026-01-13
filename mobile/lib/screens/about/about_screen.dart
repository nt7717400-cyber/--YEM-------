/// Modern About Screen - 2025 Design System
/// Requirements: 6.1, 6.2, 6.3 - Showroom info, contact details, map link, working hours
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_typography.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/url_launcher_utils.dart';
import 'package:customer_app/models/settings.dart';
import 'package:customer_app/providers/settings_provider.dart';
import 'package:customer_app/providers/theme_provider.dart';
import 'package:customer_app/widgets/modern/index.dart';

/// About Screen - شاشة عن المعرض
class AboutScreen extends ConsumerWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(settingsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: _buildAppBar(context, isDark),
      body: settingsAsync.when(
        data: (settings) => _AboutContent(settings: settings),
        loading: () => const ModernLoadingIndicator(message: AppStrings.loading),
        error: (error, stack) => ModernErrorWidget.generic(
          details: error.toString(),
          onRetry: () => ref.invalidate(settingsProvider),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, bool isDark) {
    return AppBar(
      title: Text(
        AppStrings.aboutShowroom,
        style: AppTypography.headlineSmall.copyWith(
          color:
              isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        ),
      ),
      centerTitle: true,
      backgroundColor:
          isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      elevation: 0,
    );
  }
}

/// About content widget
class _AboutContent extends ConsumerWidget {
  final ShowroomSettings settings;

  const _AboutContent({required this.settings});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ModernRefreshable(
      onRefresh: () async {},
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: AppSpacing.screenPaddingAll,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Showroom header
            _buildShowroomHeader(isDark),
            const SizedBox(height: AppSpacing.sectionGap),
            // App Settings section - إعدادات التطبيق
            _buildAppSettingsSection(context, ref, isDark),
            const SizedBox(height: AppSpacing.sectionGap),
            // Description
            if (settings.description.isNotEmpty) ...[
              _buildDescriptionSection(isDark),
              const SizedBox(height: AppSpacing.sectionGap),
            ],
            // Contact info section
            _buildContactSection(isDark),
            const SizedBox(height: AppSpacing.sectionGap),
            // Address section
            _buildAddressSection(isDark),
            const SizedBox(height: AppSpacing.sectionGap),
            // Working hours section
            if (settings.workingHours.isNotEmpty) ...[
              _buildWorkingHoursSection(isDark),
              const SizedBox(height: AppSpacing.sectionGap),
            ],
            // Map section
            if (settings.hasMapCoordinates || settings.address.isNotEmpty) ...[
              _buildMapSection(isDark),
              const SizedBox(height: AppSpacing.sectionGap),
            ],
            // Contact buttons
            _buildContactButtons(),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ),
      ),
    );
  }

  /// قسم إعدادات التطبيق - الوضع الداكن
  Widget _buildAppSettingsSection(BuildContext context, WidgetRef ref, bool isDark) {
    final themeMode = ref.watch(themeModeProvider);
    
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.settings_rounded,
            title: 'إعدادات التطبيق',
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          // Dark Mode Toggle
          _ThemeModeSelector(
            currentMode: themeMode,
            isDark: isDark,
            onModeChanged: (mode) {
              ref.read(themeModeProvider.notifier).setThemeMode(mode);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildShowroomHeader(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xxl),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: AppSpacing.borderRadiusXl,
        boxShadow: AppShadows.primaryMd,
      ),
      child: Column(
        children: [
          // Showroom icon
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.store_rounded,
              size: 48,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          // Showroom name
          Text(
            settings.name,
            style: AppTypography.displaySmall.copyWith(
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionSection(bool isDark) {
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.info_outline_rounded,
            title: 'نبذة عن المعرض',
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            settings.description,
            style: AppTypography.bodyMedium.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
              height: 1.7,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection(bool isDark) {
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.contact_phone_rounded,
            title: AppStrings.contact,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          // Phone
          _ContactRow(
            icon: Icons.phone_rounded,
            iconColor: AppColors.primary,
            label: AppStrings.phone,
            value: settings.phone,
            onTap: () => UrlLauncherUtils.launchPhoneCall(settings.phone),
            isDark: isDark,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
            child: Divider(
              color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
            ),
          ),
          // WhatsApp
          _ContactRow(
            icon: Icons.chat_rounded,
            iconColor: AppColors.whatsAppGreen,
            label: AppStrings.whatsapp,
            value: settings.whatsapp,
            onTap: () => UrlLauncherUtils.launchWhatsAppWithMessage(
              phoneNumber: settings.whatsapp,
              message: 'مرحباً، أرغب في الاستفسار عن السيارات المتاحة.',
            ),
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildAddressSection(bool isDark) {
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.location_on_rounded,
            title: AppStrings.address,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.md),
          InkWell(
            onTap: _openMaps,
            borderRadius: AppSpacing.borderRadiusSm,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      settings.address,
                      style: AppTypography.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                        height: 1.6,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: AppSpacing.borderRadiusSm,
                    ),
                    child: Icon(
                      Icons.open_in_new_rounded,
                      size: 18,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkingHoursSection(bool isDark) {
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.access_time_rounded,
            title: AppStrings.workingHours,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            settings.workingHours,
            style: AppTypography.bodyMedium.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapSection(bool isDark) {
    return _InfoCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.map_rounded,
            title: AppStrings.location,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          // Map placeholder with open button
          InkWell(
            onTap: _openMaps,
            borderRadius: AppSpacing.borderRadiusMd,
            child: Container(
              width: double.infinity,
              height: 150,
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.surfaceDark
                    : AppColors.backgroundLight,
                borderRadius: AppSpacing.borderRadiusMd,
                border: Border.all(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.map_outlined,
                      size: 36,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.open_in_new_rounded,
                        size: 18,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        AppStrings.openInMaps,
                        style: AppTypography.labelLarge.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactButtons() {
    return Row(
      children: [
        // WhatsApp button
        Expanded(
          child: WhatsAppButton(
            onPressed: () => UrlLauncherUtils.launchWhatsAppWithMessage(
              phoneNumber: settings.whatsapp,
              message: 'مرحباً، أرغب في الاستفسار عن السيارات المتاحة.',
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        // Call button
        Expanded(
          child: CallButton(
            onPressed: () => UrlLauncherUtils.launchPhoneCall(settings.phone),
          ),
        ),
      ],
    );
  }

  Future<void> _openMaps() async {
    await UrlLauncherUtils.launchMapsFromSettings(settings);
  }
}

/// Info card container
class _InfoCard extends StatelessWidget {
  final Widget child;
  final bool isDark;

  const _InfoCard({
    required this.child,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: AppSpacing.cardPaddingAll,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppSpacing.borderRadiusLg,
        boxShadow: isDark ? AppShadows.darkSm : AppShadows.sm,
      ),
      child: child,
    );
  }
}

/// Section title widget
class _SectionTitle extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isDark;

  const _SectionTitle({
    required this.icon,
    required this.title,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.primarySurface,
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          child: Icon(
            icon,
            size: 20,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Text(
          title,
          style: AppTypography.titleLarge.copyWith(
            color:
                isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
      ],
    );
  }
}

/// Contact row widget
class _ContactRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final VoidCallback onTap;
  final bool isDark;

  const _ContactRow({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppSpacing.borderRadiusSm,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: AppSpacing.borderRadiusSm,
              ),
              child: Icon(
                icon,
                size: 22,
                color: iconColor,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTypography.labelSmall.copyWith(
                      color: isDark
                          ? AppColors.textTertiaryDark
                          : AppColors.textTertiaryLight,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: AppTypography.titleMedium.copyWith(
                      color: isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 16,
              color: isDark
                  ? AppColors.textTertiaryDark
                  : AppColors.textTertiaryLight,
            ),
          ],
        ),
      ),
    );
  }
}

/// Theme Mode Selector Widget - اختيار وضع الثيم
class _ThemeModeSelector extends StatelessWidget {
  final ThemeMode currentMode;
  final bool isDark;
  final ValueChanged<ThemeMode> onModeChanged;

  const _ThemeModeSelector({
    required this.currentMode,
    required this.isDark,
    required this.onModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
              size: 22,
              color: isDark ? AppColors.accentLight : AppColors.accent,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                'المظهر',
                style: AppTypography.titleMedium.copyWith(
                  color: isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimaryLight,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        // Theme options
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceDark : AppColors.backgroundLight,
            borderRadius: AppSpacing.borderRadiusMd,
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: Column(
            children: [
              _ThemeOption(
                icon: Icons.light_mode_rounded,
                label: 'فاتح',
                isSelected: currentMode == ThemeMode.light,
                isDark: isDark,
                onTap: () => onModeChanged(ThemeMode.light),
              ),
              Divider(
                height: 1,
                color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
              ),
              _ThemeOption(
                icon: Icons.dark_mode_rounded,
                label: 'داكن',
                isSelected: currentMode == ThemeMode.dark,
                isDark: isDark,
                onTap: () => onModeChanged(ThemeMode.dark),
              ),
              Divider(
                height: 1,
                color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
              ),
              _ThemeOption(
                icon: Icons.settings_suggest_rounded,
                label: 'تلقائي (حسب النظام)',
                isSelected: currentMode == ThemeMode.system,
                isDark: isDark,
                onTap: () => onModeChanged(ThemeMode.system),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Theme Option Item
class _ThemeOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _ThemeOption({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected
                  ? AppColors.primary
                  : (isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                label,
                style: AppTypography.bodyMedium.copyWith(
                  color: isSelected
                      ? AppColors.primary
                      : (isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight),
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle_rounded,
                size: 22,
                color: AppColors.primary,
              ),
          ],
        ),
      ),
    );
  }
}
