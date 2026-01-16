<?php
/**
 * API Router with Versioning Support
 * Handles routing for different API versions
 * 
 * Supported versions:
 * - v1: Current stable version
 * - (no version): Defaults to v1 for backward compatibility
 */

class Router {
    private $db;
    private $version;
    private $uri;
    private $method;
    
    // Services
    private $carService;
    private $authService;
    
    // Controllers (for routes not yet migrated to services)
    private $controllers = [];

    public function __construct($db) {
        $this->db = $db;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->parseUri();
        $this->initializeServices();
    }

    /**
     * Parse URI and extract version
     */
    private function parseUri(): void {
        $uri = $_SERVER['REQUEST_URI'];
        $uri = parse_url($uri, PHP_URL_PATH);
        
        // Remove /api prefix
        $uri = preg_replace('#^/api#', '', $uri);
        
        // Check for version prefix
        if (preg_match('#^/v(\d+)(.*)$#', $uri, $matches)) {
            $this->version = 'v' . $matches[1];
            $this->uri = $matches[2] ?: '/';
        } else {
            // Default to v1 for backward compatibility
            $this->version = 'v1';
            $this->uri = $uri;
        }
    }

    /**
     * Initialize services
     */
    private function initializeServices(): void {
        require_once __DIR__ . '/../exceptions/AppExceptions.php';
        require_once __DIR__ . '/../services/CarService.php';
        require_once __DIR__ . '/../services/AuthService.php';
        
        $this->carService = new CarService($this->db);
        $this->authService = new AuthService($this->db);
    }

    /**
     * Register a controller
     */
    public function registerController(string $name, $controller): void {
        $this->controllers[$name] = $controller;
    }

    /**
     * Get current API version
     */
    public function getVersion(): string {
        return $this->version;
    }

    /**
     * Get parsed URI (without version prefix)
     */
    public function getUri(): string {
        return $this->uri;
    }

    /**
     * Get HTTP method
     */
    public function getMethod(): string {
        return $this->method;
    }

    /**
     * Route the request
     */
    public function route(): bool {
        // Load version-specific routes
        $routesPath = __DIR__ . '/' . $this->version;
        
        if (!is_dir($routesPath)) {
            Response::error('إصدار API غير مدعوم', 400, 'API_VERSION_NOT_SUPPORTED');
            return false;
        }

        // Try car routes
        if ($this->tryRoute('cars')) return true;
        
        // Try auth routes
        if ($this->tryRoute('auth')) return true;

        return false;
    }

    /**
     * Try to match a route file
     */
    private function tryRoute(string $routeName): bool {
        $routeFile = __DIR__ . '/' . $this->version . '/' . $routeName . '.php';
        
        if (!file_exists($routeFile)) {
            return false;
        }

        $routeHandler = require $routeFile;
        
        switch ($routeName) {
            case 'cars':
                return $routeHandler(
                    $this->uri, 
                    $this->method, 
                    $this->db, 
                    $this->carService,
                    $this->controllers['images'] ?? null,
                    $this->controllers['videos'] ?? null
                );
            
            case 'auth':
                return $routeHandler(
                    $this->uri, 
                    $this->method, 
                    $this->db, 
                    $this->authService
                );
            
            default:
                return false;
        }
    }

    /**
     * Get service instance
     */
    public function getService(string $name) {
        switch ($name) {
            case 'car': return $this->carService;
            case 'auth': return $this->authService;
            default: return null;
        }
    }

    /**
     * Get controller instance
     */
    public function getController(string $name) {
        return $this->controllers[$name] ?? null;
    }
}
