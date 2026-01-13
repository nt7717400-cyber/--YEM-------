"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast Component - Requirements: 13.1, 13.4
 * 
 * Toast notification component with:
 * - Multiple types (success, error, warning, info)
 * - Appropriate icons for each type
 * - Dismissible via close button
 * - RTL support
 * - Accessible with ARIA attributes
 */

// Toast type definitions
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Unique identifier for the toast */
  id: string;
  /** Type of toast notification */
  type: ToastType;
  /** Message to display */
  message: string;
  /** Optional title */
  title?: string;
  /** Duration in ms before auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss?: (id: string) => void;
  /** Whether the toast can be dismissed by clicking close */
  dismissible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Icon mapping for each toast type - Requirements: 13.4
const toastIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// Toast variants using CVA for consistent styling
const toastVariants = cva(
  [
    // Base styles
    "relative flex items-start gap-3 w-full max-w-sm p-4 rounded-lg shadow-lg",
    "border transition-all duration-300 ease-in-out motion-reduce:transition-none",
    // Animation classes - respects reduced motion (Requirements: 7.4)
    "motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:fade-in-0",
    // RTL support
    "rtl:flex-row-reverse",
  ].join(" "),
  {
    variants: {
      type: {
        success: [
          "bg-success/10 border-success/30 text-success-foreground",
          "dark:bg-success/20 dark:border-success/40",
        ].join(" "),
        error: [
          "bg-destructive/10 border-destructive/30 text-destructive-foreground",
          "dark:bg-destructive/20 dark:border-destructive/40",
        ].join(" "),
        warning: [
          "bg-warning/10 border-warning/30 text-warning-foreground",
          "dark:bg-warning/20 dark:border-warning/40",
        ].join(" "),
        info: [
          "bg-info/10 border-info/30 text-info-foreground",
          "dark:bg-info/20 dark:border-info/40",
        ].join(" "),
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

// Icon color variants
const iconVariants = cva("h-5 w-5 shrink-0 mt-0.5", {
  variants: {
    type: {
      success: "text-success",
      error: "text-destructive",
      warning: "text-warning",
      info: "text-info",
    },
  },
  defaultVariants: {
    type: "info",
  },
});

/**
 * Individual Toast component
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      id,
      type,
      message,
      title,
      onDismiss,
      dismissible = true,
      className,
      ...props
    },
    ref
  ) => {
    const Icon = toastIcons[type];

    const handleDismiss = React.useCallback(() => {
      onDismiss?.(id);
    }, [id, onDismiss]);

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={type === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        data-toast-type={type}
        data-toast-id={id}
        className={cn(toastVariants({ type }), className)}
        {...props}
      >
        {/* Icon */}
        <Icon className={iconVariants({ type })} aria-hidden="true" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-sm mb-1" data-toast-title>
              {title}
            </p>
          )}
          <p className="text-sm opacity-90" data-toast-message>
            {message}
          </p>
        </div>

        {/* Close button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "shrink-0 p-1 rounded-md transition-colors motion-reduce:transition-none",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "focus:ring-current"
            )}
            aria-label="إغلاق الإشعار"
            data-toast-close
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = "Toast";

export { toastVariants, iconVariants };
