import { Suspense } from 'react';
import { Metadata } from 'next';
import CarsPageClient from './CarsPageClient';
import { MainLayout } from '@/components/layout';
import { LoadingPage } from '@/components/ui/loading';

export const metadata: Metadata = {
  title: 'جميع السيارات',
  description: 'تصفح جميع السيارات المتوفرة للبيع في معرض وحدة اليمن للسيارات. سيارات جديدة ومستعملة بأسعار منافسة.',
  openGraph: {
    title: 'جميع السيارات | معرض وحدة اليمن للسيارات',
    description: 'تصفح جميع السيارات المتوفرة للبيع في معرض وحدة اليمن للسيارات',
  },
  alternates: {
    canonical: '/cars',
  },
};

export default function CarsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingPage />}>
        <CarsPageClient />
      </Suspense>
    </MainLayout>
  );
}
