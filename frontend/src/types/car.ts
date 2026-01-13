import type { BodyType, CarInspection } from './inspection';
import type { PriceType, Auction } from './auction';

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  priceType: PriceType;
  condition: 'NEW' | 'USED';
  origin?: string;
  kilometers?: number;
  description: string;
  specifications: string;
  status: 'AVAILABLE' | 'SOLD';
  isFeatured: boolean;
  viewCount: number;
  thumbnail?: string;
  bodyType?: BodyType;
  createdAt: string;
  updatedAt: string;
  images: CarImage[];
  video?: CarVideo;
  inspection?: CarInspection;
  auction?: Auction;
}

export interface CarImage {
  id: number;
  carId: number;
  url: string;
  order: number;
  createdAt: string;
}

export interface CarVideo {
  id: number;
  carId: number;
  type: 'YOUTUBE' | 'UPLOAD';
  url: string;
  createdAt: string;
}

export interface CreateCarInput {
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  priceType?: PriceType;
  condition: 'NEW' | 'USED';
  origin?: string;
  kilometers?: number;
  description?: string;
  specifications?: string;
  isFeatured?: boolean;
  bodyType?: BodyType;
  // Auction fields (required when priceType is 'AUCTION')
  startingPrice?: number;
  reservePrice?: number;
  minIncrement?: number;
  endTime?: string;
}

export interface UpdateCarInput extends Partial<CreateCarInput> {
  status?: 'AVAILABLE' | 'SOLD';
}

export interface CarFilters {
  search?: string;
  brand?: string;
  condition?: 'NEW' | 'USED';
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  status?: 'AVAILABLE' | 'SOLD';
  featured?: boolean;
}
