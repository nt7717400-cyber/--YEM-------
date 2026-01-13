'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CarImage } from '@/types';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * CarGallery Component - Requirements: 3.1, 3.2, 3.3
 * 
 * Features:
 * - Image gallery with thumbnail navigation (3.1)
 * - Fullscreen lightbox viewer (3.2)
 * - Swipe gestures for mobile navigation (3.3)
 * - Keyboard navigation support
 * - Zoom functionality in lightbox
 * - RTL support
 */

export interface CarGalleryProps {
  /** Array of car images */
  images: CarImage[];
  /** Car name for alt text */
  carName: string;
  /** Enable lightbox functionality */
  enableLightbox?: boolean;
  /** Enable swipe gestures on mobile */
  enableSwipe?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Custom hook for swipe gesture detection
 * Requirement 3.3: Swipe gestures for mobile navigation
 */
function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean = true,
  minSwipeDistance: number = 50
) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!enabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
    isSwiping.current = false;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!enabled || touchStartX.current === null || touchStartY.current === null) return;
    
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    // Calculate horizontal and vertical distance
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);

    // Only consider it a swipe if horizontal movement is greater than vertical
    // This prevents accidental swipes while scrolling
    if (deltaX > deltaY && deltaX > 10) {
      isSwiping.current = true;
      // Prevent vertical scrolling during horizontal swipe
      e.preventDefault?.();
    }
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || touchStartX.current === null || touchEndX.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
      isSwiping.current = false;
      return;
    }

    const swipeDistance = touchStartX.current - touchEndX.current;
    
    // Only trigger if it was a horizontal swipe
    if (isSwiping.current) {
      // Swipe left (next image)
      if (swipeDistance > minSwipeDistance) {
        onSwipeLeft();
      }
      // Swipe right (previous image)
      else if (swipeDistance < -minSwipeDistance) {
        onSwipeRight();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
    isSwiping.current = false;
  }, [enabled, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export function CarGallery({
  images,
  carName,
  enableLightbox = true,
  enableSwipe = true,
  className,
}: CarGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger navigation (in pixels)
  const MIN_SWIPE_DISTANCE = 50;

  // Handle empty images array
  const displayImages = images.length > 0 
    ? images 
    : [{ id: 0, url: '/placeholder-car.svg', order: 0, carId: 0, createdAt: '' }];

  const currentImage = displayImages[activeIndex];
  const currentImageUrl = getImageUrl(currentImage.url);

  // Navigate to next image
  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
    setZoomLevel(1);
  }, [displayImages.length]);

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    setZoomLevel(1);
  }, [displayImages.length]);

  // Go to specific image
  const goToImage = useCallback((index: number) => {
    setActiveIndex(index);
    setZoomLevel(1);
  }, []);

  // Open lightbox
  const openLightbox = useCallback(() => {
    if (enableLightbox) {
      setIsLightboxOpen(true);
      setZoomLevel(1);
    }
  }, [enableLightbox]);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  }, []);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  }, []);

  // Use swipe gesture hook for gallery
  const gallerySwipe = useSwipeGesture(
    goToNext,      // Swipe left = next
    goToPrevious,  // Swipe right = previous
    enableSwipe && displayImages.length > 1,
    MIN_SWIPE_DISTANCE
  );

  // Use swipe gesture hook for lightbox
  const lightboxSwipe = useSwipeGesture(
    goToNext,
    goToPrevious,
    enableSwipe && isLightboxOpen && displayImages.length > 1,
    MIN_SWIPE_DISTANCE
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowLeft':
            goToPrevious();
            break;
          case 'ArrowRight':
            goToNext();
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
            handleZoomOut();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, goToNext, goToPrevious, handleZoomIn, handleZoomOut]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Handle image load state
  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
  }, []);

  return (
    <>
      {/* Main Gallery */}
      <div 
        ref={galleryRef}
        className={cn('space-y-4', className)}
        data-testid="car-gallery"
      >
        {/* Main Image */}
        <div
          className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted cursor-pointer group touch-pan-y"
          onClick={openLightbox}
          onTouchStart={gallerySwipe.handleTouchStart}
          onTouchMove={gallerySwipe.handleTouchMove}
          onTouchEnd={gallerySwipe.handleTouchEnd}
          role="button"
          tabIndex={0}
          aria-label={enableLightbox ? 'انقر لفتح العرض الكامل' : carName}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLightbox();
            }
          }}
          data-testid="gallery-main-image"
        >
          {/* Skeleton loader */}
          {!imageLoaded[activeIndex] && (
            <Skeleton 
              variant="rectangular" 
              className="absolute inset-0 w-full h-full"
              data-testid="gallery-skeleton"
            />
          )}

          {/* Main image */}
          <Image
            src={currentImageUrl}
            alt={`${carName} - صورة ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}
            className={cn(
              'object-cover transition-all duration-300',
              imageLoaded[activeIndex] ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-105'
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
            onLoad={() => handleImageLoad(activeIndex)}
          />

          {/* Fullscreen hint */}
          {enableLightbox && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 
                className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Navigation arrows (desktop) */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="الصورة السابقة"
                data-testid="gallery-prev-button"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="الصورة التالية"
                data-testid="gallery-next-button"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {activeIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div 
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted"
            role="tablist"
            aria-label="معرض الصور"
            data-testid="gallery-thumbnails"
          >
            {displayImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`صورة ${index + 1} من ${displayImages.length}`}
                className={cn(
                  'relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all',
                  activeIndex === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                data-testid={`gallery-thumbnail-${index}`}
              >
                <Image
                  src={getImageUrl(image.url)}
                  alt={`${carName} - صورة مصغرة ${index + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center touch-pan-y"
          onClick={closeLightbox}
          onTouchStart={lightboxSwipe.handleTouchStart}
          onTouchMove={lightboxSwipe.handleTouchMove}
          onTouchEnd={lightboxSwipe.handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="عرض الصورة بالحجم الكامل"
          data-testid="gallery-lightbox"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeLightbox}
            aria-label="إغلاق"
            data-testid="lightbox-close-button"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoomLevel <= 1}
              aria-label="تصغير"
              data-testid="lightbox-zoom-out"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm flex items-center px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoomLevel >= 3}
              aria-label="تكبير"
              data-testid="lightbox-zoom-in"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>

          {/* Main lightbox image */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative max-w-full max-h-full overflow-auto"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <Image
                src={currentImageUrl}
                alt={`${carName} - صورة ${activeIndex + 1}`}
                width={1200}
                height={900}
                className="object-contain max-h-[85vh] w-auto"
                priority
                data-testid="lightbox-image"
              />
            </div>
          </div>

          {/* Navigation arrows */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="الصورة السابقة"
                data-testid="lightbox-prev-button"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="الصورة التالية"
                data-testid="lightbox-next-button"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Lightbox thumbnails */}
          {displayImages.length > 1 && (
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-[90vw] overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="lightbox-thumbnails"
            >
              {displayImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={cn(
                    'relative w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all',
                    activeIndex === index
                      ? 'border-white'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  aria-label={`صورة ${index + 1}`}
                >
                  <Image
                    src={getImageUrl(image.url)}
                    alt={`${carName} - صورة مصغرة ${index + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {activeIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * CarGallerySkeleton - Loading placeholder for CarGallery
 */
export function CarGallerySkeleton() {
  return (
    <div className="space-y-4" data-testid="car-gallery-skeleton">
      {/* Main image skeleton */}
      <Skeleton variant="rectangular" className="aspect-[4/3] w-full rounded-lg" />
      
      {/* Thumbnails skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            className="w-20 h-16 rounded-md flex-shrink-0" 
          />
        ))}
      </div>
    </div>
  );
}

export default CarGallery;
