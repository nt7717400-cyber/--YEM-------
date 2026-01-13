/**
 * FormField Component - Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 * 
 * Enhanced form field wrapper with:
 * - Clear labels and placeholders
 * - Required field indicators
 * - Real-time validation with error display
 * - Grouped fields with section headers
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "./input"

// ============================================
// FormField Component
// ============================================

export interface FormFieldProps extends InputProps {
  /** Field name for form binding */
  name?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (props, ref) => {
    return <Input ref={ref} {...props} />
  }
)
FormField.displayName = "FormField"

// ============================================
// FormSection Component - Requirements: 11.5
// ============================================

export interface FormSectionProps {
  /** Section title */
  title: string
  /** Section description */
  description?: string
  /** Child form fields */
  children: React.ReactNode
  /** Additional className */
  className?: string
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <fieldset className={cn("space-y-4", className)}>
      <legend className="sr-only">{title}</legend>
      <div className="border-b border-border pb-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  )
}
FormSection.displayName = "FormSection"

// ============================================
// FormRow Component - For horizontal field groups
// Requirements: 15.2 - Single-column layout on mobile
// ============================================

export interface FormRowProps {
  /** Child form fields */
  children: React.ReactNode
  /** Additional className */
  className?: string
  /** Number of columns on larger screens (default: 2) */
  columns?: 2 | 3 | 4
}

const FormRow: React.FC<FormRowProps> = ({ children, className, columns = 2 }) => {
  // Column classes based on the columns prop
  // Always single column on mobile (< 640px)
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }
  
  return (
    <div 
      className={cn(
        "grid gap-4",
        // Responsive: single column on mobile, multi-column on larger screens
        columnClasses[columns],
        className
      )}
      data-testid="form-row"
      data-columns={columns}
    >
      {children}
    </div>
  )
}
FormRow.displayName = "FormRow"

// ============================================
// ResponsiveFormGrid Component - Requirements: 15.2
// Ensures forms display in single-column on mobile
// ============================================

export interface ResponsiveFormGridProps {
  /** Child form fields */
  children: React.ReactNode
  /** Additional className */
  className?: string
  /** Number of columns on tablet (sm breakpoint, default: 2) */
  tabletColumns?: 1 | 2
  /** Number of columns on desktop (lg breakpoint, default: 2) */
  desktopColumns?: 2 | 3 | 4
  /** Gap between items (default: 4 = 1rem) */
  gap?: 2 | 3 | 4 | 6 | 8
}

const ResponsiveFormGrid: React.FC<ResponsiveFormGridProps> = ({
  children,
  className,
  tabletColumns = 2,
  desktopColumns = 2,
  gap = 4,
}) => {
  // Build responsive column classes
  // Mobile is always 1 column (< 640px)
  const getColumnClasses = () => {
    const classes = ["grid-cols-1"] // Always single column on mobile
    
    // Tablet (sm: >= 640px)
    if (tabletColumns === 2) {
      classes.push("sm:grid-cols-2")
    }
    // If tabletColumns is 1, we don't add sm: class, keeping it single column
    
    // Desktop (lg: >= 1024px)
    if (desktopColumns === 2) {
      classes.push("lg:grid-cols-2")
    } else if (desktopColumns === 3) {
      classes.push("lg:grid-cols-3")
    } else if (desktopColumns === 4) {
      classes.push("lg:grid-cols-4")
    }
    
    return classes.join(" ")
  }
  
  const gapClasses = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  }
  
  return (
    <div 
      className={cn(
        "grid",
        getColumnClasses(),
        gapClasses[gap],
        className
      )}
      data-testid="responsive-form-grid"
      data-tablet-columns={tabletColumns}
      data-desktop-columns={desktopColumns}
    >
      {children}
    </div>
  )
}
ResponsiveFormGrid.displayName = "ResponsiveFormGrid"

// ============================================
// Textarea Component with validation support
// ============================================

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Label text for the textarea */
  label?: string
  /** Error message to display below the textarea */
  error?: string
  /** Helper text to display below the textarea */
  helperText?: string
  /** Whether the field is required */
  required?: boolean
  /** Container className */
  containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
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
    const textareaId = id || generatedId
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`
    
    const hasError = Boolean(error)
    
    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
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
        
        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            "flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
            "min-h-[100px] resize-y",
            // Placeholder and focus styles
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Text size responsive
            "md:text-sm",
            // Default border
            "border-input",
            // Error state
            hasError && "border-destructive focus-visible:ring-destructive",
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
        
        {hasError && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {!hasError && helperText && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { FormField, FormSection, FormRow, ResponsiveFormGrid, Textarea }
