<?php
/**
 * Image Processor Utility
 * Image compression and manipulation
 * Requirements: 9.1, 16.2
 */

class ImageProcessor {
    private $maxWidth = 1200;
    private $maxHeight = 800;
    private $quality = 80;
    private $uploadDir;
    private $gdAvailable;

    public function __construct() {
        $this->uploadDir = __DIR__ . '/../uploads/images/';
        $this->gdAvailable = extension_loaded('gd');
        
        // Create upload directory if not exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Process and compress uploaded image
     * Requirements: 9.1
     * @param array $file $_FILES array element
     * @return string|false Saved file path or false on failure
     */
    public function processUpload($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            return false;
        }

        // Generate unique filename
        $extension = $this->getExtensionFromMime($mimeType);
        $filename = uniqid('car_', true) . '.' . $extension;
        $destPath = $this->uploadDir . $filename;

        // If GD is available, compress. Otherwise, just copy the file
        if ($this->gdAvailable) {
            if ($this->compress($file['tmp_name'], $destPath, $mimeType)) {
                return '/uploads/images/' . $filename;
            }
        } else {
            // No GD - just copy the file as-is
            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                return '/uploads/images/' . $filename;
            }
        }

        return false;
    }
    
    /**
     * Get file extension from MIME type
     */
    private function getExtensionFromMime($mimeType) {
        $map = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif'
        ];
        return $map[$mimeType] ?? 'jpg';
    }

    /**
     * Compress image
     * @param string $sourcePath Source file path
     * @param string $destPath Destination file path
     * @param string $mimeType Source MIME type
     * @return bool Success status
     */
    public function compress($sourcePath, $destPath, $mimeType = null) {
        // If GD is not available, just copy the file
        if (!$this->gdAvailable) {
            return copy($sourcePath, $destPath);
        }
        
        if (!$mimeType) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $sourcePath);
            finfo_close($finfo);
        }

        // Create image resource based on type
        $image = null;
        switch ($mimeType) {
            case 'image/jpeg':
                $image = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $image = @imagecreatefrompng($sourcePath);
                break;
            case 'image/webp':
                $image = @imagecreatefromwebp($sourcePath);
                break;
            case 'image/gif':
                $image = @imagecreatefromgif($sourcePath);
                break;
            default:
                return copy($sourcePath, $destPath);
        }

        if (!$image) {
            // Fallback: just copy the file
            return copy($sourcePath, $destPath);
        }

        // Get original dimensions
        $width = imagesx($image);
        $height = imagesy($image);

        // Calculate new dimensions if needed
        if ($width > $this->maxWidth || $height > $this->maxHeight) {
            $ratio = min($this->maxWidth / $width, $this->maxHeight / $height);
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            // Create resized image
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNG
            if ($mimeType === 'image/png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        // Save as JPEG for compression
        $result = imagejpeg($image, $destPath, $this->quality);
        imagedestroy($image);

        return $result;
    }

    /**
     * Delete image file
     * @param string $url Image URL path
     * @return bool Success status
     */
    public function delete($url) {
        $filePath = __DIR__ . '/..' . $url;
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false;
    }

    /**
     * Set compression quality
     * @param int $quality Quality (0-100)
     */
    public function setQuality($quality) {
        $this->quality = max(0, min(100, $quality));
    }

    /**
     * Set max dimensions
     * @param int $width Max width
     * @param int $height Max height
     */
    public function setMaxDimensions($width, $height) {
        $this->maxWidth = $width;
        $this->maxHeight = $height;
    }
}
