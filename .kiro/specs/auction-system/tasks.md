# Implementation Plan: Auction System (نظام المزايدة)

## Overview

تنفيذ نظام المزايدة الكامل عبر Backend (PHP), Frontend (Next.js), و Mobile (Flutter) مع حماية خصوصية المزايدين.

## Tasks

- [x] 1. Database Schema Updates
  - [x] 1.1 Add price_type column to cars table
    - Add ENUM('FIXED', 'AUCTION') column with default 'FIXED'
    - _Requirements: 7.5_
  - [x] 1.2 Create auctions table
    - Fields: id, car_id, starting_price, reserve_price, current_price, min_increment, end_time, status, winner_phone
    - Foreign key to cars table
    - _Requirements: 7.1, 7.3_
  - [x] 1.3 Create bids table
    - Fields: id, auction_id, bidder_name, phone_number, amount, created_at
    - Foreign key to auctions table
    - Indexes for performance
    - _Requirements: 7.2, 7.4_

- [x] 2. PHP API - Core Auction Logic
  - [x] 2.1 Create phone masking utility
    - Function to mask phone: 777123456 → 777***456
    - _Requirements: 5.1, 5.3_
  - [x] 2.2 Write property test for phone masking

    - **Property 2: Phone Number Masking**
    - **Validates: Requirements 5.1, 5.3**
  - [x] 2.3 Create AuctionsController
    - index(), show(), placeBid(), update(), cancel() methods
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 2.4 Implement bid validation logic
    - Validate bidder_name is not empty
    - Validate amount > current_price + min_increment
    - Validate phone number format
    - _Requirements: 4.3, 4.4, 4.5_
  - [x] 2.5 Write property test for bid validation

    - **Property 1: Bid Amount Validation**
    - **Validates: Requirements 4.3, 4.4**
  - [x] 2.6 Add auction routes to router.php
    - Register all auction endpoints
    - _Requirements: 6.1-6.6_

- [x] 3. PHP API - Car Integration
  - [x] 3.1 Update CarsController for price_type
    - Add price_type field to create/update
    - Create auction record when price_type is AUCTION
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 3.2 Implement auction creation validation
    - Validate end_time is in future
    - Validate reserve_price >= starting_price
    - _Requirements: 1.4, 1.5_
  - [x] 3.3 Write property test for auction validation

    - **Property 3: Auction End Time Validation**
    - **Property 4: Reserve Price Validation**
    - **Validates: Requirements 1.4, 1.5**

- [x] 4. Checkpoint - Backend Complete
  - Ensure all API tests pass
  - Test endpoints with Postman

- [x] 5. Frontend (Next.js) - Types and API
  - [x] 5.1 Create auction TypeScript types
    - Auction, Bid, PlaceBidInput interfaces
    - _Requirements: 6.1-6.6_
  - [x] 5.2 Add auction API methods to api.ts
    - getAllAuctions(), getAuctionById(), updateAuction(), cancelAuction()
    - _Requirements: 6.1-6.5_

- [x] 6. Frontend - Admin Panel
  - [x] 6.1 Update car form with price type selector
    - Radio buttons for "مزاد" / "سعر ثابت"
    - Conditional auction fields
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 6.2 Create auctions list page
    - Table with car name, prices, bid count, status, end time
    - Filter by status
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 6.3 Create auction details page
    - Show all bids with masked phones
    - Actions: end early, extend time
    - _Requirements: 2.4, 2.5, 2.6_
  - [x] 6.4 Add auctions navigation item
    - Add "المزادات" to admin sidebar
    - _Requirements: 2.1_

- [x] 7. Checkpoint - Frontend Admin Complete
  - Test auction creation flow
  - Test auction management

- [x] 8. Flutter - Models and API
  - [x] 8.1 Create Auction and Bid models
    - Auction, Bid, AuctionStatus, PriceType
    - fromJson/toJson methods
    - _Requirements: 3.1, 4.1_
  - [x] 8.2 Update Car model with priceType
    - Add PriceType enum and field
    - _Requirements: 1.1_
  - [x] 8.3 Add auction endpoints to api_endpoints.dart
    - /auctions, /auctions/{id}, /auctions/{id}/bids
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 8.4 Create auction repository
    - getAuctions(), getAuctionById(), placeBid()
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 8.5 Create auction provider with Riverpod
    - auctionsProvider, auctionDetailsProvider
    - _Requirements: 3.1, 3.3_

- [x] 9. Flutter - UI Components
  - [x] 9.1 Create AuctionCard widget
    - Car image, name, current price, bid count, countdown timer
    - _Requirements: 3.2_
  - [x] 9.2 Create countdown timer widget
    - Real-time countdown to auction end
    - _Requirements: 3.2, 3.4_
  - [x] 9.3 Create BidForm widget
    - Bidder name input, phone number input, bid amount input, submit button
    - Validation and error display
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  - [x] 9.4 Create BidsList widget
    - Display bids with bidder names, masked phones, and amounts
    - _Requirements: 5.1_

- [x] 10. Flutter - Screens
  - [x] 10.1 Create AuctionsListScreen
    - Grid/list of auction cards
    - Sort by ending soonest
    - _Requirements: 3.1, 3.5_
  - [x] 10.2 Create AuctionDetailsScreen
    - Car details, current price, bid form, bids list
    - _Requirements: 3.2, 4.1_
  - [x] 10.3 Update app navigation
    - Replace tags with "المزادات" tab
    - _Requirements: 3.1, 8.2_
  - [x] 10.4 Update home screen
    - Add auctions section/carousel
    - _Requirements: 3.1_

- [x] 11. Checkpoint - Flutter UI Complete
  - Test auction browsing
  - Test bid placement flow

- [x] 12. Remove Tags System
  - [x] 12.1 Remove tags from admin panel
    - Remove tags management pages
    - Remove tags from car form
    - _Requirements: 8.1_
  - [x] 12.2 Remove tags from Flutter app
    - Remove tags display components
    - Remove tags from models
    - _Requirements: 8.2_
  - [x] 12.3 Remove tags API endpoints
    - Remove or deprecate tags routes
    - _Requirements: 8.3_

- [x] 13. Final Testing and Polish
  - [x] 13.1 End-to-end testing
    - Full auction lifecycle test
    - Bid placement from mobile
  - [x] 13.2 UI/UX polish
    - Arabic RTL support
    - Loading states
    - Error handling

- [x] 14. Final Checkpoint
  - Ensure all tests pass
  - Verify privacy protection
  - Test on real device

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Arabic strings should be added to app_strings.dart
