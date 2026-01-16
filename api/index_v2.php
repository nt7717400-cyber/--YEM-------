<?php
/**
 * Yemen Car Showroom API Router v2
 * Main entry point with Service Layer and API Versioning
 * 
 * Supports:
 * - /api/v1/... (versioned endpoints)
 * - /api/... (defaults to v1 for backward compatibility)
 */

// Set timezone to Yemen (UTC+3)
date_default_timezone_set('Asia/Aden');

// Error reporting
$isProduction = getenv('APP_ENV') === 'production';
error_reporting($isProduction ? 0 : E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$logsDir = __DIR__ . '/logs';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0755, true);
}
ini_set('error_log', $logsDir . '/error.log');

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$uri = parse_url($uri, PHP_URL_PATH);

// ==================== Static Files Handler ====================
if (preg_match('#^(/api)?/uploads/(images|videos|banners)/(.+)$#', $uri, $matches)) {
    require_once __DIR__ . '/handlers/StaticFileHandler.php';
    handleStaticFile($matches[2], $matches[3], $method);
    exit;
}

// ==================== Load Core Dependencies ====================
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/AuditLogger.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/SecurityHeaders.php';
require_once __DIR__ . '/middleware/RateLimiter.php';

// Handle CORS
CORS::handlePreflight();
CORS::setHeaders();
SecurityHeaders::setHeaders();

// Rate limiting
if (!RateLimiter::check('api')) {
    exit;
}

// ==================== Database Connection ====================
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    Response::error('خطأ في الاتصال بقاعدة البيانات', 500, 'DB_001');
}

// ==================== Initialize Router ====================
require_once __DIR__ . '/routes/Router.php';

$router = new Router($db);

// Register controllers for routes not yet migrated to services
require_once __DIR__ . '/controllers/ImagesController.php';
require_once __DIR__ . '/controllers/VideosController.php';
require_once __DIR__ . '/controllers/BannersController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/InspectionController.php';
require_once __DIR__ . '/controllers/AuctionsController.php';
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/TemplatesController.php';
require_once __DIR__ . '/controllers/PartKeysController.php';
require_once __DIR__ . '/controllers/ColorMappingsController.php';

$router->registerController('images', new ImagesController($db));
$router->registerController('videos', new VideosController($db));
$router->registerController('banners', new BannersController($db));
$router->registerController('settings', new SettingsController($db));
$router->registerController('inspection', new InspectionController($db));
$router->registerController('auctions', new AuctionsController($db));
$router->registerController('stats', new StatsController($db));
$router->registerController('templates', new TemplatesController($db));
$router->registerController('partKeys', new PartKeysController($db));
$router->registerController('colorMappings', new ColorMappingsController($db));

// ==================== Try New Router First ====================
if ($router->route()) {
    exit;
}

// ==================== Fallback to Legacy Routes ====================
// For routes not yet migrated to the new system

$uri = $router->getUri();
$method = $router->getMethod();

// Get controllers
$bannersController = $router->getController('banners');
$settingsController = $router->getController('settings');
$inspectionController = $router->getController('inspection');
$auctionsController = $router->getController('auctions');
$statsController = $router->getController('stats');
$templatesController = $router->getController('templates');
$partKeysController = $router->getController('partKeys');
$colorMappingsController = $router->getController('colorMappings');

// Load VDS controller if exists
$vdsInspectionsController = null;
if (file_exists(__DIR__ . '/controllers/VDSInspectionsController.php')) {
    require_once __DIR__ . '/controllers/VDSInspectionsController.php';
    $vdsInspectionsController = new VDSInspectionsController($db);
}

// ==================== Legacy Routes ====================

// Inspection Routes
if (preg_match('#^/cars/(\d+)/inspection$#', $uri, $matches) && $method === 'GET') {
    $inspectionController->getInspection((int)$matches[1]);
}
elseif (preg_match('#^/cars/(\d+)/inspection$#', $uri, $matches) && in_array($method, ['POST', 'PUT'])) {
    AuthMiddleware::authenticate();
    $inspectionController->saveInspection((int)$matches[1]);
}

// Banners Routes
elseif (preg_match('#^/banners/position/([a-z_]+)$#', $uri, $matches) && $method === 'GET') {
    $bannersController->getByPosition($matches[1]);
}
elseif (preg_match('#^/banners/(\d+)/click$#', $uri, $matches) && $method === 'POST') {
    $bannersController->trackClick((int)$matches[1]);
}
elseif (preg_match('#^/banners/(\d+)/view$#', $uri, $matches) && $method === 'POST') {
    $bannersController->trackView((int)$matches[1]);
}
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
    if (!RateLimiter::check('upload')) exit;
    $bannersController->create();
}
elseif (preg_match('#^/banners/(\d+)$#', $uri, $matches) && in_array($method, ['PUT', 'POST'])) {
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

// Auctions Routes
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
    if (!RateLimiter::check('bid')) exit;
    $auctionsController->placeBid((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    $auctionsController->update((int)$matches[1]);
}
elseif (preg_match('#^/auctions/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    AuthMiddleware::authenticate();
    $auctionsController->delete((int)$matches[1]);
}

// Admin Auctions
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

// Stats
elseif (preg_match('#^/stats$#', $uri) && $method === 'GET') {
    AuthMiddleware::authenticate();
    $statsController->getDashboardStats();
}

// Templates Routes
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

// Part Keys Routes
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

// Color Mappings Routes
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
    if ($vdsInspectionsController) {
        $vdsInspectionsController->getAll();
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)$#', $uri, $matches) && $method === 'GET') {
    if ($vdsInspectionsController) {
        $vdsInspectionsController->getById((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections$#', $uri) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if ($vdsInspectionsController) {
        $vdsInspectionsController->create();
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    AuthMiddleware::authenticate();
    if ($vdsInspectionsController) {
        $vdsInspectionsController->update((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)/finalize$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if ($vdsInspectionsController) {
        $vdsInspectionsController->finalize((int)$matches[1]);
    } else {
        Response::error('VDS Inspections not available', 404, 'NOT_FOUND');
    }
}
elseif (preg_match('#^/vds/inspections/(\d+)/parts/([a-z_]+)/photos$#', $uri, $matches) && $method === 'POST') {
    AuthMiddleware::authenticate();
    if (!RateLimiter::check('upload')) exit;
    if ($vdsInspectionsController) {
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
        'version' => '2.0.0',
        'apiVersion' => $router->getVersion()
    ]);
}

// API Info
elseif (preg_match('#^/?$#', $uri) && $method === 'GET') {
    Response::success([
        'name' => 'Yemen Car Showroom API',
        'version' => '2.0.0',
        'currentApiVersion' => $router->getVersion(),
        'supportedVersions' => ['v1'],
        'documentation' => '/api/docs'
    ]);
}

// 404 Not Found
else {
    Response::error('المسار غير موجود', 404, 'NOT_FOUND');
}
