<?php
/**
 * Cars Controller
 * CRUD operations, filtering, sorting, archiving
 * Requirements: 2.1, 3.1-3.9, 4.5, 8.1-8.7, 11.1-11.3, 14.1-14.3
 * Auction Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * PERFORMANCE: Optimized queries, eliminated N+1, unified filter building
 */

require_once __DIR__ . '/../utils/AuditLogger.php';

class CarsController {
    private $db;

    // Valid price types
    private const VALID_PRICE_TYPES = ['FIXED', 'AUCTION'];

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Build WHERE clause and params from filters
     * PERFORMANCE: Unified filter building to avoid code duplication
     * @param array $filters The filters array
     * @return array ['where' => string, 'params' => array]
     */
    private function buildWhereClause(array $filters): array {
        $where = " WHERE 1=1";
        $params = [];

        // Filter by status (default: available only for public)
        if (isset($filters['status'])) {
            $where .= " AND c.status = ?";
            $params[] = strtoupper($filters['status']);
        } else {
            $where .= " AND c.status = 'AVAILABLE'";
        }

        // Filter by featured
        if (isset($filters['featured'])) {
            $where .= " AND c.is_featured = ?";
            $params[] = $filters['featured'] ? 1 : 0;
        }

        // Search by name or brand
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $where .= " AND (c.name LIKE ? OR c.brand LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Filter by brand
        if (!empty($filters['brand'])) {
            $where .= " AND c.brand = ?";
            $params[] = $filters['brand'];
        }

        // Filter by condition
        if (!empty($filters['condition'])) {
            $where .= " AND c.car_condition = ?";
            $params[] = strtoupper($filters['condition']);
        }

        // Filter by year
        if (!empty($filters['year'])) {
            $where .= " AND c.year = ?";
            $params[] = (int)$filters['year'];
        }

        // Filter by price range
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
     * Get all cars with filtering and sorting
     * Requirements: 2.1, 3.1-3.9
     * PERFORMANCE: Optimized with LEFT JOIN instead of subquery, unified filter building
     * GET /api/cars
     */
    public function getAll() {
        $filters = $this->getFilters();
        
        try {
            // Build WHERE clause once (reused for both count and data queries)
            $whereClause = $this->buildWhereClause($filters);
            
            // PERFORMANCE: Use LEFT JOIN with subquery for thumbnail instead of correlated subquery
            // This is more efficient as it only runs the subquery once
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
            $sortBy = $filters['sortBy'] ?? 'newest';
            switch ($sortBy) {
                case 'price_asc':
                    $query .= " ORDER BY c.price ASC";
                    break;
                case 'price_desc':
                    $query .= " ORDER BY c.price DESC";
                    break;
                case 'views':
                    $query .= " ORDER BY c.view_count DESC";
                    break;
                case 'newest':
                default:
                    $query .= " ORDER BY c.created_at DESC";
                    break;
            }

            // Pagination
            $page = max(1, (int)($filters['page'] ?? 1));
            $perPage = min(50, max(1, (int)($filters['perPage'] ?? 12)));
            $offset = ($page - 1) * $perPage;

            // PERFORMANCE: Get total count using same WHERE clause (no duplication)
            $countQuery = "SELECT COUNT(*) as total FROM cars c" . $whereClause['where'];
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($whereClause['params']);
            $total = $countStmt->fetch()['total'];

            // Add pagination
            $query .= " LIMIT ? OFFSET ?";
            $params[] = $perPage;
            $params[] = $offset;

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $cars = $stmt->fetchAll();

            $cars = array_map([$this, 'formatCar'], $cars);
            
            // Add cache headers for public data
            header('Cache-Control: public, max-age=60'); // 1 minute cache
            
            Response::paginated($cars, $total, $page, $perPage);

        } catch (PDOException $e) {
            error_log("CarsController::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب السيارات', 500, 'SRV_001');
        }
    }


    /**
     * Get car by ID
     * GET /api/cars/:id
     * Requirements: 6.2 - Include inspection data for used cars
     */
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $car = $stmt->fetch();

            if (!$car) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $imgStmt = $this->db->prepare("SELECT * FROM car_images WHERE car_id = ? ORDER BY image_order");
            $imgStmt->execute([$id]);
            $car['images'] = $imgStmt->fetchAll();

            $vidStmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ?");
            $vidStmt->execute([$id]);
            $car['video'] = $vidStmt->fetch() ?: null;

            // Fetch inspection data for used cars
            if ($car['car_condition'] === 'USED') {
                $car['inspection'] = $this->getInspectionData($id);
            }

            Response::success($this->formatCar($car));

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب بيانات السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Get inspection data for a car
     * Requirements: 6.2
     */
    private function getInspectionData($carId) {
        // Get mechanical inspection data including damage_details and tires_status
        $inspectionStmt = $this->db->prepare("
            SELECT engine_status, transmission_status, chassis_status, tires_status, technical_notes, damage_details, created_at, updated_at
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

        // Format body parts as key-value object
        $formattedParts = [];
        foreach ($bodyParts as $part) {
            $formattedParts[$part['part_id']] = $part['status'];
        }

        // Parse damage details JSON and strip base64 photos
        $damageDetails = null;
        if ($inspection && !empty($inspection['damage_details'])) {
            $damageDetails = json_decode($inspection['damage_details'], true);
            // Strip base64 photos from response to reduce payload size
            $damageDetails = $this->stripBase64PhotosFromDamageDetails($damageDetails);
        }

        // Parse tires status JSON
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
     * Strip base64 photos from damage details to reduce response size
     */
    private function stripBase64PhotosFromDamageDetails($damageDetails) {
        if (!is_array($damageDetails)) {
            return $damageDetails;
        }

        foreach ($damageDetails as $partKey => &$detail) {
            if (isset($detail['photos']) && is_array($detail['photos'])) {
                $cleanPhotos = [];
                foreach ($detail['photos'] as $photo) {
                    // If it's a base64 string, skip it (don't include in response)
                    // If it's already a URL, keep it
                    if (is_string($photo) && strpos($photo, 'data:') !== 0) {
                        $cleanPhotos[] = $photo;
                    }
                    // Base64 photos are stripped - they're too large for API response
                }
                $detail['photos'] = $cleanPhotos;
            }
        }

        return $damageDetails;
    }

    /**
     * Create new car
     * POST /api/cars
     * Requirements: 1.1 - Support body_type for used cars
     * Requirements: 1.1, 1.2, 1.3 - Support price_type and auction creation
     */
    public function create() {
        $data = Response::getJsonInput();
        $errors = $this->validateCarData($data);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        // Determine price type
        $priceType = isset($data['priceType']) ? strtoupper($data['priceType']) : 'FIXED';
        
        // Validate auction data if price_type is AUCTION
        if ($priceType === 'AUCTION') {
            $auctionErrors = $this->validateAuctionData($data);
            if (!empty($auctionErrors)) {
                Response::error('يرجى التحقق من بيانات المزاد', 400, 'VAL_001', $auctionErrors);
            }
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO cars (name, brand, model, year, price, price_type, car_condition, body_type, origin, kilometers, description, specifications, status, is_featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            // For auction cars, use starting price as the price field
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

            $carId = $this->db->lastInsertId();

            // Create auction record if price_type is AUCTION
            if ($priceType === 'AUCTION') {
                $this->createAuctionForCar($carId, $data);
            }

            $this->db->commit();
            $this->getById($carId);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("CarsController::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إضافة السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Update car
     * PUT /api/cars/:id
     * Requirements: 1.1 - Support body_type for used cars
     * Requirements: 1.1, 1.2, 1.3 - Support price_type and auction updates
     */
    public function update($id) {
        $stmt = $this->db->prepare("SELECT id, price_type FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        $existingCar = $stmt->fetch();
        if (!$existingCar) {
            Response::error('السيارة غير موجودة', 404, 'CAR_001');
        }

        $data = Response::getJsonInput();
        $errors = $this->validateCarData($data, true);

        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        // Determine new price type
        $newPriceType = isset($data['priceType']) ? strtoupper($data['priceType']) : $existingCar['price_type'];
        $oldPriceType = $existingCar['price_type'];

        // Validate auction data if changing to AUCTION or updating auction
        if ($newPriceType === 'AUCTION') {
            // Check if auction data is provided for new auctions
            if ($oldPriceType !== 'AUCTION' || isset($data['startingPrice']) || isset($data['endTime'])) {
                $auctionErrors = $this->validateAuctionData($data, $oldPriceType === 'AUCTION');
                if (!empty($auctionErrors)) {
                    Response::error('يرجى التحقق من بيانات المزاد', 400, 'VAL_001', $auctionErrors);
                }
            }
        }

        try {
            $this->db->beginTransaction();

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
                    if ($field === 'bodyType') {
                        $dbField = 'body_type';
                    }
                    if ($field === 'priceType') {
                        $dbField = 'price_type';
                        $value = strtoupper($value);
                    }
                    if ($field === 'status') {
                        $value = strtoupper($value);
                    }
                    if ($field === 'isFeatured') {
                        $dbField = 'is_featured';
                        $value = $value ? 1 : 0;
                    }
                    $updates[] = "$dbField = ?";
                    $params[] = $value;
                }
            }

            // If changing to AUCTION, update price to starting price
            if ($newPriceType === 'AUCTION' && isset($data['startingPrice'])) {
                if (!in_array('price = ?', $updates)) {
                    $updates[] = "price = ?";
                    $params[] = (float)$data['startingPrice'];
                }
            }

            if (empty($updates)) {
                Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
            }

            $params[] = $id;
            $query = "UPDATE cars SET " . implode(', ', $updates) . " WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            // Handle auction record based on price type change
            if ($newPriceType === 'AUCTION' && $oldPriceType !== 'AUCTION') {
                // Create new auction
                $this->createAuctionForCar($id, $data);
            } elseif ($newPriceType !== 'AUCTION' && $oldPriceType === 'AUCTION') {
                // Cancel existing auction when changing from AUCTION to FIXED
                $this->cancelAuctionForCar($id);
            } elseif ($newPriceType === 'AUCTION' && $oldPriceType === 'AUCTION') {
                // Update existing auction if auction data provided
                $this->updateAuctionForCar($id, $data);
            }

            $this->db->commit();
            $this->getById($id);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("CarsController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Delete car
     * DELETE /api/cars/:id
     */
    public function delete($id) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("DELETE FROM cars WHERE id = ?");
            $stmt->execute([$id]);

            Response::success(['message' => 'تم حذف السيارة بنجاح']);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في حذف السيارة', 500, 'SRV_001');
        }
    }


    /**
     * Duplicate car
     * POST /api/cars/:id/duplicate
     */
    public function duplicate($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $car = $stmt->fetch();

            if (!$car) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("
                INSERT INTO cars (name, brand, model, year, price, car_condition, kilometers, description, specifications, status, is_featured, view_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', 0, 0)
            ");

            $stmt->execute([
                $car['name'] . ' (نسخة)',
                $car['brand'],
                $car['model'],
                $car['year'],
                $car['price'],
                $car['car_condition'],
                $car['kilometers'],
                $car['description'],
                $car['specifications']
            ]);

            $newCarId = $this->db->lastInsertId();

            $imgStmt = $this->db->prepare("SELECT url, image_order FROM car_images WHERE car_id = ?");
            $imgStmt->execute([$id]);
            $images = $imgStmt->fetchAll();

            foreach ($images as $image) {
                $insertImg = $this->db->prepare("INSERT INTO car_images (car_id, url, image_order) VALUES (?, ?, ?)");
                $insertImg->execute([$newCarId, $image['url'], $image['image_order']]);
            }

            $this->getById($newCarId);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في نسخ السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Toggle featured status
     * PUT /api/cars/:id/featured
     */
    public function toggleFeatured($id) {
        try {
            $stmt = $this->db->prepare("SELECT id, is_featured FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $car = $stmt->fetch();

            if (!$car) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $newStatus = $car['is_featured'] ? 0 : 1;
            $stmt = $this->db->prepare("UPDATE cars SET is_featured = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);

            $this->getById($id);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في تغيير حالة التمييز', 500, 'SRV_001');
        }
    }

    /**
     * Archive car (mark as sold)
     * PUT /api/cars/:id/archive
     */
    public function archive($id) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("UPDATE cars SET status = 'SOLD' WHERE id = ?");
            $stmt->execute([$id]);

            $this->getById($id);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في أرشفة السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Update car status
     * PUT /api/cars/:id/status
     */
    public function updateStatus($id) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['status'])) {
                Response::error('الحالة مطلوبة', 400, 'VAL_001');
            }
            
            $status = strtoupper($data['status']);
            $validStatuses = ['AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED'];
            
            if (!in_array($status, $validStatuses)) {
                Response::error('حالة غير صالحة', 400, 'VAL_002');
            }

            $stmt = $this->db->prepare("UPDATE cars SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);

            $this->getById($id);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في تحديث حالة السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Restore car from archive
     * PUT /api/cars/:id/restore
     */
    public function restore($id) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            $stmt = $this->db->prepare("UPDATE cars SET status = 'AVAILABLE' WHERE id = ?");
            $stmt->execute([$id]);

            $this->getById($id);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في استعادة السيارة', 500, 'SRV_001');
        }
    }

    /**
     * Increment view count
     * PUT /api/cars/:id/view
     */
    public function incrementViewCount($id) {
        try {
            $stmt = $this->db->prepare("UPDATE cars SET view_count = view_count + 1 WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }

            Response::success(['message' => 'تم تحديث عداد المشاهدات']);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في تحديث عداد المشاهدات', 500, 'SRV_001');
        }
    }

    /**
     * Get all brands
     * GET /api/brands
     */
    public function getBrands() {
        try {
            $stmt = $this->db->query("SELECT DISTINCT brand FROM cars WHERE status = 'AVAILABLE' ORDER BY brand");
            $brands = $stmt->fetchAll(PDO::FETCH_COLUMN);

            Response::success($brands);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب العلامات التجارية', 500, 'SRV_001');
        }
    }


    /**
     * Get filters from query string
     */
    private function getFilters() {
        return [
            'search' => $_GET['search'] ?? null,
            'brand' => $_GET['brand'] ?? null,
            'condition' => $_GET['condition'] ?? null,
            'year' => $_GET['year'] ?? null,
            'minPrice' => $_GET['minPrice'] ?? null,
            'maxPrice' => $_GET['maxPrice'] ?? null,
            'sortBy' => $_GET['sortBy'] ?? 'newest',
            'status' => $_GET['status'] ?? null,
            'featured' => isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null,
            'page' => $_GET['page'] ?? 1,
            'perPage' => $_GET['perPage'] ?? 12
        ];
    }

    // Valid body types for used cars
    private const VALID_BODY_TYPES = [
        'sedan', 'hatchback', 'coupe', 'suv', 'crossover', 
        'pickup', 'van', 'minivan', 'truck'
    ];

    /**
     * Validate auction data
     * Requirements: 1.4, 1.5
     * @param array $data The auction data to validate
     * @param bool $isUpdate Whether this is an update (fields are optional)
     * @return array Validation errors
     */
    public function validateAuctionData(array $data, bool $isUpdate = false): array {
        $errors = [];

        // For new auctions, starting price and end time are required
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

        // Validate end time is in future (Requirement 1.4)
        if (!empty($data['endTime'])) {
            $endTimestamp = strtotime($data['endTime']);
            if ($endTimestamp === false) {
                $errors['endTime'] = 'صيغة وقت الانتهاء غير صحيحة';
            } elseif ($endTimestamp <= time()) {
                $errors['endTime'] = 'وقت الانتهاء يجب أن يكون في المستقبل';
            }
        }

        // Validate reserve price >= starting price (Requirement 1.5)
        if (isset($data['reservePrice']) && $data['reservePrice'] !== null && $data['reservePrice'] !== '') {
            if (!is_numeric($data['reservePrice'])) {
                $errors['reservePrice'] = 'السعر الأدنى يجب أن يكون رقماً';
            } elseif ((float)$data['reservePrice'] < 0) {
                $errors['reservePrice'] = 'السعر الأدنى يجب أن يكون رقماً موجباً';
            } elseif (isset($data['startingPrice']) && is_numeric($data['startingPrice']) && 
                      (float)$data['reservePrice'] < (float)$data['startingPrice']) {
                $errors['reservePrice'] = 'السعر الأدنى يجب أن يكون أكبر من أو يساوي السعر الابتدائي';
            }
        }

        // Validate min increment if provided
        if (isset($data['minIncrement']) && $data['minIncrement'] !== null && $data['minIncrement'] !== '') {
            if (!is_numeric($data['minIncrement']) || (float)$data['minIncrement'] <= 0) {
                $errors['minIncrement'] = 'الحد الأدنى للزيادة يجب أن يكون رقماً موجباً';
            }
        }

        return $errors;
    }

    /**
     * Create auction record for a car
     * Requirements: 1.2, 1.3
     */
    private function createAuctionForCar(int $carId, array $data): void {
        $startingPrice = (float)$data['startingPrice'];
        $reservePrice = isset($data['reservePrice']) && $data['reservePrice'] !== '' 
            ? (float)$data['reservePrice'] 
            : null;
        $minIncrement = isset($data['minIncrement']) && $data['minIncrement'] !== '' 
            ? (float)$data['minIncrement'] 
            : 100.00;
        
        // Convert ISO datetime to MySQL format
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
            $startingPrice,
            $reservePrice,
            $startingPrice, // current_price starts at starting_price
            $minIncrement,
            $endTime
        ]);
    }

    /**
     * Update auction record for a car
     */
    private function updateAuctionForCar(int $carId, array $data): void {
        $updates = [];
        $params = [];

        if (isset($data['startingPrice'])) {
            $updates[] = "starting_price = ?";
            $params[] = (float)$data['startingPrice'];
            
            // Also update current_price if no bids have been placed
            $bidCountStmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM bids b 
                JOIN auctions a ON b.auction_id = a.id 
                WHERE a.car_id = ?
            ");
            $bidCountStmt->execute([$carId]);
            $bidCount = $bidCountStmt->fetch()['count'];
            
            if ($bidCount == 0) {
                $updates[] = "current_price = ?";
                $params[] = (float)$data['startingPrice'];
            }
        }

        if (isset($data['reservePrice'])) {
            $updates[] = "reserve_price = ?";
            $params[] = $data['reservePrice'] !== '' ? (float)$data['reservePrice'] : null;
        }

        if (isset($data['minIncrement'])) {
            $updates[] = "min_increment = ?";
            $params[] = (float)$data['minIncrement'];
        }

        if (isset($data['endTime'])) {
            // Convert ISO datetime to MySQL format
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
     * Cancel auction for a car (when changing from AUCTION to FIXED)
     */
    private function cancelAuctionForCar(int $carId): void {
        $stmt = $this->db->prepare("UPDATE auctions SET status = 'CANCELLED' WHERE car_id = ?");
        $stmt->execute([$carId]);
    }

    /**
     * Validate car data
     * Requirements: 1.4 - body_type is required for used cars
     * Requirements: 1.1 - price_type validation
     */
    public function validateCarData($data, $isUpdate = false) {
        $errors = [];

        if (!$isUpdate) {
            if (empty($data['name'])) $errors['name'] = 'اسم السيارة مطلوب';
            if (empty($data['brand'])) $errors['brand'] = 'العلامة التجارية مطلوبة';
            if (empty($data['model'])) $errors['model'] = 'الموديل مطلوب';
            if (empty($data['year'])) $errors['year'] = 'سنة الصنع مطلوبة';
            if (empty($data['condition'])) $errors['condition'] = 'حالة السيارة مطلوبة';
            
            // Price is required for FIXED price type, startingPrice for AUCTION
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

        if (isset($data['status']) && !in_array(strtoupper($data['status']), ['AVAILABLE', 'SOLD'])) {
            $errors['status'] = 'حالة التوفر يجب أن تكون AVAILABLE أو SOLD';
        }

        // Validate price_type (Requirement 1.1)
        if (isset($data['priceType']) && !in_array(strtoupper($data['priceType']), self::VALID_PRICE_TYPES)) {
            $errors['priceType'] = 'نوع التسعير يجب أن يكون FIXED أو AUCTION';
        }

        // Validate body_type for used cars (Requirement 1.4)
        if (isset($data['condition']) && strtoupper($data['condition']) === 'USED') {
            if (empty($data['bodyType'])) {
                $errors['bodyType'] = 'نوع الهيكل مطلوب للسيارات المستعملة';
            } elseif (!in_array($data['bodyType'], self::VALID_BODY_TYPES)) {
                $errors['bodyType'] = 'نوع الهيكل غير صالح. القيم المسموحة: ' . implode(', ', self::VALID_BODY_TYPES);
            }
        }

        // Validate body_type value if provided (even for new cars)
        if (isset($data['bodyType']) && !empty($data['bodyType']) && !in_array($data['bodyType'], self::VALID_BODY_TYPES)) {
            $errors['bodyType'] = 'نوع الهيكل غير صالح. القيم المسموحة: ' . implode(', ', self::VALID_BODY_TYPES);
        }

        return $errors;
    }

    /**
     * Get valid body types (for external use/testing)
     */
    public static function getValidBodyTypes() {
        return self::VALID_BODY_TYPES;
    }

    /**
     * Format car data for response
     * Requirements: 1.1, 6.2 - Include bodyType, priceType and inspection data
     */
    private function formatCar($car) {
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

        // Include inspection data if available
        if (isset($car['inspection'])) {
            $formatted['inspection'] = $car['inspection'];
        }

        // Include auction data if price_type is AUCTION
        if (($car['price_type'] ?? 'FIXED') === 'AUCTION') {
            $formatted['auction'] = $this->getAuctionDataForCar((int)$car['id']);
        }

        return $formatted;
    }

    /**
     * Get auction data for a car
     */
    private function getAuctionDataForCar(int $carId): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT a.*, 
                       (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count
                FROM auctions a 
                WHERE a.car_id = ?
            ");
            $stmt->execute([$carId]);
            $auction = $stmt->fetch();

            if (!$auction) {
                return null;
            }

            return [
                'id' => (int)$auction['id'],
                'startingPrice' => (float)$auction['starting_price'],
                'reservePrice' => $auction['reserve_price'] ? (float)$auction['reserve_price'] : null,
                'currentPrice' => (float)$auction['current_price'],
                'minIncrement' => (float)$auction['min_increment'],
                'endTime' => $auction['end_time'],
                'status' => $auction['status'],
                'bidCount' => (int)$auction['bid_count'],
                'createdAt' => $auction['created_at'],
                'updatedAt' => $auction['updated_at']
            ];
        } catch (PDOException $e) {
            error_log("CarsController::getAuctionDataForCar error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Convert camelCase to snake_case
     */
    private function camelToSnake($input) {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }
}
