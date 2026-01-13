# Requirements Document

## Introduction

نظام إدارة البانرات الإعلانية لمعرض السيارات. يتيح هذا النظام للمدير إضافة وإدارة البانرات الإعلانية التي تظهر في مواقع مختلفة من الموقع، مع إمكانية جدولتها زمنياً وتتبع إحصائياتها.

## Glossary

- **Banner_System**: نظام إدارة البانرات الإعلانية الكامل
- **Banner**: إعلان مرئي (صورة) يظهر في موقع محدد من الموقع
- **Admin**: مدير النظام الذي يملك صلاحية إدارة البانرات
- **Visitor**: زائر الموقع الذي يشاهد البانرات
- **Position**: موقع ظهور البانر في الصفحة (hero_top, hero_bottom, sidebar, cars_between, car_detail, footer_above, popup)
- **Schedule**: جدولة زمنية لظهور البانر (تاريخ البداية والنهاية)
- **Click_Count**: عدد النقرات على البانر
- **View_Count**: عدد مرات ظهور البانر

## Requirements

### Requirement 1: إنشاء بانر جديد

**User Story:** As an Admin, I want to create new banners with images and settings, so that I can display advertisements on the website.

#### Acceptance Criteria

1. WHEN an Admin uploads a banner image THEN THE Banner_System SHALL accept images in JPG, PNG, or WebP format with maximum size of 5MB
2. WHEN an Admin creates a banner THEN THE Banner_System SHALL require a title, image, and position
3. WHEN an Admin specifies a link URL THEN THE Banner_System SHALL validate the URL format
4. WHEN an Admin selects a position THEN THE Banner_System SHALL only allow valid positions (hero_top, hero_bottom, sidebar, cars_between, car_detail, footer_above, popup)
5. WHEN a banner is created successfully THEN THE Banner_System SHALL store the banner and return the created banner data
6. IF an Admin uploads an invalid image format THEN THE Banner_System SHALL reject the upload with a descriptive error message

### Requirement 2: تعديل البانر

**User Story:** As an Admin, I want to edit existing banners, so that I can update their content and settings.

#### Acceptance Criteria

1. WHEN an Admin requests to edit a banner THEN THE Banner_System SHALL load the current banner data
2. WHEN an Admin updates banner fields THEN THE Banner_System SHALL validate and save the changes
3. WHEN an Admin uploads a new image for an existing banner THEN THE Banner_System SHALL replace the old image and delete it from storage
4. IF an Admin attempts to edit a non-existent banner THEN THE Banner_System SHALL return a 404 error

### Requirement 3: حذف البانر

**User Story:** As an Admin, I want to delete banners, so that I can remove outdated or unwanted advertisements.

#### Acceptance Criteria

1. WHEN an Admin deletes a banner THEN THE Banner_System SHALL remove the banner record from the database
2. WHEN a banner is deleted THEN THE Banner_System SHALL delete the associated image file from storage
3. IF an Admin attempts to delete a non-existent banner THEN THE Banner_System SHALL return a 404 error

### Requirement 4: عرض قائمة البانرات

**User Story:** As an Admin, I want to view all banners in a list, so that I can manage them efficiently.

#### Acceptance Criteria

1. WHEN an Admin requests the banner list THEN THE Banner_System SHALL return all banners with their details
2. WHEN displaying banners THEN THE Banner_System SHALL include id, title, image_url, position, is_active, start_date, end_date, click_count, and view_count
3. WHEN an Admin filters by position THEN THE Banner_System SHALL return only banners matching that position
4. WHEN an Admin filters by status THEN THE Banner_System SHALL return only active or inactive banners accordingly

### Requirement 5: تفعيل/إلغاء تفعيل البانر

**User Story:** As an Admin, I want to activate or deactivate banners, so that I can control which banners are displayed.

#### Acceptance Criteria

1. WHEN an Admin toggles banner status THEN THE Banner_System SHALL switch is_active between true and false
2. WHEN a banner is deactivated THEN THE Banner_System SHALL stop displaying it to visitors immediately
3. WHEN a banner is activated THEN THE Banner_System SHALL start displaying it according to its schedule

### Requirement 6: جدولة البانر

**User Story:** As an Admin, I want to schedule banners with start and end dates, so that I can plan advertising campaigns.

#### Acceptance Criteria

1. WHEN an Admin sets a start_date THEN THE Banner_System SHALL not display the banner before that date
2. WHEN an Admin sets an end_date THEN THE Banner_System SHALL stop displaying the banner after that date
3. WHILE a banner is within its scheduled period AND is_active is true THEN THE Banner_System SHALL display the banner
4. IF start_date is after end_date THEN THE Banner_System SHALL reject the schedule with an error

### Requirement 7: ترتيب البانرات

**User Story:** As an Admin, I want to set display order for banners in the same position, so that I can prioritize certain advertisements.

#### Acceptance Criteria

1. WHEN multiple banners exist in the same position THEN THE Banner_System SHALL display them according to display_order
2. WHEN an Admin updates display_order THEN THE Banner_System SHALL reorder banners accordingly
3. THE Banner_System SHALL display banners with lower display_order values first

### Requirement 8: عرض البانرات للزوار

**User Story:** As a Visitor, I want to see relevant banners on the website, so that I can discover promotions and offers.

#### Acceptance Criteria

1. WHEN a Visitor loads a page THEN THE Banner_System SHALL return active banners for that page's positions
2. WHEN returning banners THEN THE Banner_System SHALL only include banners where is_active is true AND current time is within schedule
3. WHEN a banner is displayed THEN THE Banner_System SHALL increment its view_count
4. WHEN a Visitor clicks a banner THEN THE Banner_System SHALL increment its click_count and redirect to the link_url

### Requirement 9: دعم الصور المتجاوبة

**User Story:** As an Admin, I want to upload separate mobile images, so that banners display optimally on all devices.

#### Acceptance Criteria

1. WHEN an Admin uploads a banner THEN THE Banner_System SHALL allow an optional mobile image
2. WHEN a mobile device requests a banner THEN THE Banner_System SHALL return the mobile image if available
3. IF no mobile image is provided THEN THE Banner_System SHALL use the main image for all devices

### Requirement 10: إحصائيات البانرات

**User Story:** As an Admin, I want to view banner statistics, so that I can measure advertising effectiveness.

#### Acceptance Criteria

1. WHEN an Admin views banner details THEN THE Banner_System SHALL display click_count and view_count
2. WHEN an Admin requests statistics THEN THE Banner_System SHALL calculate click-through rate (CTR) as click_count/view_count
3. THE Banner_System SHALL track statistics accurately without duplicate counting per session
