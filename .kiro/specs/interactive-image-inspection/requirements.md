# Requirements Document

## Introduction

نظام فحص المركبات (Vehicle Damage System - VDS) هو نظام فحص تفاعلي ثنائي الأبعاد يعتمد على رسومات Vector (SVG) لهيكل السيارة الخارجي. يعمل على تطبيق Flutter والويب بنفس الكفاءة، ويتيح للفاحص تحديد الأضرار وتوثيقها بشكل احترافي مع إمكانية إنشاء تقارير PDF.

## Glossary

- **VDS**: Vehicle Damage System - نظام فحص المركبات
- **Inspection_Viewer**: مكون عرض الفحص التفاعلي ثنائي الأبعاد
- **SVG_Template**: قالب رسم متجه للسيارة من زاوية معينة
- **View_Angle**: زاوية العرض (Right Side, Left Side, Front, Rear, Top)
- **Part_Region**: منطقة تفاعلية على الرسم تمثل جزء من السيارة
- **Part_Key**: معرف فريد وثابت للجزء (مثل: front_bumper, hood, roof)
- **Part_Condition**: حالة الجزء (سليم، خدش، سمكرة، كسر، رش، تغيير)
- **Damage_Severity**: شدة الضرر (خفيف، متوسط، شديد)
- **Car_Template**: قالب شكل السيارة (Sedan, SUV, Hatchback, Coupe, Pickup, Van)
- **Inspection_Report**: تقرير الفحص الكامل
- **Color_Mapping**: خريطة الألوان الموحدة لحالات الأجزاء
- **Inspector**: الفاحص الذي يقوم بعملية الفحص
- **Finalize**: قفل التقرير بعد الاعتماد النهائي

## Requirements

### Requirement 1: واجهات الفحص ثنائية الأبعاد متعددة الزوايا

**User Story:** As an Inspector, I want to view the car from multiple angles, so that I can inspect all exterior parts comprehensively.

#### Acceptance Criteria

1. WHEN displaying the inspection viewer THEN THE Inspection_Viewer SHALL show SVG diagrams from 4 primary angles: Right Side, Left Side, Front, Rear
2. WHEN the user switches between view angles THEN THE Inspection_Viewer SHALL maintain all part statuses across views
3. WHEN displaying a view angle THEN THE Inspection_Viewer SHALL show all relevant parts for that angle as interactive regions
4. THE Inspection_Viewer SHALL support adding Top view angle in future updates
5. WHEN loading a view THEN THE Inspection_Viewer SHALL render the SVG within 200ms
6. WHEN displaying views THEN THE Inspection_Viewer SHALL provide clear navigation tabs/buttons for switching angles

### Requirement 2: مناطق تفاعلية للأجزاء (SVG Regions)

**User Story:** As an Inspector, I want each car part to be a clickable region, so that I can select and inspect individual parts.

#### Acceptance Criteria

1. WHEN displaying an SVG diagram THEN THE Part_Region SHALL be defined as separate SVG paths with unique IDs matching Part_Keys
2. WHEN the user hovers over a Part_Region THEN THE Inspection_Viewer SHALL highlight the region with a visual indicator (border/glow)
3. WHEN the user clicks/taps a Part_Region THEN THE Inspection_Viewer SHALL open the damage input form for that part
4. WHEN a Part_Region has damage recorded THEN THE Inspection_Viewer SHALL display the region with the corresponding status color
5. WHEN displaying Part_Regions THEN THE Inspection_Viewer SHALL show part labels on hover/tap (Arabic and English)
6. THE Part_Region SHALL support both mouse click (web) and touch tap (mobile/tablet)

### Requirement 3: نموذج إدخال بيانات الضرر

**User Story:** As an Inspector, I want to record detailed damage information for each part, so that I can create comprehensive inspection reports.

#### Acceptance Criteria

1. WHEN the user selects a part THEN THE VDS SHALL display a damage input form with the following fields:
   - Part_Condition: dropdown (سليم/خدش/سمكرة/كسر/رش/تغيير)
   - Damage_Severity: dropdown (خفيف/متوسط/شديد) - shown only when condition is not "سليم"
   - Notes: text area for additional observations
   - Photos: optional image upload (multiple images allowed)
2. WHEN the user saves the damage form THEN THE VDS SHALL update the part color immediately on the SVG
3. WHEN the user cancels the form THEN THE VDS SHALL close the form without saving changes
4. WHEN editing an existing damage record THEN THE VDS SHALL pre-populate the form with saved data
5. WHEN uploading photos THEN THE VDS SHALL support camera capture (mobile) and file selection (web)
6. WHEN uploading photos THEN THE VDS SHALL compress images to max 1MB each

### Requirement 4: نظام الألوان الموحد (Color Mapping)

**User Story:** As an Inspector, I want consistent color coding for damage conditions, so that reports are easy to understand.

#### Acceptance Criteria

1. THE Color_Mapping SHALL use the following colors for Part_Condition:
   - سليم (Good): #22c55e (Green)
   - خدش (Scratch): #eab308 (Yellow)
   - سمكرة (Bodywork): #f97316 (Orange)
   - كسر (Broken): #ef4444 (Red)
   - رش (Painted): #3b82f6 (Blue)
   - تغيير (Replaced): #8b5cf6 (Purple)
   - غير محدد (Not Inspected): #9ca3af (Gray)
2. WHEN displaying the inspection viewer THEN THE VDS SHALL show a color legend explaining each status
3. WHEN a part status changes THEN THE Part_Region color SHALL update immediately with smooth transition
4. THE Color_Mapping SHALL be consistent across Flutter app and Web platform

### Requirement 5: قاموس الأجزاء الموحد (Part Keys Dictionary)

**User Story:** As a Developer, I want a standardized parts dictionary, so that data is consistent across all templates and platforms.

#### Acceptance Criteria

1. THE VDS SHALL define a fixed set of Part_Keys for all exterior body parts:
   - Front: front_bumper, hood, front_grille, headlight_left, headlight_right, front_windshield
   - Rear: rear_bumper, trunk, taillight_left, taillight_right, rear_windshield
   - Left Side: left_front_door, left_rear_door, left_front_fender, left_rear_quarter, left_mirror, left_front_window, left_rear_window
   - Right Side: right_front_door, right_rear_door, right_front_fender, right_rear_quarter, right_mirror, right_front_window, right_rear_window
   - Top: roof, sunroof (optional)
   - Wheels: wheel_front_left, wheel_front_right, wheel_rear_left, wheel_rear_right
2. WHEN a Part_Key is not applicable for a Car_Template THEN THE Part_Region SHALL be hidden or disabled
3. THE Part_Keys SHALL be identical across Flutter and Web platforms
4. THE VDS SHALL provide Arabic and English labels for each Part_Key

### Requirement 6: قوالب أشكال السيارات (Car Templates)

**User Story:** As an Inspector, I want different car shape templates, so that the inspection diagram matches the actual vehicle type.

#### Acceptance Criteria

1. THE VDS SHALL support the following Car_Templates: Sedan, SUV, Hatchback, Coupe, Pickup, Van
2. WHEN selecting a Car_Template THEN THE Inspection_Viewer SHALL load the appropriate SVG diagrams for all view angles
3. WHEN a Car_Template does not have a specific part THEN THE Part_Region SHALL be hidden (e.g., Pickup has no trunk)
4. THE Car_Template system SHALL be extensible to add new templates without code changes
5. WHEN a Car_Template is not available THEN THE VDS SHALL fall back to Sedan template
6. EACH Car_Template SHALL maintain the same Part_Keys where applicable

### Requirement 7: تقرير الفحص PDF

**User Story:** As an Inspector, I want to generate professional PDF reports, so that I can share inspection results with clients.

#### Acceptance Criteria

1. WHEN generating a PDF report THEN THE VDS SHALL include:
   - Cover page with inspection title and date
   - General information page (vehicle data, client info, inspector info, date/time)
   - SVG diagrams for each view angle with damage colors and legend
   - Detailed damage table (Part, Condition, Severity, Notes, Photo count)
   - Optional: Damage photos pages
2. WHEN generating PDF THEN THE VDS SHALL support both Arabic and English languages
3. WHEN generating PDF THEN THE VDS SHALL use a professional corporate design style
4. THE PDF generation SHALL work identically on Flutter and Web platforms
5. WHEN generating PDF THEN THE VDS SHALL allow the user to select which sections to include
6. THE PDF file size SHALL not exceed 10MB for reports with up to 20 photos

### Requirement 8: هيكل البيانات والتخزين (Data Schema)

**User Story:** As a Developer, I want a clear data structure, so that inspection data can be stored and synced easily.

#### Acceptance Criteria

1. THE VDS SHALL output inspection data in JSON format with the following structure:
   - inspection_id: unique identifier
   - vehicle_info: {plate, vin, make, model, year, color, mileage}
   - client_info: {name, phone, email}
   - inspector_info: {name, id}
   - template_type: Car_Template enum
   - inspection_date: ISO timestamp
   - parts: array of {part_key, condition, severity, notes, photos[]}
   - status: (draft/finalized)
   - finalized_at: ISO timestamp (when finalized)
2. WHEN saving inspection THEN THE VDS SHALL validate all required fields
3. WHEN inspection is finalized THEN THE VDS SHALL lock the report from further edits
4. THE VDS SHALL provide API endpoints for: create, read, update, delete, finalize inspections
5. WHEN syncing data THEN THE VDS SHALL handle offline scenarios gracefully (Flutter)

### Requirement 9: دعم اللغة العربية والإنجليزية

**User Story:** As a User, I want the system in Arabic and English, so that I can use it in my preferred language.

#### Acceptance Criteria

1. THE VDS SHALL support full Arabic interface with RTL layout
2. THE VDS SHALL support full English interface with LTR layout
3. WHEN switching language THEN THE VDS SHALL update all labels, buttons, and messages
4. THE PDF reports SHALL support Arabic text rendering correctly
5. THE Part labels SHALL be available in both Arabic and English
6. THE VDS SHALL remember the user's language preference

### Requirement 10: التوافق مع Flutter والويب

**User Story:** As a User, I want the same experience on mobile and web, so that I can use either platform seamlessly.

#### Acceptance Criteria

1. THE Inspection_Viewer SHALL render identically on Flutter and Web
2. THE SVG interactions SHALL work smoothly on both platforms (60fps)
3. THE PDF generation SHALL produce identical output on both platforms
4. THE data format SHALL be compatible between Flutter and Web
5. WHEN using touch devices THEN THE VDS SHALL support pinch-to-zoom and pan gestures
6. WHEN using desktop THEN THE VDS SHALL support mouse wheel zoom and drag pan

### Requirement 11: إزالة نظام الفحص ثلاثي الأبعاد

**User Story:** As a Developer, I want to remove the 3D inspection system, so that the codebase is cleaner and lighter.

#### Acceptance Criteria

1. WHEN removing 3D components THEN THE VDS SHALL remove Car3DViewer and related Three.js components
2. WHEN removing 3D components THEN THE VDS SHALL remove Three.js, @react-three/fiber, @react-three/drei dependencies
3. WHEN removing 3D components THEN THE VDS SHALL preserve existing inspection data types and API compatibility
4. WHEN removing 3D components THEN THE VDS SHALL update InspectionSection to use new 2D viewer
5. THE removal SHALL not affect other parts of the application

### Requirement 12: الأداء والتحسين

**User Story:** As a User, I want fast and smooth interactions, so that I can complete inspections efficiently.

#### Acceptance Criteria

1. WHEN loading the inspection viewer THEN THE VDS SHALL complete initial render within 500ms
2. WHEN switching view angles THEN THE transition SHALL complete within 200ms
3. WHEN updating part colors THEN THE change SHALL be visible within 100ms
4. THE SVG files SHALL be optimized to under 50KB each
5. WHEN generating PDF THEN THE process SHALL complete within 5 seconds for standard reports
6. THE VDS SHALL maintain 60fps during interactions on mid-range devices

### Requirement 13: لوحة التحكم الإدارية (Admin Dashboard)

**User Story:** As an Admin, I want a dashboard to manage inspection templates and parts, so that I can customize the system without code changes.

#### Acceptance Criteria

1. WHEN accessing the admin dashboard THEN THE Admin SHALL see a templates management section
2. WHEN managing templates THEN THE Admin SHALL be able to:
   - View all existing Car_Templates (Sedan, SUV, Hatchback, etc.)
   - Add new Car_Template with custom SVG files for each view angle
   - Edit existing template SVG files and part mappings
   - Enable/disable templates
   - Set default template
3. WHEN managing parts THEN THE Admin SHALL be able to:
   - View the master Part_Keys dictionary
   - Add new Part_Key with Arabic and English labels
   - Edit part labels and descriptions
   - Map parts to specific regions in SVG templates
   - Set which parts are applicable for each template
4. WHEN managing color mapping THEN THE Admin SHALL be able to:
   - View current Part_Condition colors
   - Modify colors for each condition
   - Preview color changes before saving
5. WHEN uploading SVG templates THEN THE Admin Dashboard SHALL validate SVG structure and part IDs
6. THE Admin Dashboard SHALL provide a visual SVG editor to define clickable regions

### Requirement 14: إدارة قوالب السيارات (Template Management)

**User Story:** As an Admin, I want to easily add new car templates, so that the system supports more vehicle types.

#### Acceptance Criteria

1. WHEN adding a new template THEN THE Admin SHALL provide:
   - Template name (Arabic and English)
   - Template type/category
   - SVG files for each view angle (Front, Rear, Left, Right)
   - Part mapping configuration (which Part_Keys are visible)
2. WHEN uploading SVG THEN THE Admin Dashboard SHALL:
   - Validate SVG format and structure
   - Auto-detect path elements with IDs
   - Allow manual mapping of paths to Part_Keys
   - Preview the template with sample colors
3. WHEN editing a template THEN THE Admin SHALL be able to:
   - Replace SVG files
   - Modify part mappings
   - Test interactions before publishing
4. WHEN deleting a template THEN THE VDS SHALL prevent deletion if inspections exist using that template
5. THE template system SHALL support importing/exporting templates as JSON packages

### Requirement 15: واجهة الفحص للعميل (Customer Inspection View)

**User Story:** As a Customer, I want to view and interact with car inspection results, so that I can understand the vehicle condition.

#### Acceptance Criteria

1. WHEN viewing inspection in Flutter app THEN THE Customer SHALL see:
   - Interactive 2D car diagrams from all angles
   - Color-coded parts showing damage status
   - Ability to tap parts to see damage details
   - Color legend explaining each status
2. WHEN viewing inspection on Web THEN THE Customer SHALL have the same interactive experience
3. WHEN tapping/clicking a part THEN THE Customer SHALL see:
   - Part name (Arabic/English)
   - Damage condition and severity
   - Inspector notes
   - Attached photos (if any)
4. WHEN viewing inspection THEN THE Customer SHALL be able to:
   - Switch between view angles easily
   - Zoom in/out on diagrams
   - Pan/drag to navigate zoomed view
5. WHEN inspection is in read-only mode THEN THE Customer SHALL NOT be able to modify any data

### Requirement 16: توليد تقرير PDF للعميل

**User Story:** As a Customer, I want to generate and print a professional PDF report, so that I can have a physical record of the inspection.

#### Acceptance Criteria

1. WHEN clicking "Generate Report" THEN THE VDS SHALL create a PDF containing:
   - Header with company logo and report title
   - Vehicle information section (make, model, year, VIN, plate, color, mileage)
   - Customer and inspector information
   - Inspection date and time
   - 2D diagrams for each view angle with damage colors
   - Color legend
   - Detailed damage table (Part, Condition, Severity, Notes)
   - Damage photos section (if photos exist)
   - Footer with page numbers and generation timestamp
2. WHEN generating PDF THEN THE VDS SHALL support:
   - Arabic language with proper RTL rendering
   - English language with LTR rendering
   - Mixed Arabic/English content
3. WHEN generating PDF THEN THE Customer SHALL be able to:
   - Preview before downloading
   - Choose which sections to include
   - Select paper size (A4, Letter)
4. WHEN PDF is generated THEN THE Customer SHALL be able to:
   - Download the file
   - Print directly from browser/app
   - Share via email or messaging apps (mobile)
5. THE PDF design SHALL be professional and corporate-styled with consistent branding

### Requirement 17: سير عمل الفحص (Inspection Workflow)

**User Story:** As an Inspector, I want a clear workflow for conducting inspections, so that I can work efficiently and consistently.

#### Acceptance Criteria

1. WHEN starting a new inspection THEN THE Inspector SHALL:
   - Select or create vehicle record
   - Choose appropriate Car_Template
   - Enter customer information (optional)
2. WHEN conducting inspection THEN THE Inspector SHALL:
   - Navigate through view angles systematically
   - Click parts to record damage
   - Add photos for damaged parts
   - Add general notes
3. WHEN completing inspection THEN THE Inspector SHALL:
   - Review all recorded damages
   - Make final adjustments
   - Save as draft or finalize
4. WHEN inspection is finalized THEN THE VDS SHALL:
   - Lock the inspection from further edits
   - Record finalization timestamp
   - Allow PDF generation
5. WHEN inspection is in draft status THEN THE Inspector SHALL be able to:
   - Continue editing at any time
   - Delete the inspection
   - Share preview link (optional)

