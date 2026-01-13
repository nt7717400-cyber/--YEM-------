'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar, MobileOverlay } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface AdminLayoutProps {
  children: React.ReactNode;
}

// ============================================
// Page Title Mapping
// ============================================

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/cars': 'إدارة السيارات',
  '/admin/auctions': 'المزادات',
  '/admin/banners': 'البانرات',
  '/admin/templates': 'قوالب الفحص',
  '/admin/part-keys': 'قاموس الأجزاء',
  '/admin/color-mappings': 'خريطة الألوان',
  '/admin/archive': 'الأرشيف',
  '/admin/settings': 'الإعدادات',
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  
  // Check for nested routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + '/')) {
      return title;
    }
  }
  
  return 'لوحة التحكم';
}

// ============================================
// Mobile Menu Hook
// ============================================

function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle };
}

// ============================================
// Admin Header
// ============================================

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
  username?: string;
}

function AdminHeader({ title, onMenuClick, username }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Page title */}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        {/* User info - visible on larger screens */}
        {username && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>مرحباً،</span>
            <span className="font-medium text-foreground">{username}</span>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================
// Main Component
// ============================================

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const mobileMenu = useMobileMenu();
  
  const pageTitle = getPageTitle(pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by AuthContext
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Mobile Overlay */}
      <MobileOverlay isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader
          title={pageTitle}
          onMenuClick={mobileMenu.open}
          username={user?.username}
        />
        
        {/* Page Content */}
        <main className={cn(
          'flex-1 p-4 lg:p-6',
          'overflow-x-hidden'
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Export page title utility for use in other components
export { getPageTitle };
