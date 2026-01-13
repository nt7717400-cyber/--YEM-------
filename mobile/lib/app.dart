/// Modern App Shell - 2025 Design System
/// Requirements: 3.1 - Navigation to car details screen
/// Requirements: 8.2 - Replace tags with auctions tab
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_spacing.dart';
import 'package:customer_app/core/constants/app_shadows.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/screens/home/home_screen.dart';
import 'package:customer_app/screens/cars/cars_list_screen.dart';
import 'package:customer_app/screens/cars/car_details_screen.dart';
import 'package:customer_app/screens/auctions/auctions_list_screen.dart';
import 'package:customer_app/screens/auctions/auction_details_screen.dart';
import 'package:customer_app/screens/about/about_screen.dart';
import 'package:customer_app/widgets/modern/modern_bottom_nav.dart';

/// Navigation tab indices
enum AppTab {
  home,
  cars,
  auctions,
  about,
}

/// App Shell - الهيكل الرئيسي للتطبيق
/// Modern design with animated bottom navigation
class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int _currentIndex = AppTab.home.index;

  // Navigation keys for each tab to preserve state
  final List<GlobalKey<NavigatorState>> _navigatorKeys = [
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
  ];

  // Search query to pass between screens
  String? _pendingSearch;

  // Navigation items
  final List<NavItem> _navItems = const [
    NavItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: AppStrings.home,
    ),
    NavItem(
      icon: Icons.directions_car_outlined,
      activeIcon: Icons.directions_car_rounded,
      label: AppStrings.cars,
    ),
    NavItem(
      icon: Icons.gavel_outlined,
      activeIcon: Icons.gavel_rounded,
      label: AppStrings.auctions,
      accentColor: AppColors.accent,
    ),
    NavItem(
      icon: Icons.info_outline_rounded,
      activeIcon: Icons.info_rounded,
      label: AppStrings.about,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBackPress();
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: [
            // Home Tab
            _buildNavigator(
              AppTab.home.index,
              HomeScreen(
                onNavigateToCars: () => _navigateToTab(AppTab.cars),
                onNavigateToAuctions: () => _navigateToTab(AppTab.auctions),
                onSearch: (search) => _navigateToCarsWithSearch(search),
                onCarTap: (car) => _navigateToCarDetails(car),
                onAuctionTap: (auction) => _navigateToAuctionDetails(auction),
              ),
            ),
            // Cars Tab
            _buildNavigator(
              AppTab.cars.index,
              CarsListScreen(
                initialSearch: _pendingSearch,
                onCarTap: (car) => _navigateToCarDetails(car),
              ),
            ),
            // Auctions Tab
            _buildNavigator(
              AppTab.auctions.index,
              AuctionsListScreen(
                onAuctionTap: (auction) => _navigateToAuctionDetails(auction),
              ),
            ),
            // About Tab
            _buildNavigator(
              AppTab.about.index,
              const AboutScreen(),
            ),
          ],
        ),
        bottomNavigationBar: _buildModernBottomNav(isDark),
      ),
    );
  }

  Widget _buildNavigator(int index, Widget child) {
    return Navigator(
      key: _navigatorKeys[index],
      onGenerateRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => child,
          settings: settings,
        );
      },
    );
  }

  /// Modern Bottom Navigation Bar
  Widget _buildModernBottomNav(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppSpacing.radiusXl),
        ),
        boxShadow: AppShadows.bottomNav,
      ),
      child: SafeArea(
        top: false,
        child: Container(
          height: AppSpacing.bottomNavHeight,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              _navItems.length,
              (index) => _buildNavItem(
                index: index,
                item: _navItems[index],
                isDark: isDark,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required NavItem item,
    required bool isDark,
  }) {
    final isSelected = _currentIndex == index;
    final accentColor = item.accentColor ?? AppColors.primary;
    final inactiveColor = isDark
        ? AppColors.textTertiaryDark
        : AppColors.textTertiaryLight;

    return Expanded(
      child: GestureDetector(
        onTap: () => _onTabTapped(index),
        behavior: HitTestBehavior.opaque,
        child: Container(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon
              Icon(
                isSelected ? item.activeIcon : item.icon,
                size: 26,
                color: isSelected ? accentColor : inactiveColor,
              ),
              const SizedBox(height: 4),
              // Label
              Text(
                item.label,
                style: TextStyle(
                  fontFamily: 'Cairo',
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? accentColor : inactiveColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onTabTapped(int index) {
    if (_currentIndex == index) {
      // If already on this tab, pop to root
      _navigatorKeys[index].currentState?.popUntil((route) => route.isFirst);
    } else {
      // Clear pending filters when switching tabs
      if (index != AppTab.cars.index) {
        _pendingSearch = null;
      }
      setState(() {
        _currentIndex = index;
      });
    }
  }

  void _navigateToTab(AppTab tab) {
    setState(() {
      _currentIndex = tab.index;
    });
  }

  void _navigateToCarsWithSearch(String? search) {
    setState(() {
      _pendingSearch = search;
      _currentIndex = AppTab.cars.index;
    });
    _rebuildCarsScreen();
  }

  void _rebuildCarsScreen() {
    _navigatorKeys[AppTab.cars.index]
        .currentState
        ?.popUntil((route) => route.isFirst);
  }

  /// Navigate to car details screen
  void _navigateToCarDetails(Car car) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CarDetailsScreenWithContact(
          carId: car.id,
          initialCar: car,
        ),
      ),
    );
  }

  /// Navigate to auction details screen
  void _navigateToAuctionDetails(Auction auction) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => AuctionDetailsScreen(
          auctionId: auction.id,
          initialAuction: auction,
        ),
      ),
    );
  }

  void _handleBackPress() {
    final currentNavigator = _navigatorKeys[_currentIndex].currentState;
    if (currentNavigator != null && currentNavigator.canPop()) {
      currentNavigator.pop();
    } else if (_currentIndex != AppTab.home.index) {
      setState(() {
        _currentIndex = AppTab.home.index;
      });
    }
  }
}

/// Route names for the app
class AppRoutes {
  AppRoutes._();

  static const String home = '/';
  static const String cars = '/cars';
  static const String carDetails = '/cars/details';
  static const String auctions = '/auctions';
  static const String auctionDetails = '/auctions/details';
  static const String about = '/about';
}
