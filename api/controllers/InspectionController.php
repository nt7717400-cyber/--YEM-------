<?php
/**
 * Inspection Controller
 * CRUD operations for car inspection data (body parts and mechanical status)
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

class InspectionController {
    private $db;

    // Valid body types
    private const VALID_BODY_TYPES = [
        'sedan', 'hatchback', 'coupe', 'suv', 'crossover', 
        'pickup', 'van', 'minivan', 'truck'
    ];

    // Valid body part IDs
    private const VALID_PART_IDS = [
        'front_bumper', 'rear_bumper', 'hood', 'roof', 'trunk',
        'front_left_door', 'front_right_door', 'rear_left_door', 'rear_right_door',
        'front_left_fender', 'front_right_fender', 'rear_left_quarter', 'rear_right_quarter'
    ];

    // Valid part statuses
    private const VALID_PART_STATUSES = [
        'original', 'painted', 'bodywork', 'accident', 'replaced', 'needs_check'
    ];

    // Valid mechanical statuses
    private const VALID_ENGINE_STATUSES = ['original', 'replaced', 'refurbished'];
    private const VALID_TRANSMISSION_STATUSES = ['original', 'replaced'];
    private const VALID_CHASSIS_STATUSES = ['intact', 'accident_affected', 'modified'];

    public function __construct($db) {
        $this->db = $db;
    }


    /**
     * Get inspection data for a car
     * GET /api/cars/:id/inspection
     * Requirements: 6.2
     */
    public function getInspection($carId) {
        try {
            // Check if car exists
            $carStmt = $this->db->prepare("SELECT id, body_type FROM cars WHERE id = ?");
            $carStmt->execute([$carId]);
            $car = $carStmt->fetch();

            if (!$car) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            // Get inspection data including tires_status
            $inspectionStmt = $this->db->prepare("
                SELECT id, engine_status, transmission_status, chassis_status, tires_status, technical_notes, damage_details, created_at, updated_at
                FROM car_inspection 
                WHERE car_id = ?
            ");
            $inspectionStmt->execute([$carId]);
            $inspection = $inspectionStmt->fetch();

            // Get body parts data
            $partsStmt = $this->db->prepare("
                SELECT part_id, status 
                FROM car_body_parts 
                WHERE car_id = ?
            ");
            $partsStmt->execute([$carId]);
            $bodyParts = $partsStmt->fetchAll();

            // Parse damage details JSON and strip base64 photos
            $damageDetails = null;
            if ($inspection && !empty($inspection['damage_details'])) {
                $damageDetails = json_decode($inspection['damage_details'], true);
                // Strip base64 photos from response to reduce payload size
                $damageDetails = $this->stripBase64Photos($damageDetails);
            }

            // Parse tires status JSON
            $tiresStatus = null;
            if ($inspection && !empty($inspection['tires_status'])) {
                $tiresStatus = json_decode($inspection['tires_status'], true);
            }

            // Format response
            $response = [
                'carId' => (int)$carId,
                'bodyType' => $car['body_type'],
                'bodyParts' => $this->formatBodyParts($bodyParts),
                'mechanical' => $inspection ? [
                    'engine' => $inspection['engine_status'],
                    'transmission' => $inspection['transmission_status'],
                    'chassis' => $inspection['chassis_status'],
                    'tires' => $tiresStatus,
                    'technicalNotes' => $inspection['technical_notes'] ?? ''
                ] : null,
                'damageDetails' => $damageDetails,
                'createdAt' => $inspection['created_at'] ?? null,
                'updatedAt' => $inspection['updated_at'] ?? null
            ];

            Response::success($response);

        } catch (PDOException $e) {
            error_log("InspectionController::getInspection error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Strip base64 photos from damage details to reduce response size
     * Returns only URL-based photos (base64 photos should already be converted during save)
     */
    private function stripBase64Photos($damageDetails) {
        if (!is_array($damageDetails)) {
            return $damageDetails;
        }

        foreach ($damageDetails as $partKey => &$detail) {
            if (isset($detail['photos']) && is_array($detail['photos'])) {
                $cleanPhotos = [];
                foreach ($detail['photos'] as $photo) {
                    // Keep URL-based photos, skip any remaining base64 (shouldn't happen after save conversion)
                    if (is_string($photo) && !str_starts_with($photo, 'data:')) {
                        $cleanPhotos[] = $photo;
                    }
                }
                $detail['photos'] = $cleanPhotos;
            }
        }

        return $damageDetails;
    }

    /**
     * Convert base64 photos to files and return URLs
     * @param array $damageDetails Damage details with potential base64 photos
     * @param int $carId Car ID for organizing files
     * @return array Damage details with photos converted to URLs
     */
    private function convertBase64PhotosToFiles($damageDetails, $carId) {
        if (!is_array($damageDetails)) {
            return $damageDetails;
        }

        $uploadDir = __DIR__ . '/../uploads/damage';
        
        // Create damage uploads directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        foreach ($damageDetails as $partKey => &$detail) {
            if (isset($detail['photos']) && is_array($detail['photos'])) {
                $convertedPhotos = [];
                foreach ($detail['photos'] as $index => $photo) {
                    if (is_string($photo)) {
                        // Check if it's a base64 image
                        if (str_starts_with($photo, 'data:image')) {
                            // Extract the base64 data
                            $parts = explode(',', $photo, 2);
                            if (count($parts) === 2) {
                                $imageData = base64_decode($parts[1]);
                                if ($imageData !== false) {
                                    // Determine file extension from mime type
                                    $extension = 'jpg';
                                    if (strpos($parts[0], 'png') !== false) {
                                        $extension = 'png';
                                    } elseif (strpos($parts[0], 'gif') !== false) {
                                        $extension = 'gif';
                                    } elseif (strpos($parts[0], 'webp') !== false) {
                                        $extension = 'webp';
                                    }
                                    
                                    // Generate unique filename
                                    $filename = sprintf(
                                        'car_%d_%s_%d_%s.%s',
                                        $carId,
                                        preg_replace('/[^a-zA-Z0-9_]/', '_', $partKey),
                                        $index,
                                        uniqid(),
                                        $extension
                                    );
                                    
                                    $filePath = $uploadDir . '/' . $filename;
                                    
                                    // Save the file
                                    if (file_put_contents($filePath, $imageData)) {
                                        // Return the URL path
                                        $convertedPhotos[] = '/uploads/damage/' . $filename;
                                        error_log("InspectionController: Saved damage photo to $filePath");
                                    } else {
                                        error_log("InspectionController: Failed to save damage photo to $filePath");
                                    }
                                }
                            }
                        } else {
                            // Already a URL, keep it
                            $convertedPhotos[] = $photo;
                        }
                    }
                }
                $detail['photos'] = $convertedPhotos;
            }
        }

        return $damageDetails;
    }

    /**
     * Format body parts array to key-value object
     */
    private function formatBodyParts($bodyParts) {
        $formatted = [];
        foreach ($bodyParts as $part) {
            $formatted[$part['part_id']] = $part['status'];
        }
        return $formatted;
    }


    /**
     * Save or update inspection data for a car
     * POST/PUT /api/cars/:id/inspection
     * Requirements: 6.1, 6.3
     */
    public function saveInspection($carId) {
        $data = Response::getJsonInput();
        
        // Debug logging
        error_log("InspectionController::saveInspection - Received data: " . json_encode($data, JSON_UNESCAPED_UNICODE));
        error_log("InspectionController::saveInspection - damageDetails: " . json_encode($data['damageDetails'] ?? 'null', JSON_UNESCAPED_UNICODE));

        // Validate car exists
        $carStmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
        $carStmt->execute([$carId]);
        if (!$carStmt->fetch()) {
            Response::error('السيارة غير موجودة', 404, 'CAR_001');
        }

        // Validate inspection data
        $errors = $this->validateInspection($data);
        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            $this->db->beginTransaction();

            // Update body_type in cars table if provided
            if (isset($data['bodyType'])) {
                $updateCarStmt = $this->db->prepare("UPDATE cars SET body_type = ? WHERE id = ?");
                $updateCarStmt->execute([$data['bodyType'], $carId]);
            }

            // Prepare damage details JSON
            $damageDetailsJson = null;
            if (isset($data['damageDetails']) && !empty($data['damageDetails'])) {
                // Parse if it's a JSON string
                $damageData = $data['damageDetails'];
                if (is_string($damageData)) {
                    $damageData = json_decode($damageData, true);
                }
                
                // Convert base64 photos to files
                if (is_array($damageData)) {
                    $damageData = $this->convertBase64PhotosToFiles($damageData, $carId);
                }
                
                $damageDetailsJson = json_encode($damageData, JSON_UNESCAPED_UNICODE);
                error_log("InspectionController::saveInspection - damageDetailsJson to save: " . $damageDetailsJson);
            }

            // Prepare tires status JSON
            $tiresStatusJson = null;
            $mechanical = $data['mechanical'] ?? [];
            if (isset($mechanical['tires']) && !empty($mechanical['tires'])) {
                if (is_string($mechanical['tires'])) {
                    $tiresStatusJson = $mechanical['tires'];
                } else {
                    $tiresStatusJson = json_encode($mechanical['tires'], JSON_UNESCAPED_UNICODE);
                }
                error_log("InspectionController::saveInspection - tiresStatusJson to save: " . $tiresStatusJson);
            }

            // Upsert car_inspection record with tires_status
            $inspectionStmt = $this->db->prepare("
                INSERT INTO car_inspection (car_id, engine_status, transmission_status, chassis_status, tires_status, technical_notes, damage_details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    engine_status = VALUES(engine_status),
                    transmission_status = VALUES(transmission_status),
                    chassis_status = VALUES(chassis_status),
                    tires_status = VALUES(tires_status),
                    technical_notes = VALUES(technical_notes),
                    damage_details = VALUES(damage_details),
                    updated_at = CURRENT_TIMESTAMP
            ");

            $inspectionStmt->execute([
                $carId,
                $mechanical['engine'] ?? 'original',
                $mechanical['transmission'] ?? 'original',
                $mechanical['chassis'] ?? 'intact',
                $tiresStatusJson,
                $mechanical['technicalNotes'] ?? null,
                $damageDetailsJson
            ]);

            // Handle body parts - delete existing and insert new
            if (isset($data['bodyParts']) && is_array($data['bodyParts'])) {
                // Delete existing body parts for this car
                $deletePartsStmt = $this->db->prepare("DELETE FROM car_body_parts WHERE car_id = ?");
                $deletePartsStmt->execute([$carId]);

                // Insert new body parts
                $insertPartStmt = $this->db->prepare("
                    INSERT INTO car_body_parts (car_id, part_id, status)
                    VALUES (?, ?, ?)
                ");

                foreach ($data['bodyParts'] as $partId => $status) {
                    if (in_array($partId, self::VALID_PART_IDS) && in_array($status, self::VALID_PART_STATUSES)) {
                        $insertPartStmt->execute([$carId, $partId, $status]);
                    }
                }
            }

            $this->db->commit();

            // Return updated inspection data
            $this->getInspection($carId);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("InspectionController::saveInspection error: " . $e->getMessage());
            Response::error('حدث خطأ في حفظ بيانات الفحص', 500, 'SRV_001');
        }
    }


    /**
     * Validate inspection data
     * Requirements: 6.4
     * 
     * @param array $data Inspection data to validate
     * @return array Array of validation errors (empty if valid)
     */
    public function validateInspection($data) {
        $errors = [];

        // Validate body type if provided
        if (isset($data['bodyType'])) {
            if (!in_array($data['bodyType'], self::VALID_BODY_TYPES)) {
                $errors['bodyType'] = 'نوع الهيكل غير صالح. القيم المسموحة: ' . implode(', ', self::VALID_BODY_TYPES);
            }
        }

        // Validate body parts if provided
        if (isset($data['bodyParts'])) {
            if (!is_array($data['bodyParts'])) {
                $errors['bodyParts'] = 'بيانات أجزاء الهيكل يجب أن تكون مصفوفة';
            } else {
                foreach ($data['bodyParts'] as $partId => $status) {
                    if (!in_array($partId, self::VALID_PART_IDS)) {
                        $errors["bodyParts.$partId"] = "معرف الجزء غير صالح: $partId";
                    }
                    if (!in_array($status, self::VALID_PART_STATUSES)) {
                        $errors["bodyParts.$partId.status"] = "حالة الجزء غير صالحة: $status. القيم المسموحة: " . implode(', ', self::VALID_PART_STATUSES);
                    }
                }
            }
        }

        // Validate mechanical status if provided
        if (isset($data['mechanical'])) {
            if (!is_array($data['mechanical'])) {
                $errors['mechanical'] = 'بيانات الحالة الميكانيكية يجب أن تكون مصفوفة';
            } else {
                $mechanical = $data['mechanical'];

                // Validate engine status
                if (isset($mechanical['engine']) && !in_array($mechanical['engine'], self::VALID_ENGINE_STATUSES)) {
                    $errors['mechanical.engine'] = 'حالة المكينة غير صالحة. القيم المسموحة: ' . implode(', ', self::VALID_ENGINE_STATUSES);
                }

                // Validate transmission status
                if (isset($mechanical['transmission']) && !in_array($mechanical['transmission'], self::VALID_TRANSMISSION_STATUSES)) {
                    $errors['mechanical.transmission'] = 'حالة القير غير صالحة. القيم المسموحة: ' . implode(', ', self::VALID_TRANSMISSION_STATUSES);
                }

                // Validate chassis status
                if (isset($mechanical['chassis']) && !in_array($mechanical['chassis'], self::VALID_CHASSIS_STATUSES)) {
                    $errors['mechanical.chassis'] = 'حالة الشاصي غير صالحة. القيم المسموحة: ' . implode(', ', self::VALID_CHASSIS_STATUSES);
                }

                // Technical notes - just ensure it's a string if provided
                if (isset($mechanical['technicalNotes']) && !is_string($mechanical['technicalNotes'])) {
                    $errors['mechanical.technicalNotes'] = 'الملاحظات الفنية يجب أن تكون نصاً';
                }
            }
        }

        return $errors;
    }

    /**
     * Delete inspection data for a car
     * DELETE /api/cars/:id/inspection
     * Requirements: 6.5
     */
    public function deleteInspection($carId) {
        try {
            // Check if car exists
            $carStmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $carStmt->execute([$carId]);
            if (!$carStmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $this->db->beginTransaction();

            // Delete body parts (will cascade, but explicit for clarity)
            $deletePartsStmt = $this->db->prepare("DELETE FROM car_body_parts WHERE car_id = ?");
            $deletePartsStmt->execute([$carId]);

            // Delete inspection record
            $deleteInspectionStmt = $this->db->prepare("DELETE FROM car_inspection WHERE car_id = ?");
            $deleteInspectionStmt->execute([$carId]);

            // Clear body_type from cars table
            $updateCarStmt = $this->db->prepare("UPDATE cars SET body_type = NULL WHERE id = ?");
            $updateCarStmt->execute([$carId]);

            $this->db->commit();

            Response::success(['message' => 'تم حذف بيانات الفحص بنجاح']);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("InspectionController::deleteInspection error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف بيانات الفحص', 500, 'SRV_001');
        }
    }

    /**
     * Get valid constants for external use (e.g., testing)
     */
    public static function getValidBodyTypes() {
        return self::VALID_BODY_TYPES;
    }

    public static function getValidPartIds() {
        return self::VALID_PART_IDS;
    }

    public static function getValidPartStatuses() {
        return self::VALID_PART_STATUSES;
    }

    public static function getValidEngineStatuses() {
        return self::VALID_ENGINE_STATUSES;
    }

    public static function getValidTransmissionStatuses() {
        return self::VALID_TRANSMISSION_STATUSES;
    }

    public static function getValidChassisStatuses() {
        return self::VALID_CHASSIS_STATUSES;
    }
}
