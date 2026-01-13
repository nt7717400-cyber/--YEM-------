'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Car,
  Gavel,
  Image,
  FileText,
  Wrench,
  Palette,
  Archive,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  X,
  Menu,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ============================================
// Navigation Configuration
// ============================================

const navGroups: NavGroup[] = [
  {
    title: 'الرئيسية',
    items: [
      { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    ],
  },
  {
    title: 'إدارة المحتوى',
    items: [
      { href: '/admin/cars', label: 'إدارة السيارات', icon: Car },
      { href: '/admin/auctions', label: 'المزادات', icon: Gavel },
      { href: '/admin/banners', label: 'البانرات', icon: Image },
    ],
  },
  {
    title: 'الفحص',
    items: [
      { href: '/admin/templates', label: 'قوالب الفحص', icon: FileText },
      { href: '/admin/part-keys', label: 'قاموس الأجزاء', icon: Wrench },
      { href: '/admin/color-mappings', label: 'خريطة الألوان', icon: Palette },
    ],
  },
  {
    title: 'النظام',
    items: [
      { href: '/admin/archive', label: 'الأرشيف', icon: Archive },
      { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
    ],
  },
];

// Flatten for easy lookup
const allNavItems = navGroups.flatMap(group => group.items);

// ============================================
// Storage Keys
// ============================================

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

// ============================================
// Hooks
// ============================================

function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  return { isCollapsed, toggleCollapsed, isLoaded };
}

function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
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
// Components
// ============================================

interface NavItemLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function NavItemLink({ item, isActive, isCollapsed, onClick }: NavItemLinkProps) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'h-6 w-6')} />
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </Link>
  );
}

interface NavGroupSectionProps {
  group: NavGroup;
  pathname: string;
  isCollapsed: boolean;
  onItemClick?: () => void;
}

function NavGroupSection({ group, pathname, isCollapsed, onItemClick }: NavGroupSectionProps) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.title}
        </h3>
      )}
      <ul className="space-y-1">
        {group.items.map((item) => (
          <li key={item.href}>
            <NavItemLink
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              isCollapsed={isCollapsed}
              onClick={onItemClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SidebarContentProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: () => void;
  showToggle?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  isCollapsed,
  onToggleCollapse,
  onItemClick,
  showToggle = true,
  showCloseButton = false,
  onClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        'p-4 border-b flex items-center',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold">معرض وحدة اليمن</h1>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        )}
        
        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {showToggle && onToggleCollapse && !showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            aria-label={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className={cn('space-y-6', isCollapsed && 'space-y-4')}>
          {navGroups.map((group) => (
            <NavGroupSection
              key={group.title}
              group={group}
              pathname={pathname}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn('p-4 border-t', isCollapsed && 'p-2')}>
        {!isCollapsed && (
          <div className="text-sm text-muted-foreground mb-3 text-center truncate">
            مرحباً، {user?.username}
          </div>
        )}
        <Button
          variant="outline"
          className={cn('w-full', isCollapsed && 'p-2')}
          onClick={logout}
          title={isCollapsed ? 'تسجيل الخروج' : undefined}
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'ml-2')} />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Mobile Overlay
// ============================================

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 w-72 bg-background z-50 lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          'shadow-xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
      >
        <SidebarContent
          isCollapsed={false}
          showToggle={false}
          showCloseButton={true}
          onClose={onClose}
          onItemClick={onClose}
        />
      </aside>
    </>
  );
}

// ============================================
// Mobile Menu Button
// ============================================

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden"
      aria-label="فتح القائمة"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}

// ============================================
// Main Component
// ============================================

export function AdminSidebar() {
  const { isCollapsed, toggleCollapsed, isLoaded } = useSidebarState();
  const mobileMenu = useMobileMenu();

  // Don't render until we've loaded the saved state to prevent flash
  if (!isLoaded) {
    return (
      <aside className="hidden lg:block w-64 bg-background border-l min-h-screen" />
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-background border-l min-h-screen',
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </aside>

      {/* Mobile Overlay */}
      <MobileOverlay isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />
    </>
  );
}

// Export for use in AdminLayout
export { useMobileMenu, MobileOverlay };
export type { NavItem, NavGroup };
