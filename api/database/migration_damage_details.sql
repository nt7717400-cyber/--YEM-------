-- Migration: Add damage_details column to car_inspection table
-- This column stores extended damage information including photos, notes, and severity

ALTER TABLE car_inspection 
ADD COLUMN damage_details LONGTEXT NULL COMMENT 'JSON containing extended damage details with photos and notes';

-- Example structure of damage_details JSON:
-- {
--   "front_bumper": {
--     "partKey": "front_bumper",
--     "condition": "broken",
--     "severity": "severe",
--     "notes": "تم الاصطدام من الأمام",
--     "photos": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."],
--     "updatedAt": "2025-01-08T12:00:00.000Z"
--   }
-- }
