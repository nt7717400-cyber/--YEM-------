/// Property-Based Tests for Car Model
/// Feature: flutter-customer-app, Property 1: Car Data Completeness
/// **Validates: Requirements 1.2, 3.3**

import 'package:flutter_test/flutter_test.dart' hide group, test, expect;
import 'package:glados/glados.dart';
import 'package:customer_app/models/car.dart';

/// Custom generators for Car model types
extension CarGenerators on Any {
  /// Generate a valid BodyType
  Generator<BodyType> get bodyType => choose(BodyType.values);

  /// Generate a valid CarCondition
  Generator<CarCondition> get carCondition => choose(CarCondition.values);

  /// Generate a valid CarStatus
  Generator<CarStatus> get carStatus => choose(CarStatus.values);

  /// Generate a valid CarVideoType
  Generator<CarVideoType> get carVideoType => choose(CarVideoType.values);

  /// Generate a valid PartStatus
  Generator<PartStatus> get partStatus => choose(PartStatus.values);

  /// Generate a valid BodyPartId
  Generator<BodyPartId> get bodyPartId => choose(BodyPartId.values);

  /// Generate a valid EngineStatus
  Generator<EngineStatus> get engineStatus => choose(EngineStatus.values);

  /// Generate a valid TransmissionStatus
  Generator<TransmissionStatus> get transmissionStatus =>
      choose(TransmissionStatus.values);

  /// Generate a valid ChassisStatus
  Generator<ChassisStatus> get chassisStatus => choose(ChassisStatus.values);

  /// Generate a valid year
  Generator<int> get validYear => intInRange(1990, 2030);

  /// Generate a positive price
  Generator<double> get positivePrice =>
      intInRange(1000, 10000000).map((i) => i.toDouble());

  /// Generate a bounded positive int for IDs
  Generator<int> get boundedId => intInRange(1, 100000);
}

void main() {
  group('Car Model Property Tests', () {
    /// Property 1: Car Data Completeness - Round Trip
    /// *For any* car, serializing to JSON and deserializing back should produce
    /// an equivalent car with all required fields preserved.
    Glados(any.boundedId).test(
      'Property 1: Car JSON round-trip preserves all required fields',
      (id) {
        // Create a car with all required fields
        final now = DateTime.now();
        final car = Car(
          id: id,
          name: 'Test Car $id',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 50000.0,
          condition: CarCondition.newCar,
          createdAt: now,
          updatedAt: now,
          images: [],
        );

        // Serialize to JSON
        final json = car.toJson();

        // Deserialize back
        final restored = Car.fromJson(json);

        // Verify all required fields are preserved
        expect(restored.id, equals(car.id));
        expect(restored.name, equals(car.name));
        expect(restored.brand, equals(car.brand));
        expect(restored.model, equals(car.model));
        expect(restored.year, equals(car.year));
        expect(restored.price, equals(car.price));
        expect(restored.condition, equals(car.condition));
        expect(restored.images, isA<List<CarImage>>());
      },
    );

    Glados2(any.carCondition, any.positivePrice).test(
      'Property 1: Car condition and price preserved in round-trip',
      (condition, price) {
        final now = DateTime.now();
        final car = Car(
          id: 1,
          name: 'Test Car',
          brand: 'Honda',
          model: 'Civic',
          year: 2022,
          price: price,
          condition: condition,
          createdAt: now,
          updatedAt: now,
        );

        final json = car.toJson();
        final restored = Car.fromJson(json);

        expect(restored.condition, equals(condition));
        expect(restored.price, equals(price));
      },
    );

    Glados(any.validYear).test(
      'Property 1: Car year preserved in round-trip',
      (year) {
        final now = DateTime.now();
        final car = Car(
          id: 1,
          name: 'Test Car',
          brand: 'Nissan',
          model: 'Altima',
          year: year,
          price: 30000.0,
          condition: CarCondition.used,
          createdAt: now,
          updatedAt: now,
        );

        final json = car.toJson();
        final restored = Car.fromJson(json);

        expect(restored.year, equals(year));
      },
    );
  });

  group('CarImage Model Property Tests', () {
    Glados2(any.boundedId, any.boundedId).test(
      'CarImage JSON round-trip preserves all fields',
      (id, carId) {
        final now = DateTime.now();
        final image = CarImage(
          id: id,
          carId: carId,
          url: 'https://example.com/image_$id.jpg',
          order: id % 10,
          createdAt: now,
        );

        final json = image.toJson();
        final restored = CarImage.fromJson(json);

        expect(restored.id, equals(image.id));
        expect(restored.carId, equals(image.carId));
        expect(restored.url, equals(image.url));
        expect(restored.order, equals(image.order));
      },
    );
  });

  group('CarVideo Model Property Tests', () {
    Glados2(any.boundedId, any.carVideoType).test(
      'CarVideo JSON round-trip preserves all fields',
      (id, videoType) {
        final now = DateTime.now();
        final video = CarVideo(
          id: id,
          carId: id + 1,
          type: videoType,
          url: videoType == CarVideoType.youtube
              ? 'https://youtube.com/watch?v=abc123'
              : 'https://example.com/video.mp4',
          createdAt: now,
        );

        final json = video.toJson();
        final restored = CarVideo.fromJson(json);

        expect(restored.id, equals(video.id));
        expect(restored.carId, equals(video.carId));
        expect(restored.type, equals(video.type));
        expect(restored.url, equals(video.url));
      },
    );
  });

  group('CarInspection Model Property Tests', () {
    Glados2(any.bodyType, any.boundedId).test(
      'CarInspection JSON round-trip preserves body type',
      (bodyType, carId) {
        final now = DateTime.now();
        final inspection = CarInspection(
          id: 1,
          carId: carId,
          bodyType: bodyType,
          bodyParts: [
            const BodyPartStatus(
              partId: BodyPartId.hood,
              status: PartStatus.original,
            ),
          ],
          mechanical: const MechanicalStatus(
            engine: EngineStatus.original,
            transmission: TransmissionStatus.original,
            chassis: ChassisStatus.intact,
          ),
          createdAt: now,
          updatedAt: now,
        );

        final json = inspection.toJson();
        final restored = CarInspection.fromJson(json);

        expect(restored.bodyType, equals(bodyType));
        expect(restored.carId, equals(carId));
        expect(restored.bodyParts.length, equals(1));
      },
    );
  });

  group('MechanicalStatus Model Property Tests', () {
    Glados3(any.engineStatus, any.transmissionStatus, any.chassisStatus).test(
      'MechanicalStatus JSON round-trip preserves all statuses',
      (engine, transmission, chassis) {
        final mechanical = MechanicalStatus(
          engine: engine,
          transmission: transmission,
          chassis: chassis,
          technicalNotes: 'Test notes',
        );

        final json = mechanical.toJson();
        final restored = MechanicalStatus.fromJson(json);

        expect(restored.engine, equals(engine));
        expect(restored.transmission, equals(transmission));
        expect(restored.chassis, equals(chassis));
        expect(restored.technicalNotes, equals('Test notes'));
      },
    );
  });

  group('BodyPartStatus Model Property Tests', () {
    Glados2(any.bodyPartId, any.partStatus).test(
      'BodyPartStatus JSON round-trip preserves all fields',
      (partId, status) {
        final bodyPart = BodyPartStatus(
          partId: partId,
          status: status,
        );

        final json = bodyPart.toJson();
        final restored = BodyPartStatus.fromJson(json);

        expect(restored.partId, equals(partId));
        expect(restored.status, equals(status));
      },
    );
  });
}
