# Requirements Document

## Introduction

نظام المزايدة (Auction System) هو ميزة جديدة تتيح للمستخدمين المزايدة على السيارات بدلاً من الشراء بسعر ثابت. يتضمن النظام إدارة المزادات من لوحة التحكم، عرض المزادات في تطبيق Flutter، وحماية خصوصية بيانات المزايدين.

## Glossary

- **Auction_System**: نظام المزايدة الكامل الذي يدير عمليات المزاد
- **Bid**: عرض سعر من مزايد على سيارة معينة
- **Bidder**: المستخدم الذي يقدم عرض سعر في المزاد
- **Starting_Price**: السعر الابتدائي للمزاد
- **Current_Price**: أعلى سعر حالي في المزاد
- **Reserve_Price**: السعر الأدنى المقبول (اختياري)
- **Auction_End_Time**: وقت انتهاء المزاد
- **Price_Type**: نوع التسعير (مزاد أو سعر ثابت)
- **Masked_Phone**: رقم الهاتف المخفي جزئياً (مثل: 777***456)

## Requirements

### Requirement 1: نوع التسعير عند إضافة سيارة

**User Story:** As an admin, I want to choose between auction or fixed price when adding a car, so that I can offer different selling methods.

#### Acceptance Criteria

1. WHEN an admin creates a new car, THE Admin_Panel SHALL display a price type selector with options "مزاد" (Auction) and "سعر ثابت" (Fixed Price)
2. WHEN "سعر ثابت" is selected, THE Admin_Panel SHALL show the standard price input field
3. WHEN "مزاد" is selected, THE Admin_Panel SHALL show auction-specific fields: starting price, reserve price (optional), and end date/time
4. THE Auction_System SHALL validate that auction end time is in the future
5. THE Auction_System SHALL validate that reserve price is greater than or equal to starting price

### Requirement 2: إدارة المزادات في لوحة التحكم

**User Story:** As an admin, I want to manage auctions from the admin panel, so that I can monitor and control active auctions.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a dedicated "المزادات" section in the navigation
2. WHEN viewing auctions list, THE Admin_Panel SHALL show: car name, starting price, current price, bid count, end time, and status
3. THE Admin_Panel SHALL allow filtering auctions by status (active, ended, cancelled)
4. WHEN an admin views auction details, THE Admin_Panel SHALL display all bids with masked bidder phone numbers
5. THE Admin_Panel SHALL allow ending an auction early
6. THE Admin_Panel SHALL allow extending auction end time

### Requirement 3: عرض المزادات في تطبيق Flutter

**User Story:** As a customer, I want to see auctions in the mobile app, so that I can participate in bidding.

#### Acceptance Criteria

1. THE Flutter_App SHALL display an "المزادات" tab or section replacing the current tags system
2. WHEN viewing auction cars, THE Flutter_App SHALL show: car image, name, current price, bid count, and countdown timer
3. THE Flutter_App SHALL update auction data in real-time or with periodic refresh
4. WHEN an auction ends, THE Flutter_App SHALL display "انتهى المزاد" status
5. THE Flutter_App SHALL sort auctions by ending soonest first

### Requirement 4: تقديم عروض المزايدة

**User Story:** As a customer, I want to place bids on auction cars, so that I can try to win the car.

#### Acceptance Criteria

1. WHEN viewing an auction car, THE Flutter_App SHALL display a "قدم عرضك" (Place Bid) button
2. WHEN placing a bid, THE Flutter_App SHALL require: bidder name, phone number, and bid amount
3. THE Auction_System SHALL validate that bidder name is not empty
4. THE Auction_System SHALL validate that bid amount is higher than current price
5. THE Auction_System SHALL validate that bid amount meets minimum increment (configurable)
6. WHEN a bid is placed successfully, THE Auction_System SHALL update the current price
7. IF a bid is invalid, THEN THE Auction_System SHALL display appropriate error message

### Requirement 5: حماية خصوصية المزايدين

**User Story:** As a bidder, I want my phone number to be partially hidden, so that my privacy is protected.

#### Acceptance Criteria

1. WHEN displaying bidder information, THE Auction_System SHALL mask phone numbers showing only first 3 and last 3 digits (e.g., 777***456)
2. THE Admin_Panel SHALL show full phone numbers only to authenticated admins
3. THE API SHALL never expose full phone numbers in public endpoints
4. WHEN a bid is placed, THE Auction_System SHALL store the full phone number securely

### Requirement 6: API للمزادات

**User Story:** As a developer, I want auction API endpoints, so that the frontend and mobile app can interact with the auction system.

#### Acceptance Criteria

1. THE API SHALL provide GET /auctions endpoint to list active auctions
2. THE API SHALL provide GET /auctions/{id} endpoint to get auction details with bids
3. THE API SHALL provide POST /auctions/{id}/bids endpoint to place a bid
4. THE API SHALL provide PUT /auctions/{id} endpoint for admin to update auction (authenticated)
5. THE API SHALL provide DELETE /auctions/{id} endpoint for admin to cancel auction (authenticated)
6. WHEN returning bid data, THE API SHALL mask phone numbers for non-admin requests

### Requirement 7: قاعدة البيانات

**User Story:** As a system, I want to store auction and bid data, so that the auction system functions correctly.

#### Acceptance Criteria

1. THE Database SHALL have an auctions table with: car_id, starting_price, reserve_price, current_price, end_time, status
2. THE Database SHALL have a bids table with: auction_id, phone_number, amount, created_at
3. THE Database SHALL enforce foreign key relationship between auctions and cars
4. THE Database SHALL enforce foreign key relationship between bids and auctions
5. THE Cars table SHALL have a price_type column with values 'FIXED' or 'AUCTION'

### Requirement 8: إزالة نظام العلامات

**User Story:** As an admin, I want the tags system removed, so that it's replaced by the auction section.

#### Acceptance Criteria

1. THE Admin_Panel SHALL remove the tags management section
2. THE Flutter_App SHALL remove the tags display and replace with auctions section
3. THE API SHALL deprecate or remove tags-related endpoints
4. THE Database migration SHALL handle existing tags data appropriately
