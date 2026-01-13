# Design Document: نظام فحص السيارات المستعملة بمجسم ثلاثي الأبعاد

## Overview

نظام فحص بصري تفاعلي يتيح للمشرفين توثيق حالة السيارات المستعملة باستخدام مجسم ثلاثي الأبعاد. يتكامل مع نموذج إضافة السيارات الحالي ويضيف طبقة بصرية لتوثيق حالة الهيكل والأجزاء الميكانيكية.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  CarForm.tsx                                                 │
│  ├── BasicInfoCard (existing)                               │
│  ├── InspectionSection (new - conditional on USED)          │
│  │   ├── BodyTypeSelector                                   │
│  │   ├── Car3DViewer (Three.js)                            │
│  │   │   └── BodyPartMesh[] (13 clickable zones)           │
│  │   ├── PartStatusPopup                                    │
│  │   ├── MechanicalStatusForm                               │
│  │   └── InspectionSummary                                  │
│  ├── ImagesCard (existing)                                  │
│  └── VideoCard (existing)                                   │
├─────────────────────────────────────────────────────────────┤
│                      API (PHP)                               │
├─────────────────────────────────────────────────────────────┤
│  CarsController.php (updated)                               │
│  ├── create() - includes inspection data                    │
│  ├── update() - includes inspection data                    │
│  └── getById() - returns inspection data                    │
│                                                              │
│  InspectionController.php (new)                             │
│  ├── getInspection($carId)                                  │
│  ├── saveInspection($carId, $data)                         │
│  └── validateInspection($data)                              │
├─────────────────────────────────────────────────────────────┤
│                    Database (MySQL)                          │
├─────────────────────────────────────────────────────────────┤
│  cars (existing - add body_type column)                     │
│  car_inspection (new)                                        │
│  car_body_parts (new)                                        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. BodyTypeSelector
```typescript
interface BodyTypeSelectorProps {
  value: BodyType | null;
  onChange: (type: BodyType) => void;
  disabled?: boolean;
}

type BodyType = 
  | 'sedan' 
  | 'hatchback' 
  | 'coupe' 
  | 'suv' 
  | 'crossover' 
  | 'pickup' 
  | 'van' 
  | 'minivan' 
  | 'truck';

const BODY_TYPE_LABELS: Record<BodyType, string> = {
  sedan: 'سيدان',
  hatchback: 'هاتشباك',
  coupe: 'كوبيه',
  suv: 'SUV',
  crossover: 'كروس أوفر',
  pickup: 'بيك أب',
  van: 'فان',
  minivan: 'ميني فان',
  truck: 'شاحنة'
};
```

#### 2. Car3DViewer
```typescript
interface Car3DViewerProps {
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  onPartClick: (partId: BodyPartId) => void;
  readOnly?: boolean;
}

type BodyPartId = 
  | 'front_bumper'
  | 'rear_bumper'
  | 'hood'
  | 'roof'
  | 'trunk'
  | 'front_left_door'
  | 'front_right_door'
  | 'rear_left_door'
  | 'rear_right_door'
  | 'front_left_fender'
  | 'front_right_fender'
  | 'rear_left_quarter'
  | 'rear_right_quarter';

const BODY_PART_LABELS: Record<BodyPartId, string> = {
  front_bumper: 'الصدام الأمامي',
  rear_bumper: 'الصدام الخلفي',
  hood: 'الكبوت',
  roof: 'السقف',
  trunk: 'الشنطة',
  front_left_door: 'الباب الأمامي الأيسر',
  front_right_door: 'الباب الأمامي الأيمن',
  rear_left_door: 'الباب الخلفي الأيسر',
  rear_right_door: 'الباب الخلفي الأيمن',
  front_left_fender: 'الرفرف الأمامي الأيسر',
  front_right_fender: 'الرفرف الأمامي الأيمن',
  rear_left_quarter: 'الربع الخلفي الأيسر',
  rear_right_quarter: 'الربع الخلفي الأيمن'
};
```

#### 3. PartStatusPopup
```typescript
interface PartStatusPopupProps {
  partId: BodyPartId;
  currentStatus: PartStatus;
  onStatusSelect: (status: PartStatus) => void;
  onClose: () => void;
}

type PartStatus = 
  | 'original'      // سليم / وكالة
  | 'painted'       // رش
  | 'bodywork'      // سمكرة + رش
  | 'accident'      // حادث
  | 'replaced'      // تم تغيير القطعة
  | 'needs_check';  // يحتاج فحص

const PART_STATUS_CONFIG: Record<PartStatus, { label: string; color: string; icon: string }> = {
  original: { label: 'سليم / وكالة', color: '#22c55e', icon: '✅' },
  painted: { label: 'رش', color: '#eab308', icon: '🎨' },
  bodywork: { label: 'سمكرة + رش', color: '#f97316', icon: '🔧' },
  accident: { label: 'حادث', color: '#ef4444', icon: '💥' },
  replaced: { label: 'تم تغيير القطعة', color: '#3b82f6', icon: '🔄' },
  needs_check: { label: 'يحتاج فحص', color: '#6b7280', icon: '⚠️' }
};
```

#### 4. MechanicalStatusForm
```typescript
interface MechanicalStatusFormProps {
  value: MechanicalStatus;
  onChange: (status: MechanicalStatus) => void;
}

interface MechanicalStatus {
  engine: EngineStatus;
  transmission: TransmissionStatus;
  chassis: ChassisStatus;
  technicalNotes: string;
}

type EngineStatus = 'original' | 'replaced' | 'refurbished';
type TransmissionStatus = 'original' | 'replaced';
type ChassisStatus = 'intact' | 'accident_affected' | 'modified';
```

### API Interfaces

#### InspectionController Endpoints
```
GET    /api/cars/:id/inspection     - Get inspection data
POST   /api/cars/:id/inspection     - Save inspection data
PUT    /api/cars/:id/inspection     - Update inspection data
DELETE /api/cars/:id/inspection     - Delete inspection data
```

#### Request/Response Types
```typescript
interface InspectionData {
  bodyType: BodyType;
  bodyParts: Record<BodyPartId, PartStatus>;
  mechanical: MechanicalStatus;
}

interface SaveInspectionRequest {
  bodyType: BodyType;
  bodyParts: Array<{ partId: BodyPartId; status: PartStatus }>;
  engine: EngineStatus;
  transmission: TransmissionStatus;
  chassis: ChassisStatus;
  technicalNotes?: string;
}
```

## Data Models

### Database Schema Updates

```sql
-- Add body_type to cars table
ALTER TABLE cars ADD COLUMN body_type 
  ENUM('sedan','hatchback','coupe','suv','crossover','pickup','van','minivan','truck') 
  NULL AFTER car_condition;

-- Car inspection table
CREATE TABLE car_inspection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT UNIQUE NOT NULL,
    engine_status ENUM('original','replaced','refurbished') DEFAULT 'original',
    transmission_status ENUM('original','replaced') DEFAULT 'original',
    chassis_status ENUM('intact','accident_affected','modified') DEFAULT 'intact',
    technical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Car body parts status table
CREATE TABLE car_body_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    part_id VARCHAR(30) NOT NULL,
    status ENUM('original','painted','bodywork','accident','replaced','needs_check') DEFAULT 'original',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_car_part (car_id, part_id),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### TypeScript Types (Frontend)

```typescript
// types/inspection.ts
export interface CarInspection {
  id: number;
  carId: number;
  bodyType: BodyType;
  bodyParts: BodyPartStatus[];
  mechanical: MechanicalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BodyPartStatus {
  partId: BodyPartId;
  status: PartStatus;
}

// Extended Car type
export interface CarWithInspection extends Car {
  inspection?: CarInspection;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Condition-based UI visibility
*For any* car form state, when the condition is set to "USED", the inspection section (body type selector, 3D viewer, mechanical status) SHALL be visible, and when condition is "NEW", the inspection section SHALL be hidden.
**Validates: Requirements 1.1, 5.1**

### Property 2: Body type to model mapping
*For any* body type selection, the Car3DViewer SHALL load a model that corresponds exactly to the selected body type identifier.
**Validates: Requirements 1.3**

### Property 3: Used car validation requires body type
*For any* form submission where condition is "USED" and body type is null/undefined, the validation SHALL fail and return an error.
**Validates: Requirements 1.4**

### Property 4: Part status to color mapping
*For any* body part and status combination, the displayed color SHALL match the predefined color in PART_STATUS_CONFIG for that status.
**Validates: Requirements 2.6, 4.3, 4.4**

### Property 5: Part click triggers popup
*For any* clickable body part in the 3D viewer (when not in readOnly mode), clicking the part SHALL set the selectedPart state to that part's ID.
**Validates: Requirements 2.5, 4.1**

### Property 6: Status selection updates state
*For any* part and status selection in the popup, selecting a status SHALL update the partsStatus record for that part to the new status value.
**Validates: Requirements 4.5, 4.6**

### Property 7: Inspection data round-trip
*For any* valid inspection data object, saving it to the database and then retrieving it SHALL return an equivalent inspection data object.
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 8: Inspection data validation
*For any* inspection data with invalid values (unknown body type, unknown part status, unknown mechanical status), the validation function SHALL return false/errors.
**Validates: Requirements 6.4**

### Property 9: Cascade delete
*For any* car with associated inspection data, deleting the car SHALL also delete all associated records in car_inspection and car_body_parts tables.
**Validates: Requirements 6.5**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| 3D model fails to load | Display fallback 2D diagram with clickable zones |
| WebGL not supported | Show warning message with browser upgrade suggestion |
| Invalid inspection data | Display validation errors, prevent submission |
| Network error on save | Show retry option, preserve form state |
| Part click detection fails | Provide dropdown fallback for part selection |

## Testing Strategy

### Unit Tests
- Test PART_STATUS_CONFIG color mapping function
- Test validation functions for inspection data
- Test body type enum values and labels
- Test mechanical status enum values

### Property-Based Tests (using fast-check)
- Property 1: UI visibility based on condition
- Property 3: Validation rejects missing body type for used cars
- Property 4: Color mapping consistency
- Property 7: Round-trip serialization/deserialization
- Property 8: Validation rejects invalid data

### Integration Tests
- Test full inspection save/load cycle
- Test cascade delete behavior
- Test CarForm integration with inspection section

### E2E Tests
- Complete flow: Add used car with inspection → View car details → Edit inspection
- Verify 3D viewer interactions work on different browsers
