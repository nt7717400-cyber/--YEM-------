-- Migration: Car Inspection System
-- نظام فحص السيارات المستعملة بمجسم ثلاثي الأبعاد
-- Requirements: 1.1, 1.2, 3.1, 3.2, 4.2, 5.2, 5.3, 5.4, 5.5, 6.5

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- Task 1.1: Add body_type column to cars table
-- Requirements: 1.1, 1.2
-- =====================================================
-- Note: Run this only if body_type column doesn't exist
-- If you get "Duplicate column" error, skip this statement

-- First, check if column exists and add it if not
-- Using a procedure to handle the conditional logic

DELIMITER //

DROP PROCEDURE IF EXISTS add_body_type_column//

CREATE PROCEDURE add_body_type_column()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cars' 
    AND COLUMN_NAME = 'body_type';
    
    IF column_exists = 0 THEN
        ALTER TABLE cars ADD COLUMN body_type 
            ENUM('sedan','hatchback','coupe','suv','crossover','pickup','van','minivan','truck') 
            NULL AFTER car_condition;
    END IF;
END//

DELIMITER ;

CALL add_body_type_column();
DROP PROCEDURE IF EXISTS add_body_type_column;

-- =====================================================
-- Task 1.2: Create car_inspection table
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
-- Task 1.3: Create car_body_parts table
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
