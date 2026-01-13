<?php
/**
 * VDS Inspections Controller
 * CRUD operations for Vehicle Damage System inspections
 * Requirements: 8.1, 8.3, 8.4
 */

class VDSInspectionsController {
    private $db;

    // Valid inspection statuses
    private const VALID_STATUSES = ['draft', 'finalized'];

    // Valid part conditions
    private const VALID_CONDITIONS = ['good', 'scratch', 'bodywork', 'broken', 'painted', 'replaced'];

    // Valid damage severities
    private const VALID_SEVERITIES = ['light', 'medium', 'severe'];

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get all inspections
     * GET /api/inspections
     * Requirements: 8.4
     */
    public function getAll() {
        try {
            $filters = $this->getFilters();
            
            $query = "SELECT i.*, 
                      ct.name_ar as template_name_ar, ct.name_en as template_name_en, ct.type as template_type,
                      c.name as car_name, c.brand as car_brand,
                      (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id) as parts_count,
                      (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id AND ip.condition_status != 'good') as damaged_parts_count
                      FROM inspections i
                      LEFT JOIN car_templates ct ON i.template_id = ct.id
                      LEFT JOIN cars c ON i.car_id = c.id
                      WHERE 1=1";
            $params = [];

            // Filter by status
            if (!empty($filters['status'])) {
                $query .= " AND i.status = ?";
                $params[] = $filters['status'];
            }

            // Filter by car_id
            if (!empty($filters['carId'])) {
                $query .= " AND i.car_id = ?";
                $params[] = (int)$filters['carId'];
            }

            // Filter by template_id
            if (!empty($filters['templateId'])) {
                $query .= " AND i.template_id = ?";
                $params[] = (int)$filters['templateId'];
            }

            $query .= " ORDER BY i.created_at DESC";

            // Pagination
            $page = max(1, (int)($filters['page'] ?? 1));
            $perPage = min(50, max(1, (int)($filters['perPage'] ?? 12)));
            $offset = ($page - 1) * $perPage;

            // Get total count
            $countQuery = str_replace(
                "SELECT i.*, ct.name_ar as template_name_ar, ct.name_en as template_name_en, ct.type as template_type,
                      c.name as car_name, c.brand as car_brand,
                      (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id) as parts_count,
                      (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id AND ip.condition_status != 'good') as damaged_parts_count",
                "SELECT COUNT(*) as total",
                $query
            );
            $countQuery = preg_replace('/ORDER BY.*$/', '', $countQuery);
            
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($params);
            $total = $countStmt->fetch()['total'];

            // Add pagination
            $query .= " LIMIT ? OFFSET ?";
            $params[] = $perPage;
            $params[] = $offset;

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $inspections = $stmt->fetchAll();

            $inspections = array_map([$this, 'formatInspectionSummary'], $inspections);
            Response::paginated($inspections, $total, $page, $perPage);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب الفحوصات', 500, 'SRV_001');
        }
    }

    /**
     * Get inspection by ID
     * GET /api/inspections/:id
     * Requirements: 8.4
     */
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT i.*, 
                       ct.name_ar as template_name_ar, ct.name_en as template_name_en, ct.type as template_type
                FROM inspections i
                LEFT JOIN car_templates ct ON i.template_id = ct.id
                WHERE i.id = ?
            ");
            $stmt->execute([$id]);
            $inspection = $stmt->fetch();

            if (!$inspection) {
                Response::error('الفحص غير موجود', 404, 'INS_001');
            }

            // Get inspection parts with photos
            $partsStmt = $this->db->prepare("
                SELECT ip.*, pk.label_ar, pk.label_en, pk.category,
                       cm.color_hex, cm.label_ar as condition_label_ar, cm.label_en as condition_label_en
                FROM inspection_parts ip
                LEFT JOIN part_keys pk ON ip.part_key = pk.part_key
                LEFT JOIN color_mappings cm ON ip.condition_status = cm.condition_key
                WHERE ip.inspection_id = ?
                ORDER BY pk.category, pk.sort_order
            ");
            $partsStmt->execute([$id]);
            $parts = $partsStmt->fetchAll();

            // Get photos for each part
            foreach ($parts as &$part) {
                $photosStmt = $this->db->prepare("
                    SELECT id, photo_url, photo_order FROM inspection_part_photos 
                    WHERE inspection_part_id = ? ORDER BY photo_order
                ");
                $photosStmt->execute([$part['id']]);
                $part['photos'] = $photosStmt->fetchAll();
            }

            $inspection['parts'] = $parts;

            Response::success($this->formatInspectionDetail($inspection));

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::getById error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Create new inspection
     * POST /api/inspections
     * Requirements: 8.1, 8.2
     */
    public function create() {
        $data = Response::getJsonInput();
        $errors = $this->validateInspectionData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            // Verify template exists
            $templateStmt = $this->db->prepare("SELECT id FROM car_templates WHERE id = ?");
            $templateStmt->execute([$data['templateId']]);
            if (!$templateStmt->fetch()) {
                Response::error('القالب غير موجود', 404, 'TPL_001');
            }

            $stmt = $this->db->prepare("
                INSERT INTO inspections (
                    car_id, template_id, vehicle_make, vehicle_model, vehicle_year,
                    vehicle_vin, vehicle_plate, vehicle_color, vehicle_mileage,
                    customer_name, customer_phone, customer_email,
                    inspector_id, inspector_name, general_notes, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
            ");

            $stmt->execute([
                $data['carId'] ?? null,
                $data['templateId'],
                $data['vehicle']['make'] ?? null,
                $data['vehicle']['model'] ?? null,
                $data['vehicle']['year'] ?? null,
                $data['vehicle']['vin'] ?? null,
                $data['vehicle']['plate'] ?? null,
                $data['vehicle']['color'] ?? null,
                $data['vehicle']['mileage'] ?? null,
                $data['customer']['name'] ?? null,
                $data['customer']['phone'] ?? null,
                $data['customer']['email'] ?? null,
                $data['inspector']['id'] ?? null,
                $data['inspector']['name'] ?? null,
                $data['generalNotes'] ?? null
            ]);

            $inspectionId = $this->db->lastInsertId();

            // Insert parts if provided
            if (!empty($data['parts'])) {
                $this->saveParts($inspectionId, $data['parts']);
            }

            $this->db->commit();
            $this->getById($inspectionId);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("VDSInspectionsController::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إنشاء الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Update inspection
     * PUT /api/inspections/:id
     * Requirements: 8.1, 8.3
     */
    public function update($id) {
        // Check if inspection exists and is not finalized
        $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
        $stmt->execute([$id]);
        $inspection = $stmt->fetch();

        if (!$inspection) {
            Response::error('الفحص غير موجود', 404, 'INS_001');
        }

        if ($inspection['status'] === 'finalized') {
            Response::error('لا يمكن تعديل فحص معتمد', 400, 'INS_002');
        }

        $data = Response::getJsonInput();
        $errors = $this->validateInspectionData($data, true);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            $updates = [];
            $params = [];

            // Vehicle info
            if (isset($data['vehicle'])) {
                $vehicleFields = ['make', 'model', 'year', 'vin', 'plate', 'color', 'mileage'];
                foreach ($vehicleFields as $field) {
                    if (isset($data['vehicle'][$field])) {
                        $updates[] = "vehicle_$field = ?";
                        $params[] = $data['vehicle'][$field];
                    }
                }
            }

            // Customer info
            if (isset($data['customer'])) {
                $customerFields = ['name', 'phone', 'email'];
                foreach ($customerFields as $field) {
                    if (isset($data['customer'][$field])) {
                        $updates[] = "customer_$field = ?";
                        $params[] = $data['customer'][$field];
                    }
                }
            }

            // Inspector info
            if (isset($data['inspector'])) {
                if (isset($data['inspector']['id'])) {
                    $updates[] = "inspector_id = ?";
                    $params[] = $data['inspector']['id'];
                }
                if (isset($data['inspector']['name'])) {
                    $updates[] = "inspector_name = ?";
                    $params[] = $data['inspector']['name'];
                }
            }

            // General notes
            if (isset($data['generalNotes'])) {
                $updates[] = "general_notes = ?";
                $params[] = $data['generalNotes'];
            }

            // Template ID
            if (isset($data['templateId'])) {
                $updates[] = "template_id = ?";
                $params[] = $data['templateId'];
            }

            if (!empty($updates)) {
                $params[] = $id;
                $query = "UPDATE inspections SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute($params);
            }

            // Update parts if provided
            if (isset($data['parts'])) {
                // Delete existing parts
                $deleteStmt = $this->db->prepare("DELETE FROM inspection_parts WHERE inspection_id = ?");
                $deleteStmt->execute([$id]);
                
                // Insert new parts
                if (!empty($data['parts'])) {
                    $this->saveParts($id, $data['parts']);
                }
            }

            $this->db->commit();
            $this->getById($id);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("VDSInspectionsController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Finalize inspection
     * POST /api/inspections/:id/finalize
     * Requirements: 8.3
     */
    public function finalize($id) {
        try {
            // Check if inspection exists
            $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
            $stmt->execute([$id]);
            $inspection = $stmt->fetch();

            if (!$inspection) {
                Response::error('الفحص غير موجود', 404, 'INS_001');
            }

            if ($inspection['status'] === 'finalized') {
                Response::error('الفحص معتمد مسبقاً', 400, 'INS_003');
            }

            // Update status to finalized
            $updateStmt = $this->db->prepare("
                UPDATE inspections 
                SET status = 'finalized', finalized_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $updateStmt->execute([$id]);

            $this->getById($id);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::finalize error: " . $e->getMessage());
            Response::error('حدث خطأ في اعتماد الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Delete inspection
     * DELETE /api/inspections/:id
     * Requirements: 8.4
     */
    public function delete($id) {
        try {
            // Check if inspection exists
            $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
            $stmt->execute([$id]);
            $inspection = $stmt->fetch();

            if (!$inspection) {
                Response::error('الفحص غير موجود', 404, 'INS_001');
            }

            if ($inspection['status'] === 'finalized') {
                Response::error('لا يمكن حذف فحص معتمد', 400, 'INS_004');
            }

            $stmt = $this->db->prepare("DELETE FROM inspections WHERE id = ?");
            $stmt->execute([$id]);

            Response::success(['message' => 'تم حذف الفحص بنجاح']);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Update part status
     * PUT /api/inspections/:id/parts/:partKey
     * Requirements: 3.1, 3.2
     */
    public function updatePart($inspectionId, $partKey) {
        // Check if inspection exists and is not finalized
        $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
        $stmt->execute([$inspectionId]);
        $inspection = $stmt->fetch();

        if (!$inspection) {
            Response::error('الفحص غير موجود', 404, 'INS_001');
        }

        if ($inspection['status'] === 'finalized') {
            Response::error('لا يمكن تعديل فحص معتمد', 400, 'INS_002');
        }

        $data = Response::getJsonInput();
        $errors = $this->validatePartData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            // Upsert part
            $stmt = $this->db->prepare("
                INSERT INTO inspection_parts (inspection_id, part_key, condition_status, severity, notes)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    condition_status = VALUES(condition_status),
                    severity = VALUES(severity),
                    notes = VALUES(notes),
                    updated_at = CURRENT_TIMESTAMP
            ");

            $stmt->execute([
                $inspectionId,
                $partKey,
                $data['condition'],
                $data['condition'] !== 'good' ? ($data['severity'] ?? null) : null,
                $data['notes'] ?? null
            ]);

            $this->getById($inspectionId);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::updatePart error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث حالة الجزء', 500, 'SRV_001');
        }
    }

    /**
     * Upload photo for part
     * POST /api/inspections/:id/parts/:partKey/photos
     * Requirements: 3.5, 3.6
     */
    public function uploadPartPhoto($inspectionId, $partKey) {
        // Check if inspection exists and is not finalized
        $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
        $stmt->execute([$inspectionId]);
        $inspection = $stmt->fetch();

        if (!$inspection) {
            Response::error('الفحص غير موجود', 404, 'INS_001');
        }

        if ($inspection['status'] === 'finalized') {
            Response::error('لا يمكن تعديل فحص معتمد', 400, 'INS_002');
        }

        // Check if part exists
        $partStmt = $this->db->prepare("SELECT id FROM inspection_parts WHERE inspection_id = ? AND part_key = ?");
        $partStmt->execute([$inspectionId, $partKey]);
        $part = $partStmt->fetch();

        if (!$part) {
            Response::error('الجزء غير موجود في هذا الفحص', 404, 'INS_005');
        }

        // Handle file upload
        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            Response::error('يرجى رفع صورة صالحة', 400, 'VAL_001');
        }

        $file = $_FILES['photo'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        if (!in_array($file['type'], $allowedTypes)) {
            Response::error('نوع الملف غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP', 400, 'VAL_001');
        }

        // Max 1MB
        if ($file['size'] > 1024 * 1024) {
            Response::error('حجم الصورة يجب أن لا يتجاوز 1 ميجابايت', 400, 'VAL_001');
        }

        try {
            // Create upload directory if not exists
            $uploadDir = __DIR__ . '/../uploads/inspections/' . $inspectionId;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Generate unique filename
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = $partKey . '_' . uniqid() . '.' . $ext;
            $filepath = $uploadDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                Response::error('فشل في رفع الصورة', 500, 'SRV_001');
            }

            // Get next photo order
            $orderStmt = $this->db->prepare("SELECT MAX(photo_order) as max_order FROM inspection_part_photos WHERE inspection_part_id = ?");
            $orderStmt->execute([$part['id']]);
            $maxOrder = $orderStmt->fetch()['max_order'] ?? 0;

            // Save to database
            $photoUrl = '/uploads/inspections/' . $inspectionId . '/' . $filename;
            $insertStmt = $this->db->prepare("
                INSERT INTO inspection_part_photos (inspection_part_id, photo_url, photo_order)
                VALUES (?, ?, ?)
            ");
            $insertStmt->execute([$part['id'], $photoUrl, $maxOrder + 1]);

            Response::success([
                'id' => $this->db->lastInsertId(),
                'photoUrl' => $photoUrl,
                'photoOrder' => $maxOrder + 1
            ]);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::uploadPartPhoto error: " . $e->getMessage());
            Response::error('حدث خطأ في حفظ الصورة', 500, 'SRV_001');
        }
    }

    /**
     * Delete part photo
     * DELETE /api/inspections/:id/parts/:partKey/photos/:photoId
     * Requirements: 3.5
     */
    public function deletePartPhoto($inspectionId, $partKey, $photoId) {
        // Check if inspection exists and is not finalized
        $stmt = $this->db->prepare("SELECT id, status FROM inspections WHERE id = ?");
        $stmt->execute([$inspectionId]);
        $inspection = $stmt->fetch();

        if (!$inspection) {
            Response::error('الفحص غير موجود', 404, 'INS_001');
        }

        if ($inspection['status'] === 'finalized') {
            Response::error('لا يمكن تعديل فحص معتمد', 400, 'INS_002');
        }

        try {
            // Get photo info
            $photoStmt = $this->db->prepare("
                SELECT ipp.*, ip.part_key 
                FROM inspection_part_photos ipp
                JOIN inspection_parts ip ON ipp.inspection_part_id = ip.id
                WHERE ipp.id = ? AND ip.inspection_id = ? AND ip.part_key = ?
            ");
            $photoStmt->execute([$photoId, $inspectionId, $partKey]);
            $photo = $photoStmt->fetch();

            if (!$photo) {
                Response::error('الصورة غير موجودة', 404, 'INS_006');
            }

            // Delete file
            $filepath = __DIR__ . '/..' . $photo['photo_url'];
            if (file_exists($filepath)) {
                unlink($filepath);
            }

            // Delete from database
            $deleteStmt = $this->db->prepare("DELETE FROM inspection_part_photos WHERE id = ?");
            $deleteStmt->execute([$photoId]);

            Response::success(['message' => 'تم حذف الصورة بنجاح']);

        } catch (PDOException $e) {
            error_log("VDSInspectionsController::deletePartPhoto error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف الصورة', 500, 'SRV_001');
        }
    }

    /**
     * Save parts for an inspection
     */
    private function saveParts($inspectionId, $parts) {
        $stmt = $this->db->prepare("
            INSERT INTO inspection_parts (inspection_id, part_key, condition_status, severity, notes)
            VALUES (?, ?, ?, ?, ?)
        ");

        foreach ($parts as $part) {
            if (empty($part['partKey']) || empty($part['condition'])) {
                continue;
            }

            $stmt->execute([
                $inspectionId,
                $part['partKey'],
                $part['condition'],
                $part['condition'] !== 'good' ? ($part['severity'] ?? null) : null,
                $part['notes'] ?? null
            ]);
        }
    }

    /**
     * Validate inspection data
     */
    private function validateInspectionData($data, $isUpdate = false) {
        $errors = [];

        if (!$isUpdate) {
            // Template ID is required for creation
            if (empty($data['templateId'])) {
                $errors['templateId'] = 'معرف القالب مطلوب';
            }
        }

        // Validate parts if provided
        if (isset($data['parts']) && is_array($data['parts'])) {
            foreach ($data['parts'] as $index => $part) {
                $partErrors = $this->validatePartData($part);
                foreach ($partErrors as $field => $error) {
                    $errors["parts.$index.$field"] = $error;
                }
            }
        }

        return $errors;
    }

    /**
     * Validate part data
     */
    private function validatePartData($data) {
        $errors = [];

        if (empty($data['condition'])) {
            $errors['condition'] = 'حالة الجزء مطلوبة';
        } elseif (!in_array($data['condition'], self::VALID_CONDITIONS)) {
            $errors['condition'] = 'حالة الجزء غير صالحة';
        }

        // Severity is required if condition is not 'good'
        if (isset($data['condition']) && $data['condition'] !== 'good') {
            if (isset($data['severity']) && !in_array($data['severity'], self::VALID_SEVERITIES)) {
                $errors['severity'] = 'شدة الضرر غير صالحة';
            }
        }

        return $errors;
    }

    /**
     * Format inspection summary for list view
     */
    private function formatInspectionSummary($inspection) {
        return [
            'id' => (int)$inspection['id'],
            'carId' => $inspection['car_id'] ? (int)$inspection['car_id'] : null,
            'templateId' => (int)$inspection['template_id'],
            'templateNameAr' => $inspection['template_name_ar'],
            'templateNameEn' => $inspection['template_name_en'],
            'templateType' => $inspection['template_type'],
            'carName' => $inspection['car_name'],
            'carBrand' => $inspection['car_brand'],
            'vehicle' => [
                'make' => $inspection['vehicle_make'],
                'model' => $inspection['vehicle_model'],
                'year' => $inspection['vehicle_year'] ? (int)$inspection['vehicle_year'] : null,
                'plate' => $inspection['vehicle_plate']
            ],
            'customerName' => $inspection['customer_name'],
            'inspectorName' => $inspection['inspector_name'],
            'status' => $inspection['status'],
            'partsCount' => (int)$inspection['parts_count'],
            'damagedPartsCount' => (int)$inspection['damaged_parts_count'],
            'createdAt' => $inspection['created_at'],
            'finalizedAt' => $inspection['finalized_at']
        ];
    }

    /**
     * Format inspection detail
     */
    private function formatInspectionDetail($inspection) {
        $formatted = [
            'id' => (int)$inspection['id'],
            'carId' => $inspection['car_id'] ? (int)$inspection['car_id'] : null,
            'templateId' => (int)$inspection['template_id'],
            'templateNameAr' => $inspection['template_name_ar'],
            'templateNameEn' => $inspection['template_name_en'],
            'templateType' => $inspection['template_type'],
            'vehicle' => [
                'make' => $inspection['vehicle_make'],
                'model' => $inspection['vehicle_model'],
                'year' => $inspection['vehicle_year'] ? (int)$inspection['vehicle_year'] : null,
                'vin' => $inspection['vehicle_vin'],
                'plate' => $inspection['vehicle_plate'],
                'color' => $inspection['vehicle_color'],
                'mileage' => $inspection['vehicle_mileage'] ? (int)$inspection['vehicle_mileage'] : null
            ],
            'customer' => [
                'name' => $inspection['customer_name'],
                'phone' => $inspection['customer_phone'],
                'email' => $inspection['customer_email']
            ],
            'inspector' => [
                'id' => $inspection['inspector_id'] ? (int)$inspection['inspector_id'] : null,
                'name' => $inspection['inspector_name']
            ],
            'generalNotes' => $inspection['general_notes'],
            'status' => $inspection['status'],
            'createdAt' => $inspection['created_at'],
            'updatedAt' => $inspection['updated_at'],
            'finalizedAt' => $inspection['finalized_at'],
            'parts' => []
        ];

        // Format parts
        if (!empty($inspection['parts'])) {
            foreach ($inspection['parts'] as $part) {
                $formatted['parts'][] = [
                    'partKey' => $part['part_key'],
                    'labelAr' => $part['label_ar'],
                    'labelEn' => $part['label_en'],
                    'category' => $part['category'],
                    'condition' => $part['condition_status'],
                    'conditionLabelAr' => $part['condition_label_ar'],
                    'conditionLabelEn' => $part['condition_label_en'],
                    'colorHex' => $part['color_hex'],
                    'severity' => $part['severity'],
                    'notes' => $part['notes'],
                    'photos' => array_map(function($photo) {
                        return [
                            'id' => (int)$photo['id'],
                            'url' => $photo['photo_url'],
                            'order' => (int)$photo['photo_order']
                        ];
                    }, $part['photos'] ?? [])
                ];
            }
        }

        return $formatted;
    }

    /**
     * Get filters from query string
     */
    private function getFilters() {
        return [
            'status' => $_GET['status'] ?? null,
            'carId' => $_GET['carId'] ?? null,
            'templateId' => $_GET['templateId'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'perPage' => $_GET['perPage'] ?? 12
        ];
    }

    /**
     * Get valid statuses
     */
    public static function getValidStatuses() {
        return self::VALID_STATUSES;
    }

    /**
     * Get valid conditions
     */
    public static function getValidConditions() {
        return self::VALID_CONDITIONS;
    }

    /**
     * Get valid severities
     */
    public static function getValidSeverities() {
        return self::VALID_SEVERITIES;
    }
}
