import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

/**
 * Cairo Font Configuration - Requirements: 17.1, 17.2
 * 
 * Font loading strategy optimizations:
 * - display: "swap" - Shows fallback font immediately, swaps when Cairo loads
 * - weight: Specific weights to reduce download size
 * - subsets: Arabic and Latin for bilingual support
 * - preload: true (default) - Preloads font for faster initial render
 * - adjustFontFallback: true (default) - Adjusts fallback metrics to reduce CLS
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: {
    default: "معرض وحدة اليمن للسيارات",
    template: "%s | معرض وحدة اليمن للسيارات",
  },
  description: "معرض وحدة اليمن للسيارات - أفضل السيارات الجديدة والمستعملة في اليمن. تشكيلة واسعة من السيارات بأسعار منافسة وجودة عالية.",
  keywords: ["سيارات", "معرض سيارات", "اليمن", "سيارات للبيع", "سيارات مستعملة", "سيارات جديدة", "معرض وحدة اليمن", "وحدة اليمن للسيارات", "شراء سيارة"],
  authors: [{ name: "معرض وحدة اليمن للسيارات" }],
  creator: "معرض وحدة اليمن للسيارات",
  publisher: "معرض وحدة اليمن للسيارات",
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_YE',
    siteName: 'معرض وحدة اليمن للسيارات',
    title: 'معرض وحدة اليمن للسيارات',
    description: 'أفضل السيارات الجديدة والمستعملة في اليمن',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'معرض وحدة اليمن للسيارات',
    description: 'أفضل السيارات الجديدة والمستعملة في اليمن',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
