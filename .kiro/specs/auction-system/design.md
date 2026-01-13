# Design Document: Auction System

## Overview

نظام المزايدة يضيف طريقة بيع جديدة للسيارات حيث يمكن للمستخدمين تقديم عروض أسعار تنافسية. يتكامل النظام مع البنية الحالية للمشروع (PHP API, Next.js Admin, Flutter App) مع الحفاظ على خصوصية بيانات المزايدين.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Flutter App                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auctions    │  │ Bid Form    │  │ Auction Details     │  │
│  │ List Screen │  │ Widget      │  │ Screen              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        PHP API                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auctions    │  │ Bids        │  │ Phone Masking       │  │
│  │ Controller  │  │ Controller  │  │ Utility             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       MySQL Database                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ cars        │  │ auctions    │  │ bids                │  │
│  │ (modified)  │  │ (new)       │  │ (new)               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Changes

```sql
-- Modify cars table
ALTER TABLE cars ADD COLUMN price_type ENUM('FIXED', 'AUCTION') DEFAULT 'FIXED';

-- New auctions table
CREATE TABLE auctions (
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
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- New bids table
CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_amount (amount DESC)
);
```

### 2. API Endpoints

```
GET    /auctions              - List active auctions
GET    /auctions/{id}         - Get auction details with bids
POST   /auctions/{id}/bids    - Place a bid (public)
PUT    /auctions/{id}         - Update auction (admin)
DELETE /auctions/{id}         - Cancel auction (admin)
POST   /auctions              - Create auction (admin, when creating car)
```

### 3. PHP Controller Interface

```php
class AuctionsController {
    public function index(): array;           // List auctions
    public function show(int $id): array;     // Get auction details
    public function placeBid(int $id): array; // Place bid
    public function update(int $id): array;   // Admin update
    public function cancel(int $id): array;   // Admin cancel
}
```

### 4. Flutter Models

```dart
enum PriceType { fixed, auction }

class Auction {
    final int id;
    final int carId;
    final double startingPrice;
    final double? reservePrice;
    final double currentPrice;
    final double minIncrement;
    final DateTime endTime;
    final AuctionStatus status;
    final int bidCount;
    final List<Bid> bids;
    final Car car;
}

class Bid {
    final int id;
    final int auctionId;
    final String bidderName;
    final String maskedPhone;  // 777***456
    final double amount;
    final DateTime createdAt;
}
```

## Data Models

### Auction Model (TypeScript)

```typescript
interface Auction {
    id: number;
    carId: number;
    startingPrice: number;
    reservePrice?: number;
    currentPrice: number;
    minIncrement: number;
    endTime: string;
    status: 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'SOLD';
    winnerPhone?: string;
    bidCount: number;
    bids: Bid[];
    car: Car;
    createdAt: string;
    updatedAt: string;
}

interface Bid {
    id: number;
    auctionId: number;
    bidderName: string;
    maskedPhone: string;
    amount: number;
    createdAt: string;
}

interface PlaceBidInput {
    bidderName: string;
    phoneNumber: string;
    amount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Bid Amount Validation
*For any* bid placed on an auction, the bid amount must be strictly greater than the current price plus minimum increment.
**Validates: Requirements 4.3, 4.4**

### Property 2: Phone Number Masking
*For any* phone number displayed in public API responses, only the first 3 and last 3 digits should be visible, with the middle digits replaced by asterisks.
**Validates: Requirements 5.1, 5.3**

### Property 3: Auction End Time Validation
*For any* auction created or updated, the end time must be in the future relative to the current time.
**Validates: Requirements 1.4**

### Property 4: Reserve Price Validation
*For any* auction with a reserve price, the reserve price must be greater than or equal to the starting price.
**Validates: Requirements 1.5**

### Property 5: Current Price Update
*For any* successful bid, the auction's current price must equal the bid amount after the bid is placed.
**Validates: Requirements 4.5**

### Property 6: Bid Ordering
*For any* auction's bid list, bids must be ordered by amount in descending order (highest first).
**Validates: Requirements 2.4**

## Error Handling

| Error Code | Condition | Message (Arabic) |
|------------|-----------|------------------|
| AUCTION_NOT_FOUND | Auction ID doesn't exist | المزاد غير موجود |
| AUCTION_ENDED | Auction has ended | انتهى المزاد |
| BID_TOO_LOW | Bid amount below minimum | العرض أقل من الحد الأدنى |
| INVALID_PHONE | Phone number format invalid | رقم الهاتف غير صحيح |
| AUCTION_CANCELLED | Auction was cancelled | تم إلغاء المزاد |
| RESERVE_NOT_MET | Reserve price not met at end | لم يتم الوصول للسعر الأدنى |

## Testing Strategy

### Unit Tests
- Phone number masking function
- Bid validation logic
- Auction status transitions
- Price calculations

### Property-Based Tests
- Bid amount always > current price + increment
- Phone masking format consistency
- Auction end time always in future on creation

### Integration Tests
- Full bid placement flow
- Auction creation with car
- Admin auction management
