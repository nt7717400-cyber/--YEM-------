/**
 * Form Validation Hook - Requirements: 11.2, 11.3, 11.8
 * 
 * Provides real-time validation for form fields with:
 * - Immediate validation as user types
 * - Error message display below fields
 * - Data preservation on submission failure
 */

import { useState, useCallback, useMemo } from 'react'

// ============================================
// Types
// ============================================

export type ValidationRule<T = string> = {
  /** Validation function that returns true if valid */
  validate: (value: T, formValues?: Record<string, unknown>) => boolean
  /** Error message to display when validation fails */
  message: string
}

export type FieldConfig<T = string> = {
  /** Initial value for the field */
  initialValue: T
  /** Whether the field is required */
  required?: boolean
  /** Custom validation rules */
  rules?: ValidationRule<T>[]
  /** Custom required message */
  requiredMessage?: string
}

export type FieldState<T = string> = {
  /** Current value of the field */
  value: T
  /** Error message if validation failed */
  error: string | null
  /** Whether the field has been touched (focused and blurred) */
  touched: boolean
  /** Whether the field is currently dirty (value changed from initial) */
  dirty: boolean
}

export type FormConfig = Record<string, FieldConfig<unknown>>

export type FormState<T extends FormConfig> = {
  [K in keyof T]: FieldState<T[K]['initialValue']>
}

export type FormValues<T extends FormConfig> = {
  [K in keyof T]: T[K]['initialValue']
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate a single field value against its rules
 */
export function validateField<T>(
  value: T,
  config: FieldConfig<T>,
  formValues?: Record<string, unknown>
): string | null {
  // Check required first
  if (config.required) {
    const isEmpty = value === '' || value === null || value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    
    if (isEmpty) {
      return config.requiredMessage || 'هذا الحقل مطلوب'
    }
  }
  
  // Run custom validation rules
  if (config.rules) {
    for (const rule of config.rules) {
      if (!rule.validate(value, formValues)) {
        return rule.message
      }
    }
  }
  
  return null
}

/**
 * Check if a field value is valid
 */
export function isFieldValid<T>(
  value: T,
  config: FieldConfig<T>,
  formValues?: Record<string, unknown>
): boolean {
  return validateField(value, config, formValues) === null
}

// ============================================
// Common Validation Rules
// ============================================

export const validationRules = {
  /** Email validation */
  email: (message = 'البريد الإلكتروني غير صالح'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true // Let required handle empty
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message,
  }),
  
  /** Minimum length validation */
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true // Let required handle empty
      return value.length >= min
    },
    message: message || `يجب أن يكون على الأقل ${min} أحرف`,
  }),
  
  /** Maximum length validation */
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      return value.length <= max
    },
    message: message || `يجب أن لا يتجاوز ${max} أحرف`,
  }),
  
  /** Pattern validation */
  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      return regex.test(value)
    },
    message,
  }),
  
  /** Numeric validation */
  numeric: (message = 'يجب أن يكون رقماً'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      return /^\d+$/.test(value)
    },
    message,
  }),
  
  /** Minimum number validation */
  min: (min: number, message?: string): ValidationRule<string | number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(num) && num >= min
    },
    message: message || `يجب أن يكون على الأقل ${min}`,
  }),
  
  /** Maximum number validation */
  max: (max: number, message?: string): ValidationRule<string | number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(num) && num <= max
    },
    message: message || `يجب أن لا يتجاوز ${max}`,
  }),
  
  /** Phone number validation (Yemen format) */
  phone: (message = 'رقم الهاتف غير صالح'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      // Yemen phone format: starts with 7 and has 9 digits
      const phoneRegex = /^7\d{8}$/
      return phoneRegex.test(value.replace(/\s/g, ''))
    },
    message,
  }),
  
  /** URL validation */
  url: (message = 'الرابط غير صالح'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message,
  }),
  
  /** Custom validation */
  custom: <T>(
    validate: (value: T, formValues?: Record<string, unknown>) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate,
    message,
  }),
}

// ============================================
// useFormValidation Hook
// ============================================

export function useFormValidation<T extends FormConfig>(config: T) {
  // Initialize form state
  const initialState = useMemo(() => {
    const state: Record<string, FieldState<unknown>> = {}
    for (const [key, fieldConfig] of Object.entries(config)) {
      state[key] = {
        value: fieldConfig.initialValue,
        error: null,
        touched: false,
        dirty: false,
      }
    }
    return state as FormState<T>
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const [formState, setFormState] = useState<FormState<T>>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Get current form values
  const values = useMemo(() => {
    const vals: Record<string, unknown> = {}
    for (const key of Object.keys(formState)) {
      vals[key] = formState[key].value
    }
    return vals as FormValues<T>
  }, [formState])
  
  // Set field value with real-time validation - Requirements: 11.2
  const setFieldValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]['initialValue']
  ) => {
    setFormState(prev => {
      const fieldConfig = config[field] as FieldConfig<T[K]['initialValue']>
      const currentValues = { ...values, [field]: value }
      const error = prev[field].touched 
        ? validateField(value, fieldConfig, currentValues)
        : null
      
      return {
        ...prev,
        [field]: {
          ...prev[field],
          value,
          error,
          dirty: value !== fieldConfig.initialValue,
        },
      }
    })
  }, [config, values])
  
  // Set field touched state (on blur) - triggers validation
  const setFieldTouched = useCallback(<K extends keyof T>(field: K) => {
    setFormState(prev => {
      const fieldConfig = config[field] as FieldConfig<T[K]['initialValue']>
      const error = validateField(prev[field].value, fieldConfig, values)
      
      return {
        ...prev,
        [field]: {
          ...prev[field],
          touched: true,
          error,
        },
      }
    })
  }, [config, values])
  
  // Set field error manually
  const setFieldError = useCallback(<K extends keyof T>(
    field: K,
    error: string | null
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }))
  }, [])
  
  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let isValid = true
    const newState = { ...formState }
    
    for (const [key, fieldConfig] of Object.entries(config)) {
      const error = validateField(
        formState[key].value,
        fieldConfig as FieldConfig<unknown>,
        values
      )
      
      newState[key as keyof T] = {
        ...formState[key as keyof T],
        touched: true,
        error,
      }
      
      if (error) {
        isValid = false
      }
    }
    
    setFormState(newState as FormState<T>)
    return isValid
  }, [config, formState, values])
  
  // Check if form is valid (without triggering validation)
  const isValid = useMemo(() => {
    for (const [key, fieldConfig] of Object.entries(config)) {
      const error = validateField(
        formState[key].value,
        fieldConfig as FieldConfig<unknown>,
        values
      )
      if (error) return false
    }
    return true
  }, [config, formState, values])
  
  // Check if form is dirty
  const isDirty = useMemo(() => {
    return Object.values(formState).some(field => field.dirty)
  }, [formState])
  
  // Handle form submission - Requirements: 11.6, 11.8
  const handleSubmit = useCallback(
    (onSubmit: (values: FormValues<T>) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        e?.preventDefault()
        
        // Validate all fields first
        if (!validateAll()) {
          return
        }
        
        setIsSubmitting(true)
        setSubmitError(null)
        
        try {
          await onSubmit(values)
        } catch (error) {
          // Preserve form data on failure - Requirements: 11.8
          setSubmitError(
            error instanceof Error 
              ? error.message 
              : 'حدث خطأ أثناء الإرسال'
          )
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [validateAll, values]
  )
  
  // Reset form to initial state
  const reset = useCallback(() => {
    setFormState(initialState)
    setSubmitError(null)
  }, [initialState])
  
  // Get field props for easy binding
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => {
    const fieldState = formState[field]
    const fieldConfig = config[field]
    
    return {
      value: fieldState.value,
      error: fieldState.error || undefined,
      required: fieldConfig.required,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(field, e.target.value as T[K]['initialValue'])
      },
      onBlur: () => setFieldTouched(field),
    }
  }, [formState, config, setFieldValue, setFieldTouched])
  
  return {
    formState,
    values,
    isValid,
    isDirty,
    isSubmitting,
    submitError,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateAll,
    handleSubmit,
    reset,
    getFieldProps,
  }
}

export default useFormValidation
