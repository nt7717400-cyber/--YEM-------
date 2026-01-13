<?php
/**
 * Authentication Middleware
 * JWT token verification and session management
 * Requirements: 6.2, 6.3, 6.4, 6.5
 */

class AuthMiddleware {
    private static $secretKey;
    private static $tokenExpiry = 1800; // 30 minutes in seconds
    private static $currentUserId = null;

    /**
     * Initialize secret key
     * SECURITY: JWT_SECRET environment variable is REQUIRED
     */
    private static function init() {
        if (!self::$secretKey) {
            // Try to load from .env file if environment variable not set
            self::loadEnvFile();
            
            self::$secretKey = getenv('JWT_SECRET');
            if (!self::$secretKey || strlen(self::$secretKey) < 32) {
                error_log('CRITICAL: JWT_SECRET environment variable is missing or too short (min 32 chars)');
                Response::error('خطأ في إعدادات الخادم', 500, 'SRV_CONFIG');
            }
        }
    }
    
    /**
     * Load environment variables from .env file
     */
    private static function loadEnvFile() {
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '#') === 0) continue; // Skip comments
                if (strpos($line, '=') === false) continue;
                
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                if (!getenv($key)) {
                    putenv("{$key}={$value}");
                }
            }
        }
    }

    /**
     * Authenticate request using JWT token
     * Requirements: 6.4
     */
    public static function authenticate() {
        self::init();
        
        $token = self::getBearerToken();
        
        if (!$token) {
            Response::error('غير مصرح لك بالوصول', 401, 'AUTH_003');
        }

        $payload = self::verifyToken($token);
        
        if (!$payload) {
            Response::error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 401, 'AUTH_002');
        }

        // Check token expiry (30 minutes inactivity)
        // Requirements: 6.5
        if (isset($payload['iat']) && (time() - $payload['iat']) > self::$tokenExpiry) {
            Response::error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 401, 'AUTH_002');
        }

        self::$currentUserId = $payload['user_id'] ?? null;
        
        return $payload;
    }

    /**
     * Get current authenticated user ID
     */
    public static function getUserId() {
        return self::$currentUserId;
    }

    /**
     * Check if request is authenticated without throwing error
     * @return bool True if authenticated, false otherwise
     */
    public static function isAuthenticated() {
        self::init();
        
        $token = self::getBearerToken();
        
        if (!$token) {
            return false;
        }

        $payload = self::verifyToken($token);
        
        if (!$payload) {
            return false;
        }

        // Check token expiry
        if (isset($payload['iat']) && (time() - $payload['iat']) > self::$tokenExpiry) {
            return false;
        }

        self::$currentUserId = $payload['user_id'] ?? null;
        
        return true;
    }

    /**
     * Generate JWT token
     * @param array $payload Token payload
     * @return string JWT token
     */
    public static function generateToken($payload) {
        self::init();
        
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$tokenExpiry;

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", self::$secretKey, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    /**
     * Verify JWT token
     * Requirements: 6.2, 6.3
     * @param string $token JWT token
     * @return array|null Payload if valid, null otherwise
     */
    public static function verifyToken($token) {
        self::init();
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return null;
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

        // Verify signature
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", self::$secretKey, true);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if (!$payload) {
            return null;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * Refresh token (extend expiry)
     * @param string $token Current token
     * @return string|null New token or null if invalid
     */
    public static function refreshToken($token) {
        $payload = self::verifyToken($token);
        
        if (!$payload) {
            return null;
        }

        // Remove old timing claims
        unset($payload['iat'], $payload['exp']);

        return self::generateToken($payload);
    }

    /**
     * Get Bearer token from Authorization header
     * @return string|null Token or null if not found
     */
    private static function getBearerToken() {
        $headers = self::getAuthorizationHeader();
        
        if (!$headers) {
            return null;
        }

        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Get Authorization header
     * @return string|null
     */
    private static function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }

    /**
     * Base64 URL encode
     * @param string $data
     * @return string
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     * @param string $data
     * @return string
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }

    /**
     * Set token expiry time
     * @param int $seconds Expiry time in seconds
     */
    public static function setTokenExpiry($seconds) {
        self::$tokenExpiry = $seconds;
    }

    /**
     * Get token expiry time
     * @return int Expiry time in seconds
     */
    public static function getTokenExpiry() {
        return self::$tokenExpiry;
    }
}
