<?php
/**
 * Audit Logger Utility
 * Logs sensitive operations for security auditing
 * SECURITY: Critical for tracking admin actions and detecting suspicious activity
 */

class AuditLogger {
    private static $logDir;
    private static $logFile;
    
    /**
     * Initialize the logger
     */
    private static function init(): void {
        if (!self::$logDir) {
            self::$logDir = __DIR__ . '/../logs/';
            
            if (!is_dir(self::$logDir)) {
                mkdir(self::$logDir, 0755, true);
            }
            
            self::$logFile = self::$logDir . 'audit_' . date('Y-m') . '.log';
        }
    }
    
    /**
     * Log an action
     * @param string $action The action performed
     * @param string $resource The resource type (car, user, auction, etc.)
     * @param int|string|null $resourceId The resource ID
     * @param array $details Additional details
     * @param string $level Log level (INFO, WARNING, ERROR, CRITICAL)
     */
    public static function log(
        string $action,
        string $resource,
        $resourceId = null,
        array $details = [],
        string $level = 'INFO'
    ): void {
        self::init();
        
        $entry = [
            'timestamp' => date('c'),
            'level' => $level,
            'action' => $action,
            'resource' => $resource,
            'resource_id' => $resourceId,
            'user_id' => self::getCurrentUserId(),
            'ip' => self::getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'details' => $details
        ];
        
        $logLine = json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n";
        
        file_put_contents(self::$logFile, $logLine, FILE_APPEND | LOCK_EX);
        
        // Also log critical events to error log
        if (in_array($level, ['ERROR', 'CRITICAL'])) {
            error_log("AUDIT [{$level}]: {$action} on {$resource}:{$resourceId} by user " . self::getCurrentUserId());
        }
    }
    
    /**
     * Log authentication events
     */
    public static function logAuth(string $action, ?int $userId = null, array $details = []): void {
        $level = in_array($action, ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS']) ? 'WARNING' : 'INFO';
        self::log($action, 'auth', $userId, $details, $level);
    }
    
    /**
     * Log car operations
     */
    public static function logCar(string $action, int $carId, array $details = []): void {
        self::log($action, 'car', $carId, $details);
    }
    
    /**
     * Log auction operations
     */
    public static function logAuction(string $action, int $auctionId, array $details = []): void {
        self::log($action, 'auction', $auctionId, $details);
    }
    
    /**
     * Log bid operations
     */
    public static function logBid(string $action, int $bidId, array $details = []): void {
        self::log($action, 'bid', $bidId, $details);
    }
    
    /**
     * Log settings changes
     */
    public static function logSettings(string $action, array $details = []): void {
        self::log($action, 'settings', null, $details);
    }
    
    /**
     * Log file operations
     */
    public static function logFile(string $action, string $filename, array $details = []): void {
        self::log($action, 'file', $filename, $details);
    }
    
    /**
     * Log security events
     */
    public static function logSecurity(string $action, array $details = [], string $level = 'WARNING'): void {
        self::log($action, 'security', null, $details, $level);
    }
    
    /**
     * Get current user ID from AuthMiddleware
     */
    private static function getCurrentUserId(): ?int {
        if (class_exists('AuthMiddleware')) {
            return AuthMiddleware::getUserId();
        }
        return null;
    }
    
    /**
     * Get client IP address
     */
    private static function getClientIp(): string {
        $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Get recent audit logs
     * @param int $limit Number of entries to return
     * @param string|null $resource Filter by resource type
     * @param string|null $action Filter by action
     * @return array Log entries
     */
    public static function getRecentLogs(int $limit = 100, ?string $resource = null, ?string $action = null): array {
        self::init();
        
        if (!file_exists(self::$logFile)) {
            return [];
        }
        
        $logs = [];
        $lines = file(self::$logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $lines = array_reverse($lines); // Most recent first
        
        foreach ($lines as $line) {
            if (count($logs) >= $limit) {
                break;
            }
            
            $entry = json_decode($line, true);
            if (!$entry) {
                continue;
            }
            
            // Apply filters
            if ($resource !== null && $entry['resource'] !== $resource) {
                continue;
            }
            if ($action !== null && $entry['action'] !== $action) {
                continue;
            }
            
            $logs[] = $entry;
        }
        
        return $logs;
    }
    
    /**
     * Clean up old log files
     * @param int $daysToKeep Number of days to keep logs
     */
    public static function cleanup(int $daysToKeep = 90): void {
        self::init();
        
        $files = glob(self::$logDir . 'audit_*.log');
        $cutoffDate = strtotime("-{$daysToKeep} days");
        $cleaned = 0;
        
        foreach ($files as $file) {
            // Extract date from filename (audit_YYYY-MM.log)
            if (preg_match('/audit_(\d{4}-\d{2})\.log$/', $file, $matches)) {
                $fileDate = strtotime($matches[1] . '-01');
                if ($fileDate < $cutoffDate) {
                    unlink($file);
                    $cleaned++;
                }
            }
        }
        
        if ($cleaned > 0) {
            error_log("AuditLogger cleanup: removed {$cleaned} old log files");
        }
    }
}
