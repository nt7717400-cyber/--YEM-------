-- Yemen Car Showroom Database Schema
-- MySQL Database for Hostinger

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;



-- =====================================================
-- Users table (Admin only)
-- Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Cars table
-- Requirements: 2.1, 3.1-3.9, 4.1-4.7, 7.5, 8.1-8.7, 11.1-11.3, 14.1-14.3
-- =====================================================
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    price_type ENUM('FIXED', 'AUCTION') DEFAULT 'FIXED',
    car_condition ENUM('NEW', 'USED') NOT NULL,
    body_type ENUM('sedan','hatchback','coupe','suv','crossover','pickup','van','minivan','truck') NULL,
    origin VARCHAR(50) NULL,
    kilometers INT NULL,
    description TEXT,
    specifications TEXT,
    status ENUM('AVAILABLE', 'SOLD') DEFAULT 'AVAILABLE',
    is_featured TINYINT(1) DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for filtering and sorting
    INDEX idx_brand (brand),
    INDEX idx_status (status),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_at (created_at),
    INDEX idx_year (year),
    INDEX idx_price (price),
    INDEX idx_price_type (price_type),
    INDEX idx_car_condition (car_condition),
    INDEX idx_body_type (body_type),
    INDEX idx_view_count (view_count),
    INDEX idx_origin (origin),
    -- Composite indexes for common queries
    INDEX idx_status_featured (status, is_featured),
    INDEX idx_status_brand (status, brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- Car inspection table (for used cars)
-- Requirements: 5.2, 5.3, 5.4, 5.5, 6.5
-- =====================================================
CREATE TABLE IF NOT EXISTS car_inspection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT UNIQUE NOT NULL,
    engine_status ENUM('original','replaced','refurbished') DEFAULT 'original',
    transmission_status ENUM('original','replaced') DEFAULT 'original',
    chassis_status ENUM('intact','accident_affected','modified') DEFAULT 'intact',
    technical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_car_id (car_id),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Car body parts status table (for used cars inspection)
-- Requirements: 3.1, 3.2, 4.2, 6.5
-- =====================================================
CREATE TABLE IF NOT EXISTS car_body_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    part_id VARCHAR(30) NOT NULL,
    status ENUM('original','painted','bodywork','accident','replaced','needs_check') DEFAULT 'original',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_car_part (car_id, part_id),
    INDEX idx_car_id (car_id),
    INDEX idx_part_id (part_id),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Car images table
-- Requirements: 9.1-9.7
-- =====================================================
CREATE TABLE IF NOT EXISTS car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    image_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_car_id (car_id),
    INDEX idx_image_order (image_order),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Car videos table
-- Requirements: 10.1-10.3
-- =====================================================
CREATE TABLE IF NOT EXISTS car_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT UNIQUE NOT NULL,
    video_type ENUM('YOUTUBE', 'UPLOAD') NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Settings table
-- Requirements: 5.1-5.4, 12.1-12.8
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(10) PRIMARY KEY DEFAULT 'main',
    name VARCHAR(100) DEFAULT 'معرض وحدة اليمن',
    description TEXT,
    address VARCHAR(255) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    whatsapp VARCHAR(20) DEFAULT '',
    working_hours VARCHAR(255) DEFAULT '',
    map_latitude DECIMAL(10, 8) NULL,
    map_longitude DECIMAL(11, 8) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Default Data Insertion
-- =====================================================

-- Insert default settings
INSERT INTO settings (id, name, description, address, phone, whatsapp, working_hours)
VALUES (
    'main',
    'معرض وحدة اليمن للسيارات',
    'معرض متخصص في بيع السيارات الجديدة والمستعملة بأفضل الأسعار وأعلى جودة. نقدم خدمات متميزة لعملائنا مع ضمان الجودة والمصداقية.',
    'صنعاء - شارع الستين',
    '+967777123456',
    '+967777123456',
    'السبت - الخميس: 8:00 صباحاً - 8:00 مساءً'
)
ON DUPLICATE KEY UPDATE id = id;

-- Insert default admin user
-- Default password: admin123 (MUST BE CHANGED IN PRODUCTION!)
-- Password hash generated using password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO users (username, password_hash)
VALUES (
    'admin',
    '$2y$10$KHHTnwEmd4iP2w0wbFZnP.Y35qM6UWh2rlBCr5WYXT3.bjW8Cs.Bu'
)
ON DUPLICATE KEY UPDATE password_hash = '$2y$10$KHHTnwEmd4iP2w0wbFZnP.Y35qM6UWh2rlBCr5WYXT3.bjW8Cs.Bu';


-- =====================================================
-- Sample Data for Testing (Optional - Remove in Production)
-- =====================================================

-- Sample cars data
INSERT INTO cars (name, brand, model, year, price, car_condition, kilometers, description, specifications, status, is_featured, view_count)
VALUES
    ('تويوتا كامري 2024', 'Toyota', 'Camry', 2024, 35000.00, 'NEW', NULL, 
     'سيارة تويوتا كامري موديل 2024 جديدة بالكامل، فل كامل مع جميع الإضافات.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 203 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 150),
    
    ('هوندا أكورد 2023', 'Honda', 'Accord', 2023, 32000.00, 'NEW', NULL,
     'هوندا أكورد 2023 سبورت، تصميم أنيق وأداء متميز.',
     'المحرك: 1.5 لتر تيربو\nالقوة: 192 حصان\nناقل الحركة: CVT\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 120),
    
    ('نيسان التيما 2022', 'Nissan', 'Altima', 2022, 25000.00, 'USED', 35000,
     'نيسان التيما 2022 مستخدمة بحالة ممتازة، صيانة دورية في الوكالة.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 188 حصان\nناقل الحركة: CVT\nنظام الدفع: أمامي',
     'AVAILABLE', 0, 85),
    
    ('هيونداي سوناتا 2023', 'Hyundai', 'Sonata', 2023, 28000.00, 'NEW', NULL,
     'هيونداي سوناتا 2023 فل كامل مع نظام ملاحة وكاميرا خلفية.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 191 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 95),
    
    ('كيا K5 2024', 'Kia', 'K5', 2024, 30000.00, 'NEW', NULL,
     'كيا K5 موديل 2024 GT-Line، تصميم رياضي وتقنيات متقدمة.',
     'المحرك: 1.6 لتر تيربو\nالقوة: 180 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 0, 70),
    
    ('تويوتا لاندكروزر 2023', 'Toyota', 'Land Cruiser', 2023, 85000.00, 'NEW', NULL,
     'تويوتا لاندكروزر 2023 VXR، سيارة دفع رباعي فاخرة.',
     'المحرك: 3.5 لتر V6 تيربو\nالقوة: 409 حصان\nناقل الحركة: أوتوماتيك 10 سرعات\nنظام الدفع: رباعي',
     'AVAILABLE', 1, 200),
    
    ('مرسيدس E-Class 2022', 'Mercedes', 'E-Class', 2022, 55000.00, 'USED', 20000,
     'مرسيدس E300 موديل 2022، حالة ممتازة مع تاريخ صيانة كامل.',
     'المحرك: 2.0 لتر تيربو\nالقوة: 255 حصان\nناقل الحركة: أوتوماتيك 9 سرعات\nنظام الدفع: خلفي',
     'AVAILABLE', 0, 180),
    
    ('بي إم دبليو X5 2021', 'BMW', 'X5', 2021, 65000.00, 'USED', 45000,
     'بي إم دبليو X5 xDrive40i، سيارة SUV فاخرة بحالة ممتازة.',
     'المحرك: 3.0 لتر 6 سلندر تيربو\nالقوة: 335 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: رباعي',
     'SOLD', 0, 250)
ON DUPLICATE KEY UPDATE name = name;

-- Sample car images
INSERT INTO car_images (car_id, url, image_order)
SELECT c.id, CONCAT('/uploads/images/car_', c.id, '_1.jpg'), 0
FROM cars c
WHERE NOT EXISTS (SELECT 1 FROM car_images ci WHERE ci.car_id = c.id);

-- =====================================================
-- Stored Procedures (Optional - for complex operations)
-- =====================================================

-- Procedure to get dashboard statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetDashboardStats()
BEGIN
    SELECT 
        COUNT(*) as total_cars,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_cars,
        SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END) as sold_cars,
        SUM(view_count) as total_views
    FROM cars;
END //
DELIMITER ;

-- Procedure to get most viewed cars
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetMostViewedCars(IN limit_count INT)
BEGIN
    SELECT * FROM cars 
    WHERE status = 'AVAILABLE'
    ORDER BY view_count DESC 
    LIMIT limit_count;
END //
DELIMITER ;

-- =====================================================
-- Views (Optional - for common queries)
-- =====================================================

-- View for available cars
CREATE OR REPLACE VIEW available_cars AS
SELECT * FROM cars WHERE status = 'AVAILABLE';

-- View for featured cars
CREATE OR REPLACE VIEW featured_cars AS
SELECT * FROM cars WHERE status = 'AVAILABLE' AND is_featured = 1;

-- View for cars with images
CREATE OR REPLACE VIEW cars_with_thumbnail AS
SELECT 
    c.*,
    (SELECT ci.url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.image_order LIMIT 1) as thumbnail
FROM cars c;


-- =====================================================
-- Auctions table (for auction system)
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
-- Bids table (for auction system)
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
