<?php
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if damage_details column exists
    $result = $db->query("SHOW COLUMNS FROM car_inspection LIKE 'damage_details'");
    if ($result->rowCount() == 0) {
        $db->exec("ALTER TABLE car_inspection ADD COLUMN damage_details LONGTEXT NULL COMMENT 'JSON containing extended damage details with photos and notes'");
        echo "Column damage_details added successfully\n";
    } else {
        echo "Column damage_details already exists\n";
    }
    
    // Check if tires_status column exists
    $result = $db->query("SHOW COLUMNS FROM car_inspection LIKE 'tires_status'");
    if ($result->rowCount() == 0) {
        $db->exec("ALTER TABLE car_inspection ADD COLUMN tires_status JSON DEFAULT NULL COMMENT 'JSON object storing tire status for each position'");
        echo "Column tires_status added successfully\n";
    } else {
        echo "Column tires_status already exists\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
