<?php
/**
 * Stats Controller
 * Dashboard statistics
 * Requirements: 7.1-7.5
 */

class StatsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get dashboard statistics
     * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
     * GET /api/stats
     */
    public function getDashboardStats() {
        try {
            // Get car counts
            // Requirements: 7.1 - total cars
            // Requirements: 7.2 - available cars
            // Requirements: 7.3 - sold cars
            // Requirements: 7.4 - total views
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total_cars,
                    SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_cars,
                    SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END) as sold_cars,
                    COALESCE(SUM(view_count), 0) as total_views
                FROM cars
            ");
            $stats = $stmt->fetch();

            // Get most viewed cars
            // Requirements: 7.5
            $mostViewedStmt = $this->db->query("
                SELECT c.*, 
                       (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail
                FROM cars c
                WHERE c.status = 'AVAILABLE'
                ORDER BY c.view_count DESC
                LIMIT 5
            ");
            $mostViewedCars = $mostViewedStmt->fetchAll();

            // Get featured cars count
            $featuredStmt = $this->db->query("
                SELECT COUNT(*) as featured_count
                FROM cars
                WHERE is_featured = 1 AND status = 'AVAILABLE'
            ");
            $featuredCount = $featuredStmt->fetch()['featured_count'];

            // Get recent cars (last 7 days)
            $recentStmt = $this->db->query("
                SELECT COUNT(*) as recent_count
                FROM cars
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $recentCount = $recentStmt->fetch()['recent_count'];

            // Get brands distribution
            $brandsStmt = $this->db->query("
                SELECT brand, COUNT(*) as count
                FROM cars
                WHERE status = 'AVAILABLE'
                GROUP BY brand
                ORDER BY count DESC
                LIMIT 10
            ");
            $brandDistribution = $brandsStmt->fetchAll();

            Response::success([
                'totalCars' => (int)$stats['total_cars'],
                'availableCars' => (int)$stats['available_cars'],
                'soldCars' => (int)$stats['sold_cars'],
                'totalViews' => (int)$stats['total_views'],
                'featuredCars' => (int)$featuredCount,
                'recentCars' => (int)$recentCount,
                'mostViewedCars' => array_map([$this, 'formatCarSummary'], $mostViewedCars),
                'brandDistribution' => array_map(function($item) {
                    return [
                        'brand' => $item['brand'],
                        'count' => (int)$item['count']
                    ];
                }, $brandDistribution)
            ]);

        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب الإحصائيات', 500, 'SRV_001');
        }
    }

    /**
     * Format car summary for stats
     */
    private function formatCarSummary($car) {
        return [
            'id' => (int)$car['id'],
            'name' => $car['name'],
            'brand' => $car['brand'],
            'model' => $car['model'],
            'year' => (int)$car['year'],
            'price' => (float)$car['price'],
            'viewCount' => (int)$car['view_count'],
            'thumbnail' => $car['thumbnail'] ?? null
        ];
    }
}
