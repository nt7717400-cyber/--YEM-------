# Requirements Document

## Introduction

نظام فحص بصري تفاعلي للسيارات المستعملة داخل لوحة تحكم الإدارة، يتيح عرض السيارة كمجسم ثلاثي الأبعاد وتحديد حالة كل جزء من أجزاء الهيكل والحالة الميكانيكية بدقة عالية.

## Glossary

- **Car_3D_Viewer**: مكون عرض المجسم ثلاثي الأبعاد التفاعلي
- **Body_Part**: جزء من هيكل السيارة الخارجي (باب، صدام، كبوت، إلخ)
- **Part_Status**: حالة الجزء (سليم، رش، سمكرة، حادث، تم التغيير، يحتاج فحص)
- **Body_Type**: نوع هيكل السيارة (سيدان، هاتشباك، SUV، إلخ)
- **Inspection_Data**: البيانات المنظمة لنتائج الفحص
- **Mechanical_Status**: حالة الأجزاء الميكانيكية (المكينة، القير، الشاصي)
- **Admin_Panel**: لوحة تحكم الإدارة

## Requirements

### Requirement 1: اختيار نوع هيكل السيارة

**User Story:** As an admin, I want to select the car body type when adding a used car, so that the correct 3D model is displayed for inspection.

#### Acceptance Criteria

1. WHEN an admin selects "USED" as car condition, THE Admin_Panel SHALL display a body type selection dropdown
2. THE Body_Type selector SHALL include options: سيدان، هاتشباك، كوبيه، SUV، كروس أوفر، بيك أب، فان، ميني فان، شاحنة
3. WHEN a body type is selected, THE Car_3D_Viewer SHALL load the corresponding 3D model
4. IF no body type is selected for a used car, THEN THE Admin_Panel SHALL prevent form submission and display an error message

### Requirement 2: عرض المجسم ثلاثي الأبعاد

**User Story:** As an admin, I want to view an interactive 3D car model, so that I can visually inspect and mark each part's condition.

#### Acceptance Criteria

1. THE Car_3D_Viewer SHALL render a complete 3D model of the selected body type
2. THE Car_3D_Viewer SHALL support 360-degree rotation via mouse drag or touch gestures
3. THE Car_3D_Viewer SHALL support zoom in/out via scroll wheel or pinch gestures
4. THE Car_3D_Viewer SHALL highlight body parts on hover with a distinct color
5. WHEN a body part is clicked, THE Car_3D_Viewer SHALL open a status selection popup
6. THE Car_3D_Viewer SHALL display each body part with a color corresponding to its current status

### Requirement 3: تقسيم المجسم إلى مناطق تفاعلية

**User Story:** As an admin, I want the 3D model divided into clickable zones, so that I can select and inspect each part individually.

#### Acceptance Criteria

1. THE Car_3D_Viewer SHALL divide the model into 13 distinct clickable zones
2. THE clickable zones SHALL include: الصدام الأمامي، الصدام الخلفي، الكبوت، السقف، الشنطة، الباب الأمامي الأيسر، الباب الأمامي الأيمن، الباب الخلفي الأيسر، الباب الخلفي الأيمن، الرفرف الأمامي الأيسر، الرفرف الأمامي الأيمن، الربع الخلفي الأيسر، الربع الخلفي الأيمن
3. WHEN hovering over a zone, THE Car_3D_Viewer SHALL display the zone name in Arabic
4. THE Car_3D_Viewer SHALL ensure each zone is independently selectable without overlap

### Requirement 4: تحديد حالة كل جزء

**User Story:** As an admin, I want to set the condition status for each body part, so that I can accurately document the car's physical state.

#### Acceptance Criteria

1. WHEN a body part is clicked, THE Admin_Panel SHALL display a status selection popup
2. THE status options SHALL include: سليم/وكالة، رش، سمكرة + رش، حادث، تم تغيير القطعة، يحتاج فحص
3. WHEN a status is selected, THE Body_Part SHALL change color to match the status
4. THE color mapping SHALL be: سليم=أخضر، رش=أصفر، سمكرة+رش=برتقالي، حادث=أحمر، تم التغيير=أزرق، يحتاج فحص=رمادي
5. THE Admin_Panel SHALL persist the selected status in the form state
6. THE Admin_Panel SHALL allow changing a part's status at any time before submission

### Requirement 5: الحالة الميكانيكية

**User Story:** As an admin, I want to document the mechanical condition of the car, so that buyers have complete information about engine, transmission, and chassis.

#### Acceptance Criteria

1. WHILE car condition is "USED", THE Admin_Panel SHALL display a mechanical status section
2. THE mechanical status section SHALL include engine status with options: أصلية، تم تغييرها، مجددة
3. THE mechanical status section SHALL include transmission status with options: أصلي، تم تغييره
4. THE mechanical status section SHALL include chassis status with options: سليم، متأثر بحادث، معدل
5. THE mechanical status section SHALL include a technical notes text field
6. IF mechanical status is incomplete for a used car, THEN THE Admin_Panel SHALL display a warning but allow submission

### Requirement 6: حفظ واسترجاع بيانات الفحص

**User Story:** As an admin, I want inspection data to be saved and retrieved with the car record, so that the information persists and can be edited later.

#### Acceptance Criteria

1. WHEN a car is saved, THE System SHALL store all inspection data in the database
2. WHEN editing an existing used car, THE Admin_Panel SHALL load and display the saved inspection data
3. THE Inspection_Data SHALL be stored in a structured JSON format
4. THE System SHALL validate inspection data before saving
5. WHEN a car is deleted, THE System SHALL cascade delete the associated inspection data

### Requirement 7: عرض بيانات الفحص للعملاء

**User Story:** As a customer, I want to view the car inspection results visually, so that I can understand the car's condition before purchasing.

#### Acceptance Criteria

1. WHEN viewing a used car details page, THE System SHALL display the 3D inspection viewer in read-only mode
2. THE customer view SHALL show all body parts with their status colors
3. THE customer view SHALL display a legend explaining each color/status
4. THE customer view SHALL show the mechanical status summary
5. THE customer view SHALL allow rotating and zooming the 3D model

### Requirement 8: تجربة المستخدم والواجهة

**User Story:** As an admin, I want an intuitive and easy-to-use interface, so that I can complete inspections quickly and accurately.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display clear icons for each status option
2. THE Admin_Panel SHALL use distinct colors that are easily distinguishable
3. THE Admin_Panel SHALL provide undo functionality for status changes
4. THE Admin_Panel SHALL show a summary of all parts and their statuses
5. THE inspection section SHALL be mandatory for used cars and optional for new cars
6. THE Admin_Panel SHALL be responsive and work on tablet devices
