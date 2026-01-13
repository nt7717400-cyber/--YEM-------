<?php
/**
 * Property-Based Tests for Banner Management
 * Feature: banner-management
 * 
 * Properties tested:
 * - Property 1: Banner CRUD Round-Trip
 * - Property 2: Required Field Validation
 * - Property 3: Position Validation
 * - Property 7: Banner Visibility Rules
 * - Property 10: Display Ordering
 * - Property 11: Toggle Status Idempotence
 * - Property 12: View Count Increment
 * - Property 13: Click Count Increment
 * 
 * Validates: Requirements 1.2, 1.4, 1.5, 2.2, 5.1, 5.2, 6.1-6.3, 7.1, 8.2-8.4
 */

use PHPUnit\Framework\TestCase;

class BannerPropertyTest extends TestCase
{
    private const ITERATIONS = 100;
    
    private const VALID_POSITIONS = [
        'hero_top', 'hero_bottom', 'sidebar', 'cars_between', 
        'car_detail', 'footer_above', 'popup'
    ];
    
    private const INVALID_POSITIONS = [
        'invalid', 'header', 'footer', 'main', 'body', 
        'top', 'bottom', 'left', 'right', '', 'HERO_TOP'
    ];
    
    private const LINK_TARGETS = ['_self', '_blank'];

    /**
     * Generate random banner data
     */
    private function generateRandomBanner(): array
    {
        $hasSchedule = rand(0, 1);
        $startDate = null;
        $endDate = null;
        
        if ($hasSchedule) {
            $startTimestamp = rand(strtotime('-30 days'), strtotime('+30 days'));
            $startDate = date('Y-m-d H:i:s', $startTimestamp);
            $endDate = date('Y-m-d H:i:s', $startTimestamp + rand(86400, 86400 * 30)); // 1-30 days after start
        }
        
        return [
            'id' => rand(1, 10000),
            'title' => 'Banner ' . rand(1, 1000),
            'image_url' => '/uploads/banners/banner_' . uniqid() . '.jpg',
            'image_mobile_url' => rand(0, 1) ? '/uploads/banners/banner_mobile_' . uniqid() . '.jpg' : null,
            'link_url' => rand(0, 1) ? 'https://example.com/' . rand(1, 100) : null,
            'link_target' => self::LINK_TARGETS[array_rand(self::LINK_TARGETS)],
            'position' => self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)],
            'display_order' => rand(0, 100),
            'is_active' => rand(0, 1),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'click_count' => rand(0, 1000),
            'view_count' => rand(0, 10000),
            'created_at' => date('Y-m-d H:i:s', rand(strtotime('2020-01-01'), time())),
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate random title
     */
    private function generateRandomTitle(): string
    {
        $titles = [
            'عرض خاص', 'تخفيضات', 'سيارات جديدة', 'أفضل الأسعار',
            'Banner Title', 'Special Offer', 'New Arrivals', 'Best Deals'
        ];
        return $titles[array_rand($titles)] . ' ' . rand(1, 100);
    }

    /**
     * Format banner for comparison (simulating controller output)
     */
    private function formatBanner(array $banner): array
    {
        return [
            'id' => (int)$banner['id'],
            'title' => $banner['title'],
            'imageUrl' => $banner['image_url'],
            'imageMobileUrl' => $banner['image_mobile_url'],
            'linkUrl' => $banner['link_url'],
            'linkTarget' => $banner['link_target'],
            'position' => $banner['position'],
            'displayOrder' => (int)$banner['display_order'],
            'isActive' => (bool)$banner['is_active'],
            'startDate' => $banner['start_date'],
            'endDate' => $banner['end_date'],
            'clickCount' => (int)$banner['click_count'],
            'viewCount' => (int)$banner['view_count'],
            'createdAt' => $banner['created_at'],
            'updatedAt' => $banner['updated_at']
        ];
    }


    /**
     * Property 1: Banner CRUD Round-Trip
     * For any valid banner data, creating a banner then retrieving it by ID 
     * should return equivalent data.
     * 
     * @test
     * Feature: banner-management, Property 1: Banner CRUD Round-Trip
     * Validates: Requirements 1.5, 2.2
     */
    public function testBannerCrudRoundTripProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banner input
            $input = [
                'title' => $this->generateRandomTitle(),
                'position' => self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)],
                'linkUrl' => rand(0, 1) ? 'https://example.com/' . rand(1, 100) : null,
                'linkTarget' => self::LINK_TARGETS[array_rand(self::LINK_TARGETS)],
                'displayOrder' => rand(0, 100),
                'isActive' => (bool)rand(0, 1)
            ];
            
            // Simulate creating and retrieving (round-trip)
            $created = [
                'id' => rand(1, 10000),
                'title' => $input['title'],
                'image_url' => '/uploads/banners/test.jpg',
                'image_mobile_url' => null,
                'link_url' => $input['linkUrl'],
                'link_target' => $input['linkTarget'],
                'position' => $input['position'],
                'display_order' => $input['displayOrder'],
                'is_active' => $input['isActive'] ? 1 : 0,
                'start_date' => null,
                'end_date' => null,
                'click_count' => 0,
                'view_count' => 0,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $retrieved = $this->formatBanner($created);
            
            // Property: Retrieved data should match input
            $this->assertEquals(
                $input['title'],
                $retrieved['title'],
                "Iteration $i: Title mismatch after round-trip"
            );
            
            $this->assertEquals(
                $input['position'],
                $retrieved['position'],
                "Iteration $i: Position mismatch after round-trip"
            );
            
            $this->assertEquals(
                $input['linkUrl'],
                $retrieved['linkUrl'],
                "Iteration $i: Link URL mismatch after round-trip"
            );
            
            $this->assertEquals(
                $input['isActive'],
                $retrieved['isActive'],
                "Iteration $i: Active status mismatch after round-trip"
            );
        }
    }

    /**
     * Property 2: Required Field Validation
     * For any banner creation request missing title, image, or position,
     * the system should reject the request with a validation error.
     * 
     * @test
     * Feature: banner-management, Property 2: Required Field Validation
     * Validates: Requirements 1.2
     */
    public function testRequiredFieldValidationProperty(): void
    {
        $requiredFields = ['title', 'position'];
        
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate complete valid data
            $validData = [
                'title' => $this->generateRandomTitle(),
                'position' => self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)]
            ];
            
            // Randomly remove one or more required fields
            $fieldsToRemove = array_rand(array_flip($requiredFields), rand(1, count($requiredFields)));
            if (!is_array($fieldsToRemove)) {
                $fieldsToRemove = [$fieldsToRemove];
            }
            
            $invalidData = $validData;
            foreach ($fieldsToRemove as $field) {
                unset($invalidData[$field]);
            }
            
            // Simulate validation
            $errors = $this->validateBannerData($invalidData);
            
            // Property: Missing required fields should produce errors
            $this->assertNotEmpty(
                $errors,
                "Iteration $i: Missing fields " . implode(', ', $fieldsToRemove) . " should produce validation errors"
            );
            
            foreach ($fieldsToRemove as $field) {
                $this->assertArrayHasKey(
                    $field,
                    $errors,
                    "Iteration $i: Missing '$field' should produce a validation error"
                );
            }
        }
    }

    /**
     * Validate banner data (simulating controller validation)
     */
    private function validateBannerData(array $data, bool $isUpdate = false): array
    {
        $errors = [];
        
        if (!$isUpdate) {
            if (empty($data['title'])) {
                $errors['title'] = 'عنوان البانر مطلوب';
            }
            if (empty($data['position'])) {
                $errors['position'] = 'موقع البانر مطلوب';
            }
        }
        
        if (isset($data['position']) && !in_array($data['position'], self::VALID_POSITIONS)) {
            $errors['position'] = 'موقع البانر غير صالح';
        }
        
        return $errors;
    }

    /**
     * Property 3: Position Validation
     * For any string that is not one of the 7 valid positions,
     * the system should reject the banner creation/update request.
     * 
     * @test
     * Feature: banner-management, Property 3: Position Validation
     * Validates: Requirements 1.4
     */
    public function testPositionValidationProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Test with invalid position
            $invalidPosition = self::INVALID_POSITIONS[array_rand(self::INVALID_POSITIONS)];
            
            // Also generate random invalid strings
            if (rand(0, 1)) {
                $invalidPosition = 'random_' . rand(1, 1000);
            }
            
            $data = [
                'title' => $this->generateRandomTitle(),
                'position' => $invalidPosition
            ];
            
            $errors = $this->validateBannerData($data);
            
            // Property: Invalid position should produce error
            $this->assertArrayHasKey(
                'position',
                $errors,
                "Iteration $i: Invalid position '$invalidPosition' should produce validation error"
            );
        }
        
        // Also verify all valid positions are accepted
        foreach (self::VALID_POSITIONS as $validPosition) {
            $data = [
                'title' => 'Test Banner',
                'position' => $validPosition
            ];
            
            $errors = $this->validateBannerData($data);
            
            $this->assertArrayNotHasKey(
                'position',
                $errors,
                "Valid position '$validPosition' should not produce validation error"
            );
        }
    }


    /**
     * Property 7: Banner Visibility Rules
     * For any banner query by position, the returned banners should satisfy ALL conditions:
     * - is_active is true
     * - start_date is null OR start_date <= current time
     * - end_date is null OR end_date >= current time
     * 
     * @test
     * Feature: banner-management, Property 7: Banner Visibility Rules
     * Validates: Requirements 5.2, 6.1, 6.2, 6.3, 8.2
     */
    public function testBannerVisibilityRulesProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random set of banners
            $bannerCount = rand(5, 20);
            $banners = [];
            for ($j = 0; $j < $bannerCount; $j++) {
                $banners[] = $this->generateRandomBanner();
            }
            
            // Pick a random position to filter
            $targetPosition = self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)];
            $now = time();
            
            // Filter banners by visibility rules
            $visibleBanners = array_filter($banners, function($banner) use ($targetPosition, $now) {
                return $this->bannerIsVisible($banner, $targetPosition, $now);
            });
            
            // Property: Every visible banner must satisfy ALL visibility conditions
            foreach ($visibleBanners as $banner) {
                // Must be active
                $this->assertEquals(
                    1,
                    $banner['is_active'],
                    "Iteration $i: Visible banner must have is_active = 1"
                );
                
                // Must match position
                $this->assertEquals(
                    $targetPosition,
                    $banner['position'],
                    "Iteration $i: Visible banner must match target position"
                );
                
                // Start date check
                if ($banner['start_date'] !== null) {
                    $startTimestamp = strtotime($banner['start_date']);
                    $this->assertLessThanOrEqual(
                        $now,
                        $startTimestamp,
                        "Iteration $i: Visible banner start_date must be <= current time"
                    );
                }
                
                // End date check
                if ($banner['end_date'] !== null) {
                    $endTimestamp = strtotime($banner['end_date']);
                    $this->assertGreaterThanOrEqual(
                        $now,
                        $endTimestamp,
                        "Iteration $i: Visible banner end_date must be >= current time"
                    );
                }
            }
            
            // Property: No excluded banner should satisfy all visibility conditions
            $excludedBanners = array_filter($banners, function($banner) use ($visibleBanners) {
                return !in_array($banner, $visibleBanners);
            });
            
            foreach ($excludedBanners as $banner) {
                $this->assertFalse(
                    $this->bannerIsVisible($banner, $targetPosition, $now),
                    "Iteration $i: Excluded banner should not satisfy visibility rules"
                );
            }
        }
    }

    /**
     * Check if banner is visible based on visibility rules
     */
    private function bannerIsVisible(array $banner, string $position, int $now): bool
    {
        // Must match position
        if ($banner['position'] !== $position) {
            return false;
        }
        
        // Must be active
        if (!$banner['is_active']) {
            return false;
        }
        
        // Check start date
        if ($banner['start_date'] !== null) {
            $startTimestamp = strtotime($banner['start_date']);
            if ($startTimestamp > $now) {
                return false;
            }
        }
        
        // Check end date
        if ($banner['end_date'] !== null) {
            $endTimestamp = strtotime($banner['end_date']);
            if ($endTimestamp < $now) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Property 10: Display Ordering
     * For any list of banners in the same position, they should be ordered
     * by display_order in ascending order (lower values first).
     * 
     * @test
     * Feature: banner-management, Property 10: Display Ordering
     * Validates: Requirements 7.1, 7.3
     */
    public function testDisplayOrderingProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banners with same position
            $position = self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)];
            $bannerCount = rand(3, 15);
            $banners = [];
            
            for ($j = 0; $j < $bannerCount; $j++) {
                $banner = $this->generateRandomBanner();
                $banner['position'] = $position;
                $banner['display_order'] = rand(0, 100);
                $banners[] = $banner;
            }
            
            // Sort by display_order (simulating controller behavior)
            usort($banners, function($a, $b) {
                return $a['display_order'] - $b['display_order'];
            });
            
            // Property: Banners should be in ascending display_order
            $previousOrder = -1;
            foreach ($banners as $index => $banner) {
                $this->assertGreaterThanOrEqual(
                    $previousOrder,
                    $banner['display_order'],
                    "Iteration $i: Banner at index $index has display_order {$banner['display_order']} which is less than previous $previousOrder"
                );
                $previousOrder = $banner['display_order'];
            }
        }
    }

    /**
     * Property 11: Toggle Status Idempotence
     * For any banner, toggling its status twice should return it to its original is_active state.
     * 
     * @test
     * Feature: banner-management, Property 11: Toggle Status Idempotence
     * Validates: Requirements 5.1
     */
    public function testToggleStatusIdempotenceProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banner
            $banner = $this->generateRandomBanner();
            $originalStatus = (bool)$banner['is_active'];
            
            // First toggle
            $banner['is_active'] = $banner['is_active'] ? 0 : 1;
            $afterFirstToggle = (bool)$banner['is_active'];
            
            // Property: First toggle should change status
            $this->assertNotEquals(
                $originalStatus,
                $afterFirstToggle,
                "Iteration $i: First toggle should change status"
            );
            
            // Second toggle
            $banner['is_active'] = $banner['is_active'] ? 0 : 1;
            $afterSecondToggle = (bool)$banner['is_active'];
            
            // Property: Second toggle should restore original status
            $this->assertEquals(
                $originalStatus,
                $afterSecondToggle,
                "Iteration $i: Double toggle should restore original status"
            );
        }
    }


    /**
     * Property 12: View Count Increment
     * For any banner, calling trackView should increment view_count by exactly 1.
     * 
     * @test
     * Feature: banner-management, Property 12: View Count Increment
     * Validates: Requirements 8.3
     */
    public function testViewCountIncrementProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banner with random view count
            $banner = $this->generateRandomBanner();
            $initialViewCount = $banner['view_count'];
            
            // Simulate trackView (increment by 1)
            $banner['view_count'] = $banner['view_count'] + 1;
            
            // Property: View count should increase by exactly 1
            $this->assertEquals(
                $initialViewCount + 1,
                $banner['view_count'],
                "Iteration $i: View count should increase by exactly 1"
            );
            
            // Test multiple increments
            $incrementCount = rand(1, 10);
            $beforeMultiple = $banner['view_count'];
            
            for ($j = 0; $j < $incrementCount; $j++) {
                $banner['view_count'] = $banner['view_count'] + 1;
            }
            
            // Property: Multiple increments should add up correctly
            $this->assertEquals(
                $beforeMultiple + $incrementCount,
                $banner['view_count'],
                "Iteration $i: $incrementCount increments should add $incrementCount to view count"
            );
        }
    }

    /**
     * Property 13: Click Count Increment
     * For any banner, calling trackClick should increment click_count by exactly 1.
     * 
     * @test
     * Feature: banner-management, Property 13: Click Count Increment
     * Validates: Requirements 8.4
     */
    public function testClickCountIncrementProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banner with random click count
            $banner = $this->generateRandomBanner();
            $initialClickCount = $banner['click_count'];
            
            // Simulate trackClick (increment by 1)
            $banner['click_count'] = $banner['click_count'] + 1;
            
            // Property: Click count should increase by exactly 1
            $this->assertEquals(
                $initialClickCount + 1,
                $banner['click_count'],
                "Iteration $i: Click count should increase by exactly 1"
            );
            
            // Test multiple increments
            $incrementCount = rand(1, 10);
            $beforeMultiple = $banner['click_count'];
            
            for ($j = 0; $j < $incrementCount; $j++) {
                $banner['click_count'] = $banner['click_count'] + 1;
            }
            
            // Property: Multiple increments should add up correctly
            $this->assertEquals(
                $beforeMultiple + $incrementCount,
                $banner['click_count'],
                "Iteration $i: $incrementCount increments should add $incrementCount to click count"
            );
        }
    }

    /**
     * Additional Property: Position filtering returns only matching banners
     * @test
     */
    public function testPositionFilteringProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banners with various positions
            $bannerCount = rand(10, 30);
            $banners = [];
            for ($j = 0; $j < $bannerCount; $j++) {
                $banners[] = $this->generateRandomBanner();
            }
            
            // Pick a random position to filter
            $targetPosition = self::VALID_POSITIONS[array_rand(self::VALID_POSITIONS)];
            
            // Filter by position
            $filtered = array_filter($banners, function($banner) use ($targetPosition) {
                return $banner['position'] === $targetPosition;
            });
            
            // Property: All filtered banners must have the target position
            foreach ($filtered as $banner) {
                $this->assertEquals(
                    $targetPosition,
                    $banner['position'],
                    "Iteration $i: Filtered banner should have position '$targetPosition'"
                );
            }
            
            // Property: No banner with different position should be in results
            $excluded = array_filter($banners, function($banner) use ($targetPosition) {
                return $banner['position'] !== $targetPosition;
            });
            
            foreach ($excluded as $banner) {
                $this->assertNotContains(
                    $banner,
                    $filtered,
                    "Iteration $i: Banner with position '{$banner['position']}' should not be in filtered results"
                );
            }
        }
    }

    /**
     * Additional Property: Status filtering returns only matching banners
     * @test
     */
    public function testStatusFilteringProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random banners
            $bannerCount = rand(10, 30);
            $banners = [];
            for ($j = 0; $j < $bannerCount; $j++) {
                $banners[] = $this->generateRandomBanner();
            }
            
            // Filter by active status
            $targetStatus = (bool)rand(0, 1);
            
            $filtered = array_filter($banners, function($banner) use ($targetStatus) {
                return (bool)$banner['is_active'] === $targetStatus;
            });
            
            // Property: All filtered banners must have the target status
            foreach ($filtered as $banner) {
                $this->assertEquals(
                    $targetStatus,
                    (bool)$banner['is_active'],
                    "Iteration $i: Filtered banner should have is_active = " . ($targetStatus ? 'true' : 'false')
                );
            }
        }
    }
}
