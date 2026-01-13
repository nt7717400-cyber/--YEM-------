/**
 * Banner Management Types
 * نظام إدارة البانرات الإعلانية
 */

// Banner positions - مواقع ظهور البانر
export type BannerPosition =
  | 'hero_top'
  | 'hero_bottom'
  | 'sidebar'
  | 'cars_between'
  | 'car_detail'
  | 'footer_above'
  | 'popup';

// Link target options
export type LinkTarget = '_self' | '_blank';

// Banner interface - واجهة البانر
export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  imageMobileUrl: string | null;
  linkUrl: string | null;
  linkTarget: LinkTarget;
  position: BannerPosition;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  clickCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Create banner input - مدخلات إنشاء بانر جديد
export interface CreateBannerInput {
  title: string;
  image: File;
  imageMobile?: File;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position: BannerPosition;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// Update banner input - مدخلات تحديث البانر
export interface UpdateBannerInput {
  title?: string;
  image?: File;
  imageMobile?: File;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position?: BannerPosition;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// Banner filters - فلاتر البانرات
export interface BannerFilters {
  position?: BannerPosition;
  isActive?: boolean;
}
