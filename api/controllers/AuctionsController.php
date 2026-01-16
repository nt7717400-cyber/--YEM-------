<?php
/**
 * Auctions Controller
 * CRUD operations for auction system
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

require_once __DIR__ . '/../utils/PhoneMasking.php';

class AuctionsController {
    private $db;
    private $isAdmin;

    public function __construct($db, $isAdmin = false) {
        $this->db = $db;
        $this->isAdmin = $isAdmin;
    }

    /**
     * Set admin status for phone number visibility
     */
    public function setAdminStatus(bool $isAdmin): void {
        $this->isAdmin = $isAdmin;
    }

    /**
     * Get all active auctions
     * GET /api/auctions
     * Requirements: 6.1
     */
    public function index() {
        try {
            $filters = $this->getFilters();
            
            $query = "SELECT a.*, c.name as car_name, c.brand, c.model, c.year, c.car_condition,
                      (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count,
                      (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail
                      FROM auctions a
                      JOIN cars c ON a.car_id = c.id
                      WHERE 1=1";
            $params = [];

            // Filter by status
            if (!empty($filters['status'])) {
                $query .= " AND a.status = ?";
                $params[] = strtoupper($filters['status']);
            } else {
                // Default: show active auctions only for public
                if (!$this->isAdmin) {
                    $query .= " AND a.status = 'ACTIVE' AND a.end_time > NOW()";
                }
            }

            // Sort by ending soonest (for active auctions)
            $query .= " ORDER BY a.end_time ASC";

            // Pagination
            $page = max(1, (int)($filters['page'] ?? 1));
            $perPage = min(50, max(1, (int)($filters['perPage'] ?? 12)));
            $offset = ($page - 1) * $perPage;

            // Get total count
            $countQuery = str_replace(
                "SELECT a.*, c.name as car_name, c.brand, c.model, c.year, c.car_condition,
                      (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count,
                      (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail",
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
            $auctions = $stmt->fetchAll();

            $auctions = array_map([$this, 'formatAuction'], $auctions);
            Response::paginated($auctions, $total, $page, $perPage);

        } catch (PDOException $e) {
            error_log("AuctionsController::index error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب المزادات', 500, 'SRV_001');
        }
    }

    /**
     * Get auction by ID with bids
     * GET /api/auctions/:id
     * Requirements: 6.2
     */
    public function show(int $id) {
        try {
            $stmt = $this->db->prepare("
                SELECT a.*, c.name as car_name, c.brand, c.model, c.year, c.car_condition,
                       c.description, c.specifications, c.kilometers, c.origin, c.body_type,
                       (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count,
                       (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail
                FROM auctions a
                JOIN cars c ON a.car_id = c.id
                WHERE a.id = ?
            ");
            $stmt->execute([$id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            // Get car images
            $imgStmt = $this->db->prepare("SELECT * FROM car_images WHERE car_id = ? ORDER BY image_order");
            $imgStmt->execute([$auction['car_id']]);
            $auction['images'] = $imgStmt->fetchAll();

            // Get car video
            $videoStmt = $this->db->prepare("SELECT * FROM car_videos WHERE car_id = ? LIMIT 1");
            $videoStmt->execute([$auction['car_id']]);
            $auction['video'] = $videoStmt->fetch() ?: null;

            // Get bids ordered by amount descending
            $bidsStmt = $this->db->prepare("
                SELECT id, auction_id, bidder_name, phone_number, amount, created_at
                FROM bids
                WHERE auction_id = ?
                ORDER BY amount DESC
            ");
            $bidsStmt->execute([$id]);
            $auction['bids'] = $bidsStmt->fetchAll();

            Response::success($this->formatAuctionWithBids($auction));

        } catch (PDOException $e) {
            error_log("AuctionsController::show error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب بيانات المزاد', 500, 'SRV_001');
        }
    }

    /**
     * Get bids for an auction
     * GET /api/auctions/:id/bids
     */
    public function getBids(int $id) {
        try {
            // Check if auction exists
            $stmt = $this->db->prepare("SELECT id FROM auctions WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            // Get bids ordered by amount descending
            $bidsStmt = $this->db->prepare("
                SELECT id, auction_id, bidder_name, phone_number, amount, created_at
                FROM bids
                WHERE auction_id = ?
                ORDER BY amount DESC
            ");
            $bidsStmt->execute([$id]);
            $bids = $bidsStmt->fetchAll();

            $formattedBids = array_map([$this, 'formatBid'], $bids);
            Response::success($formattedBids);

        } catch (PDOException $e) {
            error_log("AuctionsController::getBids error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب المزايدات', 500, 'SRV_001');
        }
    }


    /**
     * Place a bid on an auction
     * POST /api/auctions/:id/bids
     * Requirements: 6.3
     */
    public function placeBid(int $id) {
        $data = Response::getJsonInput();
        
        // Validate bid data
        $errors = $this->validateBidData($data);
        if (!empty($errors)) {
            Response::error('يرجى التحقق من البيانات المدخلة', 400, 'VAL_001', $errors);
        }

        try {
            // Get auction details
            $stmt = $this->db->prepare("SELECT * FROM auctions WHERE id = ?");
            $stmt->execute([$id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            // Check if auction is active
            if ($auction['status'] !== 'ACTIVE') {
                Response::error('المزاد غير نشط', 400, 'AUCTION_ENDED');
            }

            // Check if auction has ended
            if (strtotime($auction['end_time']) < time()) {
                Response::error('انتهى المزاد', 400, 'AUCTION_ENDED');
            }

            // Validate bid amount
            $minBid = (float)$auction['current_price'] + (float)$auction['min_increment'];
            if ((float)$data['amount'] < $minBid) {
                Response::error(
                    'العرض أقل من الحد الأدنى. الحد الأدنى للمزايدة: ' . number_format($minBid, 2),
                    400,
                    'BID_TOO_LOW'
                );
            }

            // Start transaction
            $this->db->beginTransaction();

            // Insert bid
            $insertStmt = $this->db->prepare("
                INSERT INTO bids (auction_id, bidder_name, phone_number, amount)
                VALUES (?, ?, ?, ?)
            ");
            $insertStmt->execute([
                $id,
                trim($data['bidderName']),
                trim($data['phoneNumber']),
                (float)$data['amount']
            ]);

            $bidId = $this->db->lastInsertId();

            // Update auction current price
            $updateStmt = $this->db->prepare("
                UPDATE auctions SET current_price = ? WHERE id = ?
            ");
            $updateStmt->execute([(float)$data['amount'], $id]);

            $this->db->commit();

            // Get the created bid
            $bidStmt = $this->db->prepare("SELECT * FROM bids WHERE id = ?");
            $bidStmt->execute([$bidId]);
            $bid = $bidStmt->fetch();

            Response::success([
                'message' => 'تم تقديم العرض بنجاح',
                'bid' => $this->formatBid($bid)
            ], 201);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("AuctionsController::placeBid error: " . $e->getMessage());
            Response::error('حدث خطأ في تقديم العرض', 500, 'SRV_001');
        }
    }

    /**
     * Delete a bid (admin only)
     * DELETE /api/auctions/:id/bids/:bidId
     */
    public function deleteBid(int $auctionId, int $bidId) {
        try {
            // Get the bid to delete
            $bidStmt = $this->db->prepare("SELECT * FROM bids WHERE id = ? AND auction_id = ?");
            $bidStmt->execute([$bidId, $auctionId]);
            $bid = $bidStmt->fetch();

            if (!$bid) {
                Response::error('المزايدة غير موجودة', 404, 'BID_NOT_FOUND');
            }

            // Get auction details
            $auctionStmt = $this->db->prepare("SELECT * FROM auctions WHERE id = ?");
            $auctionStmt->execute([$auctionId]);
            $auction = $auctionStmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            $this->db->beginTransaction();

            // Delete the bid
            $deleteStmt = $this->db->prepare("DELETE FROM bids WHERE id = ?");
            $deleteStmt->execute([$bidId]);

            // Update auction current price to the next highest bid or starting price
            $highestBidStmt = $this->db->prepare("
                SELECT MAX(amount) as max_amount FROM bids WHERE auction_id = ?
            ");
            $highestBidStmt->execute([$auctionId]);
            $highestBid = $highestBidStmt->fetch();

            $newCurrentPrice = $highestBid['max_amount'] ?? $auction['starting_price'];
            
            $updateStmt = $this->db->prepare("UPDATE auctions SET current_price = ? WHERE id = ?");
            $updateStmt->execute([$newCurrentPrice, $auctionId]);

            $this->db->commit();

            Response::success(['message' => 'تم حذف المزايدة بنجاح']);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("AuctionsController::deleteBid error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف المزايدة', 500, 'SRV_001');
        }
    }

    /**
     * Update auction (admin only)
     * PUT /api/auctions/:id
     * Requirements: 6.4
     */
    public function update(int $id) {
        $data = Response::getJsonInput();

        try {
            // Check if auction exists
            $stmt = $this->db->prepare("SELECT * FROM auctions WHERE id = ?");
            $stmt->execute([$id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            $updates = [];
            $params = [];

            // Allowed fields for update - support both camelCase and snake_case
            $endTime = $data['endTime'] ?? $data['end_time'] ?? null;
            if ($endTime !== null) {
                // Convert ISO datetime to MySQL format
                $timestamp = strtotime($endTime);
                if ($timestamp === false) {
                    Response::error('صيغة وقت الانتهاء غير صحيحة', 400, 'VAL_001');
                }
                // Validate end time is in future
                if ($timestamp <= time()) {
                    Response::error('وقت الانتهاء يجب أن يكون في المستقبل', 400, 'VAL_001');
                }
                $updates[] = "end_time = ?";
                $params[] = date('Y-m-d H:i:s', $timestamp);
            }

            $status = $data['status'] ?? null;
            if ($status !== null) {
                $validStatuses = ['ACTIVE', 'ENDED', 'CANCELLED', 'SOLD'];
                if (!in_array(strtoupper($status), $validStatuses)) {
                    Response::error('حالة المزاد غير صالحة', 400, 'VAL_001');
                }
                $updates[] = "status = ?";
                $params[] = strtoupper($status);
            }

            $minIncrement = $data['minIncrement'] ?? $data['min_increment'] ?? null;
            if ($minIncrement !== null) {
                $updates[] = "min_increment = ?";
                $params[] = (float)$minIncrement;
            }

            if (empty($updates)) {
                Response::error('لا توجد بيانات للتحديث', 400, 'VAL_001');
            }

            $params[] = $id;
            $query = "UPDATE auctions SET " . implode(', ', $updates) . " WHERE id = ?";
            
            $updateStmt = $this->db->prepare($query);
            $updateStmt->execute($params);

            // Return updated auction
            $this->show($id);

        } catch (PDOException $e) {
            error_log("AuctionsController::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث المزاد', 500, 'SRV_001');
        }
    }

    /**
     * Cancel auction (admin only)
     * DELETE /api/auctions/:id
     * Requirements: 6.5
     */
    public function cancel(int $id) {
        try {
            // Check if auction exists
            $stmt = $this->db->prepare("SELECT * FROM auctions WHERE id = ?");
            $stmt->execute([$id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            // Update status to cancelled
            $updateStmt = $this->db->prepare("UPDATE auctions SET status = 'CANCELLED' WHERE id = ?");
            $updateStmt->execute([$id]);

            Response::success(['message' => 'تم إلغاء المزاد بنجاح']);

        } catch (PDOException $e) {
            error_log("AuctionsController::cancel error: " . $e->getMessage());
            Response::error('حدث خطأ في إلغاء المزاد', 500, 'SRV_001');
        }
    }

    /**
     * Delete auction (admin only)
     * DELETE /api/auctions/:id
     */
    public function delete(int $id) {
        try {
            // Check if auction exists
            $stmt = $this->db->prepare("SELECT * FROM auctions WHERE id = ?");
            $stmt->execute([$id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                Response::error('المزاد غير موجود', 404, 'AUCTION_NOT_FOUND');
            }

            $this->db->beginTransaction();

            // Delete all bids for this auction first
            $deleteBidsStmt = $this->db->prepare("DELETE FROM bids WHERE auction_id = ?");
            $deleteBidsStmt->execute([$id]);

            // Delete the auction
            $deleteStmt = $this->db->prepare("DELETE FROM auctions WHERE id = ?");
            $deleteStmt->execute([$id]);

            $this->db->commit();

            Response::success(['message' => 'تم حذف المزاد بنجاح']);

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("AuctionsController::delete error: " . $e->getMessage());
            Response::error('حدث خطأ في حذف المزاد', 500, 'SRV_001');
        }
    }


    /**
     * Validate bid data
     * Requirements: 4.3, 4.4, 4.5
     */
    public function validateBidData(array $data): array {
        $errors = [];

        // Validate bidder name is not empty
        if (empty($data['bidderName']) || trim($data['bidderName']) === '') {
            $errors['bidderName'] = 'اسم المزايد مطلوب';
        }

        // Validate phone number
        if (empty($data['phoneNumber'])) {
            $errors['phoneNumber'] = 'رقم الهاتف مطلوب';
        } elseif (!PhoneMasking::isValid($data['phoneNumber'])) {
            $errors['phoneNumber'] = 'رقم الهاتف غير صحيح';
        }

        // Validate amount
        if (!isset($data['amount'])) {
            $errors['amount'] = 'مبلغ العرض مطلوب';
        } elseif (!is_numeric($data['amount']) || (float)$data['amount'] <= 0) {
            $errors['amount'] = 'مبلغ العرض يجب أن يكون رقماً موجباً';
        }

        return $errors;
    }

    /**
     * Validate auction data for creation
     * Requirements: 1.4, 1.5
     */
    public function validateAuctionData(array $data): array {
        $errors = [];

        // Validate starting price
        if (!isset($data['startingPrice'])) {
            $errors['startingPrice'] = 'السعر الابتدائي مطلوب';
        } elseif (!is_numeric($data['startingPrice']) || (float)$data['startingPrice'] <= 0) {
            $errors['startingPrice'] = 'السعر الابتدائي يجب أن يكون رقماً موجباً';
        }

        // Validate end time is in future
        if (empty($data['endTime'])) {
            $errors['endTime'] = 'وقت انتهاء المزاد مطلوب';
        } elseif (strtotime($data['endTime']) <= time()) {
            $errors['endTime'] = 'وقت الانتهاء يجب أن يكون في المستقبل';
        }

        // Validate reserve price >= starting price (if provided)
        if (isset($data['reservePrice']) && $data['reservePrice'] !== null && $data['reservePrice'] !== '') {
            if (!is_numeric($data['reservePrice'])) {
                $errors['reservePrice'] = 'السعر الأدنى يجب أن يكون رقماً';
            } elseif (isset($data['startingPrice']) && (float)$data['reservePrice'] < (float)$data['startingPrice']) {
                $errors['reservePrice'] = 'السعر الأدنى يجب أن يكون أكبر من أو يساوي السعر الابتدائي';
            }
        }

        return $errors;
    }

    /**
     * Get filters from query string
     */
    private function getFilters(): array {
        return [
            'status' => $_GET['status'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'perPage' => $_GET['perPage'] ?? 12
        ];
    }

    /**
     * Format auction for response
     */
    private function formatAuction(array $auction): array {
        // Convert timestamps to Yemen timezone (UTC+3)
        $endTime = $this->convertToYemenTimezone($auction['end_time']);
        $createdAt = $this->convertToYemenTimezone($auction['created_at']);
        $updatedAt = $this->convertToYemenTimezone($auction['updated_at']);
        
        return [
            'id' => (int)$auction['id'],
            'carId' => (int)$auction['car_id'],
            'carName' => $auction['car_name'] ?? null,
            'brand' => $auction['brand'] ?? null,
            'model' => $auction['model'] ?? null,
            'year' => isset($auction['year']) ? (int)$auction['year'] : null,
            'condition' => $auction['car_condition'] ?? null,
            'startingPrice' => (float)$auction['starting_price'],
            'reservePrice' => $auction['reserve_price'] ? (float)$auction['reserve_price'] : null,
            'currentPrice' => (float)$auction['current_price'],
            'minIncrement' => (float)$auction['min_increment'],
            'endTime' => $endTime,
            'status' => $auction['status'],
            'bidCount' => (int)($auction['bid_count'] ?? 0),
            'thumbnail' => $auction['thumbnail'] ?? null,
            'createdAt' => $createdAt,
            'updatedAt' => $updatedAt
        ];
    }
    
    /**
     * Convert timestamp to Yemen timezone (UTC+3)
     */
    private function convertToYemenTimezone(?string $timestamp): ?string {
        if (!$timestamp) {
            return null;
        }
        
        try {
            $dt = new DateTime($timestamp, new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone('Asia/Aden'));
            return $dt->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            return $timestamp;
        }
    }

    /**
     * Format auction with bids for detailed response
     */
    private function formatAuctionWithBids(array $auction): array {
        $formatted = $this->formatAuction($auction);
        
        // Get inspection data for used cars
        $inspection = null;
        if ($auction['car_condition'] === 'USED') {
            $inspStmt = $this->db->prepare("SELECT * FROM car_inspection WHERE car_id = ?");
            $inspStmt->execute([$auction['car_id']]);
            $inspectionData = $inspStmt->fetch();
            
            if ($inspectionData) {
                // Get body parts
                $partsStmt = $this->db->prepare("SELECT * FROM car_body_parts WHERE car_id = ?");
                $partsStmt->execute([$auction['car_id']]);
                $bodyParts = $partsStmt->fetchAll();
                
                $inspection = [
                    'id' => (int)$inspectionData['id'],
                    'carId' => (int)$inspectionData['car_id'],
                    'bodyType' => $auction['body_type'] ?? null, // Get from cars table, not inspection
                    'mechanical' => [
                        'engine' => $inspectionData['engine_status'],
                        'transmission' => $inspectionData['transmission_status'],
                        'chassis' => $inspectionData['chassis_status'],
                        'technicalNotes' => $inspectionData['technical_notes'] ?? '',
                        'tires' => $inspectionData['tires_status'] ? json_decode($inspectionData['tires_status'], true) : null
                    ],
                    'bodyParts' => array_map(function($part) {
                        return [
                            'partId' => $part['part_id'],
                            'status' => $part['status']
                        ];
                    }, $bodyParts),
                    'damageDetails' => $inspectionData['damage_details'] ? $this->stripBase64PhotosFromDamageDetails(json_decode($inspectionData['damage_details'], true)) : null,
                    'createdAt' => $inspectionData['created_at'],
                    'updatedAt' => $inspectionData['updated_at']
                ];
            }
        }
        
        // Add car details
        $formatted['car'] = [
            'id' => (int)$auction['car_id'],
            'name' => $auction['car_name'],
            'brand' => $auction['brand'],
            'model' => $auction['model'],
            'year' => (int)$auction['year'],
            'condition' => $auction['car_condition'],
            'description' => $auction['description'] ?? '',
            'specifications' => $auction['specifications'] ?? '',
            'kilometers' => $auction['kilometers'] ? (int)$auction['kilometers'] : null,
            'origin' => $auction['origin'] ?? null,
            'bodyType' => $auction['body_type'] ?? null,
            'images' => isset($auction['images']) ? array_map(function($img) {
                return [
                    'id' => (int)$img['id'],
                    'url' => $img['url'],
                    'order' => (int)$img['image_order']
                ];
            }, $auction['images']) : [],
            'video' => isset($auction['video']) && $auction['video'] ? [
                'id' => (int)$auction['video']['id'],
                'url' => $auction['video']['url'],
                'type' => $auction['video']['video_type']
            ] : null,
            'inspection' => $inspection
        ];

        // Add bids with masked phone numbers
        $formatted['bids'] = isset($auction['bids']) ? array_map([$this, 'formatBid'], $auction['bids']) : [];

        // Add winner phone for admin only
        if ($this->isAdmin && !empty($auction['winner_phone'])) {
            $formatted['winnerPhone'] = $auction['winner_phone'];
        }

        return $formatted;
    }

    /**
     * Strip base64 photo data from damage details to reduce response size
     */
    private function stripBase64PhotosFromDamageDetails($damageDetails) {
        if (!$damageDetails || !is_array($damageDetails)) {
            return $damageDetails;
        }
        
        foreach ($damageDetails as $partKey => &$detail) {
            if (isset($detail['photos']) && is_array($detail['photos'])) {
                $detail['photos'] = array_filter($detail['photos'], function($photo) {
                    return !str_starts_with($photo, 'data:image');
                });
                $detail['photos'] = array_values($detail['photos']);
            }
        }
        
        return $damageDetails;
    }

    /**
     * Format bid for response
     * Requirements: 5.1, 5.3 - Mask phone numbers for non-admin
     */
    private function formatBid(array $bid): array {
        return [
            'id' => (int)$bid['id'],
            'auctionId' => (int)$bid['auction_id'],
            'bidderName' => $bid['bidder_name'],
            'maskedPhone' => PhoneMasking::mask($bid['phone_number']),
            'phoneNumber' => $this->isAdmin ? $bid['phone_number'] : null,
            'amount' => (float)$bid['amount'],
            'createdAt' => $this->convertToYemenTimezone($bid['created_at'])
        ];
    }
}
