<?php
/**
 * Static File Handler
 * Handles serving static files (images, videos, banners)
 */

function handleStaticFile(string $type, string $filename, string $method): void {
    $filePath = __DIR__ . '/../uploads/' . $type . '/' . $filename;
    
    // Handle CORS preflight
    if ($method === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: *');
        header('Access-Control-Max-Age: 86400');
        http_response_code(200);
        return;
    }
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => ['message' => 'File not found']]);
        return;
    }

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
    
    // CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: *');
    
    // Handle video files with Range Requests
    if ($type === 'videos') {
        serveVideoFile($filePath, $mimeType, $fileSize);
        return;
    }
    
    // Handle image/banner files
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . $fileSize);
    header('Cache-Control: public, max-age=86400');
    readfile($filePath);
}

function serveVideoFile(string $filePath, string $mimeType, int $fileSize): void {
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
                return;
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
}
