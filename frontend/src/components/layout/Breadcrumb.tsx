'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb Item Interface
 * Represents a single item in the breadcrumb navigation path
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string;
  /** URL path for the breadcrumb item (optional for last item) */
  href?: string;
}

/**
 * Breadcrumb Component Props
 * Requirements: 3.6 - Display navigation path breadcrumb
 */
export interface BreadcrumbProps {
  /** Array of breadcrumb items representing the navigation path */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
  /** Separator character between items (defaults to /) */
  separator?: string;
}

/**
 * Generates breadcrumb items for a car details page
 * Requirements: 3.6 - Breadcrumb showing navigation path: Home > Cars > [Car Name]
 * 
 * @param carName - The name of the car to display in the breadcrumb
 * @returns Array of BreadcrumbItem objects
 */
export function generateCarDetailsBreadcrumb(carName: string): BreadcrumbItem[] {
  return [
    { label: 'الرئيسية', href: '/' },
    { label: 'السيارات', href: '/cars' },
    { label: carName },
  ];
}

/**
 * Validates that a breadcrumb path is correct for a car details page
 * Used for property testing
 * 
 * @param items - The breadcrumb items to validate
 * @param expectedCarName - The expected car name in the last item
 * @returns true if the breadcrumb path is valid
 */
export function isValidCarDetailsBreadcrumb(
  items: BreadcrumbItem[],
  expectedCarName: string
): boolean {
  // Must have exactly 3 items
  if (items.length !== 3) return false;
  
  // First item must be Home with href /
  if (items[0].label !== 'الرئيسية' || items[0].href !== '/') return false;
  
  // Second item must be Cars with href /cars
  if (items[1].label !== 'السيارات' || items[1].href !== '/cars') return false;
  
  // Third item must be the car name without href (current page)
  if (items[2].label !== expectedCarName || items[2].href !== undefined) return false;
  
  return true;
}

/**
 * Chevron Icon Component for RTL-aware separator
 */
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 rtl:rotate-180', className)}
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

/**
 * Home Icon Component
 */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

/**
 * Breadcrumb Component
 * 
 * Displays a navigation breadcrumb trail showing the user's current location
 * within the site hierarchy. Supports RTL layout for Arabic content.
 * 
 * Requirements:
 * - 3.6: Display breadcrumb showing navigation path
 * - 16.5: Support RTL layout for Arabic content
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'الرئيسية', href: '/' },
 *     { label: 'السيارات', href: '/cars' },
 *     { label: 'تويوتا كامري 2024' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ 
  items, 
  className,
  separator = '/'
}: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="مسار التنقل"
      className={cn('flex items-center text-sm', className)}
    >
      <ol 
        className="flex items-center gap-1 flex-wrap"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {/* Separator (not shown before first item) */}
              {!isFirst && (
                <span 
                  className="text-muted-foreground mx-1"
                  aria-hidden="true"
                >
                  {separator === '/' ? (
                    <ChevronIcon className="text-muted-foreground" />
                  ) : (
                    separator
                  )}
                </span>
              )}
              
              {/* Breadcrumb item */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 text-muted-foreground transition-colors',
                    'hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm',
                    'min-h-[44px] min-w-[44px] px-1 -mx-1 flex items-center justify-center sm:min-h-0 sm:min-w-0'
                  )}
                  itemProp="item"
                >
                  {/* Show home icon for first item */}
                  {isFirst && (
                    <HomeIcon className="text-muted-foreground" />
                  )}
                  <span itemProp="name" className={isFirst ? 'sr-only sm:not-sr-only' : ''}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              
              {/* Schema.org position */}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
