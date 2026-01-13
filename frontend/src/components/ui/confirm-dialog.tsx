"use client"

import * as React from "react"
import { AlertTriangle, Trash2, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "./modal"

/**
 * ConfirmDialog Component - Requirements: 14.1, 14.2, 14.3
 * 
 * Confirmation dialog for destructive actions:
 * - Displays confirmation prompt before destructive actions - Requirement 14.1
 * - Clearly describes the action and its consequences - Requirement 14.2
 * - Cancel and Confirm buttons with appropriate colors - Requirement 14.3
 * - Does NOT close on overlay click (for destructive dialogs)
 * - Escape key closes the dialog (cancels the action)
 */

export type ConfirmDialogVariant = "destructive" | "warning" | "info"

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Callback when user confirms the action */
  onConfirm: () => void
  /** Dialog title */
  title: string
  /** Description of the action and its consequences - Requirement 14.2 */
  description: string
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Visual variant of the dialog */
  variant?: ConfirmDialogVariant
  /** Whether the confirm action is in progress */
  isLoading?: boolean
  /** Additional content to display */
  children?: React.ReactNode
}

const variantConfig: Record<ConfirmDialogVariant, {
  icon: React.ReactNode
  iconClassName: string
  confirmVariant: "destructive" | "default"
}> = {
  destructive: {
    icon: <Trash2 className="h-6 w-6" />,
    iconClassName: "bg-destructive/10 text-destructive",
    confirmVariant: "destructive",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconClassName: "bg-warning/10 text-warning",
    confirmVariant: "destructive",
  },
  info: {
    icon: <Info className="h-6 w-6" />,
    iconClassName: "bg-info/10 text-info",
    confirmVariant: "default",
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "destructive",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]

  const handleConfirm = React.useCallback(() => {
    onConfirm()
  }, [onConfirm])

  const handleCancel = React.useCallback(() => {
    if (!isLoading) {
      onClose()
    }
  }, [onClose, isLoading])

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <ModalContent
        size="sm"
        closeOnOverlay={false}
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          // Allow escape to close (cancel) even for destructive dialogs
          if (isLoading) {
            e.preventDefault()
          }
        }}
        aria-describedby="confirm-dialog-description"
      >
        <ModalHeader className="sm:text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" 
               aria-hidden="true">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              config.iconClassName
            )}>
              {config.icon}
            </div>
          </div>
          
          <ModalTitle className="text-center">{title}</ModalTitle>
          <ModalDescription id="confirm-dialog-description" className="text-center">
            {description}
          </ModalDescription>
        </ModalHeader>

        {/* Additional content */}
        {children && (
          <div className="py-2">
            {children}
          </div>
        )}

        <ModalFooter className="sm:flex-row sm:justify-center gap-3">
          {/* Cancel button - Requirement 14.3 */}
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          
          {/* Confirm button with appropriate color - Requirement 14.3 */}
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'> | null>(null)
  const resolveRef = React.useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = React.useCallback((
    dialogConfig: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfig(dialogConfig)
      setIsOpen(true)
    })
  }, [])

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const ConfirmDialogComponent = React.useCallback(() => {
    if (!config) return null
    
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...config}
      />
    )
  }, [isOpen, config, handleClose, handleConfirm])

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  }
}
