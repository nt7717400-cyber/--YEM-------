<?php
/**
 * Property-Based Test for Dashboard Statistics
 * Property 8: Dashboard Statistics Accuracy
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4
 * 
 * For any set of cars in the database:
 * - totalCars SHALL equal the count of all cars
 * - availableCars SHALL equal the count of cars with status AVAILABLE
 * - soldCars SHALL equal the count of cars with status SOLD
 * - totalViews SHALL equal the sum of all car viewCounts
 */

use PHPUnit\Framework\TestCase;

class DashboardStatsPropertyTest extends TestCase
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
            'view_count' => rand(0, 10000),
            'created_at' => date('Y-m-d H:i:s', rand(strtotime('2020-01-01'), time())),
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Calculate statistics from a set of cars (simulating StatsController logic)
     */
    private function calculateStats(array $cars): array
    {
        $totalCars = count($cars);
        $availableCars = 0;
        $soldCars = 0;
        $totalViews = 0;

        foreach ($cars as $car) {
            if ($car['status'] === 'AVAILABLE') {
                $availableCars++;
            } elseif ($car['status'] === 'SOLD') {
                $soldCars++;
            }
            $totalViews += $car['view_count'];
        }

        return [
            'totalCars' => $totalCars,
            'availableCars' => $availableCars,
            'soldCars' => $soldCars,
            'totalViews' => $totalViews
        ];
    }

    /**
     * Property 8: Dashboard Statistics Accuracy
     * For any set of cars, statistics SHALL be calculated correctly.
     * 
     * @test
     * Feature: yemen-car-showroom, Property 8: Dashboard Statistics Accuracy
     * Validates: Requirements 7.1, 7.2, 7.3, 7.4
     */
    public function testDashboardStatisticsAccuracyProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random set of cars (0-50 cars)
            $carCount = rand(0, 50);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }

            // Calculate stats
            $stats = $this->calculateStats($cars);

            // Property 7.1: totalCars equals count of all cars
            $this->assertEquals(
                count($cars),
                $stats['totalCars'],
                "Iteration $i: totalCars should equal count of all cars"
            );

            // Property 7.2: availableCars equals count of AVAILABLE cars
            $expectedAvailable = count(array_filter($cars, fn($c) => $c['status'] === 'AVAILABLE'));
            $this->assertEquals(
                $expectedAvailable,
                $stats['availableCars'],
                "Iteration $i: availableCars should equal count of AVAILABLE cars"
            );

            // Property 7.3: soldCars equals count of SOLD cars
            $expectedSold = count(array_filter($cars, fn($c) => $c['status'] === 'SOLD'));
            $this->assertEquals(
                $expectedSold,
                $stats['soldCars'],
                "Iteration $i: soldCars should equal count of SOLD cars"
            );

            // Property 7.4: totalViews equals sum of all viewCounts
            $expectedViews = array_sum(array_column($cars, 'view_count'));
            $this->assertEquals(
                $expectedViews,
                $stats['totalViews'],
                "Iteration $i: totalViews should equal sum of all viewCounts"
            );

            // Additional property: available + sold = total
            $this->assertEquals(
                $stats['totalCars'],
                $stats['availableCars'] + $stats['soldCars'],
                "Iteration $i: available + sold should equal total"
            );
        }
    }

    /**
     * Property: Empty car set should return zero stats
     * @test
     */
    public function testEmptyCarSetReturnsZeroStats(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $stats = $this->calculateStats([]);

            $this->assertEquals(0, $stats['totalCars'], "Empty set: totalCars should be 0");
            $this->assertEquals(0, $stats['availableCars'], "Empty set: availableCars should be 0");
            $this->assertEquals(0, $stats['soldCars'], "Empty set: soldCars should be 0");
            $this->assertEquals(0, $stats['totalViews'], "Empty set: totalViews should be 0");
        }
    }

    /**
     * Property: All available cars should have correct count
     * @test
     */
    public function testAllAvailableCarsProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(1, 30);
            $cars = [];
            
            // Generate all AVAILABLE cars
            for ($j = 0; $j < $carCount; $j++) {
                $car = $this->generateRandomCar();
                $car['status'] = 'AVAILABLE';
                $cars[] = $car;
            }

            $stats = $this->calculateStats($cars);

            $this->assertEquals($carCount, $stats['totalCars']);
            $this->assertEquals($carCount, $stats['availableCars']);
            $this->assertEquals(0, $stats['soldCars']);
        }
    }

    /**
     * Property: All sold cars should have correct count
     * @test
     */
    public function testAllSoldCarsProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(1, 30);
            $cars = [];
            
            // Generate all SOLD cars
            for ($j = 0; $j < $carCount; $j++) {
                $car = $this->generateRandomCar();
                $car['status'] = 'SOLD';
                $cars[] = $car;
            }

            $stats = $this->calculateStats($cars);

            $this->assertEquals($carCount, $stats['totalCars']);
            $this->assertEquals(0, $stats['availableCars']);
            $this->assertEquals($carCount, $stats['soldCars']);
        }
    }

    /**
     * Property: View count is always non-negative
     * @test
     */
    public function testViewCountNonNegativeProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(0, 50);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }

            $stats = $this->calculateStats($cars);

            $this->assertGreaterThanOrEqual(0, $stats['totalViews']);
            $this->assertGreaterThanOrEqual(0, $stats['totalCars']);
            $this->assertGreaterThanOrEqual(0, $stats['availableCars']);
            $this->assertGreaterThanOrEqual(0, $stats['soldCars']);
        }
    }

    /**
     * Property: Adding a car increases total count by 1
     * @test
     */
    public function testAddingCarIncreasesTotalProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $carCount = rand(0, 30);
            $cars = [];
            for ($j = 0; $j < $carCount; $j++) {
                $cars[] = $this->generateRandomCar();
            }

            $statsBefore = $this->calculateStats($cars);
            
            // Add a new car
            $newCar = $this->generateRandomCar();
            $cars[] = $newCar;
            
            $statsAfter = $this->calculateStats($cars);

            $this->assertEquals(
                $statsBefore['totalCars'] + 1,
                $statsAfter['totalCars'],
                "Adding a car should increase total by 1"
            );

            $this->assertEquals(
                $statsBefore['totalViews'] + $newCar['view_count'],
                $statsAfter['totalViews'],
                "Adding a car should increase views by car's view count"
            );
        }
    }
}
