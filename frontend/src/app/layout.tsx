import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

/**
 * Cairo Font Configuration
 * Optimized for Arabic content with performance in mind
 */
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'light dark',
};

const BASE_URL = 'https://fazaacaetg.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'معرض وحدة اليمن للسيارات | أفضل السيارات في اليمن',
    template: '%s | معرض وحدة اليمن للسيارات',
  },
  description:
    'معرض وحدة اليمن للسيارات - أكبر معرض للسيارات الجديدة والمستعملة في اليمن. تشكيلة واسعة من السيارات بأسعار منافسة وجودة عالية مع ضمان وفحص شامل.',
  keywords: [
    'سيارات',
    'معرض سيارات',
    'اليمن',
    'سيارات للبيع',
    'سيارات مستعملة',
    'سيارات جديدة',
    'معرض وحدة اليمن',
    'وحدة اليمن للسيارات',
    'شراء سيارة',
    'سيارات صنعاء',
    'معرض سيارات صنعاء',
    'بيع سيارات اليمن',
  ],
  authors: [{ name: 'معرض وحدة اليمن للسيارات', url: BASE_URL }],
  creator: 'معرض وحدة اليمن للسيارات',
  publisher: 'معرض وحدة اليمن للسيارات',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_YE',
    url: BASE_URL,
    siteName: 'معرض وحدة اليمن للسيارات',
    title: 'معرض وحدة اليمن للسيارات | أفضل السيارات في اليمن',
    description: 'أكبر معرض للسيارات الجديدة والمستعملة في اليمن مع ضمان الجودة',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'معرض وحدة اليمن للسيارات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'معرض وحدة اليمن للسيارات',
    description: 'أفضل السيارات الجديدة والمستعملة في اليمن',
    images: ['/logo.png'],
    creator: '@yemencars',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'ar-YE': BASE_URL,
    },
  },
  category: 'automotive',
  classification: 'Car Dealership',
  verification: {
    google: 'your-google-verification-code',
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'معرض وحدة اليمن للسيارات',
  description: 'أكبر معرض للسيارات الجديدة والمستعملة في اليمن',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'شارع الستين',
    addressLocality: 'صنعاء',
    addressCountry: 'YE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '15.3694',
    longitude: '44.1910',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '08:00',
    closes: '20:00',
  },
  priceRange: '$$',
  currenciesAccepted: 'YER, USD',
  paymentAccepted: 'Cash',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://api.fazaacaetg.com" />
        <link rel="dns-prefetch" href="https://api.fazaacaetg.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cairo.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
