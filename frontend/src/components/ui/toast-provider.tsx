"use client";

import * as React from "react";
import { Toast, ToastType, ToastProps } from "./toast";
import { cn } from "@/lib/utils";

/**
 * Toast Provider & useToast Hook - Requirements: 13.5
 * 
 * Provides toast notification management with:
 * - Vertical stacking for multiple notifications
 * - Most recent toast at the top
 * - Auto-dismiss for success (5s), no auto-dismiss for error
 * - Manual dismiss via close button
 */

// Toast data without the onDismiss callback (managed internally)
export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

// Options for creating a toast
export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

// Context value type
interface ToastContextValue {
  toasts: ToastData[];
  addToast: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  // Convenience methods
  success: (message: string, options?: Omit<ToastOptions, "type">) => string;
  error: (message: string, options?: Omit<ToastOptions, "type">) => string;
  warning: (message: string, options?: Omit<ToastOptions, "type">) => string;
  info: (message: string, options?: Omit<ToastOptions, "type">) => string;
}

// Default durations - Requirements: 13.2, 13.3
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000, // 5 seconds for success
  error: 0,      // No auto-dismiss for error
  warning: 7000, // 7 seconds for warning
  info: 5000,    // 5 seconds for info
};

// Maximum number of visible toasts
const MAX_VISIBLE_TOASTS = 5;

// Create context
const ToastContext = React.createContext<ToastContextValue | null>(null);

// Generate unique ID
let toastIdCounter = 0;
const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}-${Date.now()}`;
};

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  // Add a new toast
  const addToast = React.useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const id = generateToastId();
      const type = options.type ?? "info";
      const duration = options.duration ?? DEFAULT_DURATIONS[type];

      const newToast: ToastData = {
        id,
        type,
        message,
        title: options.title,
        duration,
        dismissible: options.dismissible ?? true,
      };

      setToasts((prev) => {
        // Add new toast at the beginning (most recent at top)
        const updated = [newToast, ...prev];
        // Limit visible toasts
        return updated.slice(0, MAX_VISIBLE_TOASTS);
      });

      return id;
    },
    []
  );

  // Remove a toast by ID
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      addToast(message, { ...options, type: "success" }),
    [addToast]
  );

  const error = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      addToast(message, { ...options, type: "error" }),
    [addToast]
  );

  const warning = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      addToast(message, { ...options, type: "warning" }),
    [addToast]
  );

  const info = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      addToast(message, { ...options, type: "info" }),
    [addToast]
  );

  const contextValue = React.useMemo<ToastContextValue>(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearAllToasts,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, clearAllToasts, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast Container - handles stacking and positioning
 * Requirements: 13.5 - Vertical stacking without overlapping
 */
interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className={cn(
        // Fixed positioning at top-right (top-left for RTL)
        "fixed top-4 z-50",
        "left-4 right-4 sm:left-auto sm:right-4 rtl:sm:left-4 rtl:sm:right-auto",
        // Flex column for vertical stacking
        "flex flex-col gap-2",
        // Pointer events only on children
        "pointer-events-none"
      )}
      role="region"
      aria-label="الإشعارات"
      data-toast-container
    >
      {toasts.map((toast, index) => (
        <ToastWithAutoDismiss
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
          style={{
            // Stacking effect - slightly offset each toast
            zIndex: toasts.length - index,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Toast wrapper with auto-dismiss functionality
 * Requirements: 13.2, 13.3
 */
interface ToastWithAutoDismissProps extends ToastData {
  onDismiss: (id: string) => void;
  style?: React.CSSProperties;
}

function ToastWithAutoDismiss({
  id,
  type,
  message,
  title,
  duration,
  dismissible,
  onDismiss,
  style,
}: ToastWithAutoDismissProps) {
  // Auto-dismiss timer
  React.useEffect(() => {
    // Don't auto-dismiss if duration is 0 or undefined
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className="pointer-events-auto" style={style}>
      <Toast
        id={id}
        type={type}
        message={message}
        title={title}
        dismissible={dismissible}
        onDismiss={onDismiss}
      />
    </div>
  );
}

/**
 * useToast Hook
 * 
 * Provides access to toast functionality from any component
 */
export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// Export types
export type { ToastContextValue };
