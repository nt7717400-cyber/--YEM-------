<?php
/**
 * Car Service
 * Business logic for car operations
 * Separates business logic from HTTP handling
 */

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../utils/AuditLogger.php';

class CarService extends BaseService {
    
    // Valid price types
    private const VALID_PRICE_TYPES = ['FIXED', 'AUCTION'];
    
    // Valid body types for used cars
    private const VALID_BODY_TYPES = [
        'sedan', 'hatchback', 'coupe', 'suv', 'crossover', 
        'pickup', 'van', 'minivan', 'truck'
    ];

    /**
     * Get all cars with filtering and pagination
     */
    public function getAllCars(array $filters): array {
        $whereClause = $this->buildWhereClause($filters);
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM cars c" . $whereClause['where'];
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute($whereClause['params']);
        $total = (int)$countStmt->fetch()['total'];

        // Build main query with thumbnail
        $query = "SELECT c.*, thumb.url as thumbnail
                  FROM cars c
                  LEFT JOIN (
                      SELECT car_id, url, 
                             ROW_NUMBER() OVER (PARTITION BY car_id ORDER BY image_order) as rn
                      FROM car_images
                  ) thumb ON thumb.car_id = c.id AND thumb.rn = 1"
                  . $whereClause['where'];
        
        $params = $whereClause['params'];

        // Sorting
        $query .= $this->buildOrderClause($filters['sortBy'] ?? 'newest');

        // Pagination
        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(50, max(1, (int)($filters['perPage'] ?? 12)));
        $offset = ($page - 1) * $perPage;

        $query .= " LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $cars = $stmt->fetchAll();

        return [
            'cars' => array_map([$this, 'formatCar'], $cars),
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage
        ];
    }

    /**
     * Get car by ID with all related data
     */
    public function getCarById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        $car = $stmt->fetch();

        if (!$car) {
            return null;
        }

        // Get images
        $imgStmt = $this->db->prepare("SELECT * FROM car_images WHERE car_id = ? ORDER BY image_order");
        $imgStmt->execute([$id]);
        $car['images'] = $imgStmt->fetchAll();

        // Get video
        $vidStmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ?");
        $vidStmt->execute([$id]);
        $car['video'] = $vidStmt->fetch() ?: null;

        // Get inspection for used cars
        if ($car['car_condition'] === 'USED') {
            $car['inspection'] = $this->getInspectionData($id);
        }

        return $this->formatCar($car);
    }


    /**
     * Create a new car
     */
    public function createCar(array $data): array {
        $errors = $this->validateCarData($data);
        if (!empty($errors)) {
            throw new ValidationException('يرجى التحقق من البيانات المدخلة', $errors);
        }

        $priceType = isset($data['priceType']) ? strtoupper($data['priceType']) : 'FIXED';
        
        if ($priceType === 'AUCTION') {
            $auctionErrors = $this->validateAuctionData($data);
            if (!empty($auctionErrors)) {
                throw new ValidationException('يرجى التحقق من بيانات المزاد', $auctionErrors);
            }
        }

        $this->beginTransaction();
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO cars (name, brand, model, year, price, price_type, car_condition, body_type, origin, kilometers, description, specifications, status, is_featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $price = $priceType === 'AUCTION' ? (float)$data['startingPrice'] : (float)$data['price'];

            $stmt->execute([
                $data['name'],
                $data['brand'],
                $data['model'],
                (int)$data['year'],
                $price,
                $priceType,
                strtoupper($data['condition']),
                $data['bodyType'] ?? null,
                $data['origin'] ?? null,
                isset($data['kilometers']) ? (int)$data['kilometers'] : null,
                $data['description'] ?? '',
                $data['specifications'] ?? '',
                'AVAILABLE',
                isset($data['isFeatured']) && $data['isFeatured'] ? 1 : 0
            ]);

            $carId = (int)$this->db->lastInsertId();

            if ($priceType === 'AUCTION') {
                $this->createAuctionForCar($carId, $data);
            }

            $this->commit();
            
            AuditLogger::logCar('CAR_CREATED', $carId, ['name' => $data['name']]);
            
            return $this->getCarById($carId);

        } catch (\Exception $e) {
            $this->rollback();
            throw $e;
        }
    }

    /**
     * Update an existing car
     */
    public function updateCar(int $id, array $data): array {
        $stmt = $this->db->prepare("SELECT id, price_type FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        $existingCar = $stmt->fetch();
        
        if (!$existingCar) {
            throw new NotFoundException('السيارة غير موجودة');
        }

        $errors = $this->validateCarData($data, true);
        if (!empty($errors)) {
            throw new ValidationException('يرجى التحقق من البيانات المدخلة', $errors);
        }

        $newPriceType = isset($data['priceType']) ? strtoupper($data['priceType']) : $existingCar['price_type'];
        $oldPriceType = $existingCar['price_type'];

        $this->beginTransaction();
        
        try {
            $updates = [];
            $params = [];

            $allowedFields = ['name', 'brand', 'model', 'year', 'price', 'priceType', 'condition',
                'bodyType', 'origin', 'kilometers', 'description', 'specifications', 'status', 'isFeatured'];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $dbField = $this->camelToSnake($field);
                    $value = $data[$field];
                    
                    if ($field === 'condition') {
                        $dbField = 'car_condition';
                        $value = strtoupper($value);
                    }
                    if ($field === 'bodyType') $dbField = 'body_type';
                    if ($field === 'priceType') {
                        $dbField = 'price_type';
                        $value = strtoupper($value);
                    }
                    if ($field === 'status') $value = strtoupper($value);
                    if ($field === 'isFeatured') {
                        $dbField = 'is_featured';
                        $value = $value ? 1 : 0;
                    }
                    
                    $updates[] = "$dbField = ?";
                    $params[] = $value;
                }
            }

            if (!empty($updates)) {
                $params[] = $id;
                $query = "UPDATE cars SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute($params);
            }

            // Handle auction changes
            if ($newPriceType === 'AUCTION' && $oldPriceType !== 'AUCTION') {
                $this->createAuctionForCar($id, $data);
            } elseif ($newPriceType !== 'AUCTION' && $oldPriceType === 'AUCTION') {
                $this->cancelAuctionForCar($id);
            } elseif ($newPriceType === 'AUCTION') {
                $this->updateAuctionForCar($id, $data);
            }

            $this->commit();
            
            AuditLogger::logCar('CAR_UPDATED', $id);
            
            return $this->getCarById($id);

        } catch (\Exception $e) {
            $this->rollback();
            throw $e;
        }
    }

    /**
     * Delete a car
     */
    public function deleteCar(int $id): bool {
        $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            throw new NotFoundException('السيارة غير موجودة');
        }

        $stmt = $this->db->prepare("DELETE FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        
        AuditLogger::logCar('CAR_DELETED', $id);
        
        return true;
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(int $id): array {
        $stmt = $this->db->prepare("SELECT id, is_featured FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        $car = $stmt->fetch();

        if (!$car) {
            throw new NotFoundException('السيارة غير موجودة');
        }

        $newStatus = $car['is_featured'] ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE cars SET is_featured = ? WHERE id = ?");
        $stmt->execute([$newStatus, $id]);

        return $this->getCarById($id);
    }

    /**
     * Update car status
     */
    public function updateStatus(int $id, string $status): array {
        $validStatuses = ['AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED'];
        $status = strtoupper($status);
        
        if (!in_array($status, $validStatuses)) {
            throw new ValidationException('حالة غير صالحة');
        }

        $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            throw new NotFoundException('السيارة غير موجودة');
        }

        $stmt = $this->db->prepare("UPDATE cars SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        return $this->getCarById($id);
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(int $id): bool {
        $stmt = $this->db->prepare("UPDATE cars SET view_count = view_count + 1 WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Get all brands
     */
    public function getBrands(): array {
        $stmt = $this->db->query("SELECT DISTINCT brand FROM cars WHERE status = 'AVAILABLE' ORDER BY brand");
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }


    // ==================== Private Helper Methods ====================

    /**
     * Build WHERE clause from filters
     */
    private function buildWhereClause(array $filters): array {
        $where = " WHERE 1=1";
        $params = [];

        if (isset($filters['status'])) {
            $where .= " AND c.status = ?";
            $params[] = strtoupper($filters['status']);
        } else {
            $where .= " AND c.status = 'AVAILABLE'";
        }

        if (isset($filters['featured'])) {
            $where .= " AND c.is_featured = ?";
            $params[] = $filters['featured'] ? 1 : 0;
        }

        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $where .= " AND (c.name LIKE ? OR c.brand LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['brand'])) {
            $where .= " AND c.brand = ?";
            $params[] = $filters['brand'];
        }

        if (!empty($filters['condition'])) {
            $where .= " AND c.car_condition = ?";
            $params[] = strtoupper($filters['condition']);
        }

        if (!empty($filters['year'])) {
            $where .= " AND c.year = ?";
            $params[] = (int)$filters['year'];
        }

        if (isset($filters['minPrice']) && $filters['minPrice'] !== '') {
            $where .= " AND c.price >= ?";
            $params[] = (float)$filters['minPrice'];
        }
        
        if (isset($filters['maxPrice']) && $filters['maxPrice'] !== '') {
            $where .= " AND c.price <= ?";
            $params[] = (float)$filters['maxPrice'];
        }

        return ['where' => $where, 'params' => $params];
    }

    /**
     * Build ORDER BY clause
     */
    private function buildOrderClause(string $sortBy): string {
        switch ($sortBy) {
            case 'price_asc': return " ORDER BY c.price ASC";
            case 'price_desc': return " ORDER BY c.price DESC";
            case 'views': return " ORDER BY c.view_count DESC";
            case 'newest':
            default: return " ORDER BY c.created_at DESC";
        }
    }

    /**
     * Get inspection data for a car
     */
    private function getInspectionData(int $carId): array {
        $inspectionStmt = $this->db->prepare("
            SELECT engine_status, transmission_status, chassis_status, tires_status, 
                   technical_notes, damage_details, created_at, updated_at
            FROM car_inspection WHERE car_id = ?
        ");
        $inspectionStmt->execute([$carId]);
        $inspection = $inspectionStmt->fetch();

        $partsStmt = $this->db->prepare("SELECT part_id, status FROM car_body_parts WHERE car_id = ?");
        $partsStmt->execute([$carId]);
        $bodyParts = $partsStmt->fetchAll();

        $formattedParts = [];
        foreach ($bodyParts as $part) {
            $formattedParts[$part['part_id']] = $part['status'];
        }

        $damageDetails = null;
        if ($inspection && !empty($inspection['damage_details'])) {
            $damageDetails = json_decode($inspection['damage_details'], true);
        }

        $tiresStatus = null;
        if ($inspection && !empty($inspection['tires_status'])) {
            $tiresStatus = json_decode($inspection['tires_status'], true);
        }

        return [
            'bodyParts' => $formattedParts,
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
    }

    /**
     * Validate car data
     */
    private function validateCarData(array $data, bool $isUpdate = false): array {
        $errors = [];

        if (!$isUpdate) {
            if (empty($data['name'])) $errors['name'] = 'اسم السيارة مطلوب';
            if (empty($data['brand'])) $errors['brand'] = 'العلامة التجارية مطلوبة';
            if (empty($data['model'])) $errors['model'] = 'الموديل مطلوب';
            if (empty($data['year'])) $errors['year'] = 'سنة الصنع مطلوبة';
            if (empty($data['condition'])) $errors['condition'] = 'حالة السيارة مطلوبة';
            
            $priceType = isset($data['priceType']) ? strtoupper($data['priceType']) : 'FIXED';
            if ($priceType === 'FIXED' && !isset($data['price'])) {
                $errors['price'] = 'السعر مطلوب';
            }
        }

        if (isset($data['year']) && ($data['year'] < 1900 || $data['year'] > date('Y') + 1)) {
            $errors['year'] = 'سنة الصنع غير صالحة';
        }

        if (isset($data['price']) && $data['price'] < 0) {
            $errors['price'] = 'السعر يجب أن يكون رقماً موجباً';
        }

        if (isset($data['condition']) && !in_array(strtoupper($data['condition']), ['NEW', 'USED'])) {
            $errors['condition'] = 'حالة السيارة يجب أن تكون NEW أو USED';
        }

        if (isset($data['priceType']) && !in_array(strtoupper($data['priceType']), self::VALID_PRICE_TYPES)) {
            $errors['priceType'] = 'نوع التسعير يجب أن يكون FIXED أو AUCTION';
        }

        if (isset($data['condition']) && strtoupper($data['condition']) === 'USED') {
            if (empty($data['bodyType'])) {
                $errors['bodyType'] = 'نوع الهيكل مطلوب للسيارات المستعملة';
            } elseif (!in_array($data['bodyType'], self::VALID_BODY_TYPES)) {
                $errors['bodyType'] = 'نوع الهيكل غير صالح';
            }
        }

        return $errors;
    }

    /**
     * Validate auction data
     */
    private function validateAuctionData(array $data, bool $isUpdate = false): array {
        $errors = [];

        if (!$isUpdate) {
            if (!isset($data['startingPrice'])) {
                $errors['startingPrice'] = 'السعر الابتدائي مطلوب';
            } elseif (!is_numeric($data['startingPrice']) || (float)$data['startingPrice'] <= 0) {
                $errors['startingPrice'] = 'السعر الابتدائي يجب أن يكون رقماً موجباً';
            }

            if (empty($data['endTime'])) {
                $errors['endTime'] = 'وقت انتهاء المزاد مطلوب';
            }
        }

        if (!empty($data['endTime'])) {
            $endTimestamp = strtotime($data['endTime']);
            if ($endTimestamp === false) {
                $errors['endTime'] = 'صيغة وقت الانتهاء غير صحيحة';
            } elseif ($endTimestamp <= time()) {
                $errors['endTime'] = 'وقت الانتهاء يجب أن يكون في المستقبل';
            }
        }

        return $errors;
    }

    /**
     * Create auction for car
     */
    private function createAuctionForCar(int $carId, array $data): void {
        $endTime = $data['endTime'];
        if (strpos($endTime, 'T') !== false) {
            $endTime = date('Y-m-d H:i:s', strtotime($endTime));
        }

        $stmt = $this->db->prepare("
            INSERT INTO auctions (car_id, starting_price, reserve_price, current_price, min_increment, end_time, status)
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
        ");

        $stmt->execute([
            $carId,
            (float)$data['startingPrice'],
            isset($data['reservePrice']) && $data['reservePrice'] !== '' ? (float)$data['reservePrice'] : null,
            (float)$data['startingPrice'],
            isset($data['minIncrement']) && $data['minIncrement'] !== '' ? (float)$data['minIncrement'] : 100.00,
            $endTime
        ]);
    }

    /**
     * Update auction for car
     */
    private function updateAuctionForCar(int $carId, array $data): void {
        $updates = [];
        $params = [];

        if (isset($data['startingPrice'])) {
            $updates[] = "starting_price = ?";
            $params[] = (float)$data['startingPrice'];
        }

        if (isset($data['reservePrice'])) {
            $updates[] = "reserve_price = ?";
            $params[] = $data['reservePrice'] !== '' ? (float)$data['reservePrice'] : null;
        }

        if (isset($data['endTime'])) {
            $endTime = $data['endTime'];
            if (strpos($endTime, 'T') !== false) {
                $endTime = date('Y-m-d H:i:s', strtotime($endTime));
            }
            $updates[] = "end_time = ?";
            $params[] = $endTime;
        }

        if (!empty($updates)) {
            $params[] = $carId;
            $query = "UPDATE auctions SET " . implode(', ', $updates) . " WHERE car_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
        }
    }

    /**
     * Cancel auction for car
     */
    private function cancelAuctionForCar(int $carId): void {
        $stmt = $this->db->prepare("UPDATE auctions SET status = 'CANCELLED' WHERE car_id = ?");
        $stmt->execute([$carId]);
    }

    /**
     * Format car data for response
     */
    private function formatCar(array $car): array {
        $formatted = [
            'id' => (int)$car['id'],
            'name' => $car['name'],
            'brand' => $car['brand'],
            'model' => $car['model'],
            'year' => (int)$car['year'],
            'price' => (float)$car['price'],
            'priceType' => $car['price_type'] ?? 'FIXED',
            'condition' => $car['car_condition'],
            'bodyType' => $car['body_type'] ?? null,
            'origin' => $car['origin'] ?? null,
            'kilometers' => $car['kilometers'] ? (int)$car['kilometers'] : null,
            'description' => $car['description'],
            'specifications' => $car['specifications'],
            'status' => $car['status'],
            'isFeatured' => (bool)$car['is_featured'],
            'viewCount' => (int)$car['view_count'],
            'thumbnail' => $car['thumbnail'] ?? null,
            'images' => isset($car['images']) ? array_map(function($img) {
                return [
                    'id' => (int)$img['id'],
                    'url' => $img['url'],
                    'order' => (int)$img['image_order']
                ];
            }, $car['images']) : [],
            'video' => isset($car['video']) && $car['video'] ? [
                'id' => (int)$car['video']['id'],
                'type' => $car['video']['video_type'],
                'url' => $car['video']['url']
            ] : null,
            'createdAt' => $car['created_at'],
            'updatedAt' => $car['updated_at']
        ];

        if (isset($car['inspection'])) {
            $formatted['inspection'] = $car['inspection'];
        }

        if (($car['price_type'] ?? 'FIXED') === 'AUCTION') {
            $formatted['auction'] = $this->getAuctionDataForCar((int)$car['id']);
        }

        return $formatted;
    }

    /**
     * Get auction data for car
     */
    private function getAuctionDataForCar(int $carId): ?array {
        $stmt = $this->db->prepare("
            SELECT a.*, (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count
            FROM auctions a WHERE a.car_id = ?
        ");
        $stmt->execute([$carId]);
        $auction = $stmt->fetch();

        if (!$auction) return null;

        return [
            'id' => (int)$auction['id'],
            'startingPrice' => (float)$auction['starting_price'],
            'reservePrice' => $auction['reserve_price'] ? (float)$auction['reserve_price'] : null,
            'currentPrice' => (float)$auction['current_price'],
            'minIncrement' => (float)$auction['min_increment'],
            'endTime' => $auction['end_time'],
            'status' => $auction['status'],
            'bidCount' => (int)$auction['bid_count']
        ];
    }
}
