<?php
/**
 * Settings Controller
 * Showroom settings management
 * Requirements: 12.1-12.8
 */

class SettingsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get showroom settings
     * Requirements: 12.1
     * GET /api/settings
     */
    public function get() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM settings WHERE id = 'main'");
            $stmt->execute();
            $settings = $stmt->fetch();

            if (!$settings) {
                // Create default settings if not exists
                $this->createDefaultSettings();
                $stmt->execute();
                $settings = $stmt->fetch();
            }

            Response::success($this->formatSettings($settings));

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب الإعدادات', 500, 'SRV_001');
        }
    }

    /**
     * Update showroom settings
     * Requirements: 12.2-12.8
     * PUT /api/settings
     */
    public function update() {
        $data = Response::getJsonInput();

        if (empty($data)) {
            Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
        }

        try {
            $updates = [];
            $params = [];

            // Allowed fields mapping
            // Requirements: 12.2 - name
            // Requirements: 12.3 - phone
            // Requirements: 12.4 - whatsapp
            // Requirements: 12.5 - description
            // Requirements: 12.6 - address
            // Requirements: 12.7 - map location
            // Requirements: 12.8 - working hours
            $allowedFields = [
                'name' => 'name',
                'description' => 'description',
                'address' => 'address',
                'phone' => 'phone',
                'whatsapp' => 'whatsapp',
                'workingHours' => 'working_hours',
                'mapLatitude' => 'map_latitude',
                'mapLongitude' => 'map_longitude'
            ];

            foreach ($allowedFields as $inputField => $dbField) {
                if (isset($data[$inputField])) {
                    $updates[] = "$dbField = ?";
                    $params[] = $data[$inputField];
                }
            }

            if (empty($updates)) {
                Response::error('لا توجد بيانات صالحة للتحديث', 400, 'VAL_001');
            }

            // Ensure settings row exists
            $checkStmt = $this->db->prepare("SELECT id FROM settings WHERE id = 'main'");
            $checkStmt->execute();
            if (!$checkStmt->fetch()) {
                $this->createDefaultSettings();
            }

            $query = "UPDATE settings SET " . implode(', ', $updates) . " WHERE id = 'main'";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            // Return updated settings
            $this->get();

        } catch (PDOException $e) {
            Response::error('حدث خطأ في تحديث الإعدادات', 500, 'SRV_001');
        }
    }

    /**
     * Create default settings
     */
    private function createDefaultSettings() {
        $stmt = $this->db->prepare("
            INSERT INTO settings (id, name, description, address, phone, whatsapp, working_hours)
            VALUES ('main', 'معرض وحدة اليمن للسيارات', '', '', '', '', '')
            ON DUPLICATE KEY UPDATE id = id
        ");
        $stmt->execute();
    }

    /**
     * Format settings for response
     */
    private function formatSettings($settings) {
        return [
            'id' => $settings['id'],
            'name' => $settings['name'],
            'description' => $settings['description'],
            'address' => $settings['address'],
            'phone' => $settings['phone'],
            'whatsapp' => $settings['whatsapp'],
            'workingHours' => $settings['working_hours'],
            'mapLatitude' => $settings['map_latitude'] ? (float)$settings['map_latitude'] : null,
            'mapLongitude' => $settings['map_longitude'] ? (float)$settings['map_longitude'] : null,
            'updatedAt' => $settings['updated_at']
        ];
    }
}
