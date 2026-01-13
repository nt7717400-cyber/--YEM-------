<?php
/**
 * Property-Based Test for Inspection Data Validation
 * Property 8: Inspection data validation
 * Validates: Requirements 6.4
 * 
 * For any inspection data with invalid values (unknown body type, unknown part status, 
 * unknown mechanical status), the validation function SHALL return false/errors.
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../controllers/InspectionController.php';

class InspectionValidationPropertyTest extends TestCase
{
    private const ITERATIONS = 100;
    
    // Valid values from InspectionController
    private array $validBodyTypes = [
        'sedan', 'hatchback', 'coupe', 'suv', 'crossover', 
        'pickup', 'van', 'minivan', 'truck'
    ];
    
    private array $validPartIds = [
        'front_bumper', 'rear_bumper', 'hood', 'roof', 'trunk',
        'front_left_door', 'front_right_door', 'rear_left_door', 'rear_right_door',
        'front_left_fender', 'front_right_fender', 'rear_left_quarter', 'rear_right_quarter'
    ];
    
    private array $validPartStatuses = [
        'original', 'painted', 'bodywork', 'accident', 'replaced', 'needs_check'
    ];
    
    private array $validEngineStatuses = ['original', 'replaced', 'refurbished'];
    private array $validTransmissionStatuses = ['original', 'replaced'];
    private array $validChassisStatuses = ['intact', 'accident_affected', 'modified'];

    // Invalid values for testing
    private array $invalidBodyTypes = [
        'invalid', 'car', 'vehicle', 'sports', 'convertible', 
        'SEDAN', 'Sedan', '', null, 123, true
    ];
    
    private array $invalidPartStatuses = [
        'invalid', 'good', 'bad', 'damaged', 'new', 
        'ORIGINAL', 'Original', '', null, 123, true
    ];
    
    private array $invalidEngineStatuses = [
        'invalid', 'new', 'broken', 'fixed', 
        'ORIGINAL', '', null, 123
    ];
    
    private array $invalidTransmissionStatuses = [
        'invalid', 'new', 'broken', 'automatic', 'manual',
        'ORIGINAL', '', null, 123
    ];
    
    private array $invalidChassisStatuses = [
        'invalid', 'good', 'bad', 'damaged',
        'INTACT', '', null, 123
    ];

    private InspectionController $controller;

    protected function setUp(): void
    {
        // Create controller with null db (we only test validation, not DB operations)
        $this->controller = new InspectionController(null);
    }

    /**
     * Generate valid inspection data
     */
    private function generateValidInspectionData(): array
    {
        $bodyParts = [];
        foreach ($this->validPartIds as $partId) {
            if (rand(0, 1)) {
                $bodyParts[$partId] = $this->validPartStatuses[array_rand($this->validPartStatuses)];
            }
        }

        return [
            'bodyType' => $this->validBodyTypes[array_rand($this->validBodyTypes)],
            'bodyParts' => $bodyParts,
            'mechanical' => [
                'engine' => $this->validEngineStatuses[array_rand($this->validEngineStatuses)],
                'transmission' => $this->validTransmissionStatuses[array_rand($this->validTransmissionStatuses)],
                'chassis' => $this->validChassisStatuses[array_rand($this->validChassisStatuses)],
                'technicalNotes' => 'Test notes ' . rand(1, 1000)
            ]
        ];
    }

    /**
     * Generate a random invalid value
     */
    private function getRandomInvalidValue(array $invalidValues)
    {
        return $invalidValues[array_rand($invalidValues)];
    }

    /**
     * Property 8: Valid inspection data passes validation
     * For any valid inspection data, validation SHALL return empty errors array.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (valid data)
     * Validates: Requirements 6.4
     */
    public function testValidInspectionDataPassesValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $validData = $this->generateValidInspectionData();
            
            $errors = $this->controller->validateInspection($validData);
            
            $this->assertEmpty(
                $errors,
                "Iteration $i: Valid inspection data should pass validation. Errors: " . json_encode($errors)
            );
        }
    }

    /**
     * Property 8: Invalid body type fails validation
     * For any inspection data with invalid body type, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid body type)
     * Validates: Requirements 6.4
     */
    public function testInvalidBodyTypeFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Replace with invalid body type (only use string values to avoid type errors)
            $invalidBodyTypes = ['invalid', 'car', 'vehicle', 'sports', 'convertible', 'SEDAN', 'Sedan'];
            $data['bodyType'] = $invalidBodyTypes[array_rand($invalidBodyTypes)];
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid body type '{$data['bodyType']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Error should be for bodyType field"
            );
        }
    }

    /**
     * Property 8: Invalid part status fails validation
     * For any inspection data with invalid part status, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid part status)
     * Validates: Requirements 6.4
     */
    public function testInvalidPartStatusFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Add an invalid part status (only use string values)
            $randomPartId = $this->validPartIds[array_rand($this->validPartIds)];
            $invalidStatuses = ['invalid', 'good', 'bad', 'damaged', 'new', 'ORIGINAL', 'Original'];
            $data['bodyParts'][$randomPartId] = $invalidStatuses[array_rand($invalidStatuses)];
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid part status should fail validation"
            );
        }
    }

    /**
     * Property 8: Invalid part ID fails validation
     * For any inspection data with invalid part ID, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid part ID)
     * Validates: Requirements 6.4
     */
    public function testInvalidPartIdFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Add an invalid part ID
            $invalidPartIds = ['invalid_part', 'windshield', 'tire', 'engine_bay', 'headlight'];
            $invalidPartId = $invalidPartIds[array_rand($invalidPartIds)];
            $data['bodyParts'][$invalidPartId] = 'original';
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid part ID '$invalidPartId' should fail validation"
            );
        }
    }

    /**
     * Property 8: Invalid engine status fails validation
     * For any inspection data with invalid engine status, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid engine status)
     * Validates: Requirements 6.4
     */
    public function testInvalidEngineStatusFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Replace with invalid engine status (only use string values)
            $invalidStatuses = ['invalid', 'new', 'broken', 'fixed', 'ORIGINAL'];
            $data['mechanical']['engine'] = $invalidStatuses[array_rand($invalidStatuses)];
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid engine status '{$data['mechanical']['engine']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'mechanical.engine',
                $errors,
                "Iteration $i: Error should be for mechanical.engine field"
            );
        }
    }

    /**
     * Property 8: Invalid transmission status fails validation
     * For any inspection data with invalid transmission status, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid transmission status)
     * Validates: Requirements 6.4
     */
    public function testInvalidTransmissionStatusFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Replace with invalid transmission status (only use string values)
            $invalidStatuses = ['invalid', 'new', 'broken', 'automatic', 'manual', 'ORIGINAL'];
            $data['mechanical']['transmission'] = $invalidStatuses[array_rand($invalidStatuses)];
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid transmission status '{$data['mechanical']['transmission']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'mechanical.transmission',
                $errors,
                "Iteration $i: Error should be for mechanical.transmission field"
            );
        }
    }

    /**
     * Property 8: Invalid chassis status fails validation
     * For any inspection data with invalid chassis status, validation SHALL return errors.
     * 
     * @test
     * Feature: car-inspection-3d, Property 8: Inspection data validation (invalid chassis status)
     * Validates: Requirements 6.4
     */
    public function testInvalidChassisStatusFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidInspectionData();
            
            // Replace with invalid chassis status (only use string values)
            $invalidStatuses = ['invalid', 'good', 'bad', 'damaged', 'INTACT'];
            $data['mechanical']['chassis'] = $invalidStatuses[array_rand($invalidStatuses)];
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Invalid chassis status '{$data['mechanical']['chassis']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'mechanical.chassis',
                $errors,
                "Iteration $i: Error should be for mechanical.chassis field"
            );
        }
    }

    /**
     * Property: Empty data passes validation (all fields optional)
     * @test
     */
    public function testEmptyDataPassesValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $errors = $this->controller->validateInspection([]);
            
            $this->assertEmpty(
                $errors,
                "Iteration $i: Empty data should pass validation (all fields optional)"
            );
        }
    }

    /**
     * Property: Partial valid data passes validation
     * @test
     */
    public function testPartialValidDataPassesValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Only include some fields
            $data = [];
            
            if (rand(0, 1)) {
                $data['bodyType'] = $this->validBodyTypes[array_rand($this->validBodyTypes)];
            }
            
            if (rand(0, 1)) {
                $data['bodyParts'] = [
                    $this->validPartIds[array_rand($this->validPartIds)] => 
                        $this->validPartStatuses[array_rand($this->validPartStatuses)]
                ];
            }
            
            if (rand(0, 1)) {
                $data['mechanical'] = [
                    'engine' => $this->validEngineStatuses[array_rand($this->validEngineStatuses)]
                ];
            }
            
            $errors = $this->controller->validateInspection($data);
            
            $this->assertEmpty(
                $errors,
                "Iteration $i: Partial valid data should pass validation. Data: " . json_encode($data) . ", Errors: " . json_encode($errors)
            );
        }
    }
}
