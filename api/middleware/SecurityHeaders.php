<?php
/**
 * Security Headers Middleware
 * Adds security headers to all API responses
 * SECURITY: Protects against XSS, clickjacking, MIME sniffing attacks
 */

class SecurityHeaders {
    /**
     * Set all security headers
     */
    public static function setHeaders(): void {
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Prevent clickjacking
        header('X-Frame-Options: DENY');
        
        // XSS Protection (legacy browsers)
        header('X-XSS-Protection: 1; mode=block');
        
        // Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy for API
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
        
        // Prevent caching of sensitive data
        if (self::isSensitiveEndpoint()) {
            header('Cache-Control: no-store, no-cache, must-revalidate, private');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
        
        // Remove PHP version header
        header_remove('X-Powered-By');
        
        // Permissions Policy (formerly Feature-Policy)
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }

    /**
     * Check if current endpoint is sensitive (auth, admin, etc.)
     * @return bool True if sensitive
     */
    private static function isSensitiveEndpoint(): bool {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $sensitivePatterns = [
            '/auth/',
            '/admin/',
            '/settings',
            '/stats',
        ];
        
        foreach ($sensitivePatterns as $pattern) {
            if (strpos($uri, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Set HSTS header (only for HTTPS)
     * Should be enabled in production with HTTPS
     */
    public static function setHSTS(): void {
        if (self::isHTTPS()) {
            // 1 year, include subdomains, allow preload
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
    }

    /**
     * Check if request is over HTTPS
     * @return bool True if HTTPS
     */
    private static function isHTTPS(): bool {
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            return true;
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
            return true;
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on') {
            return true;
        }
        if (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) {
            return true;
        }
        return false;
    }
}
