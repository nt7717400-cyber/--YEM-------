-- Migration: Vehicle Damage System (VDS)
-- نظام فحص المركبات التفاعلي ثنائي الأبعاد
-- Requirements: 4.1, 5.1, 6.1, 8.1

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- Task 2.1: Create VDS Tables
-- =====================================================

-- =====================================================
-- Car Templates Table
-- Requirements: 6.1, 6.2, 6.4, 6.5
-- Stores SVG templates for different car body types
-- =====================================================
CREATE TABLE IF NOT EXISTS car_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    type ENUM('sedan','suv','hatchback','coupe','pickup','van') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    svg_front TEXT NOT NULL,
    svg_rear TEXT NOT NULL,
    svg_left_side TEXT NOT NULL,
    svg_right_side TEXT NOT NULL,
    svg_top TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Part Keys Dictionary Table
-- Requirements: 5.1, 5.3, 5.4
-- Master dictionary of all car parts with bilingual labels
-- =====================================================
CREATE TABLE IF NOT EXISTS part_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_key VARCHAR(50) UNIQUE NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    category ENUM('front','rear','left','right','top','wheels') NOT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_part_key (part_key),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Template Part Mappings Table
-- Requirements: 6.3, 6.6
-- Maps parts to SVG elements for each template
-- =====================================================
CREATE TABLE IF NOT EXISTS template_part_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    part_key VARCHAR(50) NOT NULL,
    svg_element_id VARCHAR(100) NOT NULL,
    view_angles JSON NOT NULL, -- ["front", "left_side"]
    is_visible TINYINT(1) DEFAULT 1,
    
    FOREIGN KEY (template_id) REFERENCES car_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (part_key) REFERENCES part_keys(part_key) ON DELETE CASCADE,
    UNIQUE KEY unique_template_part (template_id, part_key),
    INDEX idx_template_id (template_id),
    INDEX idx_part_key (part_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Color Mappings Table
-- Requirements: 4.1, 4.2, 4.4
-- Unified color scheme for part conditions
-- =====================================================
CREATE TABLE IF NOT EXISTS color_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    condition_key ENUM('good','scratch','bodywork','broken','painted','replaced','not_inspected') NOT NULL UNIQUE,
    color_hex VARCHAR(7) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_en VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_condition_key (condition_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- Task 2.2: Inspection Tables
-- =====================================================

-- =====================================================
-- Inspections Table
-- Requirements: 8.1, 8.2, 8.3, 8.4
-- Main inspection records with vehicle and customer info
-- =====================================================
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NULL,
    template_id INT NOT NULL,
    
    -- Vehicle Info (can be standalone or linked to car)
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INT,
    vehicle_vin VARCHAR(50),
    vehicle_plate VARCHAR(20),
    vehicle_color VARCHAR(30),
    vehicle_mileage INT,
    
    -- Customer Info
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    
    -- Inspector Info
    inspector_id INT NULL,
    inspector_name VARCHAR(100),
    
    -- Status
    status ENUM('draft','finalized') DEFAULT 'draft',
    finalized_at TIMESTAMP NULL,
    
    -- Notes
    general_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES car_templates(id),
    INDEX idx_status (status),
    INDEX idx_car_id (car_id),
    INDEX idx_template_id (template_id),
    INDEX idx_created_at (created_at),
    INDEX idx_finalized_at (finalized_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Inspection Parts Table (Damage Records)
-- Requirements: 3.1, 3.2, 8.1
-- Individual part damage records for each inspection
-- =====================================================
CREATE TABLE IF NOT EXISTS inspection_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    part_key VARCHAR(50) NOT NULL,
    condition_status ENUM('good','scratch','bodywork','broken','painted','replaced') NOT NULL,
    severity ENUM('light','medium','severe') NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (part_key) REFERENCES part_keys(part_key) ON DELETE CASCADE,
    UNIQUE KEY unique_inspection_part (inspection_id, part_key),
    INDEX idx_inspection_id (inspection_id),
    INDEX idx_part_key (part_key),
    INDEX idx_condition_status (condition_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Inspection Part Photos Table
-- Requirements: 3.5, 3.6
-- Photos attached to damaged parts
-- =====================================================
CREATE TABLE IF NOT EXISTS inspection_part_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_part_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_part_id) REFERENCES inspection_parts(id) ON DELETE CASCADE,
    INDEX idx_inspection_part_id (inspection_part_id),
    INDEX idx_photo_order (photo_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- Task 2.3: Default Data Insertion
-- =====================================================

-- =====================================================
-- Insert Default Color Mappings (7 colors)
-- Requirements: 4.1
-- =====================================================
INSERT INTO color_mappings (condition_key, color_hex, label_ar, label_en, sort_order) VALUES
('good', '#22c55e', 'سليم', 'Good', 1),
('scratch', '#eab308', 'خدش', 'Scratch', 2),
('bodywork', '#f97316', 'سمكرة', 'Bodywork', 3),
('broken', '#ef4444', 'كسر', 'Broken', 4),
('painted', '#3b82f6', 'رش', 'Painted', 5),
('replaced', '#8b5cf6', 'تغيير', 'Replaced', 6),
('not_inspected', '#9ca3af', 'غير محدد', 'Not Inspected', 7)
ON DUPLICATE KEY UPDATE 
    color_hex = VALUES(color_hex),
    label_ar = VALUES(label_ar),
    label_en = VALUES(label_en),
    sort_order = VALUES(sort_order);

-- =====================================================
-- Insert Default Part Keys (25 parts)
-- Requirements: 5.1, 5.4
-- =====================================================
INSERT INTO part_keys (part_key, label_ar, label_en, category, sort_order) VALUES
-- Front (6 parts)
('front_bumper', 'الصدام الأمامي', 'Front Bumper', 'front', 1),
('hood', 'الكبوت', 'Hood', 'front', 2),
('front_grille', 'الشبك الأمامي', 'Front Grille', 'front', 3),
('headlight_left', 'المصباح الأمامي الأيسر', 'Left Headlight', 'front', 4),
('headlight_right', 'المصباح الأمامي الأيمن', 'Right Headlight', 'front', 5),
('front_windshield', 'الزجاج الأمامي', 'Front Windshield', 'front', 6),
-- Rear (5 parts)
('rear_bumper', 'الصدام الخلفي', 'Rear Bumper', 'rear', 1),
('trunk', 'الشنطة', 'Trunk', 'rear', 2),
('taillight_left', 'المصباح الخلفي الأيسر', 'Left Taillight', 'rear', 3),
('taillight_right', 'المصباح الخلفي الأيمن', 'Right Taillight', 'rear', 4),
('rear_windshield', 'الزجاج الخلفي', 'Rear Windshield', 'rear', 5),
-- Left Side (7 parts)
('left_front_door', 'الباب الأمامي الأيسر', 'Left Front Door', 'left', 1),
('left_rear_door', 'الباب الخلفي الأيسر', 'Left Rear Door', 'left', 2),
('left_front_fender', 'الرفرف الأمامي الأيسر', 'Left Front Fender', 'left', 3),
('left_rear_quarter', 'الربع الخلفي الأيسر', 'Left Rear Quarter', 'left', 4),
('left_mirror', 'المرآة اليسرى', 'Left Mirror', 'left', 5),
('left_front_window', 'النافذة الأمامية اليسرى', 'Left Front Window', 'left', 6),
('left_rear_window', 'النافذة الخلفية اليسرى', 'Left Rear Window', 'left', 7),
-- Right Side (7 parts)
('right_front_door', 'الباب الأمامي الأيمن', 'Right Front Door', 'right', 1),
('right_rear_door', 'الباب الخلفي الأيمن', 'Right Rear Door', 'right', 2),
('right_front_fender', 'الرفرف الأمامي الأيمن', 'Right Front Fender', 'right', 3),
('right_rear_quarter', 'الربع الخلفي الأيمن', 'Right Rear Quarter', 'right', 4),
('right_mirror', 'المرآة اليمنى', 'Right Mirror', 'right', 5),
('right_front_window', 'النافذة الأمامية اليمنى', 'Right Front Window', 'right', 6),
('right_rear_window', 'النافذة الخلفية اليمنى', 'Right Rear Window', 'right', 7)
ON DUPLICATE KEY UPDATE 
    label_ar = VALUES(label_ar),
    label_en = VALUES(label_en),
    category = VALUES(category),
    sort_order = VALUES(sort_order);

-- =====================================================
-- Insert Additional Parts (Top and Wheels - 6 parts)
-- Requirements: 5.1
-- =====================================================
INSERT INTO part_keys (part_key, label_ar, label_en, category, sort_order) VALUES
-- Top (2 parts)
('roof', 'السقف', 'Roof', 'top', 1),
('sunroof', 'الفتحة السقفية', 'Sunroof', 'top', 2),
-- Wheels (4 parts)
('wheel_front_left', 'العجلة الأمامية اليسرى', 'Front Left Wheel', 'wheels', 1),
('wheel_front_right', 'العجلة الأمامية اليمنى', 'Front Right Wheel', 'wheels', 2),
('wheel_rear_left', 'العجلة الخلفية اليسرى', 'Rear Left Wheel', 'wheels', 3),
('wheel_rear_right', 'العجلة الخلفية اليمنى', 'Rear Right Wheel', 'wheels', 4)
ON DUPLICATE KEY UPDATE 
    label_ar = VALUES(label_ar),
    label_en = VALUES(label_en),
    category = VALUES(category),
    sort_order = VALUES(sort_order);

-- =====================================================
-- Insert Default Sedan Template (placeholder SVGs)
-- Requirements: 6.1, 6.5
-- =====================================================
INSERT INTO car_templates (name_ar, name_en, type, is_active, is_default, svg_front, svg_rear, svg_left_side, svg_right_side, svg_top) VALUES
('سيدان', 'Sedan', 'sedan', 1, 1, 
 '<!-- Sedan Front SVG Placeholder --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><text x="200" y="150" text-anchor="middle">Front View</text></svg>',
 '<!-- Sedan Rear SVG Placeholder --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><text x="200" y="150" text-anchor="middle">Rear View</text></svg>',
 '<!-- Sedan Left Side SVG Placeholder --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><text x="300" y="150" text-anchor="middle">Left Side View</text></svg>',
 '<!-- Sedan Right Side SVG Placeholder --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><text x="300" y="150" text-anchor="middle">Right Side View</text></svg>',
 '<!-- Sedan Top SVG Placeholder --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><text x="300" y="150" text-anchor="middle">Top View</text></svg>')
ON DUPLICATE KEY UPDATE 
    name_ar = VALUES(name_ar),
    name_en = VALUES(name_en);

-- =====================================================
-- Views for VDS
-- =====================================================

-- View for active inspections with template info
CREATE OR REPLACE VIEW vds_inspections_view AS
SELECT 
    i.*,
    ct.name_ar as template_name_ar,
    ct.name_en as template_name_en,
    ct.type as template_type,
    c.name as car_name,
    c.brand as car_brand,
    (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id) as parts_count,
    (SELECT COUNT(*) FROM inspection_parts ip WHERE ip.inspection_id = i.id AND ip.condition_status != 'good') as damaged_parts_count
FROM inspections i
LEFT JOIN car_templates ct ON i.template_id = ct.id
LEFT JOIN cars c ON i.car_id = c.id;

-- View for inspection parts with labels
CREATE OR REPLACE VIEW vds_inspection_parts_view AS
SELECT 
    ip.*,
    pk.label_ar as part_label_ar,
    pk.label_en as part_label_en,
    pk.category as part_category,
    cm.color_hex as condition_color,
    cm.label_ar as condition_label_ar,
    cm.label_en as condition_label_en,
    (SELECT COUNT(*) FROM inspection_part_photos ipp WHERE ipp.inspection_part_id = ip.id) as photos_count
FROM inspection_parts ip
LEFT JOIN part_keys pk ON ip.part_key = pk.part_key
LEFT JOIN color_mappings cm ON ip.condition_status = cm.condition_key;

