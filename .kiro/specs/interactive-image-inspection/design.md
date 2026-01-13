# Design Document: نظام فحص المركبات التفاعلي (VDS)

## Overview

نظام فحص المركبات (Vehicle Damage System - VDS) هو نظام متكامل يعتمد على رسومات SVG ثنائية الأبعاد للتفاعل مع أجزاء السيارة وتوثيق الأضرار. يعمل على Flutter والويب بنفس الكفاءة مع دعم لوحة تحكم إدارية وتوليد تقارير PDF احترافية.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VDS Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Flutter    │    │     Web      │    │    Admin     │      │
│  │  Mobile App  │    │   Frontend   │    │  Dashboard   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │   Shared SVG    │                          │
│                    │   Components    │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │    PHP API      │                          │
│                    │   (Backend)     │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │     MySQL       │                          │
│                    │   Database      │                          │
│                    └─────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. SVG Inspection Viewer Component

```typescript
// Web Component Interface (React/Next.js)
interface SVGInspectionViewerProps {
  templateType: CarTemplate;
  viewAngle: ViewAngle;
  partsStatus: Record<PartKey, PartDamageData>;
  onPartClick: (partKey: PartKey) => void;
  onPartHover?: (partKey: PartKey | null) => void;
  readOnly?: boolean;
  language?: 'ar' | 'en';
  showLegend?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}

// View Angles
type ViewAngle = 'front' | 'rear' | 'left_side' | 'right_side' | 'top';

// Car Templates
type CarTemplate = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'van';
```

```dart
// Flutter Component Interface
class SVGInspectionViewer extends StatefulWidget {
  final CarTemplate templateType;
  final ViewAngle viewAngle;
  final Map<PartKey, PartDamageData> partsStatus;
  final Function(PartKey) onPartClick;
  final Function(PartKey?)? onPartHover;
  final bool readOnly;
  final String language;
  final bool showLegend;
  final bool enableZoom;
  final bool enablePan;
}
```

### 2. Part Damage Input Form

```typescript
interface PartDamageFormProps {
  partKey: PartKey;
  partLabel: { ar: string; en: string };
  currentData?: PartDamageData;
  onSave: (data: PartDamageData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

interface PartDamageData {
  partKey: PartKey;
  condition: PartCondition;
  severity?: DamageSeverity;
  notes?: string;
  photos?: string[]; // URLs or base64
  updatedAt: string;
}

type PartCondition = 'good' | 'scratch' | 'bodywork' | 'broken' | 'painted' | 'replaced';
type DamageSeverity = 'light' | 'medium' | 'severe';
```

### 3. Admin Template Manager

```typescript
interface TemplateManagerProps {
  templates: CarTemplateConfig[];
  onTemplateCreate: (template: CarTemplateConfig) => void;
  onTemplateUpdate: (id: string, template: CarTemplateConfig) => void;
  onTemplateDelete: (id: string) => void;
}

interface CarTemplateConfig {
  id: string;
  name: { ar: string; en: string };
  type: CarTemplate;
  isActive: boolean;
  isDefault: boolean;
  svgFiles: {
    front: string;    // SVG content or URL
    rear: string;
    left_side: string;
    right_side: string;
    top?: string;
  };
  partMappings: PartMapping[];
  createdAt: string;
  updatedAt: string;
}

interface PartMapping {
  partKey: PartKey;
  svgElementId: string;
  viewAngles: ViewAngle[];
  isVisible: boolean;
}
```

### 4. PDF Report Generator

```typescript
interface PDFReportGeneratorProps {
  inspection: InspectionData;
  options: PDFReportOptions;
}

interface PDFReportOptions {
  language: 'ar' | 'en';
  includeSections: {
    vehicleInfo: boolean;
    customerInfo: boolean;
    inspectorInfo: boolean;
    diagrams: boolean;
    damageTable: boolean;
    photos: boolean;
  };
  paperSize: 'A4' | 'Letter';
  companyLogo?: string;
  companyName?: string;
}
```

## Data Models

### Database Schema

```sql
-- Car Templates Table
CREATE TABLE car_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    type ENUM('sedan','suv','hatchback','coupe','pickup','van') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    svg_front TEXT NOT NULL,
    svg_rear TEXT NOT NULL,
    svg_left_side TEXT NOT NULL,
    svg_right_side TEXT NOT NULL,
    svg_top TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Part Keys Dictionary
CREATE TABLE part_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_key VARCHAR(50) UNIQUE NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    category ENUM('front','rear','left','right','top','wheels') NOT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_part_key (part_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Template Part Mappings
CREATE TABLE template_part_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    part_key VARCHAR(50) NOT NULL,
    svg_element_id VARCHAR(100) NOT NULL,
    view_angles JSON NOT NULL, -- ["front", "left_side"]
    is_visible TINYINT(1) DEFAULT 1,
    
    FOREIGN KEY (template_id) REFERENCES car_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (part_key) REFERENCES part_keys(part_key) ON DELETE CASCADE,
    UNIQUE KEY unique_template_part (template_id, part_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inspections Table
CREATE TABLE inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NULL,
    template_id INT NOT NULL,
    
    -- Vehicle Info (can be standalone or linked to car)
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INT,
    vehicle_vin VARCHAR(50),
    vehicle_plate VARCHAR(20),
    vehicle_color VARCHAR(30),
    vehicle_mileage INT,
    
    -- Customer Info
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    
    -- Inspector Info
    inspector_id INT NULL,
    inspector_name VARCHAR(100),
    
    -- Status
    status ENUM('draft','finalized') DEFAULT 'draft',
    finalized_at TIMESTAMP NULL,
    
    -- Notes
    general_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES car_templates(id),
    INDEX idx_status (status),
    INDEX idx_car_id (car_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inspection Parts (Damage Records)
CREATE TABLE inspection_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    part_key VARCHAR(50) NOT NULL,
    condition ENUM('good','scratch','bodywork','broken','painted','replaced') NOT NULL,
    severity ENUM('light','medium','severe') NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inspection_part (inspection_id, part_key),
    INDEX idx_condition (condition)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inspection Part Photos
CREATE TABLE inspection_part_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_part_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_part_id) REFERENCES inspection_parts(id) ON DELETE CASCADE,
    INDEX idx_inspection_part (inspection_part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Color Mapping Configuration
CREATE TABLE color_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    condition ENUM('good','scratch','bodywork','broken','painted','replaced','not_inspected') NOT NULL UNIQUE,
    color_hex VARCHAR(7) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_en VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default color mappings
INSERT INTO color_mappings (condition, color_hex, label_ar, label_en, sort_order) VALUES
('good', '#22c55e', 'سليم', 'Good', 1),
('scratch', '#eab308', 'خدش', 'Scratch', 2),
('bodywork', '#f97316', 'سمكرة', 'Bodywork', 3),
('broken', '#ef4444', 'كسر', 'Broken', 4),
('painted', '#3b82f6', 'رش', 'Painted', 5),
('replaced', '#8b5cf6', 'تغيير', 'Replaced', 6),
('not_inspected', '#9ca3af', 'غير محدد', 'Not Inspected', 7);

-- Insert default part keys
INSERT INTO part_keys (part_key, label_ar, label_en, category, sort_order) VALUES
-- Front
('front_bumper', 'الصدام الأمامي', 'Front Bumper', 'front', 1),
('hood', 'الكبوت', 'Hood', 'front', 2),
('front_grille', 'الشبك الأمامي', 'Front Grille', 'front', 3),
('headlight_left', 'المصباح الأمامي الأيسر', 'Left Headlight', 'front', 4),
('headlight_right', 'المصباح الأمامي الأيمن', 'Right Headlight', 'front', 5),
('front_windshield', 'الزجاج الأمامي', 'Front Windshield', 'front', 6),
-- Rear
('rear_bumper', 'الصدام الخلفي', 'Rear Bumper', 'rear', 1),
('trunk', 'الشنطة', 'Trunk', 'rear', 2),
('taillight_left', 'المصباح الخلفي الأيسر', 'Left Taillight', 'rear', 3),
('taillight_right', 'المصباح الخلفي الأيمن', 'Right Taillight', 'rear', 4),
('rear_windshield', 'الزجاج الخلفي', 'Rear Windshield', 'rear', 5),
-- Left Side
('left_front_door', 'الباب الأمامي الأيسر', 'Left Front Door', 'left', 1),
('left_rear_door', 'الباب الخلفي الأيسر', 'Left Rear Door', 'left', 2),
('left_front_fender', 'الرفرف الأمامي الأيسر', 'Left Front Fender', 'left', 3),
('left_rear_quarter', 'الربع الخلفي الأيسر', 'Left Rear Quarter', 'left', 4),
('left_mirror', 'المرآة اليسرى', 'Left Mirror', 'left', 5),
('left_front_window', 'النافذة الأمامية اليسرى', 'Left Front Window', 'left', 6),
('left_rear_window', 'النافذة الخلفية اليسرى', 'Left Rear Window', 'left', 7),
-- Right Side
('right_front_door', 'الباب الأمامي الأيمن', 'Right Front Door', 'right', 1),
('right_rear_door', 'الباب الخلفي الأيمن', 'Right Rear Door', 'right', 2),
('right_front_fender', 'الرفرف الأمامي الأيمن', 'Right Front Fender', 'right', 3),
('right_rear_quarter', 'الربع الخلفي الأيمن', 'Right Rear Quarter', 'right', 4),
('right_mirror', 'المرآة اليمنى', 'Right Mirror', 'right', 5),
('right_front_window', 'النافذة الأمامية اليمنى', 'Right Front Window', 'right', 6),
('right_rear_window', 'النافذة الخلفية اليمنى', 'Right Rear Window', 'right', 7),
-- Top
('roof', 'السقف', 'Roof', 'top', 1),
('sunroof', 'الفتحة السقفية', 'Sunroof', 'top', 2),
-- Wheels
('wheel_front_left', 'العجلة الأمامية اليسرى', 'Front Left Wheel', 'wheels', 1),
('wheel_front_right', 'العجلة الأمامية اليمنى', 'Front Right Wheel', 'wheels', 2),
('wheel_rear_left', 'العجلة الخلفية اليسرى', 'Rear Left Wheel', 'wheels', 3),
('wheel_rear_right', 'العجلة الخلفية اليمنى', 'Rear Right Wheel', 'wheels', 4);
```

### JSON Data Structure

```json
{
  "inspection": {
    "id": 1,
    "templateType": "sedan",
    "status": "draft",
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "vin": "1HGBH41JXMN109186",
      "plate": "أ ب ج 1234",
      "color": "أبيض",
      "mileage": 45000
    },
    "customer": {
      "name": "أحمد محمد",
      "phone": "+967777123456",
      "email": "ahmed@example.com"
    },
    "inspector": {
      "id": 1,
      "name": "محمد علي"
    },
    "parts": [
      {
        "partKey": "front_bumper",
        "condition": "scratch",
        "severity": "light",
        "notes": "خدش بسيط في الجانب الأيمن",
        "photos": ["/uploads/inspections/1/front_bumper_1.jpg"]
      },
      {
        "partKey": "hood",
        "condition": "good",
        "severity": null,
        "notes": null,
        "photos": []
      }
    ],
    "generalNotes": "السيارة بحالة جيدة بشكل عام",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T11:45:00Z",
    "finalizedAt": null
  }
}
```

## Error Handling

### Error Types

```typescript
enum VDSErrorType {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  INVALID_SVG_FORMAT = 'INVALID_SVG_FORMAT',
  PART_KEY_NOT_FOUND = 'PART_KEY_NOT_FOUND',
  INSPECTION_LOCKED = 'INSPECTION_LOCKED',
  PHOTO_UPLOAD_FAILED = 'PHOTO_UPLOAD_FAILED',
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

interface VDSError {
  type: VDSErrorType;
  message: string;
  details?: Record<string, unknown>;
}
```

### Error Handling Strategy

1. **Template Errors**: Fall back to default Sedan template if requested template not found
2. **SVG Errors**: Display placeholder with error message if SVG fails to load
3. **Network Errors**: Cache inspection data locally, sync when connection restored
4. **Validation Errors**: Show inline validation messages in forms
5. **PDF Errors**: Retry generation, show error with retry button

## Testing Strategy

### Unit Tests
- Part key dictionary validation
- Color mapping consistency
- Data model serialization/deserialization
- SVG path ID extraction

### Property-Based Tests
- SVG viewer renders all parts for any template
- Part status changes reflect correct colors
- PDF generation includes all required sections

### Integration Tests
- Full inspection workflow (create → edit → finalize)
- Template CRUD operations
- Photo upload and retrieval
- PDF generation with various data combinations



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Template SVG Completeness

*For any* Car_Template type, loading the template SHALL provide valid SVG content for all 4 primary view angles (front, rear, left_side, right_side), and each SVG SHALL contain path elements with IDs matching the template's part mappings.

**Validates: Requirements 1.1, 1.3, 2.1, 6.2**

### Property 2: Part Status Persistence Across Views

*For any* inspection with recorded part statuses, switching between view angles SHALL preserve all part status data, and returning to a previously viewed angle SHALL display the same statuses.

**Validates: Requirements 1.2**

### Property 3: Color Mapping Consistency

*For any* Part_Condition value, the Color_Mapping SHALL return a valid hex color, and applying that condition to a Part_Region SHALL result in the region being rendered with that exact color.

**Validates: Requirements 2.4, 3.2, 4.1**

### Property 4: Part Keys Dictionary Completeness

*For any* Part_Key in the dictionary, there SHALL exist both Arabic and English labels, and the key SHALL be a valid identifier (lowercase, underscores only).

**Validates: Requirements 5.1, 5.4**

### Property 5: Template Part Visibility

*For any* Car_Template, parts that are not applicable (not in partMappings or isVisible=false) SHALL NOT be rendered as interactive regions in the SVG viewer.

**Validates: Requirements 5.2, 6.3**

### Property 6: Inspection Data Schema Validation

*For any* inspection data object, serializing to JSON and deserializing back SHALL produce an equivalent object, and all required fields SHALL be present and valid.

**Validates: Requirements 8.1, 8.2**

### Property 7: Finalized Inspection Immutability

*For any* inspection with status='finalized', attempting to modify part statuses, notes, or photos SHALL be rejected, and the inspection data SHALL remain unchanged.

**Validates: Requirements 8.3**

### Property 8: PDF Report Content Completeness

*For any* inspection data with at least one damaged part, generating a PDF report SHALL include: vehicle information section, at least one SVG diagram with colors, color legend, and damage table with all recorded damages.

**Validates: Requirements 7.1, 16.1**

### Property 9: Template CRUD Validation

*For any* new Car_Template creation, the system SHALL validate that: name (ar/en) is provided, type is valid enum, and at least front/rear/left_side/right_side SVG content is provided.

**Validates: Requirements 14.1, 14.2**

### Property 10: Bilingual Label Availability

*For any* Part_Key and any Color_Mapping condition, both Arabic (ar) and English (en) labels SHALL be available and non-empty.

**Validates: Requirements 5.4, 9.1, 9.5**

