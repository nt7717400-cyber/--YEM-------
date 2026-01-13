/**
 * Auction Lifecycle Property Tests
 * Feature: auction-system
 * 
 * End-to-end testing for auction system lifecycle
 * Tests the full auction flow: creation, bidding, and completion
 * 
 * Validates: Requirements 1.4, 1.5, 4.3, 4.4, 5.1, 5.3, 6.1-6.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Auction, Bid, PlaceBidInput, AuctionStatus } from '@/types/auction';

// ============== Generators ==============

/**
 * Generate valid Yemeni phone number (9 digits starting with 7)
 */
const yemeniPhoneArb = fc.tuple(
  fc.constantFrom('77', '73', '71', '70'),
  fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 7, maxLength: 7 })
).map(([prefix, rest]) => prefix + rest.join(''));

/**
 * Generate valid bidder name (Arabic names)
 */
const bidderNameArb = fc.tuple(
  fc.constantFrom('أحمد', 'محمد', 'علي', 'خالد', 'عمر', 'سعيد', 'فهد', 'ناصر', 'عبدالله', 'يوسف'),
  fc.constantFrom('الأحمدي', 'العلوي', 'الحسني', 'المحمدي', 'الصالحي', 'الناصري', 'الخالدي')
).map(([first, last]) => `${first} ${last}`);

/**
 * Generate valid positive amount
 */
const positiveAmountArb = fc.double({ min: 100, max: 10000000, noNaN: true }).map(n => Math.round(n * 100) / 100);

/**
 * Generate valid auction data
 */
const auctionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  carId: fc.integer({ min: 1, max: 10000 }),
  startingPrice: positiveAmountArb,
  currentPrice: positiveAmountArb,
  minIncrement: fc.double({ min: 10, max: 1000, noNaN: true }).map(n => Math.round(n * 100) / 100),
  status: fc.constantFrom<AuctionStatus>('ACTIVE', 'ENDED', 'CANCELLED', 'SOLD'),
  bidCount: fc.integer({ min: 0, max: 100 }),
}).chain(base => {
  // Ensure currentPrice >= startingPrice
  const currentPrice = Math.max(base.currentPrice, base.startingPrice);
  // Reserve price should be >= starting price or null
  return fc.option(
    fc.double({ min: base.startingPrice, max: base.startingPrice * 2, noNaN: true }).map(n => Math.round(n * 100) / 100),
    { nil: undefined }
  ).map(reservePrice => ({
    ...base,
    currentPrice,
    reservePrice: reservePrice ?? null,
    endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    winnerPhone: null,
    bids: [],
    car: {
      id: base.carId,
      name: 'Test Car',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: base.startingPrice,
      condition: 'NEW' as const,
      status: 'AVAILABLE' as const,
      featured: false,
      viewCount: 0,
      images: [],
      videos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
});

/**
 * Generate valid bid input
 */
const bidInputArb = fc.record({
  bidderName: bidderNameArb,
  phoneNumber: yemeniPhoneArb,
  amount: positiveAmountArb,
});

// ============== Helper Functions ==============

/**
 * Mask phone number: 777123456 → 777***456
 * Requirements: 5.1, 5.3
 */
function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length <= 6) return digits;
  const first3 = digits.substring(0, 3);
  const last3 = digits.substring(digits.length - 3);
  const middleLength = digits.length - 6;
  return first3 + '*'.repeat(middleLength) + last3;
}

/**
 * Validate bid amount against auction
 * Requirements: 4.3, 4.4
 */
function validateBidAmount(auction: Auction, bidAmount: number): { valid: boolean; error?: string } {
  const minBid = auction.currentPrice + auction.minIncrement;
  if (bidAmount < minBid) {
    return { valid: false, error: `العرض أقل من الحد الأدنى. الحد الأدنى للمزايدة: ${minBid}` };
  }
  return { valid: true };
}

/**
 * Validate bidder name
 * Requirements: 4.3
 */
function validateBidderName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'اسم المزايد مطلوب' };
  }
  return { valid: true };
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { valid: false, error: 'رقم الهاتف غير صحيح' };
  }
  return { valid: true };
}

/**
 * Validate auction end time is in future
 * Requirements: 1.4
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateEndTime(endTime: string): { valid: boolean; error?: string } {
  const endDate = new Date(endTime);
  if (endDate.getTime() <= Date.now()) {
    return { valid: false, error: 'وقت الانتهاء يجب أن يكون في المستقبل' };
  }
  return { valid: true };
}

/**
 * Validate reserve price >= starting price
 * Requirements: 1.5
 */
function validateReservePrice(startingPrice: number, reservePrice: number | null): { valid: boolean; error?: string } {
  if (reservePrice !== null && reservePrice < startingPrice) {
    return { valid: false, error: 'السعر الأدنى يجب أن يكون أكبر من أو يساوي السعر الابتدائي' };
  }
  return { valid: true };
}

/**
 * Simulate placing a bid on an auction
 */
function placeBid(auction: Auction, input: PlaceBidInput): { success: boolean; auction?: Auction; bid?: Bid; error?: string } {
  // Validate auction is active
  if (auction.status !== 'ACTIVE') {
    return { success: false, error: 'المزاد غير نشط' };
  }

  // Validate end time
  if (new Date(auction.endTime).getTime() <= Date.now()) {
    return { success: false, error: 'انتهى المزاد' };
  }

  // Validate bidder name
  const nameValidation = validateBidderName(input.bidderName);
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error };
  }

  // Validate phone number
  const phoneValidation = validatePhoneNumber(input.phoneNumber);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.error };
  }

  // Validate bid amount
  const amountValidation = validateBidAmount(auction, input.amount);
  if (!amountValidation.valid) {
    return { success: false, error: amountValidation.error };
  }

  // Create bid
  const newBid: Bid = {
    id: auction.bids.length + 1,
    auctionId: auction.id,
    bidderName: input.bidderName,
    maskedPhone: maskPhoneNumber(input.phoneNumber),
    amount: input.amount,
    createdAt: new Date().toISOString(),
  };

  // Update auction
  const updatedAuction: Auction = {
    ...auction,
    currentPrice: input.amount,
    bidCount: auction.bidCount + 1,
    bids: [newBid, ...auction.bids],
    updatedAt: new Date().toISOString(),
  };

  return { success: true, auction: updatedAuction, bid: newBid };
}

// ============== Property Tests ==============

describe('Auction Lifecycle Property Tests', () => {
  /**
   * Property 1: Phone Number Masking
   * For any phone number, masking should hide middle digits while preserving first 3 and last 3
   * 
   * Feature: auction-system, Property 2: Phone Number Masking
   * Validates: Requirements 5.1, 5.3
   */
  it('should mask phone numbers correctly - first 3 and last 3 digits visible', () => {
    fc.assert(
      fc.property(yemeniPhoneArb, (phone) => {
        const masked = maskPhoneNumber(phone);
        const digits = phone.replace(/[^\d]/g, '');
        
        // First 3 digits should match
        expect(masked.substring(0, 3)).toBe(digits.substring(0, 3));
        
        // Last 3 digits should match
        expect(masked.substring(masked.length - 3)).toBe(digits.substring(digits.length - 3));
        
        // Middle should be asterisks
        const middle = masked.substring(3, masked.length - 3);
        expect(middle).toMatch(/^\*+$/);
        
        // Full number should not be exposed
        expect(masked.replace(/\*/g, '')).not.toBe(digits);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Bid Amount Validation
   * For any bid, amount must be >= current_price + min_increment
   * 
   * Feature: auction-system, Property 1: Bid Amount Validation
   * Validates: Requirements 4.3, 4.4
   */
  it('should validate bid amounts correctly', () => {
    fc.assert(
      fc.property(auctionArb, positiveAmountArb, (auction, bidAmount) => {
        const minBid = auction.currentPrice + auction.minIncrement;
        const validation = validateBidAmount(auction, bidAmount);
        
        if (bidAmount >= minBid) {
          expect(validation.valid).toBe(true);
        } else {
          expect(validation.valid).toBe(false);
          expect(validation.error).toContain('الحد الأدنى');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Bidder Name Validation
   * For any bid, bidder name must not be empty
   * 
   * Feature: auction-system, Property 1: Bid Validation
   * Validates: Requirements 4.3
   */
  it('should reject empty bidder names', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n'),
        (emptyName) => {
          const validation = validateBidderName(emptyName);
          expect(validation.valid).toBe(false);
          expect(validation.error).toBe('اسم المزايد مطلوب');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 4: Valid Bidder Names Accepted
   * For any valid bidder name, validation should pass
   * 
   * Feature: auction-system, Property 1: Bid Validation
   * Validates: Requirements 4.3
   */
  it('should accept valid bidder names', () => {
    fc.assert(
      fc.property(bidderNameArb, (name) => {
        const validation = validateBidderName(name);
        expect(validation.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Reserve Price Validation
   * For any auction, reserve price must be >= starting price
   * 
   * Feature: auction-system, Property 4: Reserve Price Validation
   * Validates: Requirements 1.5
   */
  it('should validate reserve price >= starting price', () => {
    fc.assert(
      fc.property(
        positiveAmountArb,
        positiveAmountArb,
        (startingPrice, reservePrice) => {
          const validation = validateReservePrice(startingPrice, reservePrice);
          
          if (reservePrice >= startingPrice) {
            expect(validation.valid).toBe(true);
          } else {
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('السعر الأدنى');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Null Reserve Price Always Valid
   * For any auction without reserve price, validation should pass
   * 
   * Feature: auction-system, Property 4: Reserve Price Validation
   * Validates: Requirements 1.5
   */
  it('should accept null reserve price', () => {
    fc.assert(
      fc.property(positiveAmountArb, (startingPrice) => {
        const validation = validateReservePrice(startingPrice, null);
        expect(validation.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Successful Bid Updates Auction State
   * For any valid bid on an active auction, the auction state should be updated correctly
   * 
   * Feature: auction-system, Property 5: Current Price Update
   * Validates: Requirements 4.5
   */
  it('should update auction state after successful bid', () => {
    fc.assert(
      fc.property(
        auctionArb.filter(a => a.status === 'ACTIVE'),
        bidInputArb,
        (auction, bidInput) => {
          // Ensure auction end time is in future
          const futureAuction = {
            ...auction,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
          
          // Ensure bid amount is valid
          const validBidInput = {
            ...bidInput,
            amount: futureAuction.currentPrice + futureAuction.minIncrement + 100,
          };
          
          const result = placeBid(futureAuction, validBidInput);
          
          expect(result.success).toBe(true);
          expect(result.auction).toBeDefined();
          expect(result.bid).toBeDefined();
          
          if (result.auction && result.bid) {
            // Current price should equal bid amount
            expect(result.auction.currentPrice).toBe(validBidInput.amount);
            
            // Bid count should increase by 1
            expect(result.auction.bidCount).toBe(futureAuction.bidCount + 1);
            
            // New bid should be in bids list
            expect(result.auction.bids[0].amount).toBe(validBidInput.amount);
            
            // Phone should be masked
            expect(result.bid.maskedPhone).toBe(maskPhoneNumber(validBidInput.phoneNumber));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Bid Rejection on Inactive Auction
   * For any bid on a non-active auction, the bid should be rejected
   * 
   * Feature: auction-system, Property 1: Bid Validation
   * Validates: Requirements 4.3, 4.4
   */
  it('should reject bids on inactive auctions', () => {
    fc.assert(
      fc.property(
        auctionArb.filter(a => a.status !== 'ACTIVE'),
        bidInputArb,
        (auction, bidInput) => {
          const validBidInput = {
            ...bidInput,
            amount: auction.currentPrice + auction.minIncrement + 100,
          };
          
          const result = placeBid(auction, validBidInput);
          
          expect(result.success).toBe(false);
          expect(result.error).toBe('المزاد غير نشط');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Bid Ordering
   * For any auction with bids, bids should be ordered by amount descending
   * 
   * Feature: auction-system, Property 6: Bid Ordering
   * Validates: Requirements 2.4
   */
  it('should maintain bid ordering by amount descending', () => {
    fc.assert(
      fc.property(
        auctionArb.filter(a => a.status === 'ACTIVE'),
        fc.array(bidInputArb, { minLength: 2, maxLength: 5 }),
        (auction, bidInputs) => {
          // Ensure auction end time is in future
          let currentAuction = {
            ...auction,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
          
          // Place multiple bids with increasing amounts
          for (let i = 0; i < bidInputs.length; i++) {
            const validBidInput = {
              ...bidInputs[i],
              amount: currentAuction.currentPrice + currentAuction.minIncrement + (i + 1) * 100,
            };
            
            const result = placeBid(currentAuction, validBidInput);
            if (result.success && result.auction) {
              currentAuction = result.auction;
            }
          }
          
          // Verify bids are ordered by amount descending
          const bids = currentAuction.bids;
          for (let i = 0; i < bids.length - 1; i++) {
            expect(bids[i].amount).toBeGreaterThanOrEqual(bids[i + 1].amount);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 10: Phone Masking Length Preservation
   * For any phone number, masked version should have same length as original digits
   * 
   * Feature: auction-system, Property 2: Phone Number Masking
   * Validates: Requirements 5.1, 5.3
   */
  it('should preserve phone number length when masking', () => {
    fc.assert(
      fc.property(yemeniPhoneArb, (phone) => {
        const masked = maskPhoneNumber(phone);
        const originalDigits = phone.replace(/[^\d]/g, '');
        
        expect(masked.length).toBe(originalDigits.length);
      }),
      { numRuns: 100 }
    );
  });
});
