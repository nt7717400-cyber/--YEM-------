<?php
/**
 * Full System Test Suite
 * Tests all API endpoints and security features
 */

$baseUrl = 'http://localhost:8000/api';
$passed = 0;
$failed = 0;
$tests = [];

function test($name, $condition, $details = '') {
    global $passed, $failed, $tests;
    if ($condition) {
        echo "✓ {$name}\n";
        $passed++;
        $tests[] = ['name' => $name, 'status' => 'PASS'];
    } else {
        echo "✗ {$name}" . ($details ? " - {$details}" : "") . "\n";
        $failed++;
        $tests[] = ['name' => $name, 'status' => 'FAIL', 'details' => $details];
    }
}

function apiRequest($method, $endpoint, $data = null, $token = null) {
    global $baseUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_filter([
        'Content-Type: application/json',
        $token ? "Authorization: Bearer {$token}" : null
    ]));
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headers = [];
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║           FULL SYSTEM TEST SUITE - Yemen Car Showroom        ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// =====================================================
// 1. Health Check
// =====================================================
echo "=== 1. Health Check ===\n";
$res = apiRequest('GET', '/health');
test('Health endpoint returns 200', $res['code'] === 200);
test('Health status is healthy', $res['body']['data']['status'] === 'healthy');

// =====================================================
// 2. Public Endpoints (No Auth)
// =====================================================
echo "\n=== 2. Public Endpoints ===\n";

// Cars listing
$res = apiRequest('GET', '/cars');
test('GET /cars returns 200', $res['code'] === 200);
test('Cars response has data array', isset($res['body']['data']) && is_array($res['body']['data']));
test('Cars response has pagination', isset($res['body']['pagination']));

// Single car
$res = apiRequest('GET', '/cars/17');
test('GET /cars/17 returns 200', $res['code'] === 200);
test('Car has inspection data', isset($res['body']['data']['inspection']) || $res['body']['data']['condition'] === 'NEW');

// Brands
$res = apiRequest('GET', '/brands');
test('GET /brands returns 200', $res['code'] === 200);
test('Brands is array', is_array($res['body']['data']));

// Settings
$res = apiRequest('GET', '/settings');
test('GET /settings returns 200', $res['code'] === 200);
test('Settings has name', isset($res['body']['data']['name']));

// Auctions
$res = apiRequest('GET', '/auctions');
test('GET /auctions returns 200', $res['code'] === 200);

// Banners by position
$res = apiRequest('GET', '/banners/position/hero_top');
test('GET /banners/position/hero_top returns 200', $res['code'] === 200);

// =====================================================
// 3. Authentication
// =====================================================
echo "\n=== 3. Authentication ===\n";

// Failed login
$res = apiRequest('POST', '/auth/login', ['username' => 'admin', 'password' => 'wrongpassword']);
test('Invalid login returns 401', $res['code'] === 401);

// Successful login
$res = apiRequest('POST', '/auth/login', ['username' => 'admin', 'password' => 'admin123']);
$token = $res['body']['data']['token'] ?? null;
test('Valid login returns 200', $res['code'] === 200);
test('Login returns token', !empty($token));

// Token verification
if ($token) {
    $res = apiRequest('GET', '/auth/verify', null, $token);
    test('Token verification returns valid', $res['body']['data']['valid'] === true);
}

// =====================================================
// 4. Protected Endpoints
// =====================================================
echo "\n=== 4. Protected Endpoints ===\n";

// Without token
$res = apiRequest('GET', '/banners');
test('GET /banners without token returns 401', $res['code'] === 401);

// With token
if ($token) {
    $res = apiRequest('GET', '/banners', null, $token);
    test('GET /banners with token returns 200', $res['code'] === 200);
    
    $res = apiRequest('GET', '/stats', null, $token);
    test('GET /stats with token returns 200', $res['code'] === 200);
    test('Stats has totalCars', isset($res['body']['data']['totalCars']));
}

// =====================================================
// 5. Security Features
// =====================================================
echo "\n=== 5. Security Features ===\n";

// Rate limiting (check headers)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/cars');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
curl_close($ch);

test('Rate limit headers present', strpos($headers, 'X-RateLimit-Limit') !== false);
test('Security headers present', strpos($headers, 'X-Content-Type-Options') !== false);

// CORS check
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/cars');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Origin: http://localhost:3000']);
$response = curl_exec($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
curl_close($ch);

test('CORS allows localhost:3000', strpos($headers, 'Access-Control-Allow-Origin') !== false);

// =====================================================
// 6. VDS/Inspection System
// =====================================================
echo "\n=== 6. VDS/Inspection System ===\n";

$res = apiRequest('GET', '/cars/17/inspection');
test('GET /cars/17/inspection returns 200', $res['code'] === 200);
$inspection = $res['body']['data'] ?? null;
test('Inspection has damageDetails', isset($inspection['damageDetails']));
test('Inspection has mechanical data', isset($inspection['mechanical']));

// Color mappings
$res = apiRequest('GET', '/color-mappings');
test('GET /color-mappings returns 200', $res['code'] === 200);

// Part keys
$res = apiRequest('GET', '/part-keys');
test('GET /part-keys returns 200', $res['code'] === 200);

// Templates
$res = apiRequest('GET', '/templates');
test('GET /templates returns 200', $res['code'] === 200);

// =====================================================
// 7. Auction System
// =====================================================
echo "\n=== 7. Auction System ===\n";

$res = apiRequest('GET', '/auctions/1');
test('GET /auctions/1 returns 200', $res['code'] === 200);
$auction = $res['body']['data'] ?? null;
test('Auction has currentPrice', isset($auction['currentPrice']));
test('Auction has bidCount', isset($auction['bidCount']));

$res = apiRequest('GET', '/auctions/1/bids');
test('GET /auctions/1/bids returns 200', $res['code'] === 200);

// =====================================================
// 8. Performance Check
// =====================================================
echo "\n=== 8. Performance Check ===\n";

$start = microtime(true);
$res = apiRequest('GET', '/cars');
$duration = (microtime(true) - $start) * 1000;
test('Cars listing < 500ms', $duration < 500, round($duration) . 'ms');

$start = microtime(true);
$res = apiRequest('GET', '/cars/17');
$duration = (microtime(true) - $start) * 1000;
test('Single car < 300ms', $duration < 300, round($duration) . 'ms');

// =====================================================
// 9. Error Handling
// =====================================================
echo "\n=== 9. Error Handling ===\n";

$res = apiRequest('GET', '/cars/99999');
test('Non-existent car returns 404', $res['code'] === 404);
test('Error has message', isset($res['body']['error']['message']));

$res = apiRequest('GET', '/nonexistent');
test('Non-existent route returns 404', $res['code'] === 404);

// =====================================================
// Summary
// =====================================================
echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                        TEST SUMMARY                          ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";
printf("║  Passed: %-3d                                                ║\n", $passed);
printf("║  Failed: %-3d                                                ║\n", $failed);
printf("║  Total:  %-3d                                                ║\n", $passed + $failed);
echo "╠══════════════════════════════════════════════════════════════╣\n";
$percentage = round(($passed / ($passed + $failed)) * 100);
printf("║  Success Rate: %d%%                                         ║\n", $percentage);
echo "╚══════════════════════════════════════════════════════════════╝\n";

// Check audit log
echo "\n=== Audit Log Check ===\n";
$logFile = __DIR__ . '/logs/audit_' . date('Y-m') . '.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    echo "Audit log entries: " . count($lines) . "\n";
    echo "Last entry: " . end($lines) . "\n";
} else {
    echo "No audit log found\n";
}
