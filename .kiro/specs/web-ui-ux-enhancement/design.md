# Design Document: Web UI/UX Enhancement

## Overview

هذا المستند يوضح التصميم التقني لتحسين واجهة الويب لمعرض SHAS Motors. يشمل التصميم واجهة المتجر للعملاء ولوحة التحكم للإدارة، مع التركيز على تجربة مستخدم سلسة وواجهة أنيقة وعصرية.

### التقنيات المستخدمة
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: Radix UI primitives + Custom components
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate + Framer Motion
- **Testing**: Vitest + fast-check (Property-Based Testing)
- **Font**: Cairo (Arabic)

### مبادئ التصميم
1. **Mobile-First**: التصميم يبدأ من الموبايل ثم يتوسع للشاشات الأكبر
2. **RTL-First**: دعم كامل للغة العربية واتجاه RTL
3. **Accessibility**: التوافق مع WCAG AA
4. **Performance**: تحميل سريع وأداء 60fps للحركات

---

## Architecture

### هيكل المجلدات

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── (storefront)/            # Customer-facing pages
│   │   ├── page.tsx             # Homepage
│   │   ├── cars/                # Car listings & details
│   │   └── about/               # About page
│   └── admin/                   # Admin dashboard pages
│       ├── layout.tsx           # Admin layout with sidebar
│       ├── page.tsx             # Dashboard home
│       ├── cars/                # Car management
│       └── settings/            # Settings
├── components/
│   ├── ui/                      # Base UI components (shared)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx           # Storefront header
│   │   ├── Footer.tsx           # Storefront footer
│   │   ├── MobileMenu.tsx       # Mobile navigation
│   │   └── Breadcrumb.tsx       # Navigation breadcrumb
│   ├── cars/                    # Car-related components
│   │   ├── CarCard.tsx          # Car listing card
│   │   ├── CarGallery.tsx       # Image gallery
│   │   ├── CarSpecs.tsx         # Specifications display
│   │   └── CarFilters.tsx       # Search filters
│   ├── admin/                   # Admin-specific components
│   │   ├── Sidebar.tsx          # Admin sidebar
│   │   ├── StatsCard.tsx        # Statistics card
│   │   ├── DataTable.tsx        # Data table
│   │   └── FileUpload.tsx       # File upload
│   └── search/                  # Search components
│       ├── SearchBar.tsx        # Search input
│       └── SearchResults.tsx    # Results display
├── lib/                         # Utilities
│   ├── utils.ts                 # General utilities
│   ├── rtlUtils.ts              # RTL helpers
│   └── responsiveUtils.ts       # Responsive helpers
└── types/                       # TypeScript types
```

### Component Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      App Layout                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Header/Sidebar                        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Page Content                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ││
│  │  │  Feature    │  │  Feature    │  │  Feature    │     ││
│  │  │  Component  │  │  Component  │  │  Component  │     ││
│  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │     ││
│  │  │  │  UI   │  │  │  │  UI   │  │  │  │  UI   │  │     ││
│  │  │  │ Comp  │  │  │  │ Comp  │  │  │  │ Comp  │  │     ││
│  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │     ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Navigation System Components

#### Header Component
```typescript
interface HeaderProps {
  transparent?: boolean;      // For hero sections
  showSearch?: boolean;       // Show search icon
}

interface HeaderState {
  isScrolled: boolean;        // Header minimized state
  isMobileMenuOpen: boolean;  // Mobile menu visibility
}
```

#### MobileMenu Component
```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}
```

### 2. Car Display Components

#### CarCard Component
```typescript
interface CarCardProps {
  car: Car;
  variant?: 'default' | 'compact' | 'featured';
  showBadges?: boolean;
  onFavorite?: (carId: string) => void;
}

interface Car {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  year: number;
  condition: 'new' | 'used';
  images: string[];
  isFeatured: boolean;
  isSold: boolean;
}
```

#### CarGallery Component
```typescript
interface CarGalleryProps {
  images: string[];
  carName: string;
  enableLightbox?: boolean;
  enableSwipe?: boolean;
}

interface GalleryState {
  activeIndex: number;
  isLightboxOpen: boolean;
}
```

### 3. Search Components

#### SearchBar Component
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
}

interface SearchSuggestion {
  type: 'car' | 'brand' | 'category';
  label: string;
  value: string;
}
```

#### CarFilters Component
```typescript
interface CarFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableOptions: FilterOptions;
}

interface FilterState {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  condition?: 'new' | 'used' | 'all';
}

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}
```

### 4. Admin Components

#### Sidebar Component
```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  menuItems: AdminMenuItem[];
}

interface AdminMenuItem {
  label: string;
  labelAr: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: AdminMenuItem[];
}
```

#### DataTable Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: PaginationConfig;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowSelect?: (selectedIds: string[]) => void;
  rowActions?: RowAction<T>[];
}

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
}
```

#### FileUpload Component
```typescript
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: UploadedFile[]) => void;
  onReorder?: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
```

### 5. Shared UI Components

#### Toast Component
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onDismiss?: () => void;
}
```

#### Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}
```

#### Skeleton Component
```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}
```

---

## Data Models

### Car Model
```typescript
interface Car {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: 'new' | 'used';
  mileage?: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual';
  color: string;
  colorAr: string;
  images: CarImage[];
  specifications: CarSpecification[];
  features: string[];
  description: string;
  descriptionAr: string;
  isFeatured: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CarImage {
  id: string;
  url: string;
  thumbnail: string;
  order: number;
  alt?: string;
}

interface CarSpecification {
  key: string;
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
  icon?: string;
}
```

### Filter State Model
```typescript
interface FilterState {
  search?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  condition?: ('new' | 'used')[];
  fuelType?: string[];
  transmission?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'year_desc' | 'newest';
  page?: number;
  limit?: number;
}
```

### Admin Statistics Model
```typescript
interface DashboardStats {
  totalCars: number;
  totalCarsChange: number;
  soldCars: number;
  soldCarsChange: number;
  totalViews: number;
  totalViewsChange: number;
  totalInquiries: number;
  totalInquiriesChange: number;
}

interface ViewsChartData {
  date: string;
  views: number;
}

interface RecentActivity {
  id: string;
  type: 'car_added' | 'car_sold' | 'inquiry' | 'view';
  message: string;
  timestamp: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

قبل كتابة خصائص الصحة، سأقوم بتحليل معايير القبول لتحديد ما يمكن اختباره.


### Property 1: Car Card Information Display
*For any* Car object, the rendered CarCard component should display the car name, price (formatted with ر.ي), year, and condition. If isFeatured is true, a "مميزة" badge should be visible. If isSold is true, a "مباعة" badge with overlay should be visible.
**Validates: Requirements 2.1, 2.3, 2.4, 2.6**

### Property 2: Filter State Synchronization
*For any* filter state change (adding, removing, or modifying filters), the search results should update to match the filter criteria, active filter chips should reflect the current state, and the result count should equal the actual number of displayed results.
**Validates: Requirements 4.4, 4.5, 4.6, 4.7**

### Property 3: Search Suggestions Relevance
*For any* search query string, the returned suggestions should only include items that contain the query string (case-insensitive) in their name, brand, or category.
**Validates: Requirements 4.1**

### Property 4: Navigation Active State
*For any* current route path, exactly one menu item should have the active state, and it should correspond to the current page.
**Validates: Requirements 1.6**

### Property 5: Mobile Menu Toggle
*For any* initial menu state (open or closed), clicking the hamburger menu button should toggle the state to the opposite value.
**Validates: Requirements 1.5**

### Property 6: Breadcrumb Path Accuracy
*For any* car details page, the breadcrumb should display the correct navigation path: Home > Cars > [Car Name].
**Validates: Requirements 3.6**

### Property 7: Car Specifications Rendering
*For any* car with specifications array, each specification should be rendered with its label, value, and icon (if provided).
**Validates: Requirements 3.4**

### Property 8: Form Validation Behavior
*For any* form field with validation rules, entering invalid data should immediately display an error message below the field, required fields should show indicators, and form data should be preserved after a failed submission.
**Validates: Requirements 11.2, 11.3, 11.4, 11.8**

### Property 9: Toast Notification Styling
*For any* toast notification type (success, error, warning, info), the toast should display the correct icon and styling. Error toasts should not auto-dismiss, while success toasts should auto-dismiss after 5 seconds.
**Validates: Requirements 13.1, 13.3, 13.4**

### Property 10: Toast Stacking
*For any* number of simultaneous notifications (n), they should be stacked vertically without overlapping, with the most recent at the top.
**Validates: Requirements 13.5**

### Property 11: Modal Keyboard Accessibility
*For any* open modal dialog, pressing Escape should close it (for non-destructive dialogs), Tab should cycle through focusable elements within the modal, and focus should be trapped within the modal.
**Validates: Requirements 14.4, 14.5, 14.6**

### Property 12: Destructive Action Confirmation
*For any* destructive action (delete, remove), a confirmation modal should appear before the action is executed.
**Validates: Requirements 14.1**

### Property 13: Data Table Sorting
*For any* sortable column in a data table, clicking the column header should sort the data by that column. Clicking again should reverse the sort order.
**Validates: Requirements 10.1, 10.2**

### Property 14: Bulk Selection Actions
*For any* data table with row selection, selecting one or more rows should display bulk action options. Deselecting all rows should hide bulk actions.
**Validates: Requirements 10.6**

### Property 15: Sidebar State Persistence
*For any* sidebar collapsed state, the state should be saved to localStorage and restored on page reload.
**Validates: Requirements 8.6**

### Property 16: Admin Page Title
*For any* admin page route, the header should display the correct page title corresponding to that route.
**Validates: Requirements 8.7**

### Property 17: Statistics Trend Indicators
*For any* metric with a change value, if the change is positive, an up arrow should be displayed. If negative, a down arrow should be displayed.
**Validates: Requirements 9.2**

### Property 18: File Upload Validation
*For any* file upload attempt, if the file type is not in the accepted list or exceeds the max size, an error message should be displayed and the file should not be added to the upload queue.
**Validates: Requirements 12.4**

### Property 19: File Upload Preview
*For any* valid image file added to the upload queue, a preview thumbnail should be generated and displayed before the upload completes.
**Validates: Requirements 12.3**

### Property 20: File Upload Progress
*For any* file being uploaded, the progress indicator should show a value between 0 and 100 that increases as the upload progresses.
**Validates: Requirements 12.2**

### Property 21: File Metadata Display
*For any* uploaded image file, the component should display the file size (formatted) and image dimensions.
**Validates: Requirements 12.6**

### Property 22: Touch Target Minimum Size
*For any* interactive element (button, link, input) on mobile viewport, the element should have minimum dimensions of 44x44 pixels.
**Validates: Requirements 6.3, 6.6, 15.4**

### Property 23: Responsive Grid Columns
*For any* viewport width, the car grid should display the correct number of columns: 4 on desktop (≥1024px), 2 on tablet (≥640px), 1 on mobile (<640px).
**Validates: Requirements 6.1**

### Property 24: Mobile Font Size
*For any* body text element on mobile viewport, the computed font size should be at least 16px.
**Validates: Requirements 17.3**

### Property 25: Reduced Motion Preference
*For any* user with prefers-reduced-motion enabled, all CSS animations and transitions should be disabled or minimized.
**Validates: Requirements 7.4**

### Property 26: RTL Layout Support
*For any* page rendered with dir="rtl", text alignment should be right-aligned, flexbox directions should be reversed where appropriate, and margins/paddings should use logical properties.
**Validates: Requirements 16.5**

### Property 27: Color Contrast Accessibility
*For any* text element and its background, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 16.3**

### Property 28: Component Keyboard Navigation
*For any* UI component (Button, Input, Select, Modal, etc.), it should be focusable via Tab key and operable via keyboard.
**Validates: Requirements 18.8**

### Property 29: Responsive Form Layout
*For any* form on mobile viewport, form fields should be displayed in a single-column layout.
**Validates: Requirements 15.2**

### Property 30: Sidebar Toggle Behavior
*For any* sidebar state, clicking the toggle button should switch between expanded (showing labels) and collapsed (icons only) states.
**Validates: Requirements 8.2**

---

## Error Handling

### Client-Side Errors

| Error Type | Handling Strategy | User Feedback |
|------------|-------------------|---------------|
| Network Error | Retry with exponential backoff | Toast notification with retry button |
| API Error (4xx) | Display error message | Inline error or toast based on context |
| API Error (5xx) | Log error, show generic message | "حدث خطأ، يرجى المحاولة لاحقاً" |
| Validation Error | Prevent submission | Inline field errors |
| File Upload Error | Remove from queue | Error message on file item |

### Error States UI

```typescript
interface ErrorState {
  hasError: boolean;
  errorCode?: string;
  errorMessage?: string;
  retryAction?: () => void;
}

// Error boundary for component-level errors
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

### Empty States

| Context | Message | Action |
|---------|---------|--------|
| No cars found | "لم يتم العثور على سيارات" | Clear filters button |
| No search results | "لا توجد نتائج للبحث" | Suggestions list |
| Empty cart | "السلة فارغة" | Browse cars button |
| No notifications | "لا توجد إشعارات" | - |

---

## Testing Strategy

### Unit Tests
Unit tests verify specific examples and edge cases:

- Component rendering with various props
- Event handler behavior
- Utility function outputs
- Edge cases (empty arrays, null values, boundary conditions)

### Property-Based Tests
Property tests verify universal properties across all inputs using fast-check:

```typescript
// Example: Car Card property test
import * as fc from 'fast-check';

// Generator for Car objects
const carArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  nameAr: fc.string({ minLength: 1 }),
  price: fc.integer({ min: 0, max: 10000000 }),
  year: fc.integer({ min: 1990, max: 2025 }),
  condition: fc.constantFrom('new', 'used'),
  isFeatured: fc.boolean(),
  isSold: fc.boolean(),
  images: fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
});

// Property test
test('Property 1: Car Card displays all required information', () => {
  fc.assert(
    fc.property(carArbitrary, (car) => {
      const { getByText, queryByText } = render(<CarCard car={car} />);
      
      // Name should be displayed
      expect(getByText(car.nameAr)).toBeInTheDocument();
      
      // Price should be formatted with currency
      expect(getByText(/ر\.ي/)).toBeInTheDocument();
      
      // Year should be displayed
      expect(getByText(car.year.toString())).toBeInTheDocument();
      
      // Featured badge logic
      if (car.isFeatured) {
        expect(getByText('مميزة')).toBeInTheDocument();
      } else {
        expect(queryByText('مميزة')).not.toBeInTheDocument();
      }
      
      // Sold badge logic
      if (car.isSold) {
        expect(getByText('مباعة')).toBeInTheDocument();
      }
    }),
    { numRuns: 100 }
  );
});
```

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
  },
});
```

### Testing Priorities

1. **High Priority**: Core business logic (filtering, sorting, validation)
2. **Medium Priority**: UI component behavior (interactions, state changes)
3. **Lower Priority**: Visual styling (handled by visual regression tests)

### Property Test Annotations

Each property test must include:
- Feature name tag
- Property number reference
- Requirements validation reference

```typescript
/**
 * Feature: web-ui-ux-enhancement
 * Property 2: Filter State Synchronization
 * Validates: Requirements 4.4, 4.5, 4.6, 4.7
 */
test('Property 2: Filter state synchronization', () => {
  // Test implementation
});
```

---

## Implementation Notes

### Performance Considerations

1. **Image Optimization**: Use Next.js Image component with lazy loading
2. **Code Splitting**: Dynamic imports for admin components
3. **Memoization**: Use React.memo for expensive components
4. **Virtual Scrolling**: For large data tables (>100 rows)

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Color is not the only means of conveying information
- [ ] Focus indicators are visible
- [ ] Skip links for main content
- [ ] ARIA labels for icon-only buttons
- [ ] Keyboard navigation works throughout

### RTL Implementation

- Use CSS logical properties (margin-inline-start, padding-inline-end)
- Use flexbox with row-reverse for RTL
- Mirror directional icons
- Test with actual Arabic content
