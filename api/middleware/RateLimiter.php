<?php
/**
 * Rate Limiter Middleware
 * Prevents brute force attacks and API abuse
 * SECURITY: Critical for protecting authentication endpoints
 */

class RateLimiter {
    private static $cacheDir;
    
    // Rate limit configurations
    // Note: Increased limits for development/testing. Reduce for production.
    private static $limits = [
        'login' => ['attempts' => 10, 'window' => 300, 'block' => 900],     // 10 attempts per 5 min, block 15 min
        'api' => ['attempts' => 300, 'window' => 60, 'block' => 60],        // 300 requests per minute (increased for testing)
        'bid' => ['attempts' => 20, 'window' => 60, 'block' => 120],        // 20 bids per minute
        'upload' => ['attempts' => 30, 'window' => 300, 'block' => 300],    // 30 uploads per 5 min
    ];

    /**
     * Initialize cache directory
     */
    private static function init() {
        if (!self::$cacheDir) {
            self::$cacheDir = __DIR__ . '/../cache/rate_limits/';
            if (!is_dir(self::$cacheDir)) {
                mkdir(self::$cacheDir, 0755, true);
            }
        }
    }

    /**
     * Get client identifier (IP address)
     * @return string Client IP
     */
    private static function getClientId(): string {
        // Check for forwarded IP (behind proxy/load balancer)
        $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // Handle comma-separated IPs (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    /**
     * Get cache file path for a key
     * @param string $key Cache key
     * @return string File path
     */
    private static function getCacheFile(string $key): string {
        self::init();
        // Use MD5 hash to create safe filename
        return self::$cacheDir . md5($key) . '.json';
    }

    /**
     * Get rate limit data from cache
     * @param string $key Cache key
     * @return array|null Rate limit data
     */
    private static function getData(string $key): ?array {
        $file = self::getCacheFile($key);
        
        if (!file_exists($file)) {
            return null;
        }
        
        $data = json_decode(file_get_contents($file), true);
        
        // Check if data is expired
        if ($data && isset($data['expires']) && $data['expires'] < time()) {
            unlink($file);
            return null;
        }
        
        return $data;
    }

    /**
     * Save rate limit data to cache
     * @param string $key Cache key
     * @param array $data Rate limit data
     */
    private static function setData(string $key, array $data): void {
        $file = self::getCacheFile($key);
        file_put_contents($file, json_encode($data), LOCK_EX);
    }

    /**
     * Check rate limit and block if exceeded
     * @param string $type Rate limit type (login, api, bid, upload)
     * @param string|null $identifier Optional custom identifier
     * @return bool True if allowed, false if blocked
     */
    public static function check(string $type, ?string $identifier = null): bool {
        if (!isset(self::$limits[$type])) {
            return true; // Unknown type, allow
        }
        
        $config = self::$limits[$type];
        $clientId = $identifier ?? self::getClientId();
        $key = "rate_limit:{$type}:{$clientId}";
        
        $data = self::getData($key);
        $now = time();
        
        // Check if currently blocked
        if ($data && isset($data['blocked_until']) && $data['blocked_until'] > $now) {
            $remainingSeconds = $data['blocked_until'] - $now;
            self::respondBlocked($remainingSeconds, $type);
            return false;
        }
        
        // Initialize or reset if window expired
        if (!$data || ($data['window_start'] + $config['window']) < $now) {
            $data = [
                'attempts' => 0,
                'window_start' => $now,
                'expires' => $now + $config['window'] + $config['block']
            ];
        }
        
        // Increment attempts
        $data['attempts']++;
        
        // Check if limit exceeded
        if ($data['attempts'] > $config['attempts']) {
            $data['blocked_until'] = $now + $config['block'];
            $data['expires'] = $data['blocked_until'] + 60; // Keep data a bit longer
            self::setData($key, $data);
            
            // Log the block
            error_log("Rate limit exceeded: type={$type}, client={$clientId}, attempts={$data['attempts']}");
            
            self::respondBlocked($config['block'], $type);
            return false;
        }
        
        self::setData($key, $data);
        
        // Add rate limit headers
        header("X-RateLimit-Limit: {$config['attempts']}");
        header("X-RateLimit-Remaining: " . ($config['attempts'] - $data['attempts']));
        header("X-RateLimit-Reset: " . ($data['window_start'] + $config['window']));
        
        return true;
    }

    /**
     * Respond with rate limit exceeded error
     * @param int $retryAfter Seconds until retry allowed
     * @param string $type Rate limit type
     */
    private static function respondBlocked(int $retryAfter, string $type): void {
        http_response_code(429);
        header("Retry-After: {$retryAfter}");
        header("X-RateLimit-Remaining: 0");
        
        $messages = [
            'login' => 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد ' . ceil($retryAfter / 60) . ' دقيقة',
            'api' => 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً',
            'bid' => 'تم تجاوز الحد الأقصى للمزايدات. يرجى الانتظار قليلاً',
            'upload' => 'تم تجاوز الحد الأقصى لرفع الملفات. يرجى المحاولة لاحقاً',
        ];
        
        echo json_encode([
            'success' => false,
            'error' => [
                'message' => $messages[$type] ?? 'تم تجاوز الحد الأقصى للطلبات',
                'code' => 'RATE_LIMIT',
                'retryAfter' => $retryAfter
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Reset rate limit for a specific client/type
     * @param string $type Rate limit type
     * @param string|null $identifier Client identifier
     */
    public static function reset(string $type, ?string $identifier = null): void {
        $clientId = $identifier ?? self::getClientId();
        $key = "rate_limit:{$type}:{$clientId}";
        $file = self::getCacheFile($key);
        
        if (file_exists($file)) {
            unlink($file);
        }
    }

    /**
     * Clean up expired cache files
     * Should be called periodically (e.g., via cron)
     */
    public static function cleanup(): void {
        self::init();
        
        $files = glob(self::$cacheDir . '*.json');
        $now = time();
        $cleaned = 0;
        
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            if ($data && isset($data['expires']) && $data['expires'] < $now) {
                unlink($file);
                $cleaned++;
            }
        }
        
        if ($cleaned > 0) {
            error_log("RateLimiter cleanup: removed {$cleaned} expired entries");
        }
    }
}
