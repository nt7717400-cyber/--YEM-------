import { Metadata } from 'next';
import CarDetailsClient from './CarDetailsClient';

// Generate static params - provide placeholder IDs for static export
// Actual car pages will be handled client-side
export function generateStaticParams() {
  // Return placeholder IDs - actual content is loaded client-side
  return [{ id: '1' }];
}

export const metadata: Metadata = {
  title: 'تفاصيل السيارة',
  description: 'عرض تفاصيل السيارة - معرض وحدة اليمن للسيارات',
  openGraph: {
    title: 'تفاصيل السيارة | معرض وحدة اليمن للسيارات',
    description: 'عرض تفاصيل السيارة في معرض وحدة اليمن للسيارات',
  },
};

export default function CarDetailsPage() {
  return <CarDetailsClient />;
}
