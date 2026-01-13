/**
 * Feature: web-ui-ux-enhancement
 * Property 6: Breadcrumb Path Accuracy
 * 
 * **Validates: Requirements 3.6**
 * 
 * For any car details page, the breadcrumb should display the correct navigation path:
 * Home > Cars > [Car Name]
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  generateCarDetailsBreadcrumb, 
  isValidCarDetailsBreadcrumb,
  BreadcrumbItem 
} from '@/components/layout/Breadcrumb';

// ============================================
// Arbitraries for Property Testing
// ============================================

/**
 * Generate valid car names (Arabic and English)
 */
const carNameArbitrary = fc.oneof(
  // Arabic car names
  fc.constantFrom(
    'تويوتا كامري 2024',
    'هوندا أكورد 2023',
    'نيسان التيما 2024',
    'مرسيدس بنز E-Class',
    'بي إم دبليو الفئة الخامسة',
    'لكزس ES 350',
    'هيونداي سوناتا',
    'كيا K5 2024'
  ),
  // English car names
  fc.constantFrom(
    'Toyota Camry 2024',
    'Honda Accord 2023',
    'Nissan Altima 2024',
    'Mercedes-Benz E-Class',
    'BMW 5 Series',
    'Lexus ES 350'
  ),
  // Random non-empty strings
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
);

/**
 * Generate breadcrumb items array
 */
const breadcrumbItemsArbitrary = fc.array(
  fc.record({
    label: fc.string({ minLength: 1, maxLength: 30 }),
    href: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
  }),
  { minLength: 1, maxLength: 5 }
);

// ============================================
// Property 6: Breadcrumb Path Accuracy
// ============================================

describe('Property 6: Breadcrumb Path Accuracy', () => {
  /**
   * Property: Generated car details breadcrumb should have exactly 3 items
   */
  it('should generate exactly 3 breadcrumb items for car details', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        return breadcrumb.length === 3;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: First item should always be Home with href /
   */
  it('should have Home as first item with correct href', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        return breadcrumb[0].label === 'الرئيسية' && breadcrumb[0].href === '/';
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Second item should always be Cars with href /cars
   */
  it('should have Cars as second item with correct href', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        return breadcrumb[1].label === 'السيارات' && breadcrumb[1].href === '/cars';
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Third item should be the car name without href (current page)
   */
  it('should have car name as third item without href', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        return breadcrumb[2].label === carName && breadcrumb[2].href === undefined;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isValidCarDetailsBreadcrumb should return true for correctly generated breadcrumbs
   */
  it('should validate correctly generated breadcrumbs as valid', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        return isValidCarDetailsBreadcrumb(breadcrumb, carName) === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isValidCarDetailsBreadcrumb should return false for incorrect car names
   */
  it('should invalidate breadcrumbs with wrong car name', () => {
    fc.assert(
      fc.property(
        carNameArbitrary,
        carNameArbitrary.filter(name => name.length > 0),
        (carName, differentName) => {
          // Skip if names happen to be the same
          if (carName === differentName) return true;
          
          const breadcrumb = generateCarDetailsBreadcrumb(carName);
          return isValidCarDetailsBreadcrumb(breadcrumb, differentName) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isValidCarDetailsBreadcrumb should return false for wrong number of items
   */
  it('should invalidate breadcrumbs with wrong number of items', () => {
    fc.assert(
      fc.property(
        carNameArbitrary,
        fc.integer({ min: 0, max: 10 }).filter(n => n !== 3),
        (carName, itemCount) => {
          // Create breadcrumb with wrong number of items
          const items: BreadcrumbItem[] = [];
          for (let i = 0; i < itemCount; i++) {
            items.push({ label: `Item ${i}`, href: `/${i}` });
          }
          return isValidCarDetailsBreadcrumb(items, carName) === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: isValidCarDetailsBreadcrumb should return false for wrong first item
   */
  it('should invalidate breadcrumbs with wrong first item', () => {
    fc.assert(
      fc.property(
        carNameArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'الرئيسية'),
        (carName, wrongLabel) => {
          const items: BreadcrumbItem[] = [
            { label: wrongLabel, href: '/' },
            { label: 'السيارات', href: '/cars' },
            { label: carName }
          ];
          return isValidCarDetailsBreadcrumb(items, carName) === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: isValidCarDetailsBreadcrumb should return false for wrong second item
   */
  it('should invalidate breadcrumbs with wrong second item', () => {
    fc.assert(
      fc.property(
        carNameArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'السيارات'),
        (carName, wrongLabel) => {
          const items: BreadcrumbItem[] = [
            { label: 'الرئيسية', href: '/' },
            { label: wrongLabel, href: '/cars' },
            { label: carName }
          ];
          return isValidCarDetailsBreadcrumb(items, carName) === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Breadcrumb generation should be deterministic
   */
  it('should produce consistent results for the same car name', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb1 = generateCarDetailsBreadcrumb(carName);
        const breadcrumb2 = generateCarDetailsBreadcrumb(carName);
        
        return (
          breadcrumb1.length === breadcrumb2.length &&
          breadcrumb1.every((item, index) => 
            item.label === breadcrumb2[index].label &&
            item.href === breadcrumb2[index].href
          )
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Last breadcrumb item should never have an href (represents current page)
   */
  it('should not have href on the last item (current page)', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        const lastItem = breadcrumb[breadcrumb.length - 1];
        return lastItem.href === undefined;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All non-last items should have valid hrefs
   */
  it('should have valid hrefs on all non-last items', () => {
    fc.assert(
      fc.property(carNameArbitrary, (carName) => {
        const breadcrumb = generateCarDetailsBreadcrumb(carName);
        const nonLastItems = breadcrumb.slice(0, -1);
        
        return nonLastItems.every(item => 
          typeof item.href === 'string' && 
          item.href.startsWith('/')
        );
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================
// Specific Test Cases
// ============================================

describe('Breadcrumb Path Accuracy - Specific Cases', () => {
  it('should generate correct breadcrumb for Arabic car name', () => {
    const carName = 'تويوتا كامري 2024';
    const breadcrumb = generateCarDetailsBreadcrumb(carName);
    
    expect(breadcrumb).toEqual([
      { label: 'الرئيسية', href: '/' },
      { label: 'السيارات', href: '/cars' },
      { label: 'تويوتا كامري 2024' },
    ]);
  });

  it('should generate correct breadcrumb for English car name', () => {
    const carName = 'Toyota Camry 2024';
    const breadcrumb = generateCarDetailsBreadcrumb(carName);
    
    expect(breadcrumb).toEqual([
      { label: 'الرئيسية', href: '/' },
      { label: 'السيارات', href: '/cars' },
      { label: 'Toyota Camry 2024' },
    ]);
  });

  it('should validate correct breadcrumb structure', () => {
    const carName = 'هوندا أكورد 2023';
    const breadcrumb = generateCarDetailsBreadcrumb(carName);
    
    expect(isValidCarDetailsBreadcrumb(breadcrumb, carName)).toBe(true);
  });

  it('should invalidate breadcrumb with missing home', () => {
    const items: BreadcrumbItem[] = [
      { label: 'السيارات', href: '/cars' },
      { label: 'Test Car' },
    ];
    
    expect(isValidCarDetailsBreadcrumb(items, 'Test Car')).toBe(false);
  });

  it('should invalidate breadcrumb with wrong home href', () => {
    const items: BreadcrumbItem[] = [
      { label: 'الرئيسية', href: '/home' }, // Wrong href
      { label: 'السيارات', href: '/cars' },
      { label: 'Test Car' },
    ];
    
    expect(isValidCarDetailsBreadcrumb(items, 'Test Car')).toBe(false);
  });

  it('should invalidate breadcrumb with href on last item', () => {
    const items: BreadcrumbItem[] = [
      { label: 'الرئيسية', href: '/' },
      { label: 'السيارات', href: '/cars' },
      { label: 'Test Car', href: '/cars/123' }, // Should not have href
    ];
    
    expect(isValidCarDetailsBreadcrumb(items, 'Test Car')).toBe(false);
  });
});
