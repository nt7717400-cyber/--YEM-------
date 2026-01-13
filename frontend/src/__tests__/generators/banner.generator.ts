import * as fc from 'fast-check';
import { Banner, BannerPosition, LinkTarget } from '@/types/banner';

// Valid banner positions
export const BANNER_POSITIONS: BannerPosition[] = [
  'hero_top',
  'hero_bottom',
  'sidebar',
  'cars_between',
  'car_detail',
  'footer_above',
  'popup',
];

// Valid link targets
export const LINK_TARGETS: LinkTarget[] = ['_self', '_blank'];

// Generate a valid date string
const validDateArbitrary = fc
  .integer({ min: Date.now() - 365 * 24 * 60 * 60 * 1000, max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
  .map((timestamp) => new Date(timestamp).toISOString());

// Generate a valid banner position
export const bannerPositionArbitrary: fc.Arbitrary<BannerPosition> = fc.constantFrom(...BANNER_POSITIONS);

// Generate a valid link target
export const linkTargetArbitrary: fc.Arbitrary<LinkTarget> = fc.constantFrom(...LINK_TARGETS);

// Generate a valid banner with a specific id
const bannerWithIdArbitrary = (id: number): fc.Arbitrary<Banner> =>
  fc.record({
    id: fc.constant(id),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    imageUrl: fc.constant('/uploads/banners/test-banner.jpg'),
    imageMobileUrl: fc.option(fc.constant('/uploads/banners/test-banner-mobile.jpg'), { nil: null }),
    linkUrl: fc.option(fc.webUrl(), { nil: null }),
    linkTarget: linkTargetArbitrary,
    position: bannerPositionArbitrary,
    displayOrder: fc.integer({ min: 0, max: 100 }),
    isActive: fc.boolean(),
    startDate: fc.option(validDateArbitrary, { nil: null }),
    endDate: fc.option(validDateArbitrary, { nil: null }),
    clickCount: fc.integer({ min: 0, max: 1000000 }),
    viewCount: fc.integer({ min: 0, max: 1000000 }),
    createdAt: validDateArbitrary,
    updatedAt: validDateArbitrary,
  });

// Generate a valid banner
export const bannerArbitrary: fc.Arbitrary<Banner> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  imageUrl: fc.constant('/uploads/banners/test-banner.jpg'),
  imageMobileUrl: fc.option(fc.constant('/uploads/banners/test-banner-mobile.jpg'), { nil: null }),
  linkUrl: fc.option(fc.webUrl(), { nil: null }),
  linkTarget: linkTargetArbitrary,
  position: bannerPositionArbitrary,
  displayOrder: fc.integer({ min: 0, max: 100 }),
  isActive: fc.boolean(),
  startDate: fc.option(validDateArbitrary, { nil: null }),
  endDate: fc.option(validDateArbitrary, { nil: null }),
  clickCount: fc.integer({ min: 0, max: 1000000 }),
  viewCount: fc.integer({ min: 0, max: 1000000 }),
  createdAt: validDateArbitrary,
  updatedAt: validDateArbitrary,
});

// Generate an array of banners with unique IDs
export const bannersArrayArbitrary: fc.Arbitrary<Banner[]> = fc
  .integer({ min: 0, max: 20 })
  .chain((length) => {
    if (length === 0) return fc.constant([]);
    // Generate unique IDs first, then create banners with those IDs
    return fc
      .uniqueArray(fc.integer({ min: 1, max: 100000 }), { minLength: length, maxLength: length })
      .chain((ids) => fc.tuple(...ids.map((id) => bannerWithIdArbitrary(id))));
  });

// Generate a banner with a specific position
export const bannerWithPositionArbitrary = (position: BannerPosition): fc.Arbitrary<Banner> =>
  bannerArbitrary.map((banner) => ({ ...banner, position }));

// Generate a banner with a specific active status
export const bannerWithStatusArbitrary = (isActive: boolean): fc.Arbitrary<Banner> =>
  bannerArbitrary.map((banner) => ({ ...banner, isActive }));
