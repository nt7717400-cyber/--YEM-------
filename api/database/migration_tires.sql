-- Migration: Add tires status to car_inspection table
-- Date: 2026-01-08

-- Add tires_status column to store tire conditions as JSON
ALTER TABLE car_inspection 
ADD COLUMN tires_status JSON DEFAULT NULL 
COMMENT 'JSON object storing tire status for each position: front_left, front_right, rear_left, rear_right, spare';

-- Example tires_status JSON structure:
-- {
--   "front_left": "new",      -- جديد
--   "front_right": "used_50", -- مستهلك 50%
--   "rear_left": "new",       -- جديد
--   "rear_right": "damaged",  -- تالف - يحتاج تغيير
--   "spare": "new"            -- الاحتياطي
-- }
-- Valid values: "new", "used_50", "damaged"
