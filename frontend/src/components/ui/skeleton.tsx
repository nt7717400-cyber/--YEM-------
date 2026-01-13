import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Skeleton Component - Requirements: 18.7
 * 
 * Loading placeholder component with multiple variants:
 * - text: For text content placeholders
 * - circular: For avatar/icon placeholders
 * - rectangular: For image/media placeholders
 * - card: For card component placeholders
 * 
 * Features:
 * - Animated shimmer effect
 * - Respects reduced motion preferences
 * - RTL support
 * - Customizable dimensions
 */

const skeletonVariants = cva(
  // Base styles with shimmer animation
  [
    "bg-muted/60 relative overflow-hidden",
    // Shimmer animation that respects reduced motion
    "before:absolute before:inset-0",
    "before:translate-x-[-100%]",
    "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "before:animate-shimmer",
    // Respect reduced motion preference
    "motion-reduce:before:animate-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // Text variant - rounded pill shape for text lines
        text: "h-4 w-full rounded-md",
        
        // Circular variant - for avatars and icons
        circular: "rounded-full aspect-square",
        
        // Rectangular variant - for images and media
        rectangular: "rounded-lg",
        
        // Card variant - full card placeholder with shadow
        card: "rounded-xl shadow-sm",
      },
    },
    defaultVariants: {
      variant: "text",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width of the skeleton (CSS value or number for pixels) */
  width?: string | number
  /** Height of the skeleton (CSS value or number for pixels) */
  height?: string | number
  /** Number of skeleton items to render (for text lines) */
  count?: number
}

/**
 * Formats dimension value to CSS string
 */
function formatDimension(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : value
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, count = 1, style, ...props }, ref) => {
    const dimensionStyle: React.CSSProperties = {
      ...style,
      width: formatDimension(width),
      height: formatDimension(height),
    }

    // Render multiple skeletons if count > 1
    if (count > 1) {
      return (
        <div className="flex flex-col gap-2" ref={ref}>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(skeletonVariants({ variant }), className)}
              style={dimensionStyle}
              aria-hidden="true"
              {...props}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        style={dimensionStyle}
        aria-hidden="true"
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

/**
 * SkeletonText - Convenience component for text placeholders
 */
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ className, ...props }, ref) => (
  <Skeleton ref={ref} variant="text" className={className} {...props} />
))
SkeletonText.displayName = "SkeletonText"

/**
 * SkeletonCircle - Convenience component for circular placeholders (avatars)
 */
const SkeletonCircle = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ className, width = 40, height = 40, ...props }, ref) => (
  <Skeleton
    ref={ref}
    variant="circular"
    width={width}
    height={height}
    className={className}
    {...props}
  />
))
SkeletonCircle.displayName = "SkeletonCircle"

/**
 * SkeletonRectangle - Convenience component for rectangular placeholders (images)
 */
const SkeletonRectangle = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ className, ...props }, ref) => (
  <Skeleton ref={ref} variant="rectangular" className={className} {...props} />
))
SkeletonRectangle.displayName = "SkeletonRectangle"

/**
 * SkeletonCard - Pre-built card skeleton with image and text placeholders
 */
interface SkeletonCardProps extends Omit<SkeletonProps, "variant" | "count"> {
  /** Show image placeholder */
  showImage?: boolean
  /** Number of text lines */
  lines?: number
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, showImage = true, lines = 3, width, height, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        className
      )}
      style={{
        width: formatDimension(width),
        height: formatDimension(height),
      }}
      aria-hidden="true"
      {...props}
    >
      {showImage && (
        <Skeleton
          variant="rectangular"
          className="mb-4 h-40 w-full"
        />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            className={cn(
              // Make last line shorter for visual variety
              index === lines - 1 && "w-2/3"
            )}
          />
        ))}
      </div>
    </div>
  )
)
SkeletonCard.displayName = "SkeletonCard"

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonCard,
  skeletonVariants,
}
