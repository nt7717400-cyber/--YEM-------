export { Header, navLinks, isMenuItemActive } from './Header';
export type { HeaderProps, MenuItem } from './Header';
export { Footer } from './Footer';
export { MainLayout } from './MainLayout';
export { 
  MobileMenu, 
  HamburgerIcon, 
  useMobileMenu, 
  toggleMenuState,
  isMenuItemActive as isMobileMenuItemActive 
} from './MobileMenu';
export type { MobileMenuProps, MobileMenuItem } from './MobileMenu';
export { 
  Breadcrumb, 
  generateCarDetailsBreadcrumb, 
  isValidCarDetailsBreadcrumb 
} from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';
