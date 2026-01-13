-- Banner Management System Migration
-- نظام إدارة البانرات الإعلانية
-- Requirements: 1.1-1.5, 4.1-4.4, 6.1-6.4, 7.1-7.3, 8.1-8.4, 10.1-10.2

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;



-- =====================================================
-- Banners table
-- Requirements: 1.1-1.5, 4.1-4.4, 6.1-6.4, 7.1-7.3, 8.1-8.4, 10.1-10.2
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_mobile_url VARCHAR(500) NULL,
    link_url VARCHAR(500) NULL,
    link_target ENUM('_self', '_blank') DEFAULT '_blank',
    position ENUM('hero_top', 'hero_bottom', 'sidebar', 'cars_between', 'car_detail', 'footer_above', 'popup') NOT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    click_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_position (position),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    INDEX idx_schedule (start_date, end_date),
    INDEX idx_position_active (position, is_active),
    INDEX idx_position_active_order (position, is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data for Testing (Optional - Remove in Production)
-- =====================================================

-- Sample banners for testing
INSERT INTO banners (title, image_url, position, display_order, is_active, link_url)
VALUES
    ('بانر الصفحة الرئيسية', '/uploads/banners/hero_sample.jpg', 'hero_top', 0, 1, NULL),
    ('عرض خاص على السيارات', '/uploads/banners/offer_sample.jpg', 'hero_bottom', 0, 1, '/cars'),
    ('إعلان جانبي', '/uploads/banners/sidebar_sample.jpg', 'sidebar', 0, 1, NULL)
ON DUPLICATE KEY UPDATE title = title;
