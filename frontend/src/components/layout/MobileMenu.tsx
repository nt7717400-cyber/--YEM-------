'use client';

import { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Menu item interface
 */
export interface MobileMenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

/**
 * MobileMenu Component Props
 * Requirements: 1.4, 1.5
 */
export interface MobileMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback when menu should close */
  onClose: () => void;
  /** Menu items to display */
  menuItems: MobileMenuItem[];
  /** Optional className for customization */
  className?: string;
}

/**
 * Determines if a menu item is active based on the current path
 */
export function isMenuItemActive(itemHref: string, currentPath: string): boolean {
  const normalizedItemHref = itemHref === '/' ? '/' : itemHref.replace(/\/$/, '');
  const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  
  if (normalizedItemHref === '/') {
    return normalizedCurrentPath === '/';
  }
  
  return normalizedCurrentPath === normalizedItemHref || 
         normalizedCurrentPath.startsWith(normalizedItemHref + '/');
}

/**
 * Toggle function type for mobile menu
 * Used for property testing
 */
export function toggleMenuState(currentState: boolean): boolean {
  return !currentState;
}

/**
 * MobileMenu Component
 * 
 * A full-screen mobile navigation menu with smooth animations.
 * 
 * Requirements:
 * - 1.4: Display hamburger menu icon on mobile
 * - 1.5: Open full-screen mobile menu with smooth animation
 */
export function MobileMenu({ 
  isOpen, 
  onClose, 
  menuItems,
  className 
}: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle escape key to close menu
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button when menu opens
      firstFocusableRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle click outside to close
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 motion-reduce:transition-none',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleOverlayClick}
        aria-hidden={!isOpen}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الرئيسية"
        aria-hidden={!isOpen}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-in-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full',
          className
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold h-10 w-10 text-lg">
              و
            </div>
            <span className="font-bold text-lg">معرض وحدة اليمن</span>
          </div>
          
          <Button
            ref={firstFocusableRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="h-10 w-10"
          >
            <CloseIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav 
          className="flex-1 overflow-y-auto p-4"
          role="navigation"
          aria-label="القائمة المحمولة"
        >
          <ul className="flex flex-col gap-2">
            {menuItems.map((item, index) => {
              const isActive = item.isActive ?? isMenuItemActive(item.href, pathname);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 text-lg font-medium transition-all duration-200 motion-reduce:transition-none py-4 px-4 rounded-xl',
                      'min-h-[56px]', // Ensure touch target size >= 44px
                      isActive
                        ? 'text-primary bg-primary/10 border-r-4 border-primary rtl:border-r-0 rtl:border-l-4'
                        : 'text-foreground hover:text-primary hover:bg-muted'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} معرض وحدة اليمن</p>
        </div>
      </div>
    </>
  );
}

/**
 * Hamburger Menu Icon Component
 * Requirements: 1.4 - Display hamburger menu icon on mobile
 */
export function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

/**
 * Close Icon Component
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * Hook for managing mobile menu state
 * Provides toggle functionality for property testing
 */
export function useMobileMenu(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
    setIsOpen,
  };
}

// Need to import useState for the hook
import { useState } from 'react';
