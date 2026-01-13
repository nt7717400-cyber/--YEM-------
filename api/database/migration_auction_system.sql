-- =====================================================
-- Auction System Migration
-- نظام المزايدة - تحديثات قاعدة البيانات
-- Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
-- =====================================================

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;



-- =====================================================
-- 1.1 Add price_type column to cars table
-- Requirements: 7.5
-- =====================================================
ALTER TABLE cars 
ADD COLUMN price_type ENUM('FIXED', 'AUCTION') DEFAULT 'FIXED' 
AFTER price;

-- Add index for price_type filtering
ALTER TABLE cars ADD INDEX idx_price_type (price_type);

-- =====================================================
-- 1.2 Create auctions table
-- Requirements: 7.1, 7.3
-- =====================================================
CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT UNIQUE NOT NULL,
    starting_price DECIMAL(12, 2) NOT NULL,
    reserve_price DECIMAL(12, 2) NULL,
    current_price DECIMAL(12, 2) NOT NULL,
    min_increment DECIMAL(12, 2) DEFAULT 100.00,
    end_time DATETIME NOT NULL,
    status ENUM('ACTIVE', 'ENDED', 'CANCELLED', 'SOLD') DEFAULT 'ACTIVE',
    winner_phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_car_id (car_id),
    INDEX idx_status (status),
    INDEX idx_end_time (end_time),
    INDEX idx_status_end_time (status, end_time),
    
    -- Foreign key to cars table
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 1.3 Create bids table
-- Requirements: 7.2, 7.4
-- =====================================================
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_auction_id (auction_id),
    INDEX idx_amount (amount DESC),
    INDEX idx_created_at (created_at),
    INDEX idx_auction_amount (auction_id, amount DESC),
    
    -- Foreign key to auctions table
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Views for auction system
-- =====================================================

-- View for active auctions with car details
CREATE OR REPLACE VIEW active_auctions AS
SELECT 
    a.*,
    c.name as car_name,
    c.brand,
    c.model,
    c.year,
    c.car_condition,
    (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.id) as bid_count,
    (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail
FROM auctions a
JOIN cars c ON a.car_id = c.id
WHERE a.status = 'ACTIVE' AND a.end_time > NOW();

-- View for auction cars (cars with price_type = 'AUCTION')
CREATE OR REPLACE VIEW auction_cars AS
SELECT c.*, a.id as auction_id, a.starting_price, a.current_price, a.end_time, a.status as auction_status
FROM cars c
JOIN auctions a ON c.id = a.car_id
WHERE c.price_type = 'AUCTION';
