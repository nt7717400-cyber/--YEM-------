# Implementation Plan: Banner Management System

## Overview

خطة تنفيذ نظام إدارة البانرات الإعلانية. يتم التنفيذ بشكل تدريجي بدءاً من قاعدة البيانات، ثم الـ Backend API، ثم الـ Frontend.

## Tasks

- [x] 1. Database Setup
  - [x] 1.1 Create banners table migration
    - Create `api/database/migration_banners.sql` with the banners table schema
    - Include all indexes for performance
    - _Requirements: 1.1-1.5, 4.1-4.4, 6.1-6.4, 7.1-7.3, 8.1-8.4, 10.1-10.2_

  - [x] 1.2 Run migration on database
    - Execute the migration SQL on yemen_cars database
    - Verify table creation
    - _Requirements: 1.1-1.5_

- [x] 2. Backend API Implementation
  - [x] 2.1 Create BannersController
    - Create `api/controllers/BannersController.php`
    - Implement getAll(), getByPosition(), getById(), create(), update(), delete()
    - Implement toggleActive(), trackClick(), trackView()
    - Include image upload handling with validation
    - _Requirements: 1.1-1.6, 2.1-2.4, 3.1-3.3, 4.1-4.4, 5.1-5.3, 8.1-8.4_

  - [x] 2.2 Add banner routes to index.php
    - Add routes for all banner endpoints
    - Configure authentication for admin routes
    - _Requirements: 1.1-1.6, 2.1-2.4, 3.1-3.3_

  - [x] 2.3 Write property tests for BannersController
    - **Property 1: Banner CRUD Round-Trip**
    - **Property 2: Required Field Validation**
    - **Property 3: Position Validation**
    - **Property 7: Banner Visibility Rules**
    - **Property 10: Display Ordering**
    - **Property 11: Toggle Status Idempotence**
    - **Property 12: View Count Increment**
    - **Property 13: Click Count Increment**
    - **Validates: Requirements 1.2, 1.4, 1.5, 2.2, 5.1, 5.2, 6.1-6.3, 7.1, 8.2-8.4**

- [x] 3. Checkpoint - Backend API Complete
  - Ensure all API endpoints work correctly
  - Test with curl or Postman
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Frontend Types and API Client
  - [x] 4.1 Add Banner types to frontend
    - Create `frontend/src/types/banner.ts` with Banner, CreateBannerInput, UpdateBannerInput, BannerFilters interfaces
    - Export from `frontend/src/types/index.ts`
    - _Requirements: 4.2_

  - [x] 4.2 Add Banner API methods to api.ts
    - Add getAllBanners(), getBannersByPosition(), createBanner(), updateBanner(), deleteBanner()
    - Add toggleBannerActive(), trackBannerClick(), trackBannerView()
    - _Requirements: 1.1-1.6, 2.1-2.4, 3.1-3.3, 4.1-4.4, 5.1-5.3, 8.1-8.4_

- [x] 5. Admin Banner Management Pages
  - [x] 5.1 Create Banner List Page
    - Create `frontend/src/app/admin/banners/page.tsx`
    - Display banners in a table with filters (position, status)
    - Add actions: edit, delete, toggle active
    - _Requirements: 4.1-4.4, 5.1-5.3_

  - [x] 5.2 Create Banner Form Component
    - Create `frontend/src/components/admin/BannerForm.tsx`
    - Image upload with preview
    - Mobile image upload (optional)
    - Position selector, schedule date pickers, link URL input
    - Client-side validation
    - _Requirements: 1.1-1.6, 2.1-2.3, 6.1-6.4, 9.1_

  - [x] 5.3 Create New Banner Page
    - Create `frontend/src/app/admin/banners/new/page.tsx`
    - Use BannerForm component
    - _Requirements: 1.1-1.6_

  - [x] 5.4 Create Edit Banner Page
    - Create `frontend/src/app/admin/banners/[id]/edit/page.tsx`
    - Load existing banner data
    - Use BannerForm component
    - _Requirements: 2.1-2.4_

  - [x] 5.5 Add Banners link to Admin Sidebar
    - Update `frontend/src/components/admin/AdminSidebar.tsx`
    - Add "البانرات" menu item with icon
    - _Requirements: 4.1_

- [x] 6. Checkpoint - Admin Pages Complete
  - Test banner CRUD operations from admin panel
  - Verify image uploads work correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Public Banner Display Components
  - [x] 7.1 Create BannerDisplay Component
    - Create `frontend/src/components/banners/BannerDisplay.tsx`
    - Fetch and display banners for a position
    - Handle click tracking
    - Responsive image display (mobile vs desktop)
    - _Requirements: 8.1-8.4, 9.2-9.3_

  - [x] 7.2 Create BannerPopup Component
    - Create `frontend/src/components/banners/BannerPopup.tsx`
    - Show popup banner on page load
    - Use sessionStorage to avoid repeat display
    - _Requirements: 8.1-8.4_

  - [x] 7.3 Export banner components
    - Create `frontend/src/components/banners/index.ts`
    - Export BannerDisplay and BannerPopup
    - _Requirements: 8.1_

- [x] 8. Integrate Banners into Public Pages
  - [x] 8.1 Add banners to Home Page
    - Update `frontend/src/app/page.tsx`
    - Add hero_top banner above hero section
    - Add hero_bottom banner below hero section
    - Add footer_above banner before contact section
    - Add popup banner
    - _Requirements: 8.1-8.4_

  - [x] 8.2 Add banners to Cars List Page
    - Update `frontend/src/app/cars/CarsPageClient.tsx`
    - Add sidebar banner
    - Add cars_between banner (between car rows)
    - _Requirements: 8.1-8.4_

  - [x] 8.3 Add banners to Car Details Page
    - Update `frontend/src/app/cars/[id]/CarDetailsClient.tsx`
    - Add car_detail banner
    - _Requirements: 8.1-8.4_

- [x] 9. Checkpoint - Public Display Complete
  - Verify banners display correctly on all pages
  - Test click tracking
  - Test view tracking
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. Frontend Property Tests
  - [x] 10.1 Write property tests for banner filtering
    - **Property 8: Position Filtering**
    - **Property 9: Status Filtering**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 10.2 Write property tests for banner display
    - **Property 14: Response Format Completeness**
    - **Validates: Requirements 4.2**

- [x] 11. Final Checkpoint
  - Run all backend tests (PHPUnit)
  - Run all frontend tests (Vitest)
  - Verify complete flow: create banner → display on page → track clicks/views
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
