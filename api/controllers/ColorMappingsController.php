<?php
/**
 * Color Mappings Controller
 * CRUD operations for part condition color mappings (VDS)
 * Requirements: 4.1, 13.4
 */

class ColorMappingsController {
    private $db;

    // Valid condition keys
    private const VALID_CONDITIONS = ['good', 'scratch', 'bodywork', 'broken', 'painted', 'replaced', 'not_inspected'];

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get all color mappings
     * GET /api/color-mappings
     * Requirements: 4.1, 4.2
     */
    public function getAll() {
        try {
            $stmt = $this->db->query("SELECT * FROM color_mappings ORDER BY sort_order");
            $colorMappings = $stmt->fetchAll();

            // Format color mappings
            $colorMappings = array_map([$this, 'formatColorMapping'], $colorMappings);

            Response::success($colorMappings);

        } catch (PDOException $e) {
            error_log("ColorMappingsController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب خريطة الألوان', 500, 'SRV_001');
        }
    }

    /**
     * Get color mapping by condition key
     * GET /api/color-mappings/:condition
     * Requirements: 4.1
     */
    public function getByCondition($condition) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM color_mappings WHERE condition_key = ?");
            $stmt->execute([$condition]);
            $colorMapping = $stmt->fetch();

            if (!$colorMapping) {
                Response::error('الحالة غير موجودة', 404, 'CM_001');
            }

            Response::success($this->formatColorMapping($colorMapping));

        } catch (PDOException $e) {
            error_log("ColorMappingsController::getByCondition error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات اللون', 500, 'SRV_001');
        }
    }

    /**
     * Update color mappings (bulk update)
     * PUT /api/color-mappings
     * Requirements: 13.4
     */
    public function update() {
        $data = Response::getJsonInput();
        
        // Validate input is array
        if (!is_array($data) || empty($data)) {
            Response::error('يرجى إرسال مصفوفة من الألوان للتحديث', 400, 'VAL_001');
        }

        $errors = $this->validateColorMappingsData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                UPDATE color_mappings 
                SET color_hex = ?, label_ar = ?, label_en = ?, sort_order = ?
                WHERE condition_key = ?
            ");

            foreach ($data as $mapping) {
                $stmt->execute([
                    $mapping['colorHex'],
                    $mapping['labelAr'],
                    $mapping['labelEn'],
                    $mapping['sortOrder'] ?? 0,
                    $mapping['conditionKey']
                ]);
            }

            $this->db->commit();
            $this->getAll();

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("ColorMappingsController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث خريطة الألوان', 500, 'SRV_001');
        }
    }

    /**
     * Update single color mapping
     * PUT /api/color-mappings/:condition
     * Requirements: 13.4
     */
    public function updateSingle($condition) {
        // Check if condition exists
        $stmt = $this->db->prepare("SELECT condition_key FROM color_mappings WHERE condition_key = ?");
        $stmt->execute([$condition]);
        if (!$stmt->fetch()) {
            Response::error('الحالة غير موجودة', 404, 'CM_001');
        }

        $data = Response::getJsonInput();
        $errors = $this->validateSingleColorMappingData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $updates = [];
            $params = [];

            $fieldMap = [
                'colorHex' => 'color_hex',
                'labelAr' => 'label_ar',
                'labelEn' => 'label_en',
                'sortOrder' => 'sort_order'
            ];

            foreach ($fieldMap as $camelCase => $snakeCase) {
                if (isset($data[$camelCase])) {
                    $updates[] = "$snakeCase = ?";
                    $params[] = $data[$camelCase];
                }
            }

            if (empty($updates)) {
                Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
            }

            $params[] = $condition;
            $query = "UPDATE color_mappings SET " . implode(', ', $updates) . " WHERE condition_key = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            $this->getByCondition($condition);

        } catch (PDOException $e) {
            error_log("ColorMappingsController::updateSingle error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث اللون', 500, 'SRV_001');
        }
    }

    /**
     * Reset color mappings to defaults
     * POST /api/color-mappings/reset
     * Requirements: 13.4
     */
    public function reset() {
        try {
            $this->db->beginTransaction();

            // Default color mappings
            $defaults = [
                ['good', '#22c55e', 'سليم', 'Good', 1],
                ['scratch', '#eab308', 'خدش', 'Scratch', 2],
                ['bodywork', '#f97316', 'سمكرة', 'Bodywork', 3],
                ['broken', '#ef4444', 'كسر', 'Broken', 4],
                ['painted', '#3b82f6', 'رش', 'Painted', 5],
                ['replaced', '#8b5cf6', 'تغيير', 'Replaced', 6],
                ['not_inspected', '#9ca3af', 'غير محدد', 'Not Inspected', 7]
            ];

            $stmt = $this->db->prepare("
                UPDATE color_mappings 
                SET color_hex = ?, label_ar = ?, label_en = ?, sort_order = ?
                WHERE condition_key = ?
            ");

            foreach ($defaults as $default) {
                $stmt->execute([
                    $default[1], // color_hex
                    $default[2], // label_ar
                    $default[3], // label_en
                    $default[4], // sort_order
                    $default[0]  // condition_key
                ]);
            }

            $this->db->commit();
            $this->getAll();

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("ColorMappingsController::reset error: " . $e->getMessage());
            Response::error('حدث خطأ في إعادة تعيين الألوان', 500, 'SRV_001');
        }
    }

    /**
     * Validate color mappings data (bulk)
     */
    private function validateColorMappingsData($data) {
        $errors = [];

        foreach ($data as $index => $mapping) {
            // Validate condition key
            if (empty($mapping['conditionKey'])) {
                $errors["$index.conditionKey"] = 'معرف الحالة مطلوب';
            } elseif (!in_array($mapping['conditionKey'], self::VALID_CONDITIONS)) {
                $errors["$index.conditionKey"] = 'معرف الحالة غير صالح';
            }

            // Validate color hex
            if (empty($mapping['colorHex'])) {
                $errors["$index.colorHex"] = 'كود اللون مطلوب';
            } elseif (!preg_match('/^#[0-9A-Fa-f]{6}$/', $mapping['colorHex'])) {
                $errors["$index.colorHex"] = 'كود اللون غير صالح (يجب أن يكون بصيغة #RRGGBB)';
            }

            // Validate labels
            if (empty($mapping['labelAr'])) {
                $errors["$index.labelAr"] = 'الاسم بالعربية مطلوب';
            }
            if (empty($mapping['labelEn'])) {
                $errors["$index.labelEn"] = 'الاسم بالإنجليزية مطلوب';
            }
        }

        return $errors;
    }

    /**
     * Validate single color mapping data
     */
    private function validateSingleColorMappingData($data) {
        $errors = [];

        // Validate color hex if provided
        if (isset($data['colorHex']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data['colorHex'])) {
            $errors['colorHex'] = 'كود اللون غير صالح (يجب أن يكون بصيغة #RRGGBB)';
        }

        // Validate sort order if provided
        if (isset($data['sortOrder']) && !is_numeric($data['sortOrder'])) {
            $errors['sortOrder'] = 'ترتيب العرض يجب أن يكون رقماً';
        }

        return $errors;
    }

    /**
     * Format color mapping for response
     */
    private function formatColorMapping($colorMapping) {
        return [
            'id' => (int)$colorMapping['id'],
            'conditionKey' => $colorMapping['condition_key'],
            'colorHex' => $colorMapping['color_hex'],
            'labelAr' => $colorMapping['label_ar'],
            'labelEn' => $colorMapping['label_en'],
            'sortOrder' => (int)$colorMapping['sort_order'],
            'updatedAt' => $colorMapping['updated_at']
        ];
    }

    /**
     * Get valid conditions
     */
    public static function getValidConditions() {
        return self::VALID_CONDITIONS;
    }
}
