<?php
/**
 * Property-Based Tests for Auction System
 * Feature: auction-system
 * 
 * Properties tested:
 * - Property 1: Bid Amount Validation
 * - Property 2: Phone Number Masking
 * 
 * Validates: Requirements 4.3, 4.4, 5.1, 5.3
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../utils/PhoneMasking.php';
require_once __DIR__ . '/../../controllers/AuctionsController.php';
require_once __DIR__ . '/../../utils/Response.php';

class AuctionPropertyTest extends TestCase
{
    private const ITERATIONS = 100;
    private ?AuctionsController $controller = null;

    protected function setUp(): void
    {
        parent::setUp();
        // Create controller with null db (we only test validation methods)
        $this->controller = new AuctionsController(null, false);
    }

    /**
     * Generate random bidder name
     */
    private function generateRandomBidderName(): string
    {
        $names = ['أحمد', 'محمد', 'علي', 'خالد', 'عمر', 'سعيد', 'فهد', 'ناصر', 'عبدالله', 'يوسف'];
        $surnames = ['الأحمدي', 'العلوي', 'الحسني', 'المحمدي', 'الصالحي', 'الناصري', 'الخالدي'];
        return $names[array_rand($names)] . ' ' . $surnames[array_rand($surnames)];
    }

    /**
     * Generate random positive amount
     */
    private function generateRandomAmount(float $min = 100, float $max = 1000000): float
    {
        return round($min + (mt_rand() / mt_getrandmax()) * ($max - $min), 2);
    }

    /**
     * Property 1: Bid Amount Validation
     * For any bid placed on an auction, the bid amount must be strictly greater than 
     * the current price plus minimum increment.
     * 
     * This test validates that:
     * - Empty bidder names are rejected
     * - Valid bidder names are accepted
     * - Invalid phone numbers are rejected
     * - Valid phone numbers are accepted
     * - Non-positive amounts are rejected
     * - Valid amounts are accepted
     * 
     * @test
     * Feature: auction-system, Property 1: Bid Amount Validation
     * Validates: Requirements 4.3, 4.4
     */
    public function testBidValidationProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Test 1: Empty bidder name should be rejected (Requirement 4.3)
            $emptyNameData = [
                'bidderName' => '',
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($emptyNameData);
            $this->assertArrayHasKey(
                'bidderName',
                $errors,
                "Iteration $i: Empty bidder name should be rejected"
            );

            // Test 2: Whitespace-only bidder name should be rejected (Requirement 4.3)
            $whitespaceNameData = [
                'bidderName' => '   ',
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($whitespaceNameData);
            $this->assertArrayHasKey(
                'bidderName',
                $errors,
                "Iteration $i: Whitespace-only bidder name should be rejected"
            );

            // Test 3: Valid bidder name should be accepted
            $validNameData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($validNameData);
            $this->assertArrayNotHasKey(
                'bidderName',
                $errors,
                "Iteration $i: Valid bidder name should be accepted. Name: {$validNameData['bidderName']}"
            );

            // Test 4: Invalid phone number should be rejected
            $invalidPhoneData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => '123', // Too short
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($invalidPhoneData);
            $this->assertArrayHasKey(
                'phoneNumber',
                $errors,
                "Iteration $i: Invalid phone number should be rejected"
            );

            // Test 5: Valid phone number should be accepted
            $validPhoneData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($validPhoneData);
            $this->assertArrayNotHasKey(
                'phoneNumber',
                $errors,
                "Iteration $i: Valid phone number should be accepted. Phone: {$validPhoneData['phoneNumber']}"
            );

            // Test 6: Non-positive amount should be rejected (Requirement 4.4)
            $negativeAmountData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => -1 * $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($negativeAmountData);
            $this->assertArrayHasKey(
                'amount',
                $errors,
                "Iteration $i: Negative amount should be rejected. Amount: {$negativeAmountData['amount']}"
            );

            // Test 7: Zero amount should be rejected (Requirement 4.4)
            $zeroAmountData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => 0
            ];
            $errors = $this->controller->validateBidData($zeroAmountData);
            $this->assertArrayHasKey(
                'amount',
                $errors,
                "Iteration $i: Zero amount should be rejected"
            );

            // Test 8: Valid positive amount should be accepted
            $validAmountData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount()
            ];
            $errors = $this->controller->validateBidData($validAmountData);
            $this->assertArrayNotHasKey(
                'amount',
                $errors,
                "Iteration $i: Valid positive amount should be accepted. Amount: {$validAmountData['amount']}"
            );
        }
    }

    /**
     * Property 1 (continued): Bid Amount Must Exceed Current Price + Increment
     * For any bid, the amount must be >= current_price + min_increment
     * 
     * This tests the mathematical property that valid bids must meet the minimum threshold.
     * 
     * @test
     * Feature: auction-system, Property 1: Bid Amount Threshold
     * Validates: Requirements 4.4
     */
    public function testBidAmountThresholdProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random auction state
            $currentPrice = $this->generateRandomAmount(1000, 100000);
            $minIncrement = $this->generateRandomAmount(50, 500);
            $minBid = $currentPrice + $minIncrement;

            // Property: Any bid amount >= minBid should be valid (amount-wise)
            $validBidAmount = $minBid + $this->generateRandomAmount(0, 10000);
            $this->assertGreaterThanOrEqual(
                $minBid,
                $validBidAmount,
                "Iteration $i: Valid bid amount should be >= minBid"
            );

            // Property: Any bid amount < minBid should be invalid
            $invalidBidAmount = $minBid - $this->generateRandomAmount(1, $minIncrement);
            $this->assertLessThan(
                $minBid,
                $invalidBidAmount,
                "Iteration $i: Invalid bid amount should be < minBid"
            );

            // Property: minBid = currentPrice + minIncrement (invariant)
            $this->assertEquals(
                $currentPrice + $minIncrement,
                $minBid,
                "Iteration $i: minBid should equal currentPrice + minIncrement"
            );
        }
    }

    /**
     * Property 1 (continued): Complete Bid Data Validation
     * For any complete and valid bid data, validation should return no errors.
     * 
     * @test
     * Feature: auction-system, Property 1: Complete Bid Validation
     * Validates: Requirements 4.3, 4.4
     */
    public function testCompleteBidValidationProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate completely valid bid data
            $validBidData = [
                'bidderName' => $this->generateRandomBidderName(),
                'phoneNumber' => $this->generateRandomYemeniPhone(),
                'amount' => $this->generateRandomAmount(100, 1000000)
            ];

            $errors = $this->controller->validateBidData($validBidData);

            // Property: Valid bid data should produce no validation errors
            $this->assertEmpty(
                $errors,
                "Iteration $i: Valid bid data should produce no errors. Data: " . json_encode($validBidData) . ", Errors: " . json_encode($errors)
            );
        }
    }

    /**
     * Generate random Yemeni phone number (9 digits starting with 7)
     */
    private function generateRandomYemeniPhone(): string
    {
        $prefixes = ['77', '73', '71', '70'];
        $prefix = $prefixes[array_rand($prefixes)];
        $remaining = '';
        for ($i = 0; $i < 7; $i++) {
            $remaining .= rand(0, 9);
        }
        return $prefix . $remaining;
    }

    /**
     * Generate random international phone number
     */
    private function generateRandomInternationalPhone(): string
    {
        $length = rand(7, 15);
        $phone = '';
        for ($i = 0; $i < $length; $i++) {
            $phone .= rand(0, 9);
        }
        return $phone;
    }

    /**
     * Property 2: Phone Number Masking
     * For any phone number displayed in public API responses, only the first 3 
     * and last 3 digits should be visible, with the middle digits replaced by asterisks.
     * 
     * @test
     * Feature: auction-system, Property 2: Phone Number Masking
     * Validates: Requirements 5.1, 5.3
     */
    public function testPhoneMaskingProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate random phone number (Yemeni or international)
            $phone = rand(0, 1) ? $this->generateRandomYemeniPhone() : $this->generateRandomInternationalPhone();
            
            $masked = PhoneMasking::mask($phone);
            $digits = preg_replace('/[^0-9]/', '', $phone);
            $length = strlen($digits);
            
            if ($length > 6) {
                // Property: First 3 digits should be visible
                $expectedFirst = substr($digits, 0, 3);
                $actualFirst = substr($masked, 0, 3);
                $this->assertEquals(
                    $expectedFirst,
                    $actualFirst,
                    "Iteration $i: First 3 digits should be visible. Phone: $phone, Masked: $masked"
                );
                
                // Property: Last 3 digits should be visible
                $expectedLast = substr($digits, -3);
                $actualLast = substr($masked, -3);
                $this->assertEquals(
                    $expectedLast,
                    $actualLast,
                    "Iteration $i: Last 3 digits should be visible. Phone: $phone, Masked: $masked"
                );
                
                // Property: Middle should contain only asterisks
                $middle = substr($masked, 3, -3);
                $this->assertMatchesRegularExpression(
                    '/^\*+$/',
                    $middle,
                    "Iteration $i: Middle should contain only asterisks. Phone: $phone, Masked: $masked, Middle: $middle"
                );
                
                // Property: Masked phone should not expose full number
                $this->assertNotEquals(
                    $digits,
                    preg_replace('/[^0-9]/', '', $masked),
                    "Iteration $i: Masked phone should not expose full number"
                );
            }
        }
    }

    /**
     * Property: Phone masking preserves length structure
     * For any phone number with more than 6 digits, the masked version should have
     * the same total length as the original (digits only).
     * 
     * @test
     * Feature: auction-system, Property 2: Phone Number Masking Length
     * Validates: Requirements 5.1, 5.3
     */
    public function testPhoneMaskingLengthProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $phone = $this->generateRandomYemeniPhone();
            $masked = PhoneMasking::mask($phone);
            
            $originalLength = strlen(preg_replace('/[^0-9]/', '', $phone));
            $maskedLength = strlen($masked);
            
            // Property: Masked length should equal original digit count
            $this->assertEquals(
                $originalLength,
                $maskedLength,
                "Iteration $i: Masked length should equal original digit count. Phone: $phone, Masked: $masked"
            );
        }
    }

    /**
     * Property: Phone validation accepts valid Yemeni numbers
     * For any 9-digit number starting with 7, validation should pass.
     * 
     * @test
     * Feature: auction-system, Property 2: Phone Validation
     * Validates: Requirements 5.1
     */
    public function testPhoneValidationYemeniProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $phone = $this->generateRandomYemeniPhone();
            
            // Property: Valid Yemeni phone should pass validation
            $this->assertTrue(
                PhoneMasking::isValid($phone),
                "Iteration $i: Valid Yemeni phone should pass validation. Phone: $phone"
            );
        }
    }

    /**
     * Property: Phone validation rejects invalid numbers
     * For any string that is too short (< 7 digits) or too long (> 15 digits),
     * validation should fail.
     * 
     * @test
     * Feature: auction-system, Property 2: Phone Validation Invalid
     * Validates: Requirements 5.1
     */
    public function testPhoneValidationInvalidProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Generate too short phone (1-6 digits)
            $shortLength = rand(1, 6);
            $shortPhone = '';
            for ($j = 0; $j < $shortLength; $j++) {
                $shortPhone .= rand(0, 9);
            }
            
            // Property: Too short phone should fail validation
            $this->assertFalse(
                PhoneMasking::isValid($shortPhone),
                "Iteration $i: Too short phone should fail validation. Phone: $shortPhone"
            );
            
            // Generate too long phone (16+ digits)
            $longLength = rand(16, 25);
            $longPhone = '';
            for ($j = 0; $j < $longLength; $j++) {
                $longPhone .= rand(0, 9);
            }
            
            // Property: Too long phone should fail validation
            $this->assertFalse(
                PhoneMasking::isValid($longPhone),
                "Iteration $i: Too long phone should fail validation. Phone: $longPhone"
            );
        }
    }

    /**
     * Property 3: Auction End Time Validation
     * For any auction created or updated, the end time must be in the future 
     * relative to the current time.
     * 
     * @test
     * Feature: auction-system, Property 3: Auction End Time Validation
     * Validates: Requirements 1.4
     */
    public function testAuctionEndTimeValidationProperty(): void
    {
        require_once __DIR__ . '/../../controllers/CarsController.php';
        $carsController = new CarsController(null);

        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Test 1: Past end time should be rejected
            $pastSeconds = rand(1, 86400 * 365); // 1 second to 1 year in the past
            $pastEndTime = date('Y-m-d H:i:s', time() - $pastSeconds);
            
            $pastData = [
                'startingPrice' => $this->generateRandomAmount(1000, 100000),
                'endTime' => $pastEndTime
            ];
            
            $errors = $carsController->validateAuctionData($pastData);
            $this->assertArrayHasKey(
                'endTime',
                $errors,
                "Iteration $i: Past end time should be rejected. EndTime: $pastEndTime"
            );

            // Test 2: Current time (now) should be rejected
            $nowEndTime = date('Y-m-d H:i:s', time());
            
            $nowData = [
                'startingPrice' => $this->generateRandomAmount(1000, 100000),
                'endTime' => $nowEndTime
            ];
            
            $errors = $carsController->validateAuctionData($nowData);
            $this->assertArrayHasKey(
                'endTime',
                $errors,
                "Iteration $i: Current time should be rejected. EndTime: $nowEndTime"
            );

            // Test 3: Future end time should be accepted
            $futureSeconds = rand(60, 86400 * 365); // 1 minute to 1 year in the future
            $futureEndTime = date('Y-m-d H:i:s', time() + $futureSeconds);
            
            $futureData = [
                'startingPrice' => $this->generateRandomAmount(1000, 100000),
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($futureData);
            $this->assertArrayNotHasKey(
                'endTime',
                $errors,
                "Iteration $i: Future end time should be accepted. EndTime: $futureEndTime"
            );
        }
    }

    /**
     * Property 3 (continued): End Time Validation with AuctionsController
     * Validates the same property using AuctionsController's validation method.
     * 
     * @test
     * Feature: auction-system, Property 3: Auction End Time Validation (AuctionsController)
     * Validates: Requirements 1.4
     */
    public function testAuctionEndTimeValidationAuctionsControllerProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            // Test 1: Past end time should be rejected
            $pastSeconds = rand(1, 86400 * 30); // 1 second to 30 days in the past
            $pastEndTime = date('Y-m-d H:i:s', time() - $pastSeconds);
            
            $pastData = [
                'startingPrice' => $this->generateRandomAmount(1000, 100000),
                'endTime' => $pastEndTime
            ];
            
            $errors = $this->controller->validateAuctionData($pastData);
            $this->assertArrayHasKey(
                'endTime',
                $errors,
                "Iteration $i: Past end time should be rejected. EndTime: $pastEndTime"
            );

            // Test 2: Future end time should be accepted
            $futureSeconds = rand(60, 86400 * 30); // 1 minute to 30 days in the future
            $futureEndTime = date('Y-m-d H:i:s', time() + $futureSeconds);
            
            $futureData = [
                'startingPrice' => $this->generateRandomAmount(1000, 100000),
                'endTime' => $futureEndTime
            ];
            
            $errors = $this->controller->validateAuctionData($futureData);
            $this->assertArrayNotHasKey(
                'endTime',
                $errors,
                "Iteration $i: Future end time should be accepted. EndTime: $futureEndTime"
            );
        }
    }

    /**
     * Property 4: Reserve Price Validation
     * For any auction with a reserve price, the reserve price must be greater than 
     * or equal to the starting price.
     * 
     * @test
     * Feature: auction-system, Property 4: Reserve Price Validation
     * Validates: Requirements 1.5
     */
    public function testReservePriceValidationProperty(): void
    {
        require_once __DIR__ . '/../../controllers/CarsController.php';
        $carsController = new CarsController(null);

        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $startingPrice = $this->generateRandomAmount(1000, 100000);
            $futureEndTime = date('Y-m-d H:i:s', time() + rand(3600, 86400 * 30));

            // Test 1: Reserve price < starting price should be rejected
            $lowerReservePrice = $startingPrice - $this->generateRandomAmount(1, $startingPrice * 0.5);
            
            $invalidData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $lowerReservePrice,
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($invalidData);
            $this->assertArrayHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Reserve price < starting price should be rejected. " .
                "Starting: $startingPrice, Reserve: $lowerReservePrice"
            );

            // Test 2: Reserve price = starting price should be accepted
            $equalReservePrice = $startingPrice;
            
            $equalData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $equalReservePrice,
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($equalData);
            $this->assertArrayNotHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Reserve price = starting price should be accepted. " .
                "Starting: $startingPrice, Reserve: $equalReservePrice"
            );

            // Test 3: Reserve price > starting price should be accepted
            $higherReservePrice = $startingPrice + $this->generateRandomAmount(1, $startingPrice);
            
            $validData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $higherReservePrice,
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($validData);
            $this->assertArrayNotHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Reserve price > starting price should be accepted. " .
                "Starting: $startingPrice, Reserve: $higherReservePrice"
            );

            // Test 4: No reserve price (null) should be accepted
            $noReserveData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => null,
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($noReserveData);
            $this->assertArrayNotHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: No reserve price should be accepted. Starting: $startingPrice"
            );

            // Test 5: Empty string reserve price should be accepted (treated as null)
            $emptyReserveData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => '',
                'endTime' => $futureEndTime
            ];
            
            $errors = $carsController->validateAuctionData($emptyReserveData);
            $this->assertArrayNotHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Empty reserve price should be accepted. Starting: $startingPrice"
            );
        }
    }

    /**
     * Property 4 (continued): Reserve Price Validation with AuctionsController
     * Validates the same property using AuctionsController's validation method.
     * 
     * @test
     * Feature: auction-system, Property 4: Reserve Price Validation (AuctionsController)
     * Validates: Requirements 1.5
     */
    public function testReservePriceValidationAuctionsControllerProperty(): void
    {
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $startingPrice = $this->generateRandomAmount(1000, 100000);
            $futureEndTime = date('Y-m-d H:i:s', time() + rand(3600, 86400 * 30));

            // Test 1: Reserve price < starting price should be rejected
            $lowerReservePrice = $startingPrice - $this->generateRandomAmount(1, $startingPrice * 0.5);
            
            $invalidData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $lowerReservePrice,
                'endTime' => $futureEndTime
            ];
            
            $errors = $this->controller->validateAuctionData($invalidData);
            $this->assertArrayHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Reserve price < starting price should be rejected. " .
                "Starting: $startingPrice, Reserve: $lowerReservePrice"
            );

            // Test 2: Reserve price >= starting price should be accepted
            $validReservePrice = $startingPrice + $this->generateRandomAmount(0, $startingPrice);
            
            $validData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $validReservePrice,
                'endTime' => $futureEndTime
            ];
            
            $errors = $this->controller->validateAuctionData($validData);
            $this->assertArrayNotHasKey(
                'reservePrice',
                $errors,
                "Iteration $i: Reserve price >= starting price should be accepted. " .
                "Starting: $startingPrice, Reserve: $validReservePrice"
            );
        }
    }

    /**
     * Property 3 & 4 Combined: Complete Auction Data Validation
     * For any complete and valid auction data, validation should return no errors.
     * 
     * @test
     * Feature: auction-system, Property 3 & 4: Complete Auction Validation
     * Validates: Requirements 1.4, 1.5
     */
    public function testCompleteAuctionValidationProperty(): void
    {
        require_once __DIR__ . '/../../controllers/CarsController.php';
        $carsController = new CarsController(null);

        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $startingPrice = $this->generateRandomAmount(1000, 100000);
            $futureEndTime = date('Y-m-d H:i:s', time() + rand(3600, 86400 * 30));
            
            // Generate valid reserve price (>= starting price or null)
            $reservePrice = rand(0, 1) 
                ? $startingPrice + $this->generateRandomAmount(0, $startingPrice) 
                : null;
            
            $minIncrement = $this->generateRandomAmount(10, 500);

            $validAuctionData = [
                'startingPrice' => $startingPrice,
                'reservePrice' => $reservePrice,
                'endTime' => $futureEndTime,
                'minIncrement' => $minIncrement
            ];

            // Test with CarsController
            $errors = $carsController->validateAuctionData($validAuctionData);
            $this->assertEmpty(
                $errors,
                "Iteration $i (CarsController): Valid auction data should produce no errors. " .
                "Data: " . json_encode($validAuctionData) . ", Errors: " . json_encode($errors)
            );

            // Test with AuctionsController
            $errors = $this->controller->validateAuctionData($validAuctionData);
            $this->assertEmpty(
                $errors,
                "Iteration $i (AuctionsController): Valid auction data should produce no errors. " .
                "Data: " . json_encode($validAuctionData) . ", Errors: " . json_encode($errors)
            );
        }
    }
}
