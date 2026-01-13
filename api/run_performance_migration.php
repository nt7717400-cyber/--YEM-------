<?php
/**
 * Run Performance Migration
 * Creates optimized indexes for better query performance
 */

require_once __DIR__ . '/config/database.php';

echo "=== Performance Migration ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "✓ Connected to database\n\n";
    
    // Define indexes to create
    $indexes = [
        // Cars table
        ['cars', 'idx_cars_status_created', 'status, created_at DESC'],
        ['cars', 'idx_cars_status_featured_created', 'status, is_featured, created_at DESC'],
        ['cars', 'idx_cars_status_price', 'status, price'],
        ['cars', 'idx_cars_status_brand_created', 'status, brand, created_at DESC'],
        ['cars', 'idx_cars_status_condition_created', 'status, car_condition, created_at DESC'],
        ['cars', 'idx_cars_status_year_created', 'status, year, created_at DESC'],
        
        // Car images table
        ['car_images', 'idx_car_images_car_order', 'car_id, image_order'],
        
        // Auctions table
        ['auctions', 'idx_auctions_status_endtime', 'status, end_time'],
        ['auctions', 'idx_auctions_car_id', 'car_id'],
        
        // Bids table
        ['bids', 'idx_bids_auction_created', 'auction_id, created_at DESC'],
        ['bids', 'idx_bids_auction_amount', 'auction_id, amount DESC'],
        
        // Banners table
        ['banners', 'idx_banners_position_active_order', 'position, is_active, display_order'],
        ['banners', 'idx_banners_active_dates', 'is_active, start_date, end_date'],
        
        // Car body parts table
        ['car_body_parts', 'idx_car_body_parts_car_part', 'car_id, part_id'],
    ];
    
    $success = 0;
    $skipped = 0;
    $failed = 0;
    
    foreach ($indexes as $index) {
        list($table, $indexName, $columns) = $index;
        
        try {
            // Check if index already exists
            $checkStmt = $db->prepare("SHOW INDEX FROM {$table} WHERE Key_name = ?");
            $checkStmt->execute([$indexName]);
            
            if ($checkStmt->fetch()) {
                echo "⊘ Skipped (exists): {$indexName} on {$table}\n";
                $skipped++;
                continue;
            }
            
            // Create index
            $sql = "CREATE INDEX {$indexName} ON {$table}({$columns})";
            $db->exec($sql);
            echo "✓ Created: {$indexName} on {$table}\n";
            $success++;
            
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                echo "⊘ Skipped (exists): {$indexName} on {$table}\n";
                $skipped++;
            } else {
                echo "✗ Failed: {$indexName} on {$table} - " . $e->getMessage() . "\n";
                $failed++;
            }
        }
    }
    
    echo "\n=== Migration Complete ===\n";
    echo "Created: {$success}\n";
    echo "Skipped: {$skipped}\n";
    echo "Failed: {$failed}\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
