<?php
/**
 * Banners Controller
 * CRUD operations for banner management
 * Requirements: 1.1-1.6, 2.1-2.4, 3.1-3.3, 4.1-4.4, 5.1-5.3, 8.1-8.4
 */

class BannersController {
    private $db;
    private $uploadDir;
    
    // Valid banner positions
    private const VALID_POSITIONS = [
        'hero_top', 'hero_bottom', 'sidebar', 'cars_between', 
        'car_detail', 'footer_above', 'popup'
    ];
    
    // Valid link targets
    private const VALID_LINK_TARGETS = ['_self', '_blank'];
    
    // Allowed image types and max size
    private const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    private const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    public function __construct($db) {
        $this->db = $db;
        $this->uploadDir = __DIR__ . '/../uploads/banners/';
        
        // Create upload directory if not exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Get all banners (admin)
     * Requirements: 4.1-4.4
     * GET /api/banners
     */
    public function getAll() {
        try {
            $query = "SELECT * FROM banners WHERE 1=1";
            $params = [];
            
            // Filter by position
            if (!empty($_GET['position'])) {
                $query .= " AND position = ?";
                $params[] = $_GET['position'];
            }
            
            // Filter by status
            if (isset($_GET['isActive'])) {
                $isActive = filter_var($_GET['isActive'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($isActive !== null) {
                    $query .= " AND is_active = ?";
                    $params[] = $isActive ? 1 : 0;
                }
            }
            
            $query .= " ORDER BY position, display_order ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $banners = $stmt->fetchAll();
            
            $formattedBanners = array_map([$this, 'formatBanner'], $banners);
            Response::success($formattedBanners);
            
        } catch (PDOException $e) {
            error_log("BannersController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب البانرات', 500, 'SRV_001');
        }
    }


    /**
     * Get active banners by position (public)
     * Requirements: 8.1-8.2
     * GET /api/banners/position/:position
     */
    public function getByPosition($position) {
        // Validate position
        if (!in_array($position, self::VALID_POSITIONS)) {
            Response::error('موقع البانر غير صالح', 400, 'BNR_004');
        }
        
        try {
            $now = date('Y-m-d H:i:s');
            
            $query = "SELECT * FROM banners 
                      WHERE position = ? 
                      AND is_active = 1 
                      AND (start_date IS NULL OR start_date <= ?)
                      AND (end_date IS NULL OR end_date >= ?)
                      ORDER BY display_order ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$position, $now, $now]);
            $banners = $stmt->fetchAll();
            
            $formattedBanners = array_map([$this, 'formatBanner'], $banners);
            Response::success($formattedBanners);
            
        } catch (PDOException $e) {
            error_log("BannersController::getByPosition error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب البانرات', 500, 'SRV_001');
        }
    }

    /**
     * Get single banner by ID
     * GET /api/banners/:id
     */
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM banners WHERE id = ?");
            $stmt->execute([$id]);
            $banner = $stmt->fetch();
            
            if (!$banner) {
                Response::error('البانر غير موجود', 404, 'BNR_007');
            }
            
            Response::success($this->formatBanner($banner));
            
        } catch (PDOException $e) {
            error_log("BannersController::getById error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب البانر', 500, 'SRV_001');
        }
    }

    /**
     * Create new banner
     * Requirements: 1.1-1.6
     * POST /api/banners
     */
    public function create() {
        // Get form data (multipart/form-data for file upload)
        $data = $_POST;
        
        // Validate required fields
        $errors = $this->validateBannerData($data, false);
        
        // Validate image upload
        if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errors['image'] = 'صورة البانر مطلوبة';
        } else {
            $imageError = $this->validateImage($_FILES['image']);
            if ($imageError) {
                $errors['image'] = $imageError;
            }
        }
        
        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'BNR_003', $errors);
        }
        
        try {
            // Upload main image
            $imageUrl = $this->uploadImage($_FILES['image']);
            if (!$imageUrl) {
                Response::error('فشل رفع الصورة', 500, 'SRV_001');
            }
            
            // Upload mobile image if provided
            $imageMobileUrl = null;
            if (!empty($_FILES['imageMobile']) && $_FILES['imageMobile']['error'] === UPLOAD_ERR_OK) {
                $mobileError = $this->validateImage($_FILES['imageMobile']);
                if (!$mobileError) {
                    $imageMobileUrl = $this->uploadImage($_FILES['imageMobile']);
                }
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO banners (title, image_url, image_mobile_url, link_url, link_target, position, display_order, is_active, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['title'],
                $imageUrl,
                $imageMobileUrl,
                $data['linkUrl'] ?? null,
                $data['linkTarget'] ?? '_blank',
                $data['position'],
                (int)($data['displayOrder'] ?? 0),
                isset($data['isActive']) ? (filter_var($data['isActive'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0) : 1,
                !empty($data['startDate']) ? $data['startDate'] : null,
                !empty($data['endDate']) ? $data['endDate'] : null
            ]);
            
            $bannerId = $this->db->lastInsertId();
            $this->getById($bannerId);
            
        } catch (PDOException $e) {
            error_log("BannersController::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إنشاء البانر', 500, 'SRV_001');
        }
    }


    /**
     * Update banner
     * Requirements: 2.1-2.4
     * PUT /api/banners/:id
     */
    public function update($id) {
        // Check if banner exists
        $stmt = $this->db->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt->execute([$id]);
        $existingBanner = $stmt->fetch();
        
        if (!$existingBanner) {
            Response::error('البانر غير موجود', 404, 'BNR_007');
        }
        
        // Get form data - handle both multipart/form-data and regular PUT data
        // For PUT requests, $_POST may be empty, so we need to parse php://input
        $data = $_POST;
        if (empty($data)) {
            // Try to parse multipart form data from php://input for PUT requests
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            if (strpos($contentType, 'multipart/form-data') !== false) {
                // Parse multipart form data manually for PUT requests
                $data = $this->parseMultipartFormData();
            } elseif (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
                // Parse URL-encoded data
                parse_str(file_get_contents('php://input'), $data);
            } else {
                // Try JSON
                $jsonData = Response::getJsonInput();
                if (!empty($jsonData)) {
                    $data = $jsonData;
                }
            }
        }
        
        // Validate data
        $errors = $this->validateBannerData($data, true);
        
        // Validate new image if provided
        if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageError = $this->validateImage($_FILES['image']);
            if ($imageError) {
                $errors['image'] = $imageError;
            }
        }
        
        // Validate mobile image if provided
        if (!empty($_FILES['imageMobile']) && $_FILES['imageMobile']['error'] === UPLOAD_ERR_OK) {
            $mobileError = $this->validateImage($_FILES['imageMobile']);
            if ($mobileError) {
                $errors['imageMobile'] = $mobileError;
            }
        }
        
        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }
        
        try {
            $updates = [];
            $params = [];
            
            // Update title
            if (isset($data['title'])) {
                $updates[] = "title = ?";
                $params[] = $data['title'];
            }
            
            // Update main image
            if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $newImageUrl = $this->uploadImage($_FILES['image']);
                if ($newImageUrl) {
                    // Delete old image
                    $this->deleteImageFile($existingBanner['image_url']);
                    $updates[] = "image_url = ?";
                    $params[] = $newImageUrl;
                }
            }
            
            // Update mobile image
            if (!empty($_FILES['imageMobile']) && $_FILES['imageMobile']['error'] === UPLOAD_ERR_OK) {
                $newMobileUrl = $this->uploadImage($_FILES['imageMobile']);
                if ($newMobileUrl) {
                    // Delete old mobile image if exists
                    if ($existingBanner['image_mobile_url']) {
                        $this->deleteImageFile($existingBanner['image_mobile_url']);
                    }
                    $updates[] = "image_mobile_url = ?";
                    $params[] = $newMobileUrl;
                }
            }
            
            // Update link URL
            if (array_key_exists('linkUrl', $data)) {
                $updates[] = "link_url = ?";
                $params[] = $data['linkUrl'] ?: null;
            }
            
            // Update link target
            if (isset($data['linkTarget'])) {
                $updates[] = "link_target = ?";
                $params[] = $data['linkTarget'];
            }
            
            // Update position
            if (isset($data['position'])) {
                $updates[] = "position = ?";
                $params[] = $data['position'];
            }
            
            // Update display order
            if (isset($data['displayOrder'])) {
                $updates[] = "display_order = ?";
                $params[] = (int)$data['displayOrder'];
            }
            
            // Update active status
            if (isset($data['isActive'])) {
                $updates[] = "is_active = ?";
                $params[] = filter_var($data['isActive'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            }
            
            // Update start date
            if (array_key_exists('startDate', $data)) {
                $updates[] = "start_date = ?";
                $params[] = !empty($data['startDate']) ? $data['startDate'] : null;
            }
            
            // Update end date
            if (array_key_exists('endDate', $data)) {
                $updates[] = "end_date = ?";
                $params[] = !empty($data['endDate']) ? $data['endDate'] : null;
            }
            
            if (empty($updates)) {
                Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
            }
            
            $params[] = $id;
            $query = "UPDATE banners SET " . implode(', ', $updates) . " WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            $this->getById($id);
            
        } catch (PDOException $e) {
            error_log("BannersController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث البانر', 500, 'SRV_001');
        }
    }

    /**
     * Delete banner
     * Requirements: 3.1-3.3
     * DELETE /api/banners/:id
     */
    public function delete($id) {
        try {
            // Get banner info
            $stmt = $this->db->prepare("SELECT * FROM banners WHERE id = ?");
            $stmt->execute([$id]);
            $banner = $stmt->fetch();
            
            if (!$banner) {
                Response::error('البانر غير موجود', 404, 'BNR_007');
            }
            
            // Delete image files
            $this->deleteImageFile($banner['image_url']);
            if ($banner['image_mobile_url']) {
                $this->deleteImageFile($banner['image_mobile_url']);
            }
            
            // Delete from database
            $stmt = $this->db->prepare("DELETE FROM banners WHERE id = ?");
            $stmt->execute([$id]);
            
            Response::success(['message' => 'تم حذف البانر بنجاح']);
            
        } catch (PDOException $e) {
            error_log("BannersController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف البانر', 500, 'SRV_001');
        }
    }


    /**
     * Toggle banner active status
     * Requirements: 5.1-5.3
     * PUT /api/banners/:id/toggle
     */
    public function toggleActive($id) {
        try {
            $stmt = $this->db->prepare("SELECT id, is_active FROM banners WHERE id = ?");
            $stmt->execute([$id]);
            $banner = $stmt->fetch();
            
            if (!$banner) {
                Response::error('البانر غير موجود', 404, 'BNR_007');
            }
            
            $newStatus = $banner['is_active'] ? 0 : 1;
            $stmt = $this->db->prepare("UPDATE banners SET is_active = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);
            
            $this->getById($id);
            
        } catch (PDOException $e) {
            error_log("BannersController::toggleActive error: " . $e->getMessage());
            Response::error('حدث خطأ في تغيير حالة البانر', 500, 'SRV_001');
        }
    }

    /**
     * Track banner click
     * Requirements: 8.4
     * POST /api/banners/:id/click
     */
    public function trackClick($id) {
        try {
            $stmt = $this->db->prepare("UPDATE banners SET click_count = click_count + 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                Response::error('البانر غير موجود', 404, 'BNR_007');
            }
            
            Response::success(['message' => 'تم تسجيل النقرة']);
            
        } catch (PDOException $e) {
            error_log("BannersController::trackClick error: " . $e->getMessage());
            Response::error('حدث خطأ في تسجيل النقرة', 500, 'SRV_001');
        }
    }

    /**
     * Track banner view
     * Requirements: 8.3
     * POST /api/banners/:id/view
     */
    public function trackView($id) {
        try {
            $stmt = $this->db->prepare("UPDATE banners SET view_count = view_count + 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                Response::error('البانر غير موجود', 404, 'BNR_007');
            }
            
            Response::success(['message' => 'تم تسجيل المشاهدة']);
            
        } catch (PDOException $e) {
            error_log("BannersController::trackView error: " . $e->getMessage());
            Response::error('حدث خطأ في تسجيل المشاهدة', 500, 'SRV_001');
        }
    }

    /**
     * Validate banner data
     * @param array $data Input data
     * @param bool $isUpdate Whether this is an update operation
     * @return array Validation errors
     */
    private function validateBannerData($data, $isUpdate = false) {
        $errors = [];
        
        // Required fields for create
        if (!$isUpdate) {
            if (empty($data['title'])) {
                $errors['title'] = 'عنوان البانر مطلوب';
            }
            if (empty($data['position'])) {
                $errors['position'] = 'موقع البانر مطلوب';
            }
        }
        
        // Validate title length
        if (isset($data['title']) && strlen($data['title']) > 100) {
            $errors['title'] = 'عنوان البانر يجب أن لا يتجاوز 100 حرف';
        }
        
        // Validate position
        if (isset($data['position']) && !in_array($data['position'], self::VALID_POSITIONS)) {
            $errors['position'] = 'موقع البانر غير صالح. المواقع المسموحة: ' . implode(', ', self::VALID_POSITIONS);
        }
        
        // Validate link URL format
        if (!empty($data['linkUrl']) && !filter_var($data['linkUrl'], FILTER_VALIDATE_URL) && !preg_match('/^\//', $data['linkUrl'])) {
            $errors['linkUrl'] = 'صيغة الرابط غير صالحة';
        }
        
        // Validate link target
        if (isset($data['linkTarget']) && !in_array($data['linkTarget'], self::VALID_LINK_TARGETS)) {
            $errors['linkTarget'] = 'هدف الرابط غير صالح';
        }
        
        // Validate schedule dates
        if (!empty($data['startDate']) && !empty($data['endDate'])) {
            $startDate = strtotime($data['startDate']);
            $endDate = strtotime($data['endDate']);
            if ($startDate && $endDate && $startDate > $endDate) {
                $errors['schedule'] = 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية';
            }
        }
        
        return $errors;
    }

    /**
     * Validate image file
     * Requirements: 1.1, 1.6
     * @param array $file $_FILES element
     * @return string|null Error message or null if valid
     */
    private function validateImage($file) {
        // Check file size
        if ($file['size'] > self::MAX_IMAGE_SIZE) {
            return 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت';
        }
        
        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, self::ALLOWED_IMAGE_TYPES)) {
            return 'صيغة الصورة غير مدعومة. الصيغ المدعومة: JPG, PNG, WebP';
        }
        
        return null;
    }

    /**
     * Upload image file
     * @param array $file $_FILES element
     * @return string|false URL path or false on failure
     */
    private function uploadImage($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }
        
        // Get extension from MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];
        
        $extension = $extensions[$mimeType] ?? 'jpg';
        $filename = uniqid('banner_', true) . '.' . $extension;
        $destPath = $this->uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            return '/uploads/banners/' . $filename;
        }
        
        return false;
    }

    /**
     * Delete image file from disk
     * @param string $url Image URL path
     * @return bool Success status
     */
    private function deleteImageFile($url) {
        if (!$url) return false;
        
        $filePath = __DIR__ . '/..' . $url;
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false;
    }

    /**
     * Format banner data for response
     * Requirements: 4.2
     * @param array $banner Raw database row
     * @return array Formatted banner
     */
    private function formatBanner($banner) {
        return [
            'id' => (int)$banner['id'],
            'title' => $banner['title'],
            'imageUrl' => $banner['image_url'],
            'imageMobileUrl' => $banner['image_mobile_url'],
            'linkUrl' => $banner['link_url'],
            'linkTarget' => $banner['link_target'],
            'position' => $banner['position'],
            'displayOrder' => (int)$banner['display_order'],
            'isActive' => (bool)$banner['is_active'],
            'startDate' => $banner['start_date'],
            'endDate' => $banner['end_date'],
            'clickCount' => (int)$banner['click_count'],
            'viewCount' => (int)$banner['view_count'],
            'createdAt' => $banner['created_at'],
            'updatedAt' => $banner['updated_at']
        ];
    }

    /**
     * Parse multipart form data from php://input for PUT requests
     * @return array Parsed form data
     */
    private function parseMultipartFormData() {
        $data = [];
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        // Extract boundary from content type
        if (preg_match('/boundary=(.*)$/', $contentType, $matches)) {
            $boundary = $matches[1];
            $input = file_get_contents('php://input');
            
            // Split by boundary
            $blocks = preg_split('/-+' . preg_quote($boundary, '/') . '/', $input);
            
            foreach ($blocks as $block) {
                if (empty($block) || $block === '--') continue;
                
                // Parse each block
                if (preg_match('/name="([^"]+)"/', $block, $nameMatch)) {
                    $name = $nameMatch[1];
                    
                    // Check if it's a file
                    if (preg_match('/filename="([^"]+)"/', $block, $filenameMatch)) {
                        // Skip file handling here - files should use $_FILES
                        continue;
                    }
                    
                    // Get the value (after the double newline)
                    $parts = preg_split('/\r?\n\r?\n/', $block, 2);
                    if (isset($parts[1])) {
                        $value = trim($parts[1]);
                        // Remove trailing boundary markers
                        $value = preg_replace('/\r?\n--$/', '', $value);
                        $data[$name] = $value;
                    }
                }
            }
        }
        
        return $data;
    }

    /**
     * Get valid positions (for external use/testing)
     */
    public static function getValidPositions() {
        return self::VALID_POSITIONS;
    }
}
