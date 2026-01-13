# Requirements Document

## Introduction

تطبيق Flutter مخصص للعملاء لمعرض السيارات. يتيح هذا التطبيق للعملاء تصفح السيارات المتاحة، البحث والفلترة، عرض تفاصيل السيارات، التواصل مع المعرض، ومشاهدة البانرات الإعلانية.

## Glossary

- **Customer_App**: تطبيق Flutter للعملاء
- **Customer**: مستخدم التطبيق الذي يتصفح السيارات
- **Car**: سيارة معروضة للبيع في المعرض
- **Banner**: إعلان مرئي يظهر في التطبيق
- **Showroom_Settings**: إعدادات المعرض (الاسم، العنوان، أرقام التواصل)
- **API_Client**: مكون للتواصل مع الـ Backend API
- **Car_Filter**: فلاتر البحث عن السيارات (الماركة، الحالة، السعر، السنة)

## Requirements

### Requirement 1: عرض قائمة السيارات

**User Story:** As a Customer, I want to browse available cars, so that I can find cars that interest me.

#### Acceptance Criteria

1. WHEN the Customer opens the app THEN THE Customer_App SHALL display a list of available cars
2. WHEN displaying cars THEN THE Customer_App SHALL show car image, name, brand, model, year, price, and condition for each car
3. WHEN a car is marked as featured THEN THE Customer_App SHALL display a "مميزة" badge on the car card
4. WHEN loading cars THEN THE Customer_App SHALL show a loading indicator
5. IF the API request fails THEN THE Customer_App SHALL display an error message with retry option
6. WHEN the car list is empty THEN THE Customer_App SHALL display "لا توجد سيارات متاحة حالياً"

### Requirement 2: البحث والفلترة

**User Story:** As a Customer, I want to search and filter cars, so that I can find specific cars quickly.

#### Acceptance Criteria

1. WHEN a Customer enters a search term THEN THE Customer_App SHALL filter cars by name, brand, or model
2. WHEN a Customer selects a brand filter THEN THE Customer_App SHALL show only cars of that brand
3. WHEN a Customer selects a condition filter (جديدة/مستعملة) THEN THE Customer_App SHALL show only cars matching that condition
4. WHEN a Customer sets a price range THEN THE Customer_App SHALL show only cars within that range
5. WHEN a Customer selects a year THEN THE Customer_App SHALL show only cars of that year
6. WHEN a Customer applies multiple filters THEN THE Customer_App SHALL apply all filters together (AND logic)
7. WHEN a Customer clears filters THEN THE Customer_App SHALL show all available cars

### Requirement 3: عرض تفاصيل السيارة

**User Story:** As a Customer, I want to view car details, so that I can learn more about a specific car.

#### Acceptance Criteria

1. WHEN a Customer taps on a car THEN THE Customer_App SHALL navigate to the car details screen
2. WHEN displaying car details THEN THE Customer_App SHALL show all images in a gallery/carousel
3. WHEN displaying car details THEN THE Customer_App SHALL show name, brand, model, year, price, condition, origin, kilometers, description, and specifications
4. WHEN a car has a video THEN THE Customer_App SHALL display a video player
5. WHEN a car is used and has inspection data THEN THE Customer_App SHALL display the inspection information
6. WHEN viewing car details THEN THE Customer_App SHALL increment the view count via API
7. WHEN a Customer taps share THEN THE Customer_App SHALL allow sharing car details via system share sheet

### Requirement 4: التواصل مع المعرض

**User Story:** As a Customer, I want to contact the showroom, so that I can inquire about cars.

#### Acceptance Criteria

1. WHEN a Customer taps "واتساب" button THEN THE Customer_App SHALL open WhatsApp with the showroom number and pre-filled message about the car
2. WHEN a Customer taps "اتصال" button THEN THE Customer_App SHALL initiate a phone call to the showroom
3. WHEN displaying contact options THEN THE Customer_App SHALL use the phone and WhatsApp numbers from showroom settings
4. IF WhatsApp is not installed THEN THE Customer_App SHALL show an appropriate message

### Requirement 5: عرض البانرات الإعلانية

**User Story:** As a Customer, I want to see promotional banners, so that I can discover offers and promotions.

#### Acceptance Criteria

1. WHEN the Customer opens the home screen THEN THE Customer_App SHALL display active banners
2. WHEN a banner is displayed THEN THE Customer_App SHALL track the view via API
3. WHEN a Customer taps a banner with a link THEN THE Customer_App SHALL open the link and track the click
4. WHEN displaying banners THEN THE Customer_App SHALL only show banners within their scheduled dates

### Requirement 6: عرض معلومات المعرض

**User Story:** As a Customer, I want to view showroom information, so that I can know more about the showroom.

#### Acceptance Criteria

1. WHEN a Customer navigates to the about/settings screen THEN THE Customer_App SHALL display showroom name, description, address, phone, WhatsApp, and working hours
2. WHEN showroom has map coordinates THEN THE Customer_App SHALL display a map or link to maps app
3. WHEN a Customer taps on the address THEN THE Customer_App SHALL open the location in maps app

### Requirement 7: السيارات المميزة

**User Story:** As a Customer, I want to see featured cars prominently, so that I can discover highlighted vehicles.

#### Acceptance Criteria

1. WHEN the Customer opens the home screen THEN THE Customer_App SHALL display featured cars in a prominent section
2. WHEN displaying featured cars THEN THE Customer_App SHALL show them in a horizontal scrollable list
3. WHEN there are no featured cars THEN THE Customer_App SHALL hide the featured section

### Requirement 8: دعم اللغة العربية

**User Story:** As a Customer, I want the app in Arabic, so that I can use it comfortably.

#### Acceptance Criteria

1. THE Customer_App SHALL display all text in Arabic
2. THE Customer_App SHALL use RTL (Right-to-Left) layout direction
3. THE Customer_App SHALL format numbers and currency in Arabic format (YER)

### Requirement 9: التصميم والأداء

**User Story:** As a Customer, I want a smooth and attractive app experience, so that I can browse cars comfortably.

#### Acceptance Criteria

1. THE Customer_App SHALL use a consistent design theme matching the web platform
2. THE Customer_App SHALL cache images for better performance
3. THE Customer_App SHALL support pull-to-refresh on list screens
4. THE Customer_App SHALL handle offline state gracefully with appropriate messages
5. THE Customer_App SHALL support both light and dark themes

### Requirement 10: قائمة الماركات

**User Story:** As a Customer, I want to browse cars by brand, so that I can find cars from my preferred manufacturer.

#### Acceptance Criteria

1. WHEN a Customer opens the brands screen THEN THE Customer_App SHALL display all available brands
2. WHEN a Customer taps on a brand THEN THE Customer_App SHALL show all cars of that brand
3. WHEN displaying brands THEN THE Customer_App SHALL show the count of available cars per brand

