<?php
/**
 * Images Controller
 * Image upload, management, and reordering
 * Requirements: 9.1-9.7
 */

require_once __DIR__ . '/../utils/ImageProcessor.php';

class ImagesController {
    private $db;
    private $imageProcessor;

    public function __construct($db) {
        $this->db = $db;
        $this->imageProcessor = new ImageProcessor();
    }

    /**
     * Get images by car ID
     * GET /api/cars/:id/images
     */
    public function getByCarId($carId) {
        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("SELECT * FROM car_images WHERE car_id = ? ORDER BY image_order");
            $stmt->execute([$carId]);
            $images = $stmt->fetchAll();

            $formattedImages = array_map(function($img) {
                return [
                    'id' => (int)$img['id'],
                    'carId' => (int)$img['car_id'],
                    'url' => $img['url'],
                    'order' => (int)$img['image_order'],
                    'createdAt' => $img['created_at']
                ];
            }, $images);

            Response::success($formattedImages);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب الصور', 500, 'SRV_001');
        }
    }

    /**
     * Upload images for a car
     * Requirements: 9.1, 9.2, 9.4, 9.5, 9.7
     * POST /api/cars/:id/images
     */
    public function upload($carId) {
        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            // Check if files were uploaded - support both 'images' and 'images[]'
            if (empty($_FILES['images']) && empty($_FILES['images[]'])) {
                error_log("Upload error: No files received. FILES: " . print_r($_FILES, true));
                Response::error('لم يتم رفع أي صور', 400, 'IMG_001');
            }
            
            // Use whichever key is present
            $filesKey = !empty($_FILES['images']) ? 'images' : 'images[]';

            // Get current max order
            $stmt = $this->db->prepare("SELECT MAX(image_order) as max_order FROM car_images WHERE car_id = ?");
            $stmt->execute([$carId]);
            $result = $stmt->fetch();
            $currentOrder = $result['max_order'] !== null ? (int)$result['max_order'] + 1 : 0;

            $uploadedImages = [];
            $files = $_FILES[$filesKey];

            // Handle both single and multiple file uploads
            if (!is_array($files['name'])) {
                $files = [
                    'name' => [$files['name']],
                    'type' => [$files['type']],
                    'tmp_name' => [$files['tmp_name']],
                    'error' => [$files['error']],
                    'size' => [$files['size']]
                ];
            }

            $fileCount = count($files['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];

                // Validate file size (max 10MB)
                if ($file['size'] > 10 * 1024 * 1024) {
                    continue; // Skip files that are too large
                }

                // Process and compress image
                // Requirements: 9.1
                $url = $this->imageProcessor->processUpload($file);

                if ($url) {
                    // Save to database
                    // Requirements: 9.2
                    $stmt = $this->db->prepare("INSERT INTO car_images (car_id, url, image_order) VALUES (?, ?, ?)");
                    $stmt->execute([$carId, $url, $currentOrder]);

                    $imageId = $this->db->lastInsertId();
                    $uploadedImages[] = [
                        'id' => (int)$imageId,
                        'carId' => (int)$carId,
                        'url' => $url,
                        'order' => $currentOrder
                    ];

                    $currentOrder++;
                }
            }

            if (empty($uploadedImages)) {
                Response::error('فشل رفع الصور', 400, 'IMG_001');
            }

            Response::success($uploadedImages, 201);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في رفع الصور', 500, 'SRV_001');
        }
    }

    /**
     * Reorder images
     * Requirements: 9.6
     * PUT /api/cars/:id/images/reorder
     */
    public function reorder($carId) {
        $data = Response::getJsonInput();

        if (empty($data['imageIds']) || !is_array($data['imageIds'])) {
            Response::error('يرجى توفير قائمة معرفات الصور', 400, 'VAL_001');
        }

        try {
            // Verify car exists
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$carId]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            // Update order for each image
            $order = 0;
            foreach ($data['imageIds'] as $imageId) {
                $stmt = $this->db->prepare("UPDATE car_images SET image_order = ? WHERE id = ? AND car_id = ?");
                $stmt->execute([$order, $imageId, $carId]);
                $order++;
            }

            // Return updated images
            $this->getByCarId($carId);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في إعادة ترتيب الصور', 500, 'SRV_001');
        }
    }

    /**
     * Delete image
     * Requirements: 9.3
     * DELETE /api/images/:id
     */
    public function delete($id) {
        try {
            // Get image info
            $stmt = $this->db->prepare("SELECT * FROM car_images WHERE id = ?");
            $stmt->execute([$id]);
            $image = $stmt->fetch();

            if (!$image) {
                Response::error('الصورة غير موجودة', 404, 'IMG_001');
            }

            // Store car_id before deletion
            $carId = $image['car_id'];

            // Delete file from disk (ignore if file doesn't exist)
            $this->imageProcessor->delete($image['url']);

            // Delete from database
            $stmt = $this->db->prepare("DELETE FROM car_images WHERE id = ?");
            $stmt->execute([$id]);

            // Reorder remaining images
            $stmt = $this->db->prepare("SELECT id FROM car_images WHERE car_id = ? ORDER BY image_order");
            $stmt->execute([$carId]);
            $remainingImages = $stmt->fetchAll();

            $order = 0;
            foreach ($remainingImages as $img) {
                $updateStmt = $this->db->prepare("UPDATE car_images SET image_order = ? WHERE id = ?");
                $updateStmt->execute([$order, $img['id']]);
                $order++;
            }

            Response::success(['message' => 'تم حذف الصورة بنجاح']);

        } catch (PDOException $e) {
            error_log("ImagesController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف الصورة', 500, 'SRV_001');
        }
    }
}
