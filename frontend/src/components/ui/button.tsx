import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Button Component - Requirements: 18.1, 18.8
 * 
 * Enhanced button component with:
 * - Multiple variants (default, destructive, outline, secondary, ghost, link)
 * - Improved hover and focus states for better UX
 * - Loading state with spinner
 * - Full keyboard navigation support
 * - WCAG AA compliant focus indicators
 */

const buttonVariants = cva(
  // Base styles with improved focus states for accessibility (Requirements: 18.8)
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium",
    // Smooth transitions for hover/focus states - respects reduced motion (Requirements: 7.4)
    "transition-all duration-200 ease-in-out motion-reduce:transition-none",
    // Enhanced focus states - visible ring for keyboard navigation
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Disabled states
    "disabled:pointer-events-none disabled:opacity-50",
    // SVG icon handling
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Touch target minimum size for mobile (44x44px)
    "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default/Primary variant with enhanced hover - respects reduced motion
        default: [
          "bg-primary text-primary-foreground shadow",
          "hover:bg-primary/90 hover:shadow-md motion-safe:hover:scale-[1.02]",
          "motion-safe:active:scale-[0.98] active:shadow-sm",
        ].join(" "),
        
        // Destructive variant for dangerous actions
        destructive: [
          "bg-destructive text-destructive-foreground shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md motion-safe:hover:scale-[1.02]",
          "motion-safe:active:scale-[0.98] active:shadow-sm",
        ].join(" "),
        
        // Outline variant with border - Requirements: 18.1
        outline: [
          "border-2 border-input bg-background shadow-sm",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:shadow-md",
          "motion-safe:active:scale-[0.98] active:shadow-sm",
        ].join(" "),
        
        // Secondary variant
        secondary: [
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md motion-safe:hover:scale-[1.02]",
          "motion-safe:active:scale-[0.98] active:shadow-sm",
        ].join(" "),
        
        // Ghost variant - minimal styling - Requirements: 18.1
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "active:bg-accent/80",
        ].join(" "),
        
        // Link variant
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
          "active:text-primary/70",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element using Radix Slot */
  asChild?: boolean
  /** Show loading spinner and disable interactions */
  isLoading?: boolean
  /** Text to show while loading (defaults to children) */
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    isLoading = false,
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Disable button when loading
    const isDisabled = disabled || isLoading
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
