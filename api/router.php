<?php
/**
 * Router for PHP built-in server
 * Handles static files properly
 */

// Disable output buffering for better streaming
if (ob_get_level()) ob_end_clean();

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Handle CORS for all requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Check if it's a static file request
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    $extension = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
    
    // Set proper content type for images and videos
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'mov' => 'video/quicktime',
    ];
    
    if (isset($mimeTypes[$extension])) {
        $filePath = __DIR__ . $uri;
        $fileSize = filesize($filePath);
        
        // Set headers for proper file serving
        header('Content-Type: ' . $mimeTypes[$extension]);
        header('Content-Length: ' . $fileSize);
        header('Cache-Control: public, max-age=86400');
        header('Accept-Ranges: bytes');
        header('Connection: keep-alive');
        
        // Output file directly using readfile for better compatibility
        readfile($filePath);
        exit;
    }
    
    // Let PHP handle other static files
    return false;
}

// Route to index.php for API requests
require __DIR__ . '/index.php';
