'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from '@/types';
import { getImageUrl } from '@/lib/api';

/**
 * CarCard Component - Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 * 
 * Features:
 * - Displays car image, name, price, year, and condition (2.1)
 * - Hover lift effect with shadow on desktop (2.2)
 * - "مميزة" badge for featured cars (2.3)
 * - "مباعة" badge with overlay for sold cars (2.4)
 * - Skeleton loading for images (2.5)
 * - Price formatted with ر.ي currency (2.6)
 * - Immediate navigation on mobile tap (2.7)
 */

interface CarCardProps {
  car: Car;
  variant?: 'default' | 'compact' | 'featured';
  showBadges?: boolean;
}

/**
 * Format price with Yemeni Rial currency
 * @param price - The price to format
 * @returns Formatted price string with ر.ي
 */
export function formatCarPrice(price: number): string {
  return new Intl.NumberFormat('ar-YE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' ر.ي';
}

export function CarCard({ car, variant = 'default', showBadges = true }: CarCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use thumbnail first, then first image from array
  const thumbnailUrl = getImageUrl(car.thumbnail || car.images?.[0]?.url);
  const formattedPrice = formatCarPrice(car.price);
  
  const isSold = car.status === 'SOLD';

  return (
    <Link href={`/cars/${car.id}`} className="block touch-manipulation">
      <Card 
        className={`
          overflow-hidden 
          transition-all duration-300 ease-out motion-reduce:transition-none
          motion-safe:hover:shadow-xl motion-safe:hover:-translate-y-2
          hover:shadow-lg
          focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
          ${variant === 'compact' ? 'h-auto' : ''}
          ${variant === 'featured' ? 'border-primary/50' : ''}
        `}
        data-testid="car-card"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Skeleton Loader - shown while image is loading */}
          {!imageLoaded && !imageError && (
            <Skeleton 
              variant="rectangular" 
              className="absolute inset-0 w-full h-full"
              data-testid="car-card-skeleton"
            />
          )}
          
          {/* Car Image */}
          <Image
            src={imageError ? '/placeholder-car.svg' : thumbnailUrl}
            alt={car.name}
            fill
            loading="lazy"
            className={`
              object-cover transition-all duration-300 motion-reduce:transition-none
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 motion-reduce:opacity-100 scale-105 motion-reduce:scale-100'}
              motion-safe:group-hover:scale-105
            `}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Sold Overlay - Requirement 2.4 */}
          {isSold && (
            <div 
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
              data-testid="sold-overlay"
            >
              <Badge 
                variant="destructive" 
                className="text-lg px-4 py-2 bg-red-600"
                data-testid="sold-badge"
              >
                مباعة
              </Badge>
            </div>
          )}
          
          {/* Badges Container */}
          {showBadges && (
            <>
              {/* Featured Badge - Requirement 2.3 */}
              {car.isFeatured && !isSold && (
                <Badge 
                  className="absolute top-2 right-2 bg-primary shadow-md"
                  data-testid="featured-badge"
                >
                  مميزة
                </Badge>
              )}
              
              {/* Condition Badge */}
              <Badge
                variant={car.condition === 'NEW' ? 'default' : 'secondary'}
                className="absolute top-2 left-2 shadow-md"
                data-testid="condition-badge"
              >
                {car.condition === 'NEW' ? 'جديدة' : 'مستعملة'}
              </Badge>
            </>
          )}
        </div>
        
        {/* Card Content - Requirement 2.1 */}
        <CardContent className="p-4">
          {/* Car Name */}
          <h3 
            className="font-bold text-lg line-clamp-1 mb-1"
            data-testid="car-name"
          >
            {car.name}
          </h3>
          
          {/* Brand and Model */}
          <p className="text-sm text-muted-foreground line-clamp-1">
            {car.brand} - {car.model}
          </p>
          
          {/* Year - Requirement 2.1 */}
          <p 
            className="text-sm text-muted-foreground"
            data-testid="car-year"
          >
            {car.year}
          </p>
        </CardContent>
        
        {/* Card Footer - Price and Views */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Price - Requirement 2.6 */}
          <span 
            className="font-bold text-primary text-lg"
            data-testid="car-price"
          >
            {formattedPrice}
          </span>
          
          {/* View Count */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            {car.viewCount}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * CarCardSkeleton - Loading placeholder for CarCard
 * Requirement: 2.5
 */
export function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="car-card-skeleton-full">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton variant="rectangular" className="w-full h-full" />
      </div>
      
      {/* Content Skeleton */}
      <CardContent className="p-4 space-y-2">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-4 w-1/4" />
      </CardContent>
      
      {/* Footer Skeleton */}
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Skeleton variant="text" className="h-6 w-24" />
        <Skeleton variant="text" className="h-4 w-12" />
      </CardFooter>
    </Card>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}
