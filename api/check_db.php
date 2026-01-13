<?php
require 'config/database.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query('DESCRIBE car_inspection');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { 
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL; 
}
