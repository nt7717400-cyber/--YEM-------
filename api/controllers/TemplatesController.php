<?php
/**
 * Templates Controller
 * CRUD operations for car inspection templates (VDS)
 * Requirements: 6.1, 14.1, 14.2
 */

class TemplatesController {
    private $db;

    // Valid template types
    private const VALID_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van'];

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get all templates
     * GET /api/templates
     * Requirements: 6.1
     */
    public function getAll() {
        try {
            $filters = $this->getFilters();
            
            $query = "SELECT id, name_ar, name_en, type, is_active, is_default, 
                      created_at, updated_at FROM car_templates WHERE 1=1";
            $params = [];

            // Filter by active status
            if (isset($filters['active'])) {
                $query .= " AND is_active = ?";
                $params[] = $filters['active'] ? 1 : 0;
            }

            // Filter by type
            if (!empty($filters['type'])) {
                $query .= " AND type = ?";
                $params[] = $filters['type'];
            }

            $query .= " ORDER BY is_default DESC, name_en ASC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $templates = $stmt->fetchAll();

            // Format templates
            $templates = array_map([$this, 'formatTemplate'], $templates);

            Response::success($templates);

        } catch (PDOException $e) {
            error_log("TemplatesController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب القوالب', 500, 'SRV_001');
        }
    }

    /**
     * Get template by ID
     * GET /api/templates/:id
     * Requirements: 6.2
     */
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM car_templates WHERE id = ?");
            $stmt->execute([$id]);
            $template = $stmt->fetch();

            if (!$template) {
                Response::error('القالب غير موجود', 404, 'TPL_001');
            }

            // Get part mappings for this template
            $mappingsStmt = $this->db->prepare("
                SELECT tpm.*, pk.label_ar, pk.label_en, pk.category
                FROM template_part_mappings tpm
                LEFT JOIN part_keys pk ON tpm.part_key = pk.part_key
                WHERE tpm.template_id = ?
                ORDER BY pk.category, pk.sort_order
            ");
            $mappingsStmt->execute([$id]);
            $mappings = $mappingsStmt->fetchAll();

            $template['partMappings'] = array_map(function($m) {
                return [
                    'partKey' => $m['part_key'],
                    'svgElementId' => $m['svg_element_id'],
                    'viewAngles' => json_decode($m['view_angles'], true),
                    'isVisible' => (bool)$m['is_visible'],
                    'labelAr' => $m['label_ar'],
                    'labelEn' => $m['label_en'],
                    'category' => $m['category']
                ];
            }, $mappings);

            Response::success($this->formatTemplateWithSvg($template));

        } catch (PDOException $e) {
            error_log("TemplatesController::getById error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات القالب', 500, 'SRV_001');
        }
    }

    /**
     * Create new template
     * POST /api/templates
     * Requirements: 14.1, 14.2
     */
    public function create() {
        $data = Response::getJsonInput();
        $errors = $this->validateTemplateData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            // If this is set as default, unset other defaults
            if (!empty($data['isDefault'])) {
                $this->db->exec("UPDATE car_templates SET is_default = 0");
            }

            $stmt = $this->db->prepare("
                INSERT INTO car_templates (name_ar, name_en, type, is_active, is_default, 
                    svg_front, svg_rear, svg_left_side, svg_right_side, svg_top)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data['nameAr'],
                $data['nameEn'],
                $data['type'],
                isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1,
                isset($data['isDefault']) ? ($data['isDefault'] ? 1 : 0) : 0,
                $data['svgFront'],
                $data['svgRear'],
                $data['svgLeftSide'],
                $data['svgRightSide'],
                $data['svgTop'] ?? null
            ]);

            $templateId = $this->db->lastInsertId();

            // Insert part mappings if provided
            if (!empty($data['partMappings'])) {
                $this->savePartMappings($templateId, $data['partMappings']);
            }

            $this->db->commit();
            $this->getById($templateId);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("TemplatesController::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إنشاء القالب', 500, 'SRV_001');
        }
    }

    /**
     * Update template
     * PUT /api/templates/:id
     * Requirements: 14.2, 14.3
     */
    public function update($id) {
        // Check if template exists
        $stmt = $this->db->prepare("SELECT id FROM car_templates WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error('القالب غير موجود', 404, 'TPL_001');
        }

        $data = Response::getJsonInput();
        $errors = $this->validateTemplateData($data, true);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            // If this is set as default, unset other defaults
            if (!empty($data['isDefault'])) {
                $this->db->exec("UPDATE car_templates SET is_default = 0");
            }

            $updates = [];
            $params = [];

            $fieldMap = [
                'nameAr' => 'name_ar',
                'nameEn' => 'name_en',
                'type' => 'type',
                'isActive' => 'is_active',
                'isDefault' => 'is_default',
                'svgFront' => 'svg_front',
                'svgRear' => 'svg_rear',
                'svgLeftSide' => 'svg_left_side',
                'svgRightSide' => 'svg_right_side',
                'svgTop' => 'svg_top'
            ];

            foreach ($fieldMap as $camelCase => $snakeCase) {
                if (isset($data[$camelCase])) {
                    $value = $data[$camelCase];
                    if (in_array($camelCase, ['isActive', 'isDefault'])) {
                        $value = $value ? 1 : 0;
                    }
                    $updates[] = "$snakeCase = ?";
                    $params[] = $value;
                }
            }

            if (!empty($updates)) {
                $params[] = $id;
                $query = "UPDATE car_templates SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute($params);
            }

            // Update part mappings if provided
            if (isset($data['partMappings'])) {
                // Delete existing mappings
                $deleteStmt = $this->db->prepare("DELETE FROM template_part_mappings WHERE template_id = ?");
                $deleteStmt->execute([$id]);
                
                // Insert new mappings
                if (!empty($data['partMappings'])) {
                    $this->savePartMappings($id, $data['partMappings']);
                }
            }

            $this->db->commit();
            $this->getById($id);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("TemplatesController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث القالب', 500, 'SRV_001');
        }
    }

    /**
     * Delete template
     * DELETE /api/templates/:id
     * Requirements: 14.4
     */
    public function delete($id) {
        try {
            // Check if template exists
            $stmt = $this->db->prepare("SELECT id, is_default FROM car_templates WHERE id = ?");
            $stmt->execute([$id]);
            $template = $stmt->fetch();

            if (!$template) {
                Response::error('القالب غير موجود', 404, 'TPL_001');
            }

            // Check if template is used in any inspections
            $usageStmt = $this->db->prepare("SELECT COUNT(*) as count FROM inspections WHERE template_id = ?");
            $usageStmt->execute([$id]);
            $usage = $usageStmt->fetch();

            if ($usage['count'] > 0) {
                Response::error('لا يمكن حذف القالب لأنه مستخدم في ' . $usage['count'] . ' فحص', 400, 'TPL_002');
            }

            // Prevent deleting default template
            if ($template['is_default']) {
                Response::error('لا يمكن حذف القالب الافتراضي', 400, 'TPL_003');
            }

            $stmt = $this->db->prepare("DELETE FROM car_templates WHERE id = ?");
            $stmt->execute([$id]);

            Response::success(['message' => 'تم حذف القالب بنجاح']);

        } catch (PDOException $e) {
            error_log("TemplatesController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف القالب', 500, 'SRV_001');
        }
    }

    /**
     * Save part mappings for a template
     */
    private function savePartMappings($templateId, $mappings) {
        $stmt = $this->db->prepare("
            INSERT INTO template_part_mappings (template_id, part_key, svg_element_id, view_angles, is_visible)
            VALUES (?, ?, ?, ?, ?)
        ");

        foreach ($mappings as $mapping) {
            $stmt->execute([
                $templateId,
                $mapping['partKey'],
                $mapping['svgElementId'],
                json_encode($mapping['viewAngles'] ?? []),
                isset($mapping['isVisible']) ? ($mapping['isVisible'] ? 1 : 0) : 1
            ]);
        }
    }

    /**
     * Validate template data
     * Requirements: 14.1, 14.2
     */
    private function validateTemplateData($data, $isUpdate = false) {
        $errors = [];

        if (!$isUpdate) {
            // Required fields for creation
            if (empty($data['nameAr'])) $errors['nameAr'] = 'الاسم بالعربية مطلوب';
            if (empty($data['nameEn'])) $errors['nameEn'] = 'الاسم بالإنجليزية مطلوب';
            if (empty($data['type'])) $errors['type'] = 'نوع القالب مطلوب';
            if (empty($data['svgFront'])) $errors['svgFront'] = 'SVG الواجهة الأمامية مطلوب';
            if (empty($data['svgRear'])) $errors['svgRear'] = 'SVG الواجهة الخلفية مطلوب';
            if (empty($data['svgLeftSide'])) $errors['svgLeftSide'] = 'SVG الجانب الأيسر مطلوب';
            if (empty($data['svgRightSide'])) $errors['svgRightSide'] = 'SVG الجانب الأيمن مطلوب';
        }

        // Validate type if provided
        if (isset($data['type']) && !in_array($data['type'], self::VALID_TYPES)) {
            $errors['type'] = 'نوع القالب غير صالح. القيم المسموحة: ' . implode(', ', self::VALID_TYPES);
        }

        // Validate SVG content (basic check)
        $svgFields = ['svgFront', 'svgRear', 'svgLeftSide', 'svgRightSide', 'svgTop'];
        foreach ($svgFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                if (strpos($data[$field], '<svg') === false) {
                    $errors[$field] = 'محتوى SVG غير صالح';
                }
            }
        }

        // Validate part mappings if provided
        if (isset($data['partMappings']) && is_array($data['partMappings'])) {
            foreach ($data['partMappings'] as $index => $mapping) {
                if (empty($mapping['partKey'])) {
                    $errors["partMappings.$index.partKey"] = 'معرف الجزء مطلوب';
                }
                if (empty($mapping['svgElementId'])) {
                    $errors["partMappings.$index.svgElementId"] = 'معرف عنصر SVG مطلوب';
                }
            }
        }

        return $errors;
    }

    /**
     * Format template for response (without SVG content)
     */
    private function formatTemplate($template) {
        return [
            'id' => (int)$template['id'],
            'nameAr' => $template['name_ar'],
            'nameEn' => $template['name_en'],
            'type' => $template['type'],
            'isActive' => (bool)$template['is_active'],
            'isDefault' => (bool)$template['is_default'],
            'createdAt' => $template['created_at'],
            'updatedAt' => $template['updated_at']
        ];
    }

    /**
     * Format template with SVG content for detailed response
     */
    private function formatTemplateWithSvg($template) {
        $formatted = $this->formatTemplate($template);
        $formatted['svgFront'] = $template['svg_front'];
        $formatted['svgRear'] = $template['svg_rear'];
        $formatted['svgLeftSide'] = $template['svg_left_side'];
        $formatted['svgRightSide'] = $template['svg_right_side'];
        $formatted['svgTop'] = $template['svg_top'];
        $formatted['partMappings'] = $template['partMappings'] ?? [];
        return $formatted;
    }

    /**
     * Get filters from query string
     */
    private function getFilters() {
        return [
            'active' => isset($_GET['active']) ? filter_var($_GET['active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null,
            'type' => $_GET['type'] ?? null
        ];
    }

    /**
     * Get valid template types
     */
    public static function getValidTypes() {
        return self::VALID_TYPES;
    }
}
