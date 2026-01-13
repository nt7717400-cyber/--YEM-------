<?php
/**
 * CORS Configuration
 * Cross-Origin Resource Sharing settings
 * Requirements: 6.4
 * SECURITY: Enhanced with proper origin validation
 */

class CORS {
    // Default allowed origins for development
    private static $defaultAllowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://10.0.2.2:3000',  // Android emulator
        'http://10.0.2.2:8000',
    ];

    /**
     * Get allowed origins from environment or defaults
     * @return array List of allowed origins
     */
    private static function getAllowedOrigins(): array {
        $envOrigins = getenv('ALLOWED_ORIGINS');
        
        if ($envOrigins && $envOrigins !== '*') {
            return array_map('trim', explode(',', $envOrigins));
        }
        
        // In production, ALLOWED_ORIGINS should be set
        // For development, use defaults
        $isProduction = getenv('APP_ENV') === 'production';
        if ($isProduction && !$envOrigins) {
            error_log('WARNING: ALLOWED_ORIGINS not set in production environment');
            return []; // Deny all in production if not configured
        }
        
        return self::$defaultAllowedOrigins;
    }

    /**
     * Check if origin is allowed
     * @param string $origin The origin to check
     * @return bool True if allowed
     */
    private static function isOriginAllowed(string $origin): bool {
        if (empty($origin)) {
            return false;
        }
        
        $allowedOrigins = self::getAllowedOrigins();
        
        // Check exact match
        if (in_array($origin, $allowedOrigins, true)) {
            return true;
        }
        
        // Check wildcard patterns (e.g., *.yourdomain.com)
        foreach ($allowedOrigins as $allowed) {
            if (strpos($allowed, '*') !== false) {
                $pattern = '/^' . str_replace('\*', '.*', preg_quote($allowed, '/')) . '$/';
                if (preg_match($pattern, $origin)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Set CORS headers for API responses
     * SECURITY: Only allows configured origins
     */
    public static function setHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Only set CORS headers if origin is allowed
        if (self::isOriginAllowed($origin)) {
            header("Access-Control-Allow-Origin: " . $origin);
            header("Access-Control-Allow-Credentials: true");
        }
        // If origin not allowed, don't set Access-Control-Allow-Origin header
        // Browser will block the request

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
        header("Access-Control-Max-Age: 86400"); // 24 hours cache for preflight
        header("Content-Type: application/json; charset=UTF-8");
    }

    /**
     * Handle preflight OPTIONS request
     */
    public static function handlePreflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            self::setHeaders();
            http_response_code(200);
            exit();
        }
    }
}
