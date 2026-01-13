<?php
/**
 * Property-Based Test for Car Body Type Validation
 * Property 3: Used car validation requires body type
 * Validates: Requirements 1.4
 * 
 * For any form submission where condition is "USED" and body type is null/undefined, 
 * the validation SHALL fail and return an error.
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../controllers/CarsController.php';

class CarBodyTypeValidationPropertyTest extends TestCase
{
    private const ITERATIONS = 100;
    
    // Valid body types
    private array $validBodyTypes = [
        'sedan', 'hatchback', 'coupe', 'suv', 'crossover', 
        'pickup', 'van', 'minivan', 'truck'
    ];
    
    // Invalid body types for testing
    private array $invalidBodyTypes = [
        'invalid', 'car', 'vehicle', 'sports', 'convertible', 
        'SEDAN', 'Sedan', 'SUV_TYPE', 'unknown'
    ];

    // Sample car brands for generating test data
    private array $brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Nissan', 'Hyundai'];
    
    // Sample car models
    private array $models = ['Camry', 'Accord', 'X5', 'C-Class', 'Altima', 'Sonata'];

    private CarsController $controller;
    private \ReflectionMethod $validateMethod;

    protected function setUp(): void
    {
        // Create controller with null db (we only test validation, not DB operations)
        $this->controller = new CarsController(null);
        
        // Use reflection to access the public validateCarData method
        $this->validateMethod = new \ReflectionMethod(CarsController::class, 'validateCarData');
        $this->validateMethod->setAccessible(true);
    }

    /**
     * Generate valid base car data
     */
    private function generateValidCarData(): array
    {
        return [
            'name' => 'Test Car ' . rand(1, 1000),
            'brand' => $this->brands[array_rand($this->brands)],
            'model' => $this->models[array_rand($this->models)],
            'year' => rand(2015, 2025),
            'price' => rand(10000, 100000),
            'condition' => 'NEW',
            'origin' => 'Japan',
            'kilometers' => rand(0, 200000),
            'description' => 'Test description',
            'specifications' => 'Test specifications'
        ];
    }

    /**
     * Property 3: Used car without body type fails validation
     * For any used car submission without body type, validation SHALL fail.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: Used car validation requires body type
     * Validates: Requirements 1.4
     */
    public function testUsedCarWithoutBodyTypeFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'USED';
            // Explicitly not setting bodyType or setting it to null/empty
            $emptyValues = [null, '', []];
            if (rand(0, 1)) {
                $data['bodyType'] = $emptyValues[array_rand($emptyValues)];
            }
            // else: bodyType key not present at all
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Used car without body type should fail validation"
            );
            $this->assertArrayHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Error should be for bodyType field"
            );
        }
    }

    /**
     * Property 3: Used car with valid body type passes validation
     * For any used car submission with valid body type, validation SHALL pass (for bodyType).
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: Used car validation requires body type (valid case)
     * Validates: Requirements 1.4
     */
    public function testUsedCarWithValidBodyTypePassesValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'USED';
            $data['bodyType'] = $this->validBodyTypes[array_rand($this->validBodyTypes)];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertArrayNotHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Used car with valid body type '{$data['bodyType']}' should not have bodyType error. Errors: " . json_encode($errors)
            );
        }
    }

    /**
     * Property 3: Used car with invalid body type fails validation
     * For any used car submission with invalid body type, validation SHALL fail.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: Used car validation requires body type (invalid type)
     * Validates: Requirements 1.4
     */
    public function testUsedCarWithInvalidBodyTypeFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'USED';
            $data['bodyType'] = $this->invalidBodyTypes[array_rand($this->invalidBodyTypes)];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Used car with invalid body type '{$data['bodyType']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Error should be for bodyType field"
            );
        }
    }

    /**
     * Property 3: New car does not require body type
     * For any new car submission, body type is optional.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: New car does not require body type
     * Validates: Requirements 1.4
     */
    public function testNewCarDoesNotRequireBodyType(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'NEW';
            // Randomly include or exclude bodyType
            if (rand(0, 1)) {
                unset($data['bodyType']);
            } else {
                $data['bodyType'] = null;
            }
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertArrayNotHasKey(
                'bodyType',
                $errors,
                "Iteration $i: New car should not require body type. Errors: " . json_encode($errors)
            );
        }
    }

    /**
     * Property 3: New car with valid body type passes validation
     * For any new car submission with valid body type, validation SHALL pass.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: New car with body type passes validation
     * Validates: Requirements 1.4
     */
    public function testNewCarWithValidBodyTypePassesValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'NEW';
            $data['bodyType'] = $this->validBodyTypes[array_rand($this->validBodyTypes)];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertArrayNotHasKey(
                'bodyType',
                $errors,
                "Iteration $i: New car with valid body type should not have bodyType error"
            );
        }
    }

    /**
     * Property 3: New car with invalid body type fails validation
     * For any new car submission with invalid body type, validation SHALL fail.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: New car with invalid body type fails validation
     * Validates: Requirements 1.4
     */
    public function testNewCarWithInvalidBodyTypeFailsValidation(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = $this->generateValidCarData();
            $data['condition'] = 'NEW';
            $data['bodyType'] = $this->invalidBodyTypes[array_rand($this->invalidBodyTypes)];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, false);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: New car with invalid body type '{$data['bodyType']}' should fail validation"
            );
            $this->assertArrayHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Error should be for bodyType field"
            );
        }
    }

    /**
     * Property 3: Update mode - Used car condition change requires body type
     * When updating a car to USED condition, body type becomes required.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: Update to USED requires body type
     * Validates: Requirements 1.4
     */
    public function testUpdateToUsedConditionRequiresBodyType(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // In update mode, only condition is being changed
            $data = [
                'condition' => 'USED'
            ];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, true);
            
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Updating to USED condition without body type should fail validation"
            );
            $this->assertArrayHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Error should be for bodyType field"
            );
        }
    }

    /**
     * Property 3: Update mode - Used car with body type passes
     * When updating a car to USED condition with body type, validation passes.
     * 
     * @test
     * Feature: car-inspection-3d, Property 3: Update to USED with body type passes
     * Validates: Requirements 1.4
     */
    public function testUpdateToUsedConditionWithBodyTypePasses(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $data = [
                'condition' => 'USED',
                'bodyType' => $this->validBodyTypes[array_rand($this->validBodyTypes)]
            ];
            
            $errors = $this->validateMethod->invoke($this->controller, $data, true);
            
            $this->assertArrayNotHasKey(
                'bodyType',
                $errors,
                "Iteration $i: Updating to USED condition with valid body type should pass. Errors: " . json_encode($errors)
            );
        }
    }
}
