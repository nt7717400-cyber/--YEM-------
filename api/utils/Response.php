<?php
/**
 * Response Utility
 * JSON response helper for API
 * PERFORMANCE: Added caching support and ETag generation
 */

class Response {
    /**
     * Set cache headers for response
     * @param int $maxAge Cache duration in seconds (0 = no cache)
     * @param bool $public Whether cache is public or private
     */
    public static function setCacheHeaders(int $maxAge = 0, bool $public = true): void {
        if ($maxAge > 0) {
            $visibility = $public ? 'public' : 'private';
            header("Cache-Control: {$visibility}, max-age={$maxAge}");
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT');
        } else {
            header('Cache-Control: no-store, no-cache, must-revalidate, private');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
    }

    /**
     * Generate and set ETag header, return 304 if not modified
     * @param mixed $data Data to generate ETag from
     * @return bool True if 304 was sent (client has cached version)
     */
    public static function handleETag($data): bool {
        $etag = '"' . md5(json_encode($data)) . '"';
        header("ETag: {$etag}");
        
        $clientEtag = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
        if ($clientEtag === $etag) {
            http_response_code(304);
            exit();
        }
        
        return false;
    }

    /**
     * Send success response
     * @param mixed $data Response data
     * @param int $statusCode HTTP status code
     * @param int $cacheSeconds Cache duration (0 = no cache)
     */
    public static function success($data = null, $statusCode = 200, int $cacheSeconds = 0) {
        http_response_code($statusCode);
        
        $response = [
            'success' => true
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        // Set cache headers
        if ($cacheSeconds > 0) {
            self::setCacheHeaders($cacheSeconds, true);
            self::handleETag($response);
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Send error response
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param string|null $code Error code
     * @param array|null $details Additional error details
     */
    public static function error($message, $statusCode = 400, $code = null, $details = null) {
        http_response_code($statusCode);
        
        // Never cache errors
        self::setCacheHeaders(0);
        
        $response = [
            'success' => false,
            'error' => [
                'message' => $message
            ]
        ];
        
        if ($code) {
            $response['error']['code'] = $code;
        }
        
        if ($details) {
            $response['error']['details'] = $details;
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Send paginated response
     * @param array $data Response data
     * @param int $total Total items
     * @param int $page Current page
     * @param int $perPage Items per page
     * @param int $cacheSeconds Cache duration (0 = no cache)
     */
    public static function paginated($data, $total, $page, $perPage, int $cacheSeconds = 60) {
        http_response_code(200);
        
        $totalPages = ceil($total / $perPage);
        
        $response = [
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage,
                'totalPages' => $totalPages,
                'hasMore' => $page < $totalPages
            ]
        ];
        
        // Set cache headers for paginated responses
        if ($cacheSeconds > 0) {
            self::setCacheHeaders($cacheSeconds, true);
            self::handleETag($response);
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Get JSON input from request body
     * @return array
     */
    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::error('Invalid JSON input', 400, 'VAL_001');
        }
        
        return $data ?? [];
    }
}
