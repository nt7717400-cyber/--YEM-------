import { Suspense } from 'react';
import { Metadata } from 'next';
import CarsPageClient from './CarsPageClient';
import { MainLayout } from '@/components/layout';
import { LoadingPage } from '@/components/ui/loading';

export const metadata: Metadata = {
  title: 'جميع السيارات المتوفرة للبيع',
  description:
    'تصفح جميع السيارات المتوفرة للبيع في معرض وحدة اليمن للسيارات. سيارات جديدة ومستعملة بأسعار منافسة وجودة عالية مع فحص شامل.',
  keywords: [
    'سيارات للبيع',
    'سيارات مستعملة',
    'سيارات جديدة',
    'معرض سيارات اليمن',
    'شراء سيارة',
  ],
  openGraph: {
    title: 'جميع السيارات | معرض وحدة اليمن للسيارات',
    description: 'تصفح جميع السيارات المتوفرة للبيع في معرض وحدة اليمن للسيارات',
    type: 'website',
    url: 'https://fazaacaetg.com/cars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'جميع السيارات | معرض وحدة اليمن للسيارات',
    description: 'تصفح جميع السيارات المتوفرة للبيع',
  },
  alternates: {
    canonical: '/cars',
  },
};

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export default function CarsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <CarsPageClient />
      </Suspense>
    </MainLayout>
  );
}
