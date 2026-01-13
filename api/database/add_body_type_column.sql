-- Add body_type column to cars table
-- تشغيل هذا الملف فقط إذا لم يكن العمود موجوداً
-- Run this file ONLY if body_type column doesn't exist

-- Check first by running:
-- SHOW COLUMNS FROM cars LIKE 'body_type';
-- If it returns empty, run the ALTER TABLE below

ALTER TABLE cars ADD COLUMN body_type 
    ENUM('sedan','hatchback','coupe','suv','crossover','pickup','van','minivan','truck') 
    NULL AFTER car_condition;

-- Add index for better performance
ALTER TABLE cars ADD INDEX idx_body_type (body_type);
