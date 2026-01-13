# Implementation Plan: Flutter Customer App

## Overview

خطة تنفيذ تطبيق Flutter للعملاء. يتم التنفيذ بشكل تدريجي بدءاً من إعداد المشروع، ثم الـ Models، ثم الـ API Client، ثم الشاشات.

## Tasks

- [x] 1. Project Setup
  - [x] 1.1 Create Flutter project
    - Create `mobile/` directory with Flutter project
    - Configure `pubspec.yaml` with required dependencies
    - Set up Arabic localization and RTL support
    - _Requirements: 8.1, 8.2_

  - [x] 1.2 Configure app theme
    - Create `lib/core/constants/app_colors.dart`
    - Create `lib/core/constants/app_theme.dart`
    - Set up light and dark themes
    - _Requirements: 9.1, 9.5_

  - [x] 1.3 Create app strings
    - Create `lib/core/constants/app_strings.dart`
    - Add all Arabic strings
    - _Requirements: 8.1_

- [x] 2. Data Models
  - [x] 2.1 Create Car model
    - Create `lib/models/car.dart`
    - Include Car, CarImage, CarVideo, CarInspection classes
    - Add JSON serialization
    - _Requirements: 1.2, 3.3_

  - [x] 2.2 Create Banner model
    - Create `lib/models/banner.dart`
    - Add JSON serialization
    - _Requirements: 5.1_

  - [x] 2.3 Create Settings model
    - Create `lib/models/settings.dart`
    - Add JSON serialization
    - _Requirements: 6.1_

  - [x] 2.4 Create CarFilter model
    - Create `lib/models/car_filter.dart`
    - Include all filter fields
    - _Requirements: 2.1-2.6_

  - [x] 2.5 Write property test for Car model round-trip
    - **Property 1: Car Data Completeness**
    - **Validates: Requirements 1.2, 3.3**

- [x] 3. API Client
  - [x] 3.1 Create API client base
    - Create `lib/core/api/api_client.dart`
    - Create `lib/core/api/api_endpoints.dart`
    - Create `lib/core/api/api_exceptions.dart`
    - Configure Dio with base URL and interceptors
    - _Requirements: 1.1, 1.5_

  - [x] 3.2 Implement Cars API methods
    - getCars(), getCarById(), getBrands(), incrementViewCount()
    - _Requirements: 1.1, 3.6, 10.1_

  - [x] 3.3 Implement Banners API methods
    - getBannersByPosition(), trackBannerView(), trackBannerClick()
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.4 Implement Settings API methods
    - getSettings()
    - _Requirements: 6.1_

- [x] 4. Repositories
  - [x] 4.1 Create Car repository
    - Create `lib/repositories/car_repository.dart`
    - Implement filter logic
    - _Requirements: 2.1-2.7_

  - [x] 4.2 Create Banner repository
    - Create `lib/repositories/banner_repository.dart`
    - Implement schedule filtering
    - _Requirements: 5.4_

  - [x] 4.3 Create Settings repository
    - Create `lib/repositories/settings_repository.dart`
    - _Requirements: 6.1_

  - [x] 4.4 Write property test for filter correctness
    - **Property 2: Filter Correctness**
    - **Property 3: Filter Reset**
    - **Validates: Requirements 2.1-2.7**

  - [x] 4.5 Write property test for banner schedule
    - **Property 5: Banner Schedule Validation**
    - **Validates: Requirements 5.4**

- [x] 5. State Management (Providers)
  - [x] 5.1 Create Car providers
    - Create `lib/providers/car_provider.dart`
    - carsProvider, featuredCarsProvider, carDetailsProvider, brandsProvider
    - _Requirements: 1.1, 7.1, 10.1_

  - [x] 5.2 Create Banner provider
    - Create `lib/providers/banner_provider.dart`
    - _Requirements: 5.1_

  - [x] 5.3 Create Settings provider
    - Create `lib/providers/settings_provider.dart`
    - _Requirements: 6.1_

- [x] 6. Checkpoint - Core Layer Complete
  - Ensure models, API client, repositories, and providers work correctly
  - Run unit tests
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Utility Functions
  - [x] 7.1 Create formatters
    - Create `lib/core/utils/formatters.dart`
    - Currency formatting (YER)
    - Number formatting (Arabic)
    - Date formatting
    - _Requirements: 8.3_

  - [x] 7.2 Create URL launcher utils
    - Create `lib/core/utils/url_launcher_utils.dart`
    - WhatsApp URL generation
    - Phone URL generation
    - Maps URL generation
    - _Requirements: 4.1, 4.2, 6.3_

  - [x] 7.3 Write property tests for utilities
    - **Property 6: WhatsApp URL Generation**
    - **Property 7: Phone URL Generation**
    - **Property 8: Currency Formatting**
    - **Validates: Requirements 4.1, 4.2, 4.3, 8.3**

- [x] 8. Shared Widgets
  - [x] 8.1 Create CarCard widget
    - Create `lib/widgets/car_card.dart`
    - Display car image, name, brand, model, year, price, condition
    - Show featured badge
    - _Requirements: 1.2, 1.3_

  - [x] 8.2 Create BannerCarousel widget
    - Create `lib/widgets/banner_carousel.dart`
    - Auto-scroll banners
    - Handle click tracking
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.3 Create ImageGallery widget
    - Create `lib/widgets/image_gallery.dart`
    - Page indicator
    - Zoom support
    - _Requirements: 3.2_

  - [x] 8.4 Create ContactButtons widget
    - Create `lib/widgets/contact_buttons.dart`
    - WhatsApp button
    - Call button
    - _Requirements: 4.1, 4.2_

  - [x] 8.5 Create CarFilterSheet widget
    - Create `lib/widgets/car_filter_sheet.dart`
    - Brand, condition, price range, year filters
    - Clear filters button
    - _Requirements: 2.1-2.7_

  - [x] 8.6 Create loading and error widgets
    - Create `lib/widgets/loading_widget.dart`
    - Create `lib/widgets/error_widget.dart`
    - _Requirements: 1.4, 1.5, 9.4_

- [x] 9. Home Screen
  - [x] 9.1 Create Home screen
    - Create `lib/screens/home/home_screen.dart`
    - Hero banner carousel
    - Featured cars section
    - Quick search
    - _Requirements: 5.1, 7.1, 7.2, 7.3_

  - [x] 9.2 Write property test for featured cars
    - **Property 4: Featured Cars Filter**
    - **Validates: Requirements 7.1**

- [x] 10. Cars List Screen
  - [x] 10.1 Create Cars List screen
    - Create `lib/screens/cars/cars_list_screen.dart`
    - Search bar
    - Filter button with bottom sheet
    - Cars grid
    - Pull-to-refresh
    - Empty state
    - _Requirements: 1.1, 1.6, 2.1-2.7, 9.3_

- [x] 11. Car Details Screen
  - [x] 11.1 Create Car Details screen
    - Create `lib/screens/cars/car_details_screen.dart`
    - Image gallery
    - Car info section
    - Video player (YouTube/Upload)
    - Inspection viewer (for used cars)
    - Contact buttons
    - Share button
    - _Requirements: 3.1-3.7, 4.1, 4.2_

- [x] 12. Brands Screen
  - [x] 12.1 Create Brands screen
    - Create `lib/screens/brands/brands_screen.dart`
    - Grid of brands with car count
    - Navigate to filtered cars list
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 12.2 Write property test for brand car count
    - **Property 9: Brand Car Count**
    - **Validates: Requirements 10.3**

- [x] 13. About Screen
  - [x] 13.1 Create About screen
    - Create `lib/screens/about/about_screen.dart`
    - Showroom info
    - Contact details
    - Map link
    - Working hours
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 13.2 Write property test for settings completeness
    - **Property 10: Settings Data Completeness**
    - **Validates: Requirements 6.1**

- [x] 14. Navigation and App Shell
  - [x] 14.1 Create app navigation
    - Create `lib/app.dart`
    - Bottom navigation bar
    - Route configuration
    - _Requirements: 3.1_

  - [x] 14.2 Create main entry point
    - Update `lib/main.dart`
    - Initialize providers
    - Configure localization
    - _Requirements: 8.1, 8.2_

- [x] 15. Checkpoint - UI Complete
  - Test all screens manually
  - Verify navigation flow
  - Test RTL layout
  - Ensure all tests pass, ask the user if questions arise

- [x] 16. Final Checkpoint
  - Run all tests
  - Test on Android emulator
  - Test on iOS simulator (if available)
  - Verify complete flow: browse cars → view details → contact showroom
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

