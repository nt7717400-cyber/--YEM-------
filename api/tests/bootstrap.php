<?php
/**
 * PHPUnit Bootstrap
 */

// Load composer autoloader if available
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Load application files
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../controllers/InspectionController.php';
require_once __DIR__ . '/../controllers/BannersController.php';

// Define test constants
define('TESTING', true);
