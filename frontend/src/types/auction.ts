/**
 * Auction System Types
 * نظام المزايدة
 */

import type { Car } from './car';

// Price type for cars - نوع التسعير
export type PriceType = 'FIXED' | 'AUCTION';

// Auction status - حالة المزاد
export type AuctionStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'SOLD';

// Auction interface - واجهة المزاد
export interface Auction {
  id: number;
  carId: number;
  startingPrice: number;
  reservePrice: number | null;
  currentPrice: number;
  minIncrement: number;
  endTime: string;
  status: AuctionStatus;
  winnerPhone: string | null;
  bidCount: number;
  bids: Bid[];
  car: Car;
  createdAt: string;
  updatedAt: string;
}

// Bid interface - واجهة العرض
export interface Bid {
  id: number;
  auctionId: number;
  bidderName: string;
  maskedPhone: string; // 777***456
  phoneNumber?: string | null; // Full phone for admin
  amount: number;
  createdAt: string;
}

// Place bid input - مدخلات تقديم عرض
export interface PlaceBidInput {
  bidderName: string;
  phoneNumber: string;
  amount: number;
}

// Create auction input - مدخلات إنشاء مزاد (used when creating car with auction)
export interface CreateAuctionInput {
  startingPrice: number;
  reservePrice?: number;
  minIncrement?: number;
  endTime: string;
}

// Update auction input - مدخلات تحديث المزاد
export interface UpdateAuctionInput {
  endTime?: string;
  status?: AuctionStatus;
  minIncrement?: number;
}

// Auction filters - فلاتر المزادات
export interface AuctionFilters {
  status?: AuctionStatus;
  carId?: number;
}
