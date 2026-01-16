<?php
/**
 * Yemen Car Showroom API Router
 * Main entry point for all API requests
 * Requirements: 6.4
 * Security: Enhanced with rate limiting, security headers, and CORS
 */

// Set timezone to Yemen (UTC+3)
date_default_timezone_set('Asia/Aden');

// Error reporting (disable in production)
$isProduction = getenv('APP_ENV') === 'production';
error_reporting($isProduction ? 0 : E_ALL);
ini_set('display_errors', 0); // Never display errors to users
ini_set('log_errors', 1);

// Create logs directory if not exists
$logsDir = __DIR__ . '/logs';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0755, true);
}
ini_set('error_log', $logsDir . '/error.log');

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Parse URI - remove query string and base path
$uri = parse_url($uri, PHP_URL_PATH);

// Serve static files from uploads directory
if (preg_match('#^(/api)?/uploads/(images|videos|banners)/(.+)$#', $uri, $matches)) {
    $type = $matches[2];
    $filename = $matches[3];
    $filePath = __DIR__ . '/uploads/' . $type . '/' . $filename;
    
    // Handle CORS preflight for static files
    if ($method === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');
        header('Access-Control-Max-Age: 86400');
        http_response_code(200);
        exit;
    }
    
    if (file_exists($filePath)) {
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'ogg' => 'video/ogg',
            'mov' => 'video/quicktime',
        ];
        
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimeType = $mimeTypes[$ext] ?? 'application/octet-stream';
        $fileSize = filesize($filePath);
        
        // CORS headers for all static files (images, videos, banners)
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');
        
        // Handle video files with Range Requests support
        if ($type === 'videos') {
            if (ob_get_level()) ob_end_clean();
            
            $start = 0;
            $end = $fileSize - 1;
            $length = $fileSize;
            
            header('Content-Type: ' . $mimeType);
            header('Accept-Ranges: bytes');
            
            if (isset($_SERVER['HTTP_RANGE'])) {
                $range = $_SERVER['HTTP_RANGE'];
                
                if (preg_match('/bytes=(\d*)-(\d*)/', $range, $matches)) {
                    $start = $matches[1] === '' ? 0 : intval($matches[1]);
                    $end = $matches[2] === '' ? $fileSize - 1 : intval($matches[2]);
                    
                    if ($end >= $fileSize) $end = $fileSize - 1;
                    if ($start > $end) {
                        header('HTTP/1.1 416 Range Not Satisfiable');
                        header("Content-Range: bytes */$fileSize");
                        exit;
                    }
                    
                    $length = $end - $start + 1;
                    
                    header('HTTP/1.1 206 Partial Content');
                    header("Content-Range: bytes $start-$end/$fileSize");
                }
            }
            
            header("Content-Length: $length");
            header('Cache-Control: no-cache, no-store, must-revalidate');
            
            $handle = fopen($filePath, 'rb');
            if ($handle) {
                fseek($handle, $start);
                $remaining = $length;
                while ($remaining > 0 && !feof($handle)) {
                    $chunk = min(8192, $remaining);
                    echo fread($handle, $chunk);
                    $remaining -= $chunk;
                    flush();
                }
                fclose($handle);
            }
            exit;
        }
        
        // Handle image files
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . $fileSize);
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
        exit;
    }
    
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => ['message' => 'File not found']]);
    exit;
}

// Load required files
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/SecurityHeaders.php';
require_once __DIR__ . '/middleware/RateLimiter.php';

// Handle CORS preflight
CORS::handlePreflight();

// Set CORS and Security headers
CORS::setHeaders();
SecurityHeaders::setHeaders();

// Apply general API rate limiting
if (!RateLimiter::check('api')) {
    exit; // Response already sent by RateLimiter
}

// Remove /api prefix if present
$uri = preg_replace('#^/api#', '', $uri);

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    Response::error('خطأ في الاتصال بقاعدة البيانات', 500, 'DB_001');
}

// Load controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/CarsController.php';
require_once __DIR__ . '/controllers/BannersController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/InspectionController.php';
require_once __DIR__ . '/controllers/AuctionsController.php';
require_once __DIR__ . '/controllers/ImagesController.php';
require_once __DIR__ . '/controllers/VideosController.php';

// Load VDS controllers
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/TemplatesController.php';
require_once __DIR__ . '/controllers/PartKeysController.php';
require_once __DIR__ . '/controllers/ColorMappingsController.php';
if (file_exists(__DIR__ . '/controllers/VDSInspectionsController.php')) {
    require_once __DIR__ . '/controllers/VDSInspectionsController.php';
}

// Initialize controllers
$authController = new AuthController($db);
$carsController = new CarsController($db);
$bannersController = new BannersController($db);
$settingsController = new SettingsController($db);
$inspectionController = new InspectionController($db);
$auctionsController = new AuctionsController($db);
$statsController = new StatsController($db);
$templatesController = new TemplatesController($db);
$partKeysController = new PartKeysController($db);
$colorMappingsController = new ColorMappingsController($db);
$imagesController = new ImagesController($db);
$videosController = new VideosController($db);


// =====================================================
// ROUTING
// =====================================================

// Auth Routes
if (preg_match('#^/auth/login$#', $uri) && $method === 'POST') {
    // Apply stricter rate limiting for login
    if (!RateLimiter::check('login')) {
        exit;
    }
    $authController->login();
}
elseif (preg_match('#^/auth/logout$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $authController->logout();
}
elseif (preg_match('#^/auth/verify$#', $uri) && $method === 'GET') {
    $authController->verify();
}

// Cars Routes (Public)
elseif (preg_match('#^/cars$#', $uri) && $method === 'GET') {
    $carsController->getAll();
}
elseif (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $carsController->getById((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/view$#', $uri, $matches) && $method === 'POST') {
    $carsController->incrementViewCount((int)$matches[1]);
}
elseif (preg_match('#^/brands$#', $uri) && $method === 'GET') {
    $carsController->getBrands();
}

// Cars Routes (Admin - Protected)
elseif (preg_match('#^/cars$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) {
        exit;
    }
    $carsController->create();
}
elseif (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $carsController->update((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $carsController->delete((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/images$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) {
        exit;
    }
    $imagesController->upload((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/images/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $imagesController->delete((int)$matches[2]);
}
elseif (preg_match('#^/cars/(\d+)/images/reorder$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $imagesController->reorder((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/video$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) {
        exit;
    }
    $videosController->add((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/video$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $videosController->deleteForCar((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/featured$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $carsController->toggleFeatured((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/status$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $carsController->updateStatus((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/duplicate$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $carsController->duplicate((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/archive$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $carsController->archive((int)$matches[1]);
}

// Inspection Routes
elseif (preg_match('#^/cars/(\d+)/inspection$#', $uri, $matches) && $method === 'GET') {
    $inspectionController->getInspection((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/inspection$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $inspectionController->saveInspection((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/inspection$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $inspectionController->saveInspection((int)$matches[1]);
}

// Banners Routes (Public)
elseif (preg_match('#^/banners/position/([a-z_]+)$#', $uri, $matches) && $method === 'GET') {
    $bannersController->getByPosition($matches[1]);
}
elseif (preg_match('#^/banners/(\d+)/click$#', $uri, $matches) && $method === 'POST') {
    $bannersController->trackClick((int)$matches[1]);
}
elseif (preg_match('#^/banners/(\d+)/view$#', $uri, $matches) && $method === 'POST') {
    $bannersController->trackView((int)$matches[1]);
}

// Banners Routes (Admin - Protected)
elseif (preg_match('#^/banners$#', $uri) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $bannersController->getAll();
}
elseif (preg_match('#^/banners/(\d+)$#', $uri, $matches) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $bannersController->getById((int)$matches[1]);
}
elseif (preg_match('#^/banners$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) {
        exit;
    }
    $bannersController->create();
}
elseif (preg_match('#^/banners/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $bannersController->update((int)$matches[1]);
}
elseif (preg_match('#^/banners/(\d+)$#', $uri, $matches) && $method === 'POST') {
    // Support POST for update (FormData works better with POST)
    AuthMiddleware::authenticate();
    $bannersController->update((int)$matches[1]);
}
elseif (preg_match('#^/banners/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $bannersController->delete((int)$matches[1]);
}
elseif (preg_match('#^/banners/(\d+)/toggle$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $bannersController->toggleActive((int)$matches[1]);
}

// Settings Routes
elseif (preg_match('#^/settings$#', $uri) && $method === 'GET') {
    $settingsController->get();
}
elseif (preg_match('#^/settings$#', $uri) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $settingsController->update();
}

// Auctions Routes (Public)
elseif (preg_match('#^/auctions$#', $uri) && $method === 'GET') {
    $auctionsController->index();
}
elseif (preg_match('#^/auctions/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $auctionsController->show((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)/bids$#', $uri, $matches) && $method === 'GET') {
    $auctionsController->getBids((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)/bids$#', $uri, $matches) && $method === 'POST') {
    if (!RateLimiter::check('bid')) {
        exit;
    }
    $auctionsController->placeBid((int)$matches[1]);
}

// Auctions Routes (Admin - Protected)
elseif (preg_match('#^/admin/auctions$#', $uri) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $auctionsController->setAdminStatus(true);
    $auctionsController->index();
}
elseif (preg_match('#^/admin/auctions/(\d+)$#', $uri, $matches) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $auctionsController->setAdminStatus(true);
    $auctionsController->show((int)$matches[1]);
}
elseif (preg_match('#^/admin/auctions/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $auctionsController->update((int)$matches[1]);
}
elseif (preg_match('#^/admin/auctions/(\d+)/status$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $auctionsController->updateStatus((int)$matches[1]);
}
// Direct auction routes (without /admin prefix)
elseif (preg_match('#^/auctions/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $auctionsController->update((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $auctionsController->delete((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)/bids/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $auctionsController->deleteBid((int)$matches[1], (int)$matches[2]);
}

// Dashboard Stats (Admin - Protected)
elseif (preg_match('#^/stats$#', $uri) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $statsController->getDashboardStats();
}


// VDS Templates Routes (Admin - Protected)
elseif (preg_match('#^/templates$#', $uri) && $method === 'GET') {
    $templatesController->getAll();
}
elseif (preg_match('#^/templates/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $templatesController->getById((int)$matches[1]);
}
elseif (preg_match('#^/templates$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $templatesController->create();
}
elseif (preg_match('#^/templates/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $templatesController->update((int)$matches[1]);
}
elseif (preg_match('#^/templates/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $templatesController->delete((int)$matches[1]);
}

// VDS Part Keys Routes
elseif (preg_match('#^/part-keys$#', $uri) && $method === 'GET') {
    $partKeysController->getAll();
}
elseif (preg_match('#^/part-keys/([a-z_]+)$#', $uri, $matches) && $method === 'GET') {
    $partKeysController->getByKey($matches[1]);
}
elseif (preg_match('#^/part-keys$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $partKeysController->create();
}
elseif (preg_match('#^/part-keys/([a-z_]+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $partKeysController->update($matches[1]);
}

// VDS Color Mappings Routes
elseif (preg_match('#^/color-mappings$#', $uri) && $method === 'GET') {
    $colorMappingsController->getAll();
}
elseif (preg_match('#^/color-mappings/([a-z_]+)$#', $uri, $matches) && $method === 'GET') {
    $colorMappingsController->getByCondition($matches[1]);
}
elseif (preg_match('#^/color-mappings/([a-z_]+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $colorMappingsController->updateSingle($matches[1]);
}
elseif (preg_match('#^/color-mappings/reset$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    $colorMappingsController->reset();
}

// VDS Inspections Routes
elseif (preg_match('#^/vds/inspections$#', $uri) && $method === 'GET') {
    AuthMiddleware::authenticate();
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->getAll();
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)$#', $uri, $matches) && $method === 'GET') {
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->getById((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->create();
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->update((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)/finalize$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->finalize((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)/parts/([a-z_]+)/photos$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) {
        exit;
    }
    if (class_exists('VDSInspectionsController')) {
        $vdsInspectionsController = new VDSInspectionsController($db);
        $vdsInspectionsController->uploadPartPhoto((int)$matches[1], $matches[2]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}

// Health Check
elseif (preg_match('#^/health$#', $uri) && $method === 'GET') {
    Response::success([
        'status' => 'healthy',
        'timestamp' => date('c'),
        'version' => '2.0.0'
    ]);
}

// 404 Not Found
else {
    Response::error('المسار غير موجود', 404, 'NOT_FOUND');
}
