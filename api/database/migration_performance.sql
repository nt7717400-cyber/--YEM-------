-- Migration: Performance Optimization Indexes
-- تحسين أداء الاستعلامات
-- Date: 2026-01-09

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- Optimized Indexes for cars table
-- =====================================================

-- Composite index for common listing queries (status + created_at)
CREATE INDEX idx_cars_status_created ON cars(status, created_at DESC);

-- Composite index for featured cars listing
CREATE INDEX idx_cars_status_featured_created ON cars(status, is_featured, created_at DESC);

-- Composite index for price sorting
CREATE INDEX idx_cars_status_price ON cars(status, price);

-- Composite index for brand filtering
CREATE INDEX idx_cars_status_brand_created ON cars(status, brand, created_at DESC);

-- Composite index for condition filtering
CREATE INDEX idx_cars_status_condition_created ON cars(status, car_condition, created_at DESC);

-- Composite index for year filtering
CREATE INDEX idx_cars_status_year_created ON cars(status, year, created_at DESC);

-- =====================================================
-- Optimized Indexes for car_images table
-- =====================================================

-- Composite index for thumbnail query (car_id + image_order)
CREATE INDEX idx_car_images_car_order ON car_images(car_id, image_order);

-- =====================================================
-- Optimized Indexes for auctions table
-- =====================================================

-- Composite index for active auctions listing
CREATE INDEX idx_auctions_status_endtime ON auctions(status, end_time);

-- Index for car lookup
CREATE INDEX idx_auctions_car_id ON auctions(car_id);

-- =====================================================
-- Optimized Indexes for bids table
-- =====================================================

-- Composite index for auction bids listing
CREATE INDEX idx_bids_auction_created ON bids(auction_id, created_at DESC);

-- Index for highest bid lookup
CREATE INDEX idx_bids_auction_amount ON bids(auction_id, amount DESC);

-- =====================================================
-- Optimized Indexes for banners table
-- =====================================================

-- Composite index for active banners by position
CREATE INDEX idx_banners_position_active_order ON banners(position, is_active, display_order);

-- Composite index for scheduled banners
CREATE INDEX idx_banners_active_dates ON banners(is_active, start_date, end_date);

-- =====================================================
-- Optimized Indexes for car_body_parts table
-- =====================================================

-- Composite index for car parts lookup
CREATE INDEX idx_car_body_parts_car_part ON car_body_parts(car_id, part_id);
