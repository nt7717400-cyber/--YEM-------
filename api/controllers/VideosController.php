<?php
/**
 * Videos Controller
 * Video management (YouTube and uploads)
 * Requirements: 10.1-10.3
 */

class VideosController {
    private $db;
    private $uploadDir;

    public function __construct($db) {
        $this->db = $db;
        $this->uploadDir = __DIR__ . '/../uploads/videos/';
        
        // Create upload directory if not exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Get video by car ID
     * GET /api/cars/:id/video
     */
    public function getByCarId($carId) {
        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ?");
            $stmt->execute([$carId]);
            $video = $stmt->fetch();

            if (!$video) {
                Response::success(null);
                return;
            }

            Response::success([
                'id' => (int)$video['id'],
                'carId' => (int)$video['car_id'],
                'type' => $video['video_type'],
                'url' => $video['url'],
                'createdAt' => $video['created_at']
            ]);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب الفيديو', 500, 'SRV_001');
        }
    }

    /**
     * Add video to car
     * Requirements: 10.1, 10.2
     * POST /api/cars/:id/video
     */
    public function add($carId) {
        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            // Check if car already has a video
            $stmt = $this->db->prepare("SELECT id FROM car_videos WHERE car_id = ?");
            $stmt->execute([$carId]);
            if ($stmt->fetch()) {
                // Delete existing video first
                $this->deleteByCarId($carId);
            }

            // Check if it's a file upload or YouTube URL
            if (!empty($_FILES['video'])) {
                // Handle file upload
                // Requirements: 10.2
                $result = $this->handleFileUpload($carId, $_FILES['video']);
            } else {
                // Handle YouTube URL
                // Requirements: 10.1
                $data = Response::getJsonInput();
                
                if (empty($data['url'])) {
                    Response::error('يرجى توفير رابط الفيديو', 400, 'VAL_001');
                }

                $result = $this->handleYoutubeUrl($carId, $data['url']);
            }

            Response::success($result, 201);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في إضافة الفيديو', 500, 'SRV_001');
        }
    }

    /**
     * Handle YouTube URL
     * Requirements: 10.1
     */
    private function handleYoutubeUrl($carId, $url) {
        // Validate YouTube URL
        $videoId = $this->extractYoutubeId($url);
        
        if (!$videoId) {
            Response::error('رابط YouTube غير صالح', 400, 'VID_002');
        }

        // Store the embed URL
        $embedUrl = "https://www.youtube.com/embed/{$videoId}";

        $stmt = $this->db->prepare("INSERT INTO car_videos (car_id, video_type, url) VALUES (?, 'YOUTUBE', ?)");
        $stmt->execute([$carId, $embedUrl]);

        $videoDbId = $this->db->lastInsertId();

        return [
            'id' => (int)$videoDbId,
            'carId' => (int)$carId,
            'type' => 'YOUTUBE',
            'url' => $embedUrl
        ];
    }

    /**
     * Handle file upload
     * Requirements: 10.2
     */
    private function handleFileUpload($carId, $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('فشل رفع الفيديو', 400, 'VID_001');
        }

        // Validate file type
        $allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            Response::error('نوع الفيديو غير مدعوم', 400, 'VID_001');
        }

        // Validate file size (max 100MB)
        if ($file['size'] > 100 * 1024 * 1024) {
            Response::error('حجم الفيديو كبير جداً (الحد الأقصى 100MB)', 400, 'VID_001');
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'mp4';
        $filename = uniqid('video_', true) . '.' . $extension;
        $destPath = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            Response::error('فشل حفظ الفيديو', 500, 'VID_001');
        }

        // Copy to frontend public folder for proper video streaming
        $frontendVideoDir = __DIR__ . '/../../frontend/public/videos/';
        if (!is_dir($frontendVideoDir)) {
            mkdir($frontendVideoDir, 0755, true);
        }
        copy($destPath, $frontendVideoDir . $filename);

        $url = '/uploads/videos/' . $filename;

        $stmt = $this->db->prepare("INSERT INTO car_videos (car_id, video_type, url) VALUES (?, 'UPLOAD', ?)");
        $stmt->execute([$carId, $url]);

        $videoId = $this->db->lastInsertId();

        return [
            'id' => (int)$videoId,
            'carId' => (int)$carId,
            'type' => 'UPLOAD',
            'url' => $url
        ];
    }

    /**
     * Delete video
     * Requirements: 10.3
     * DELETE /api/videos/:id
     */
    public function delete($id) {
        try {
            // Get video info
            $stmt = $this->db->prepare("SELECT * FROM car_videos WHERE id = ?");
            $stmt->execute([$id]);
            $video = $stmt->fetch();

            if (!$video) {
                Response::error('الفيديو غير موجود', 404, 'VID_001');
            }

            // Delete file if it's an upload
            if ($video['video_type'] === 'UPLOAD') {
                $filePath = __DIR__ . '/..' . $video['url'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                // Also delete from frontend public folder
                $filename = basename($video['url']);
                $frontendPath = __DIR__ . '/../../frontend/public/videos/' . $filename;
                if (file_exists($frontendPath)) {
                    unlink($frontendPath);
                }
            }

            // Delete from database
            $stmt = $this->db->prepare("DELETE FROM car_videos WHERE id = ?");
            $stmt->execute([$id]);

            Response::success(['message' => 'تم حذف الفيديو بنجاح']);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في حذف الفيديو', 500, 'SRV_001');
        }
    }

    /**
     * Delete video by car ID
     * DELETE /api/cars/:id/video
     */
    public function deleteForCar($carId) {
        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            // Check if video exists
            $stmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ?");
            $stmt->execute([$carId]);
            $video = $stmt->fetch();

            if (!$video) {
                Response::error('لا يوجد فيديو لهذه السيارة', 404, 'VID_001');
            }

            $this->deleteByCarId($carId);
            Response::success(['message' => 'تم حذف الفيديو بنجاح']);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في حذف الفيديو', 500, 'SRV_001');
        }
    }

    /**
     * Delete video by car ID (internal use)
     */
    private function deleteByCarId($carId) {
        $stmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ?");
        $stmt->execute([$carId]);
        $video = $stmt->fetch();

        if ($video) {
            // Delete file if it's an upload
            if ($video['video_type'] === 'UPLOAD') {
                $filePath = __DIR__ . '/..' . $video['url'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                // Also delete from frontend public folder
                $filename = basename($video['url']);
                $frontendPath = __DIR__ . '/../../frontend/public/videos/' . $filename;
                if (file_exists($frontendPath)) {
                    unlink($frontendPath);
                }
            }

            // Delete from database
            $stmt = $this->db->prepare("DELETE FROM car_videos WHERE car_id = ?");
            $stmt->execute([$carId]);
        }
    }

    /**
     * Extract YouTube video ID from URL
     */
    private function extractYoutubeId($url) {
        $patterns = [
            '/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/',
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/',
            '/youtu\.be\/([a-zA-Z0-9_-]+)/',
            '/youtube\.com\/v\/([a-zA-Z0-9_-]+)/',
            '/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}
