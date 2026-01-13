/**
 * Toast System Exports
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 * 
 * This module provides a complete toast notification system with:
 * - Multiple toast types (success, error, warning, info) - Req 13.1
 * - Auto-dismiss after 5 seconds for success messages - Req 13.2
 * - No auto-dismiss for error messages (must be manually dismissed) - Req 13.3
 * - Appropriate icons for each message type - Req 13.4
 * - Vertical stacking for multiple notifications - Req 13.5
 * - Dismissible via close button - Req 13.6
 */

// Core Toast component
export { Toast, toastVariants, iconVariants } from "./toast";
export type { ToastProps, ToastType } from "./toast";

// Toast Provider and Hook
export { ToastProvider, useToast } from "./toast-provider";
export type { ToastData, ToastOptions, ToastContextValue } from "./toast-provider";
