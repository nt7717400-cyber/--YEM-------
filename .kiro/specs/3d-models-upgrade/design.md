# Design Document: تطوير نظام النماذج ثلاثية الأبعاد

## Overview

تطوير شامل لنظام عرض السيارات ثلاثي الأبعاد مع دعم النماذج الواقعية، تقنيات PBR المتقدمة، وتحسينات الأداء.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    3D Viewer System v2.0                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ModelLoader  │  │ Environment  │  │ Performance  │          │
│  │   Service    │  │   Manager    │  │   Monitor    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼─────────────────▼─────────────────▼───────┐          │
│  │              Car3DViewer Component                │          │
│  │  ┌─────────────────────────────────────────────┐ │          │
│  │  │              Three.js Canvas                 │ │          │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │          │
│  │  │  │  HDRI   │ │ Lights  │ │ Shadows │       │ │          │
│  │  │  │ Environ │ │ System  │ │ System  │       │ │          │
│  │  │  └─────────┘ └─────────┘ └─────────┘       │ │          │
│  │  │                                             │ │          │
│  │  │  ┌─────────────────────────────────────┐   │ │          │
│  │  │  │           Car Model                  │   │ │          │
│  │  │  │  ┌─────────┐  ┌─────────────────┐   │   │ │          │
│  │  │  │  │  Base   │  │ Interactive     │   │   │ │          │
│  │  │  │  │  Body   │  │ Parts (13)      │   │   │ │          │
│  │  │  │  └─────────┘  └─────────────────┘   │   │ │          │
│  │  │  └─────────────────────────────────────┘   │ │          │
│  │  └─────────────────────────────────────────────┘ │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Controls   │  │   UI Layer   │  │   Fallback   │          │
│  │  (Orbit)     │  │  (Labels)    │  │   (2D View)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ModelLoaderService

```typescript
interface ModelLoaderService {
  loadModel(bodyType: BodyType): Promise<THREE.Group>;
  preloadModels(types: BodyType[]): Promise<void>;
  getModelStatus(bodyType: BodyType): ModelStatus;
  clearCache(): void;
}

interface ModelStatus {
  available: boolean;
  loaded: boolean;
  fileSize: number;
  polygonCount: number;
  loadTime: number;
}

interface ModelConfig {
  file: string;
  lod: {
    high: string;
    medium: string;
    low: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}
```

### 2. EnvironmentManager

```typescript
interface EnvironmentManager {
  setPreset(preset: EnvironmentPreset): void;
  setHDRI(url: string): Promise<void>;
  rotateEnvironment(angle: number): void;
  setIntensity(intensity: number): void;
}

type EnvironmentPreset = 
  | 'showroom'   // معرض داخلي
  | 'outdoor'    // خارجي
  | 'studio'     // استوديو
  | 'sunset'     // غروب
  | 'night';     // ليلي
```

### 3. Enhanced Car3DViewer Props

```typescript
interface Car3DViewerProps {
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  onPartClick: (partId: BodyPartId) => void;
  readOnly?: boolean;
  // New props
  environment?: EnvironmentPreset;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  showStats?: boolean;
  enablePostProcessing?: boolean;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}
```

### 4. PBR Material System

```typescript
interface CarPaintMaterial {
  baseColor: string;
  metalness: number;      // 0.8-0.9
  roughness: number;      // 0.1-0.2
  clearcoat: number;      // 1.0
  clearcoatRoughness: number; // 0.1
  envMapIntensity: number;
}

interface MaterialPresets {
  carPaint: CarPaintMaterial;
  glass: GlassMaterial;
  chrome: ChromeMaterial;
  rubber: RubberMaterial;
  plastic: PlasticMaterial;
}
```

## Data Models

### Model Registry (index.json)

```json
{
  "version": "2.0.0",
  "models": {
    "sedan": {
      "name": "سيدان",
      "file": "sedan/sedan.glb",
      "available": true,
      "lod": {
        "high": "sedan/sedan.glb",
        "medium": "sedan/sedan_lod1.glb",
        "low": "sedan/sedan_lod2.glb"
      },
      "dimensions": { "length": 4.8, "width": 1.8, "height": 1.4 }
    }
  },
  "interactiveParts": [...],
  "statusColors": {...}
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Model Loading Fallback
*For any* body type, if the external model file is unavailable, the system SHALL display the procedural model without throwing errors.
**Validates: Requirements 1.2, 1.3**

### Property 2: Material Color Consistency
*For any* part status, the displayed color SHALL exactly match the predefined color in the status configuration.
**Validates: Requirements 3.4**

### Property 3: Performance Threshold
*For any* device and quality setting, the frame rate SHALL not drop below 30 FPS during normal interaction.
**Validates: Requirements 4.4, 7.1**

### Property 4: LOD Selection
*For any* camera distance, the appropriate LOD level SHALL be selected based on predefined thresholds.
**Validates: Requirements 4.1, 4.3**

### Property 5: Touch and Mouse Parity
*For any* interaction (rotate, zoom, click), the behavior SHALL be identical for touch and mouse inputs.
**Validates: Requirements 8.5**

## Error Handling

| Error | Handling |
|-------|----------|
| Model file not found | Use procedural model, log warning |
| WebGL not supported | Show 2D fallback |
| Texture load failed | Use default color |
| Memory exceeded | Reduce quality automatically |
| Network timeout | Show retry button |

## Testing Strategy

### Unit Tests
- Material color mapping
- LOD threshold calculations
- Model registry parsing

### Property Tests
- Fallback behavior consistency
- Performance under load
- Touch/mouse interaction parity

### Integration Tests
- Full model loading cycle
- Environment switching
- Quality setting changes

### E2E Tests
- Complete inspection flow
- Cross-browser compatibility
- Mobile responsiveness
