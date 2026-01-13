/**
 * Form Component - Requirements: 11.6, 11.7, 11.8
 * 
 * Enhanced form wrapper with:
 * - Loading state on submit button
 * - Success toast notification on submission
 * - Data preservation on submission failure
 * - Accessible form structure
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"
import { AlertCircle, CheckCircle2 } from "lucide-react"

// ============================================
// Form Component
// ============================================

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Whether the form is currently submitting */
  isSubmitting?: boolean
  /** Error message from submission failure */
  submitError?: string | null
  /** Success message after submission */
  submitSuccess?: string | null
  /** Called when form is submitted */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({
    className,
    children,
    isSubmitting,
    submitError,
    submitSuccess,
    onSubmit,
    ...props
  }, ref) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (onSubmit) {
        await onSubmit(e)
      }
    }
    
    return (
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        onSubmit={handleSubmit}
        noValidate // We handle validation ourselves
        {...props}
      >
        {children}
        
        {/* Submit error message - Requirements: 11.8 */}
        {submitError && (
          <div
            className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        
        {/* Success message - Requirements: 11.7 */}
        {submitSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}
      </form>
    )
  }
)
Form.displayName = "Form"

// ============================================
// FormSubmitButton Component - Requirements: 11.6
// ============================================

export interface FormSubmitButtonProps extends ButtonProps {
  /** Whether the form is submitting */
  isSubmitting?: boolean
  /** Text to show while submitting */
  loadingText?: string
}

const FormSubmitButton = React.forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
  ({
    children,
    isSubmitting,
    loadingText = "جاري الإرسال...",
    disabled,
    ...props
  }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        isLoading={isSubmitting}
        loadingText={loadingText}
        disabled={disabled || isSubmitting}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
FormSubmitButton.displayName = "FormSubmitButton"

// ============================================
// FormActions Component - For form button group
// ============================================

export interface FormActionsProps {
  /** Child buttons */
  children: React.ReactNode
  /** Additional className */
  className?: string
  /** Alignment of buttons */
  align?: 'start' | 'center' | 'end' | 'between'
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  className,
  align = 'end',
}) => {
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }
  
  return (
    <div className={cn(
      "flex flex-wrap gap-3 pt-4 border-t border-border",
      alignmentClasses[align],
      className
    )}>
      {children}
    </div>
  )
}
FormActions.displayName = "FormActions"

// ============================================
// useFormSubmission Hook - For managing submission state
// ============================================

export interface UseFormSubmissionOptions<T> {
  /** Function to call on submit */
  onSubmit: (data: T) => Promise<void>
  /** Success message to show */
  successMessage?: string
  /** Called on successful submission */
  onSuccess?: () => void
  /** Called on submission error */
  onError?: (error: Error) => void
  /** Whether to reset form on success */
  resetOnSuccess?: boolean
}

export interface UseFormSubmissionReturn<T> {
  /** Whether currently submitting */
  isSubmitting: boolean
  /** Error message from last submission */
  submitError: string | null
  /** Success message from last submission */
  submitSuccess: string | null
  /** Handle form submission */
  handleSubmit: (data: T) => Promise<boolean>
  /** Clear submission state */
  clearState: () => void
}

export function useFormSubmission<T>({
  onSubmit,
  successMessage = "تم الحفظ بنجاح",
  onSuccess,
  onError,
}: UseFormSubmissionOptions<T>): UseFormSubmissionReturn<T> {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null)
  
  const handleSubmit = React.useCallback(async (data: T): Promise<boolean> => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      await onSubmit(data)
      setSubmitSuccess(successMessage)
      onSuccess?.()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "حدث خطأ أثناء الإرسال"
      setSubmitError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, successMessage, onSuccess, onError])
  
  const clearState = React.useCallback(() => {
    setSubmitError(null)
    setSubmitSuccess(null)
  }, [])
  
  return {
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit,
    clearState,
  }
}

export { Form, FormSubmitButton, FormActions }
