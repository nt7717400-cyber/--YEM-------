/// Property-Based Tests for VDS Inspection Data Schema
/// Feature: interactive-image-inspection, Property 6: Inspection Data Schema Validation
/// **Validates: Requirements 8.1, 8.2**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/inspection.dart';

/// Custom generators for VDS Inspection model types
extension InspectionGenerators on Any {
  /// Generate a valid ViewAngle
  Generator<ViewAngle> get viewAngle => choose(ViewAngle.values);

  /// Generate a valid CarTemplateType
  Generator<CarTemplateType> get carTemplateType =>
      choose(CarTemplateType.values);

  /// Generate a valid VDSPartCondition
  Generator<VDSPartCondition> get partCondition =>
      choose(VDSPartCondition.values);

  /// Generate a valid DamageSeverity
  Generator<DamageSeverity> get damageSeverity =>
      choose(DamageSeverity.values);

  /// Generate a valid VDSPartKey
  Generator<VDSPartKey> get partKey => choose(VDSPartKey.values);

  /// Generate a valid InspectionStatus
  Generator<InspectionStatus> get inspectionStatus =>
      choose(InspectionStatus.values);

  /// Generate a valid PartCategory
  Generator<PartCategory> get partCategory => choose(PartCategory.values);

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 100000);

  /// Generate a valid year
  Generator<int> get validYear => intInRange(1990, 2030);

  /// Generate a valid mileage
  Generator<int> get validMileage => intInRange(0, 500000);
}

void main() {
  group('VDS Inspection Data Schema Property Tests', () {
    /// Property 6: Inspection Data Schema Validation - Round Trip
    /// *For any* inspection data object, serializing to JSON and deserializing back
    /// SHALL produce an equivalent object, and all required fields SHALL be present and valid.

    Glados2(any.boundedId, any.carTemplateType).test(
      'Property 6: VDSInspection JSON round-trip preserves all required fields',
      (id, templateType) {
        final now = DateTime.now();
        final inspection = VDSInspection(
          id: id,
          templateId: id + 1,
          templateType: templateType,
          vehicle: const VehicleInfo(
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            vin: '1HGBH41JXMN109186',
            plate: 'ABC123',
            color: 'White',
            mileage: 50000,
          ),
          customer: const CustomerInfo(
            name: 'Test Customer',
            phone: '+967777123456',
            email: 'test@example.com',
          ),
          inspector: const InspectorInfo(
            id: 1,
            name: 'Test Inspector',
          ),
          parts: [],
          status: InspectionStatus.draft,
          createdAt: now,
          updatedAt: now,
        );

        // Serialize to JSON
        final json = inspection.toJson();

        // Deserialize back
        final restored = VDSInspection.fromJson(json);

        // Verify all required fields are preserved
        expect(restored.id, equals(inspection.id));
        expect(restored.templateId, equals(inspection.templateId));
        expect(restored.templateType, equals(inspection.templateType));
        expect(restored.status, equals(inspection.status));
        expect(restored.vehicle.make, equals(inspection.vehicle.make));
        expect(restored.vehicle.model, equals(inspection.vehicle.model));
        expect(restored.customer.name, equals(inspection.customer.name));
        expect(restored.inspector.name, equals(inspection.inspector.name));
      },
    );

    Glados2(any.partCondition, any.damageSeverity).test(
      'Property 6: PartDamageData JSON round-trip preserves condition and severity',
      (condition, severity) {
        final partData = PartDamageData(
          partKey: 'front_bumper',
          condition: condition,
          severity: condition.requiresSeverity ? severity : null,
          notes: 'Test notes',
          photos: ['photo1.jpg', 'photo2.jpg'],
          updatedAt: DateTime.now(),
        );

        final json = partData.toJson();
        final restored = PartDamageData.fromJson(json);

        expect(restored.partKey, equals(partData.partKey));
        expect(restored.condition, equals(partData.condition));
        if (condition.requiresSeverity) {
          expect(restored.severity, equals(severity));
        }
        expect(restored.notes, equals(partData.notes));
        expect(restored.photos.length, equals(partData.photos.length));
      },
    );

    Glados(any.partKey).test(
      'Property 6: PartDamageData with any part key round-trips correctly',
      (partKey) {
        final partData = PartDamageData(
          partKey: partKey.value,
          condition: VDSPartCondition.scratch,
          severity: DamageSeverity.light,
          notes: 'Damage on ${partKey.value}',
          photos: [],
          updatedAt: DateTime.now(),
        );

        final json = partData.toJson();
        final restored = PartDamageData.fromJson(json);

        expect(restored.partKey, equals(partKey.value));
        expect(restored.condition, equals(VDSPartCondition.scratch));
        expect(restored.severity, equals(DamageSeverity.light));
      },
    );

    Glados(any.inspectionStatus).test(
      'Property 6: VDSInspection status preserved in round-trip',
      (status) {
        final now = DateTime.now();
        final inspection = VDSInspection(
          id: 1,
          templateId: 1,
          templateType: CarTemplateType.sedan,
          vehicle: const VehicleInfo(),
          customer: const CustomerInfo(),
          inspector: const InspectorInfo(),
          parts: [],
          status: status,
          createdAt: now,
          updatedAt: now,
          finalizedAt: status == InspectionStatus.finalized ? now : null,
        );

        final json = inspection.toJson();
        final restored = VDSInspection.fromJson(json);

        expect(restored.status, equals(status));
        expect(restored.isFinalized, equals(status == InspectionStatus.finalized));
      },
    );
  });

  group('VehicleInfo Model Property Tests', () {
    Glados2(any.validYear, any.validMileage).test(
      'Property 6: VehicleInfo JSON round-trip preserves year and mileage',
      (year, mileage) {
        final vehicleInfo = VehicleInfo(
          make: 'Honda',
          model: 'Civic',
          year: year,
          vin: 'TESTVIN123456789',
          plate: 'XYZ789',
          color: 'Blue',
          mileage: mileage,
        );

        final json = vehicleInfo.toJson();
        final restored = VehicleInfo.fromJson(json);

        expect(restored.make, equals(vehicleInfo.make));
        expect(restored.model, equals(vehicleInfo.model));
        expect(restored.year, equals(year));
        expect(restored.mileage, equals(mileage));
        expect(restored.vin, equals(vehicleInfo.vin));
        expect(restored.plate, equals(vehicleInfo.plate));
        expect(restored.color, equals(vehicleInfo.color));
      },
    );
  });

  group('CustomerInfo Model Property Tests', () {
    Glados(any.boundedId).test(
      'Property 6: CustomerInfo JSON round-trip preserves all fields',
      (seed) {
        final customerInfo = CustomerInfo(
          name: 'Customer $seed',
          phone: '+967${seed % 1000000000}',
          email: 'customer$seed@example.com',
        );

        final json = customerInfo.toJson();
        final restored = CustomerInfo.fromJson(json);

        expect(restored.name, equals(customerInfo.name));
        expect(restored.phone, equals(customerInfo.phone));
        expect(restored.email, equals(customerInfo.email));
      },
    );
  });

  group('InspectorInfo Model Property Tests', () {
    Glados(any.boundedId).test(
      'Property 6: InspectorInfo JSON round-trip preserves all fields',
      (id) {
        final inspectorInfo = InspectorInfo(
          id: id,
          name: 'Inspector $id',
        );

        final json = inspectorInfo.toJson();
        final restored = InspectorInfo.fromJson(json);

        expect(restored.id, equals(id));
        expect(restored.name, equals(inspectorInfo.name));
      },
    );
  });

  group('ColorMappingEntry Model Property Tests', () {
    Glados(any.partCondition).test(
      'Property 6: ColorMappingEntry JSON round-trip preserves condition',
      (condition) {
        final entry = ColorMappingEntry(
          condition: condition,
          colorHex: '#ff0000',
          labelAr: 'تسمية عربية',
          labelEn: 'English Label',
          sortOrder: 1,
        );

        final json = entry.toJson();
        final restored = ColorMappingEntry.fromJson(json);

        expect(restored.condition, equals(condition));
        expect(restored.colorHex, equals(entry.colorHex));
        expect(restored.labelAr, equals(entry.labelAr));
        expect(restored.labelEn, equals(entry.labelEn));
      },
    );
  });

  group('VDSPartKeyData Model Property Tests', () {
    Glados2(any.boundedId, any.partCategory).test(
      'Property 6: VDSPartKeyData JSON round-trip preserves all fields',
      (id, category) {
        final partKeyData = VDSPartKeyData(
          id: id,
          partKey: 'test_part_$id',
          labelAr: 'جزء اختبار',
          labelEn: 'Test Part',
          category: category,
          sortOrder: id % 100,
          isActive: true,
          createdAt: DateTime.now(),
        );

        final json = partKeyData.toJson();
        final restored = VDSPartKeyData.fromJson(json);

        expect(restored.id, equals(id));
        expect(restored.partKey, equals(partKeyData.partKey));
        expect(restored.labelAr, equals(partKeyData.labelAr));
        expect(restored.labelEn, equals(partKeyData.labelEn));
        expect(restored.category, equals(category));
        expect(restored.sortOrder, equals(partKeyData.sortOrder));
        expect(restored.isActive, equals(true));
      },
    );
  });

  group('VDSTemplate Model Property Tests', () {
    Glados2(any.boundedId, any.carTemplateType).test(
      'Property 6: VDSTemplate JSON round-trip preserves all fields',
      (id, type) {
        final now = DateTime.now();
        final template = VDSTemplate(
          id: id,
          nameAr: 'قالب اختبار',
          nameEn: 'Test Template',
          type: type,
          isActive: true,
          isDefault: id % 2 == 0,
          createdAt: now,
          updatedAt: now,
        );

        final json = template.toJson();
        final restored = VDSTemplate.fromJson(json);

        expect(restored.id, equals(id));
        expect(restored.nameAr, equals(template.nameAr));
        expect(restored.nameEn, equals(template.nameEn));
        expect(restored.type, equals(type));
        expect(restored.isActive, equals(true));
        expect(restored.isDefault, equals(id % 2 == 0));
      },
    );
  });

  group('VDSPartMapping Model Property Tests', () {
    Glados(any.viewAngle).test(
      'Property 6: VDSPartMapping JSON round-trip preserves view angles',
      (viewAngle) {
        final mapping = VDSPartMapping(
          partKey: 'front_bumper',
          svgElementId: 'front_bumper_path',
          viewAngles: [viewAngle],
          isVisible: true,
          labelAr: 'الصدام الأمامي',
          labelEn: 'Front Bumper',
          category: 'front',
        );

        final json = mapping.toJson();
        final restored = VDSPartMapping.fromJson(json);

        expect(restored.partKey, equals(mapping.partKey));
        expect(restored.svgElementId, equals(mapping.svgElementId));
        expect(restored.viewAngles.length, equals(1));
        expect(restored.viewAngles.first, equals(viewAngle));
        expect(restored.isVisible, equals(true));
      },
    );
  });

  group('VDSInspection with Parts Property Tests', () {
    Glados(any.boundedId).test(
      'Property 6: VDSInspection with multiple parts round-trips correctly',
      (id) {
        final now = DateTime.now();
        final parts = [
          const PartDamageData(
            partKey: 'front_bumper',
            condition: VDSPartCondition.scratch,
            severity: DamageSeverity.light,
            notes: 'Minor scratch',
            photos: ['photo1.jpg'],
          ),
          const PartDamageData(
            partKey: 'hood',
            condition: VDSPartCondition.good,
            notes: null,
            photos: [],
          ),
          const PartDamageData(
            partKey: 'left_front_door',
            condition: VDSPartCondition.bodywork,
            severity: DamageSeverity.medium,
            notes: 'Dent repaired',
            photos: ['photo2.jpg', 'photo3.jpg'],
          ),
        ];

        final inspection = VDSInspection(
          id: id,
          templateId: 1,
          templateType: CarTemplateType.sedan,
          vehicle: const VehicleInfo(make: 'Toyota', model: 'Camry'),
          customer: const CustomerInfo(name: 'Test'),
          inspector: const InspectorInfo(name: 'Inspector'),
          parts: parts,
          generalNotes: 'General inspection notes',
          status: InspectionStatus.draft,
          createdAt: now,
          updatedAt: now,
        );

        final json = inspection.toJson();
        final restored = VDSInspection.fromJson(json);

        // Verify parts count
        expect(restored.parts.length, equals(parts.length));

        // Verify each part is preserved
        for (var i = 0; i < parts.length; i++) {
          expect(restored.parts[i].partKey, equals(parts[i].partKey));
          expect(restored.parts[i].condition, equals(parts[i].condition));
          expect(restored.parts[i].severity, equals(parts[i].severity));
          expect(restored.parts[i].notes, equals(parts[i].notes));
          expect(restored.parts[i].photos.length, equals(parts[i].photos.length));
        }

        // Verify helper methods work correctly
        expect(restored.damagedPartsCount, equals(2)); // scratch and bodywork
        expect(restored.getPartData('front_bumper')?.condition,
            equals(VDSPartCondition.scratch));
        expect(restored.partsStatusMap.length, equals(3));
      },
    );
  });

  group('Enum Serialization Property Tests', () {
    Glados(any.viewAngle).test(
      'Property 6: ViewAngle enum round-trip via string',
      (angle) {
        final jsonValue = angle.toJson();
        final restored = ViewAngle.fromString(jsonValue);
        expect(restored, equals(angle));
      },
    );

    Glados(any.carTemplateType).test(
      'Property 6: CarTemplateType enum round-trip via string',
      (type) {
        final jsonValue = type.toJson();
        final restored = CarTemplateType.fromString(jsonValue);
        expect(restored, equals(type));
      },
    );

    Glados(any.partCondition).test(
      'Property 6: VDSPartCondition enum round-trip via string',
      (condition) {
        final jsonValue = condition.toJson();
        final restored = VDSPartCondition.fromString(jsonValue);
        expect(restored, equals(condition));
      },
    );

    Glados(any.damageSeverity).test(
      'Property 6: DamageSeverity enum round-trip via string',
      (severity) {
        final jsonValue = severity.toJson();
        final restored = DamageSeverity.fromString(jsonValue);
        expect(restored, equals(severity));
      },
    );

    Glados(any.inspectionStatus).test(
      'Property 6: InspectionStatus enum round-trip via string',
      (status) {
        final jsonValue = status.toJson();
        final restored = InspectionStatus.fromString(jsonValue);
        expect(restored, equals(status));
      },
    );

    Glados(any.partCategory).test(
      'Property 6: PartCategory enum round-trip via string',
      (category) {
        final jsonValue = category.toJson();
        final restored = PartCategory.fromString(jsonValue);
        expect(restored, equals(category));
      },
    );
  });
}
