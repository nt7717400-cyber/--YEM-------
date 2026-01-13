'use client';

/**
 * InspectionSection Component - قسم الفحص المتكامل
 * Combines all inspection components and manages inspection state
 * Requirements: 2.3, 3.1, 9.1, 9.2, 9.3
 * Updated: Now uses SVGInspectionViewer with ViewAngleTabs and PartDamageForm
 * Updated: Added full i18n support with RTL layout
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BodyTypeSelector } from './BodyTypeSelector';
import { MechanicalStatusForm } from './MechanicalStatusForm';
import { InspectionSummary } from './InspectionSummary';
import { SVGInspectionViewer } from '@/components/inspection/SVGInspectionViewer';
import { ViewAngleTabs } from '@/components/inspection/ViewAngleTabs';
import { PartDamageForm } from '@/components/inspection/PartDamageForm';
import { ColorLegend } from '@/components/inspection/ColorLegend';
import { LanguageSwitcher } from '@/components/inspection/LanguageSwitcher';
import { ALL_BODY_PART_IDS } from '@/constants/inspection';
import { PART_LABELS, ALL_VIEW_ANGLES, getConditionColor, CONDITION_LABELS } from '@/constants/vds';
import { useInspectionI18n } from '@/lib/useInspectionI18n';
import type {
  BodyType,
  BodyPartId,
  PartStatus,
  MechanicalStatus,
  InspectionData,
  TireStatus,
  TirePosition,
} from '@/types/inspection';
import type {
  ViewAngle,
  CarTemplate,
  PartKey,
  PartDamageData,
  PartCondition,
  DamageSeverity,
} from '@/types/vds';

/**
 * InspectionSection Props
 */
export interface InspectionSectionProps {
  value: InspectionData | null;
  onChange: (data: InspectionData) => void;
  disabled?: boolean;
}

/**
 * Default mechanical status
 */
const DEFAULT_MECHANICAL_STATUS: MechanicalStatus = {
  engine: 'original',
  transmission: 'original',
  chassis: 'intact',
  technicalNotes: '',
  tires: {
    front_left: 'new',
    front_right: 'new',
    rear_left: 'new',
    rear_right: 'new',
  },
};

/**
 * Create default parts status with all parts set to 'original'
 */
function createDefaultPartsStatus(): Record<BodyPartId, PartStatus> {
  const partsStatus: Record<BodyPartId, PartStatus> = {} as Record<BodyPartId, PartStatus>;
  ALL_BODY_PART_IDS.forEach((partId) => {
    partsStatus[partId] = 'original';
  });
  return partsStatus;
}

/**
 * Map BodyType to CarTemplate
 */
function bodyTypeToCarTemplate(bodyType: BodyType): CarTemplate {
  const mapping: Record<BodyType, CarTemplate> = {
    sedan: 'sedan',
    hatchback: 'hatchback',
    coupe: 'coupe',
    suv: 'suv',
    crossover: 'suv',
    pickup: 'pickup',
    van: 'van',
    minivan: 'van',
    truck: 'pickup',
  };
  return mapping[bodyType] || 'sedan';
}

/**
 * Map old PartStatus to new PartCondition
 */
function partStatusToCondition(status: PartStatus): PartCondition {
  const mapping: Record<PartStatus, PartCondition> = {
    original: 'good',
    painted: 'painted',
    bodywork: 'bodywork',
    accident: 'broken',
    replaced: 'replaced',
    needs_check: 'not_inspected',
  };
  return mapping[status] || 'not_inspected';
}

/**
 * Map new PartCondition to old PartStatus
 */
function conditionToPartStatus(condition: PartCondition): PartStatus {
  const mapping: Record<PartCondition, PartStatus> = {
    good: 'original',
    scratch: 'painted', // Map scratch to painted as closest equivalent
    painted: 'painted',
    bodywork: 'bodywork',
    broken: 'accident',
    replaced: 'replaced',
    not_inspected: 'needs_check',
  };
  return mapping[condition] || 'needs_check';
}

/**
 * Map BodyPartId to PartKey (handle naming differences)
 */
function bodyPartIdToPartKey(partId: BodyPartId): PartKey | null {
  // Direct mapping for parts that exist in both systems
  const mapping: Record<string, PartKey> = {
    front_bumper: 'front_bumper',
    rear_bumper: 'rear_bumper',
    hood: 'hood',
    roof: 'roof',
    trunk: 'trunk',
    front_left_door: 'left_front_door',
    front_right_door: 'right_front_door',
    rear_left_door: 'left_rear_door',
    rear_right_door: 'right_rear_door',
    front_left_fender: 'left_front_fender',
    front_right_fender: 'right_front_fender',
    rear_left_quarter: 'left_rear_quarter',
    rear_right_quarter: 'right_rear_quarter',
  };
  return mapping[partId] || (partId as PartKey);
}

/**
 * Map PartKey to BodyPartId (reverse mapping)
 * Returns null for parts that are not body parts (headlights, mirrors, etc.)
 */
function partKeyToBodyPartId(partKey: PartKey): BodyPartId | null {
  const mapping: Record<string, BodyPartId> = {
    front_bumper: 'front_bumper',
    rear_bumper: 'rear_bumper',
    hood: 'hood',
    roof: 'roof',
    trunk: 'trunk',
    left_front_door: 'front_left_door',
    right_front_door: 'front_right_door',
    left_rear_door: 'rear_left_door',
    right_rear_door: 'rear_right_door',
    left_front_fender: 'front_left_fender',
    right_front_fender: 'front_right_fender',
    left_rear_quarter: 'rear_left_quarter',
    right_rear_quarter: 'rear_right_quarter',
  };
  return mapping[partKey] || null;
}

/**
 * Check if a part key is a wheel/tire
 */
function isWheelPart(partKey: string): boolean {
  return partKey.includes('wheel') || partKey.includes('tire');
}

/**
 * Map wheel part key to tire position
 */
function wheelPartKeyToTirePosition(partKey: string): TirePosition | null {
  const mapping: Record<string, TirePosition> = {
    'wheel_front_left': 'front_left',
    'wheel_front_right': 'front_right',
    'wheel_rear_left': 'rear_left',
    'wheel_rear_right': 'rear_right',
  };
  return mapping[partKey] || null;
}

/**
 * Map condition to tire status
 */
function conditionToTireStatus(condition: string): TireStatus {
  const mapping: Record<string, TireStatus> = {
    'good': 'new',
    'scratch': 'used_50',
    'painted': 'used_50',
    'bodywork': 'used_50',
    'broken': 'damaged',
    'replaced': 'new',
    'not_inspected': 'new',
  };
  return mapping[condition] || 'new';
}

/**
 * Convert InspectionData bodyParts to VDS partsStatus format
 */
function convertToVDSPartsStatus(
  bodyParts: Record<BodyPartId, PartStatus>,
  damageDetails?: Record<string, { partKey: string; condition: string; severity?: string; notes?: string; photos?: string[]; updatedAt: string }>,
  tiresStatus?: { front_left: TireStatus; front_right: TireStatus; rear_left: TireStatus; rear_right: TireStatus; spare?: TireStatus }
): Record<string, PartDamageData> {
  const vdsStatus: Record<string, PartDamageData> = {};
  
  // Add body parts
  Object.entries(bodyParts).forEach(([partId, status]) => {
    const partKey = bodyPartIdToPartKey(partId as BodyPartId);
    if (partKey) {
      // Check if we have extended damage details
      const detail = damageDetails?.[partKey];
      
      vdsStatus[partKey] = {
        partKey,
        condition: detail?.condition as PartCondition || partStatusToCondition(status),
        severity: detail?.severity as DamageSeverity | undefined,
        notes: detail?.notes,
        photos: detail?.photos,
        updatedAt: detail?.updatedAt || new Date().toISOString(),
      };
    }
  });
  
  // Add tire/wheel parts from tiresStatus
  if (tiresStatus) {
    const tirePositionToPartKey: Record<string, string> = {
      'front_left': 'wheel_front_left',
      'front_right': 'wheel_front_right',
      'rear_left': 'wheel_rear_left',
      'rear_right': 'wheel_rear_right',
    };
    
    const tireStatusToCondition: Record<TireStatus, PartCondition> = {
      'new': 'good',
      'used_50': 'scratch',
      'damaged': 'broken',
    };
    
    Object.entries(tiresStatus).forEach(([position, status]) => {
      if (position === 'spare') return; // Skip spare tire for now
      
      const partKey = tirePositionToPartKey[position];
      if (partKey && status) {
        const detail = damageDetails?.[partKey];
        
        vdsStatus[partKey] = {
          partKey: partKey as PartKey,
          condition: detail?.condition as PartCondition || tireStatusToCondition[status as TireStatus] || 'good',
          severity: detail?.severity as DamageSeverity | undefined,
          notes: detail?.notes,
          photos: detail?.photos,
          updatedAt: detail?.updatedAt || new Date().toISOString(),
        };
      }
    });
  }
  
  // Add extra parts from damageDetails (headlights, mirrors, windshields, etc.)
  if (damageDetails) {
    Object.entries(damageDetails).forEach(([partKey, detail]) => {
      // Skip if already added (body parts or wheels)
      if (vdsStatus[partKey]) return;
      
      vdsStatus[partKey] = {
        partKey: partKey as PartKey,
        condition: detail.condition as PartCondition || 'not_inspected',
        severity: detail.severity as DamageSeverity | undefined,
        notes: detail.notes,
        photos: detail.photos,
        updatedAt: detail.updatedAt || new Date().toISOString(),
      };
    });
  }
  
  return vdsStatus;
}

/**
 * InspectionSection Component
 * Main component that integrates all inspection sub-components
 */
export function InspectionSection({
  value,
  onChange,
  disabled = false,
}: InspectionSectionProps) {
  // i18n hook for translations and RTL support
  const { t, language, setLanguage, direction, isRTL } = useInspectionI18n();
  
  // Current view angle
  const [currentAngle, setCurrentAngle] = React.useState<ViewAngle>('front');
  
  // Selected part for damage form
  const [selectedPart, setSelectedPart] = React.useState<PartKey | null>(null);

  // Initialize default values if value is null
  const inspectionData: InspectionData = value || {
    bodyType: 'sedan',
    bodyParts: createDefaultPartsStatus(),
    mechanical: DEFAULT_MECHANICAL_STATUS,
  };

  // Convert to VDS format for SVG viewer
  const vdsPartsStatus = React.useMemo(
    () => convertToVDSPartsStatus(inspectionData.bodyParts, inspectionData.damageDetails, inspectionData.mechanical.tires),
    [inspectionData.bodyParts, inspectionData.damageDetails, inspectionData.mechanical.tires]
  );

  // Handle body type change
  const handleBodyTypeChange = (bodyType: BodyType) => {
    onChange({
      ...inspectionData,
      bodyType,
    });
  };

  // Handle part click - opens damage form
  const handlePartClick = (partKey: PartKey) => {
    if (!disabled) {
      setSelectedPart(partKey);
    }
  };

  // Handle damage form save
  const handleDamageSave = (data: PartDamageData) => {
    console.log('[InspectionSection] handleDamageSave called with:', data);
    console.log('[InspectionSection] Photos in data:', data.photos);
    console.log('[InspectionSection] Notes in data:', data.notes);
    console.log('[InspectionSection] Current inspectionData:', inspectionData);
    console.log('[InspectionSection] Current mechanical.tires:', inspectionData.mechanical.tires);
    
    // Check if this is a wheel/tire part
    if (isWheelPart(data.partKey)) {
      const tirePosition = wheelPartKeyToTirePosition(data.partKey);
      console.log('[InspectionSection] Wheel part detected, position:', tirePosition);
      console.log('[InspectionSection] data.condition:', data.condition);
      
      if (tirePosition) {
        // Update tires status in mechanical
        const tireStatus = conditionToTireStatus(data.condition);
        console.log('[InspectionSection] Mapped tire status:', tireStatus);
        
        const currentTires = inspectionData.mechanical.tires || {
          front_left: 'new' as TireStatus,
          front_right: 'new' as TireStatus,
          rear_left: 'new' as TireStatus,
          rear_right: 'new' as TireStatus,
        };
        
        console.log('[InspectionSection] Current tires before update:', currentTires);
        
        const newTires = {
          ...currentTires,
          [tirePosition]: tireStatus,
        };
        
        console.log('[InspectionSection] New tires after update:', newTires);
        
        // Save extended damage details (photos, notes, severity)
        const newDamageDetails = {
          ...(inspectionData.damageDetails || {}),
          [data.partKey]: {
            partKey: data.partKey,
            condition: data.condition,
            severity: data.severity,
            notes: data.notes,
            photos: data.photos,
            updatedAt: data.updatedAt || new Date().toISOString(),
          },
        };
        
        const newInspectionData = {
          ...inspectionData,
          mechanical: {
            ...inspectionData.mechanical,
            tires: newTires,
          },
          damageDetails: newDamageDetails,
        };
        
        console.log('[InspectionSection] Calling onChange with new data:', newInspectionData);
        console.log('[InspectionSection] New mechanical.tires:', newInspectionData.mechanical.tires);
        
        onChange(newInspectionData);
        
        setSelectedPart(null);
        return;
      }
    }
    
    const bodyPartId = partKeyToBodyPartId(data.partKey);
    console.log('[InspectionSection] Mapped to bodyPartId:', bodyPartId);
    
    // Save extended damage details (photos, notes, severity) for ALL parts
    const newDamageDetails = {
      ...(inspectionData.damageDetails || {}),
      [data.partKey]: {
        partKey: data.partKey,
        condition: data.condition,
        severity: data.severity,
        notes: data.notes,
        photos: data.photos,
        updatedAt: data.updatedAt || new Date().toISOString(),
      },
    };
    
    console.log('[InspectionSection] New damageDetails:', newDamageDetails);
    
    if (bodyPartId) {
      // This is a body part - update both bodyParts and damageDetails
      const newStatus = conditionToPartStatus(data.condition);
      console.log('[InspectionSection] New status:', newStatus);
      const newPartsStatus = {
        ...inspectionData.bodyParts,
        [bodyPartId]: newStatus,
      };
      
      onChange({
        ...inspectionData,
        bodyParts: newPartsStatus,
        damageDetails: newDamageDetails,
      });
    } else {
      // This is an extra part (headlight, mirror, etc.) - only update damageDetails
      console.log('[InspectionSection] Extra part, saving to damageDetails only');
      onChange({
        ...inspectionData,
        damageDetails: newDamageDetails,
      });
    }
    setSelectedPart(null);
  };

  // Handle damage form cancel
  const handleDamageCancel = () => {
    setSelectedPart(null);
  };

  // Handle damage form delete (reset to original)
  const handleDamageDelete = () => {
    if (selectedPart) {
      const bodyPartId = partKeyToBodyPartId(selectedPart);
      
      // Remove from damageDetails
      const newDamageDetails = { ...(inspectionData.damageDetails || {}) };
      delete newDamageDetails[selectedPart];
      
      if (bodyPartId) {
        // This is a body part - reset to original
        const newPartsStatus = {
          ...inspectionData.bodyParts,
          [bodyPartId]: 'original' as PartStatus,
        };
        onChange({
          ...inspectionData,
          bodyParts: newPartsStatus,
          damageDetails: newDamageDetails,
        });
      } else if (isWheelPart(selectedPart)) {
        // This is a wheel - reset tire status to new
        const tirePosition = wheelPartKeyToTirePosition(selectedPart);
        if (tirePosition) {
          const currentTires = inspectionData.mechanical.tires || {
            front_left: 'new' as TireStatus,
            front_right: 'new' as TireStatus,
            rear_left: 'new' as TireStatus,
            rear_right: 'new' as TireStatus,
          };
          const newTires = {
            ...currentTires,
            [tirePosition]: 'new' as TireStatus,
          };
          onChange({
            ...inspectionData,
            mechanical: {
              ...inspectionData.mechanical,
              tires: newTires,
            },
            damageDetails: newDamageDetails,
          });
        }
      } else {
        // This is an extra part - just remove from damageDetails
        onChange({
          ...inspectionData,
          damageDetails: newDamageDetails,
        });
      }
    }
    setSelectedPart(null);
  };

  // Handle mechanical status change
  const handleMechanicalChange = (mechanical: MechanicalStatus) => {
    onChange({
      ...inspectionData,
      mechanical,
    });
  };

  // Get current data for selected part
  const getSelectedPartData = (): PartDamageData | undefined => {
    if (!selectedPart) return undefined;
    return vdsPartsStatus[selectedPart];
  };

  // Get part label for selected part
  const getSelectedPartLabel = () => {
    if (!selectedPart) return { ar: '', en: '' };
    return PART_LABELS[selectedPart] || { ar: selectedPart, en: selectedPart };
  };

  return (
    <div className="space-y-6" dir={direction} data-testid="inspection-section">
      {/* Language Switcher */}
      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <LanguageSwitcher
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>

      {/* Body Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('bodyTypeSection')}</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyTypeSelector
            value={inspectionData.bodyType}
            onChange={handleBodyTypeChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* SVG Inspection Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('exteriorInspection')}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {t('clickPartToInspect')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Angle Tabs */}
          <ViewAngleTabs
            currentAngle={currentAngle}
            onAngleChange={setCurrentAngle}
            availableAngles={ALL_VIEW_ANGLES}
            language={language}
          />

          {/* SVG Viewer */}
          <div className="w-full h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-300">
            <SVGInspectionViewer
              templateType={bodyTypeToCarTemplate(inspectionData.bodyType)}
              viewAngle={currentAngle}
              partsStatus={vdsPartsStatus}
              onPartClick={handlePartClick}
              readOnly={disabled}
              language={language}
              className="w-full h-full"
            />
          </div>

          {/* Color Legend */}
          <ColorLegend language={language} compact={false} />
        </CardContent>
      </Card>

      {/* Part Damage Form Modal */}
      {selectedPart && (
        <PartDamageForm
          partKey={selectedPart}
          partLabel={getSelectedPartLabel()}
          currentData={getSelectedPartData()}
          onSave={handleDamageSave}
          onCancel={handleDamageCancel}
          onDelete={handleDamageDelete}
          language={language}
        />
      )}

      {/* Mechanical Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('mechanicalStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MechanicalStatusForm
            value={inspectionData.mechanical}
            onChange={handleMechanicalChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Inspection Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inspectionSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <InspectionSummary
            partsStatus={inspectionData.bodyParts}
            mechanical={inspectionData.mechanical}
            showMechanical={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default InspectionSection;
