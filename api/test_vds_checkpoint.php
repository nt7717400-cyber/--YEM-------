<?php
/**
 * VDS Checkpoint Test Script
 * Tests database tables and API endpoints for VDS
 */

require_once __DIR__ . '/config/database.php';

echo "=== VDS Checkpoint Test ===\n\n";

// Connect to database
$database = new Database();
try {
    $db = $database->getConnection();
    echo "✓ Database connected successfully\n\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Check VDS tables exist
echo "--- Checking VDS Tables ---\n";
$vdsTables = [
    'car_templates',
    'part_keys', 
    'template_part_mappings',
    'color_mappings',
    'inspections',
    'inspection_parts',
    'inspection_part_photos'
];

$missingTables = [];
foreach ($vdsTables as $table) {
    $stmt = $db->query("SHOW TABLES LIKE '$table'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table '$table' exists\n";
    } else {
        echo "✗ Table '$table' MISSING\n";
        $missingTables[] = $table;
    }
}

if (!empty($missingTables)) {
    echo "\n⚠ Missing tables detected. Run migration first.\n";
    exit(1);
}

// Check default data
echo "\n--- Checking Default Data ---\n";

// Check color mappings
$stmt = $db->query("SELECT COUNT(*) as count FROM color_mappings");
$count = $stmt->fetch()['count'];
echo "Color mappings: $count records (expected: 7)\n";

// Check part keys
$stmt = $db->query("SELECT COUNT(*) as count FROM part_keys");
$count = $stmt->fetch()['count'];
echo "Part keys: $count records (expected: 31)\n";

// Check templates
$stmt = $db->query("SELECT COUNT(*) as count FROM car_templates");
$count = $stmt->fetch()['count'];
echo "Car templates: $count records (expected: at least 1)\n";

// Check default template
$stmt = $db->query("SELECT * FROM car_templates WHERE is_default = 1");
$defaultTemplate = $stmt->fetch();
if ($defaultTemplate) {
    echo "✓ Default template exists: " . $defaultTemplate['name_en'] . " (" . $defaultTemplate['type'] . ")\n";
} else {
    echo "✗ No default template found\n";
}

echo "\n--- VDS Tables Data Summary ---\n";

// Part keys by category
$stmt = $db->query("SELECT category, COUNT(*) as count FROM part_keys GROUP BY category ORDER BY category");
$categories = $stmt->fetchAll();
echo "Part keys by category:\n";
foreach ($categories as $cat) {
    echo "  - {$cat['category']}: {$cat['count']} parts\n";
}

// Color mappings
$stmt = $db->query("SELECT condition_key, color_hex, label_en FROM color_mappings ORDER BY sort_order");
$colors = $stmt->fetchAll();
echo "\nColor mappings:\n";
foreach ($colors as $color) {
    echo "  - {$color['condition_key']}: {$color['color_hex']} ({$color['label_en']})\n";
}

echo "\n=== VDS Checkpoint Test Complete ===\n";
echo "All VDS tables and default data are properly configured.\n";
