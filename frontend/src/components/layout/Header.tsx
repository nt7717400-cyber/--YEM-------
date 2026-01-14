'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/**
 * Navigation menu items configuration
 */
export interface MenuItem {
  href: string;
  label: string;
}

export const navLinks: MenuItem[] = [
  { href: '/', label: 'الرئيسية' },
  { href: '/cars', label: 'جميع السيارات' },
  { href: '/about', label: 'من نحن' },
];

/**
 * Header Component Props
 * Requirements: 1.1, 1.2, 1.3, 1.6
 */
export interface HeaderProps {
  /** Whether the header should be transparent (for hero sections) */
  transparent?: boolean;
  /** Whether to show the search icon */
  showSearch?: boolean;
  /** Custom menu items (defaults to navLinks) */
  menuItems?: MenuItem[];
}

/**
 * Determines if a menu item is active based on the current path
 * Requirements: 1.6 - Highlight current active page
 */
export function isMenuItemActive(itemHref: string, currentPath: string): boolean {
  // Normalize paths by removing trailing slashes
  const normalizedItemHref = itemHref === '/' ? '/' : itemHref.replace(/\/$/, '');
  const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  
  // Exact match for home page
  if (normalizedItemHref === '/') {
    return normalizedCurrentPath === '/';
  }
  
  // For other pages, check if current path starts with the item href
  // This handles nested routes like /cars/123
  return normalizedCurrentPath === normalizedItemHref || 
         normalizedCurrentPath.startsWith(normalizedItemHref + '/');
}

/**
 * Header Component
 * 
 * Requirements:
 * - 1.1: Sticky header that remains visible while scrolling
 * - 1.2: Minimize header height smoothly when scrolling down
 * - 1.3: Display logo, main menu items, and search icon
 * - 1.6: Highlight current active page in menu
 */
export function Header({ 
  transparent = false, 
  showSearch = true,
  menuItems = navLinks 
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll to minimize header - Requirements: 1.1, 1.2
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        // Background styles
        transparent && !isScrolled
          ? 'bg-transparent border-transparent'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        // Height transition for scroll minimization - Requirement 1.2
        isScrolled ? 'py-2' : 'py-3'
      )}
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div 
          className={cn(
            'flex items-center justify-between transition-all duration-300',
            // Height changes based on scroll state - Requirement 1.2
            isScrolled ? 'h-12' : 'h-16'
          )}
        >
          {/* Logo - Requirement 1.3 */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-transform hover:scale-105"
            aria-label="الصفحة الرئيسية - معرض وحدة اليمن للسيارات"
          >
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="شعار معرض وحدة اليمن للسيارات"
              className={cn(
                'object-contain transition-all duration-300',
                isScrolled ? 'h-8 w-8' : 'h-10 w-10'
              )}
              onError={(e) => {
                // Fallback to text if image fails
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback Logo */}
            <div 
              className={cn(
                'hidden items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold transition-all duration-300',
                isScrolled ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-lg'
              )}
            >
              وحدة
            </div>
            <span 
              className={cn(
                'hidden font-bold sm:inline-block transition-all duration-300 text-primary',
                isScrolled ? 'text-sm' : 'text-base'
              )}
            >
              معرض وحدة اليمن للسيارات
            </span>
          </Link>

          {/* Desktop Navigation - Requirement 1.3 */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="القائمة الرئيسية">
            {menuItems.map((link) => {
              const isActive = isMenuItemActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors relative py-1',
                    // Active state styling - Requirement 1.6
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary',
                    // Hover effect - Requirement 1.7
                    'hover:text-primary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                  {/* Active indicator underline */}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon - Requirement 1.3 */}
            {showSearch && (
              <Link href="/cars" aria-label="البحث عن سيارات">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    'transition-all duration-300',
                    isScrolled ? 'h-8 w-8' : 'h-10 w-10'
                  )}
                >
                  <SearchIcon className={cn(
                    'transition-all duration-300',
                    isScrolled ? 'h-4 w-4' : 'h-5 w-5'
                  )} />
                  <span className="sr-only">بحث</span>
                </Button>
              </Link>
            )}

            {/* Mobile Navigation - Requirement 1.4 */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    'transition-all duration-300',
                    isScrolled ? 'h-8 w-8' : 'h-10 w-10'
                  )}
                  aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                  aria-expanded={isOpen}
                >
                  <MenuIcon className={cn(
                    'transition-all duration-300',
                    isScrolled ? 'h-4 w-4' : 'h-5 w-5'
                  )} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav 
                  className="flex flex-col gap-4 mt-8" 
                  role="navigation" 
                  aria-label="القائمة المحمولة"
                >
                  {menuItems.map((link) => {
                    const isActive = isMenuItemActive(link.href, pathname);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'text-lg font-medium transition-colors py-2 px-4 rounded-lg',
                          // Active state styling - Requirement 1.6
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Menu Icon Component
 */
function MenuIcon({ className }: { className?: string }) {
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
 * Search Icon Component
 */
function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
