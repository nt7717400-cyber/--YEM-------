import * as React from "react"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Input Component - Requirements: 6.3, 6.6, 11.1, 11.2, 11.3, 11.4
 * 
 * Enhanced input component with:
 * - Minimum touch target size of 44x44px on mobile
 * - Clear labels and placeholder support
 * - Required field indicators
 * - Real-time validation with error display
 * - Accessible focus states
 */

export interface InputProps extends React.ComponentProps<"input"> {
  /** Label text for the input field */
  label?: string
  /** Error message to display below the input */
  error?: string
  /** Helper text to display below the input */
  helperText?: string
  /** Whether the field is required (shows indicator) */
  required?: boolean
  /** Container className for the wrapper div */
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    helperText, 
    required,
    containerClassName,
    id,
    ...props 
  }, ref) => {
    // Generate a unique ID - always call useId unconditionally
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    const hasError = Boolean(error)
    
    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {/* Label with required indicator - Requirements: 11.1, 11.4 */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-foreground",
              hasError && "text-destructive"
            )}
          >
            {label}
            {required && (
              <span 
                className="text-destructive ms-1" 
                aria-hidden="true"
                title="حقل مطلوب"
              >
                *
              </span>
            )}
          </label>
        )}
        
        {/* Input field */}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              // Base styles
              "flex w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
              // Touch target minimum size for mobile (44px), normal on desktop
              "min-h-[44px] sm:min-h-[36px] h-auto sm:h-9",
              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              // Placeholder and focus styles
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Text size responsive
              "md:text-sm",
              // Default border
              "border-input",
              // Error state - Requirements: 11.2, 11.3
              hasError && [
                "border-destructive",
                "focus-visible:ring-destructive",
                "pe-10" // Space for error icon
              ],
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            aria-required={required}
            {...props}
          />
          
          {/* Error icon inside input */}
          {hasError && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
              <AlertCircle 
                className="h-4 w-4 text-destructive" 
                aria-hidden="true" 
              />
            </div>
          )}
        </div>
        
        {/* Error message - Requirements: 11.2, 11.3 */}
        {hasError && (
          <p 
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {/* Helper text (only shown when no error) */}
        {!hasError && helperText && (
          <p 
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
