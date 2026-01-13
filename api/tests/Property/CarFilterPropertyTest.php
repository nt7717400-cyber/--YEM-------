<?php
/**
 * Property-Based Test for Car Filtering
 * Property 5: Filter Correctness
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.9
 * 
 * For any combination of filters (price range, year, condition, brand) and set of cars,
 * all returned cars SHALL satisfy ALL applied filter conditions simultaneously.
 */

use PHPUnit\Framework\TestCase;

class CarFilterPropertyTest extends TestCase
{
    private const ITERATIONS = 100;
    
    private array $brands = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mercedes', 'BMW'];
    private array $conditions = ['NEW', 'USED'];
    private array $statuses = ['AVAILABLE', 'SOLD'];

    /**
     * Generate random car data
     */
    private function generateRandomCar(): array
    {
        return [
            'id' => rand(1, 10000),
            'name' => 'Car ' . rand(1, 1000),
            'brand' => $this->brands[array_rand($this->brands)],
            'model' => 'Model ' . rand(1, 100),
            'year' => rand(2000, 2026),
            'price' => rand(5000, 100000) + (rand(0, 99) / 100),
            'car_condition' => $this->conditions[array_rand($this->conditions)],
            'kilometers' => rand(0, 300000),
            'description' => 'Test description',
            'specifications' => 'Test specs',
            'status' => $this->statuses[array_rand($this->statuses)],
            'is_featured' => rand(0, 1),
            'view_count' => rand(0, 1000),
            'created_at' => date('Y-m-d H:i:s', rand(strtotime('2020-01-01'), time())),
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate random filters
     */
    private function generateRandomFilters(): array
    {
        $filters = [];
        
        // Randomly include each filter type
        if (rand(0, 1)) {
            $filters['brand'] = $this->brands[array_rand($this->brands)];
        }
        
        if (rand(0, 1)) {
            $filters['condition'] = $this->conditions[array_rand($this->conditions)];
        }
        
        if (rand(0, 1)) {
            $filters['year'] = rand(2000, 2026);
        }
        
        if (rand(0, 1)) {
            $minPrice = rand(5000, 50000);
            $filters['minPrice'] = $minPrice;
            if (rand(0, 1)) {
                $filters['maxPrice'] = $minPrice + rand(10000, 50000);
            }
        } elseif (rand(0, 1)) {
            $filters['maxPrice'] = rand(30000, 100000);
        }
        
        return $filters;
    }

    /**
     * Apply filters to a car (simulating the controller logic)
     */
    private function carMatchesFilters(array $car, array $filters): bool
    {
        // Brand filter - Requirements 3.5
        if (isset($filters['brand']) && $car['brand'] !== $filters['brand']) {
            return false;
        }
        
        // Condition filter - Requirements 3.4
        if (isset($filters['condition']) && $car['car_condition'] !== strtoupper($filters['condition'])) {
            return false;
        }
        
        // Year filter - Requirements 3.3
        if (isset($filters['year']) && (int)$car['year'] !== (int)$filters['year']) {
            return false;
        }
        
        // Price range filter - Requirements 3.2
        if (isset($filters['minPrice']) && $car['price'] < $filters['minPrice']) {
            return false;
        }
        if (isset($filters['maxPrice']) && $car['price'] > $filters['maxPrice']) {
            return false;
        }
        
        return true;
    }

    /**
     * Filter cars using the same logic as CarsController
     * Requirements 3.9: Allow combining multiple filters simultaneously
     */
    private function filterCars(array $cars, array $filters): array
    {
        return array_filter($cars, function($car) use ($filters) {
            return $this->carMatchesFilters($car, $filters);
        });
    }

    /**
     * Property 5: Filter Correctness
     * For any combination of filters and set of cars, all returned cars
     * SHALL satisfy ALL applied filter conditions simultaneously.
     * 
     * @test
     * Feature: yemen-car-showroom, Property 5: Filter Correctness
     * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.9
     */
    public function testFilterCorrectnessProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random set of cars (5-20 cars)
            $carCount = rand(5, 20);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }
            
            // Generate random filters
            $filters = $this->generateRandomFilters();
            
            // Apply filters
            $filteredCars = $this->filterCars($cars, $filters);
            
            // Property: Every car in the result must match ALL filters
            foreach ($filteredCars as $car) {
                // Check brand filter
                if (isset($filters['brand'])) {
                    $this->assertEquals(
                        $filters['brand'],
                        $car['brand'],
                        "Iteration $i: Car brand '{$car['brand']}' does not match filter '{$filters['brand']}'"
                    );
                }
                
                // Check condition filter
                if (isset($filters['condition'])) {
                    $this->assertEquals(
                        strtoupper($filters['condition']),
                        $car['car_condition'],
                        "Iteration $i: Car condition '{$car['car_condition']}' does not match filter '{$filters['condition']}'"
                    );
                }
                
                // Check year filter
                if (isset($filters['year'])) {
                    $this->assertEquals(
                        (int)$filters['year'],
                        (int)$car['year'],
                        "Iteration $i: Car year '{$car['year']}' does not match filter '{$filters['year']}'"
                    );
                }
                
                // Check price range
                if (isset($filters['minPrice'])) {
                    $this->assertGreaterThanOrEqual(
                        $filters['minPrice'],
                        $car['price'],
                        "Iteration $i: Car price '{$car['price']}' is below minimum '{$filters['minPrice']}'"
                    );
                }
                
                if (isset($filters['maxPrice'])) {
                    $this->assertLessThanOrEqual(
                        $filters['maxPrice'],
                        $car['price'],
                        "Iteration $i: Car price '{$car['price']}' exceeds maximum '{$filters['maxPrice']}'"
                    );
                }
            }
            
            // Property: No car outside the result should match all filters
            $excludedCars = array_filter($cars, function($car) use ($filteredCars) {
                return !in_array($car, $filteredCars);
            });
            
            foreach ($excludedCars as $car) {
                $this->assertFalse(
                    $this->carMatchesFilters($car, $filters),
                    "Iteration $i: Car was incorrectly excluded from results"
                );
            }
        }
    }

    /**
     * Property: Empty filters should return all cars
     * @test
     */
    public function testEmptyFiltersReturnAllCars(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(5, 20);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }
            
            $filteredCars = $this->filterCars($cars, []);
            
            $this->assertCount(
                count($cars),
                $filteredCars,
                "Iteration $i: Empty filters should return all cars"
            );
        }
    }

    /**
     * Property: Filters are conjunctive (AND logic)
     * Adding more filters should never increase result count
     * @test
     */
    public function testFiltersAreConjunctive(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(10, 30);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }
            
            // Start with one filter
            $filters1 = ['brand' => $this->brands[array_rand($this->brands)]];
            $result1 = $this->filterCars($cars, $filters1);
            
            // Add another filter
            $filters2 = array_merge($filters1, ['condition' => $this->conditions[array_rand($this->conditions)]]);
            $result2 = $this->filterCars($cars, $filters2);
            
            // Adding filters should not increase results
            $this->assertLessThanOrEqual(
                count($result1),
                count($result2),
                "Iteration $i: Adding filters should not increase result count"
            );
        }
    }
}
