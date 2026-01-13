<?php
/**
 * Part Keys Controller
 * CRUD operations for car part keys dictionary (VDS)
 * Requirements: 5.1, 13.3
 */

class PartKeysController {
    private $db;

    // Valid categories
    private const VALID_CATEGORIES = ['front', 'rear', 'left', 'right', 'top', 'wheels'];

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get all part keys
     * GET /api/part-keys
     * Requirements: 5.1
     */
    public function getAll() {
        try {
            $filters = $this->getFilters();
            
            $query = "SELECT * FROM part_keys WHERE 1=1";
            $params = [];

            // Filter by active status
            if (isset($filters['active'])) {
                $query .= " AND is_active = ?";
                $params[] = $filters['active'] ? 1 : 0;
            }

            // Filter by category
            if (!empty($filters['category'])) {
                $query .= " AND category = ?";
                $params[] = $filters['category'];
            }

            $query .= " ORDER BY category, sort_order, part_key";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $partKeys = $stmt->fetchAll();

            // Format part keys
            $partKeys = array_map([$this, 'formatPartKey'], $partKeys);

            // Group by category if requested
            if (!empty($filters['grouped'])) {
                $grouped = [];
                foreach ($partKeys as $pk) {
                    $grouped[$pk['category']][] = $pk;
                }
                Response::success($grouped);
            } else {
                Response::success($partKeys);
            }

        } catch (PDOException $e) {
            error_log("PartKeysController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب قائمة الأجزاء', 500, 'SRV_001');
        }
    }

    /**
     * Get part key by key
     * GET /api/part-keys/:key
     * Requirements: 5.1
     */
    public function getByKey($key) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM part_keys WHERE part_key = ?");
            $stmt->execute([$key]);
            $partKey = $stmt->fetch();

            if (!$partKey) {
                Response::error('الجزء غير موجود', 404, 'PK_001');
            }

            Response::success($this->formatPartKey($partKey));

        } catch (PDOException $e) {
            error_log("PartKeysController::getByKey error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات الجزء', 500, 'SRV_001');
        }
    }

    /**
     * Create new part key
     * POST /api/part-keys
     * Requirements: 13.3
     */
    public function create() {
        $data = Response::getJsonInput();
        $errors = $this->validatePartKeyData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            // Check if part_key already exists
            $checkStmt = $this->db->prepare("SELECT part_key FROM part_keys WHERE part_key = ?");
            $checkStmt->execute([$data['partKey']]);
            if ($checkStmt->fetch()) {
                Response::error('معرف الجزء موجود مسبقاً', 400, 'PK_002');
            }

            $stmt = $this->db->prepare("
                INSERT INTO part_keys (part_key, label_ar, label_en, category, sort_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data['partKey'],
                $data['labelAr'],
                $data['labelEn'],
                $data['category'],
                $data['sortOrder'] ?? 0,
                isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1
            ]);

            $this->getByKey($data['partKey']);

        } catch (PDOException $e) {
            error_log("PartKeysController::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إضافة الجزء', 500, 'SRV_001');
        }
    }

    /**
     * Update part key
     * PUT /api/part-keys/:key
     * Requirements: 13.3
     */
    public function update($key) {
        // Check if part key exists
        $stmt = $this->db->prepare("SELECT part_key FROM part_keys WHERE part_key = ?");
        $stmt->execute([$key]);
        if (!$stmt->fetch()) {
            Response::error('الجزء غير موجود', 404, 'PK_001');
        }

        $data = Response::getJsonInput();
        $errors = $this->validatePartKeyData($data, true);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $updates = [];
            $params = [];

            $fieldMap = [
                'labelAr' => 'label_ar',
                'labelEn' => 'label_en',
                'category' => 'category',
                'sortOrder' => 'sort_order',
                'isActive' => 'is_active'
            ];

            foreach ($fieldMap as $camelCase => $snakeCase) {
                if (isset($data[$camelCase])) {
                    $value = $data[$camelCase];
                    if ($camelCase === 'isActive') {
                        $value = $value ? 1 : 0;
                    }
                    $updates[] = "$snakeCase = ?";
                    $params[] = $value;
                }
            }

            if (empty($updates)) {
                Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
            }

            $params[] = $key;
            $query = "UPDATE part_keys SET " . implode(', ', $updates) . " WHERE part_key = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            $this->getByKey($key);

        } catch (PDOException $e) {
            error_log("PartKeysController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث الجزء', 500, 'SRV_001');
        }
    }

    /**
     * Delete part key
     * DELETE /api/part-keys/:key
     * Requirements: 13.3
     */
    public function delete($key) {
        try {
            // Check if part key exists
            $stmt = $this->db->prepare("SELECT part_key FROM part_keys WHERE part_key = ?");
            $stmt->execute([$key]);
            if (!$stmt->fetch()) {
                Response::error('الجزء غير موجود', 404, 'PK_001');
            }

            // Check if part key is used in any inspection parts
            $usageStmt = $this->db->prepare("SELECT COUNT(*) as count FROM inspection_parts WHERE part_key = ?");
            $usageStmt->execute([$key]);
            $usage = $usageStmt->fetch();

            if ($usage['count'] > 0) {
                Response::error('لا يمكن حذف الجزء لأنه مستخدم في ' . $usage['count'] . ' سجل فحص', 400, 'PK_003');
            }

            // Check if part key is used in template mappings
            $mappingStmt = $this->db->prepare("SELECT COUNT(*) as count FROM template_part_mappings WHERE part_key = ?");
            $mappingStmt->execute([$key]);
            $mappingUsage = $mappingStmt->fetch();

            if ($mappingUsage['count'] > 0) {
                Response::error('لا يمكن حذف الجزء لأنه مرتبط بـ ' . $mappingUsage['count'] . ' قالب', 400, 'PK_004');
            }

            $stmt = $this->db->prepare("DELETE FROM part_keys WHERE part_key = ?");
            $stmt->execute([$key]);

            Response::success(['message' => 'تم حذف الجزء بنجاح']);

        } catch (PDOException $e) {
            error_log("PartKeysController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف الجزء', 500, 'SRV_001');
        }
    }

    /**
     * Validate part key data
     */
    private function validatePartKeyData($data, $isUpdate = false) {
        $errors = [];

        if (!$isUpdate) {
            // Required fields for creation
            if (empty($data['partKey'])) {
                $errors['partKey'] = 'معرف الجزء مطلوب';
            } elseif (!preg_match('/^[a-z][a-z0-9_]*$/', $data['partKey'])) {
                $errors['partKey'] = 'معرف الجزء يجب أن يبدأ بحرف صغير ويحتوي فقط على أحرف صغيرة وأرقام وشرطات سفلية';
            }
            if (empty($data['labelAr'])) $errors['labelAr'] = 'الاسم بالعربية مطلوب';
            if (empty($data['labelEn'])) $errors['labelEn'] = 'الاسم بالإنجليزية مطلوب';
            if (empty($data['category'])) $errors['category'] = 'الفئة مطلوبة';
        }

        // Validate category if provided
        if (isset($data['category']) && !in_array($data['category'], self::VALID_CATEGORIES)) {
            $errors['category'] = 'الفئة غير صالحة. القيم المسموحة: ' . implode(', ', self::VALID_CATEGORIES);
        }

        // Validate sort order if provided
        if (isset($data['sortOrder']) && !is_numeric($data['sortOrder'])) {
            $errors['sortOrder'] = 'ترتيب العرض يجب أن يكون رقماً';
        }

        return $errors;
    }

    /**
     * Format part key for response
     */
    private function formatPartKey($partKey) {
        return [
            'id' => (int)$partKey['id'],
            'partKey' => $partKey['part_key'],
            'labelAr' => $partKey['label_ar'],
            'labelEn' => $partKey['label_en'],
            'category' => $partKey['category'],
            'sortOrder' => (int)$partKey['sort_order'],
            'isActive' => (bool)$partKey['is_active'],
            'createdAt' => $partKey['created_at']
        ];
    }

    /**
     * Get filters from query string
     */
    private function getFilters() {
        return [
            'active' => isset($_GET['active']) ? filter_var($_GET['active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null,
            'category' => $_GET['category'] ?? null,
            'grouped' => isset($_GET['grouped']) ? filter_var($_GET['grouped'], FILTER_VALIDATE_BOOLEAN) : false
        ];
    }

    /**
     * Get valid categories
     */
    public static function getValidCategories() {
        return self::VALID_CATEGORIES;
    }
}
