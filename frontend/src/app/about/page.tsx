import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'من نحن - تعرف على معرض وحدة اليمن للسيارات',
  description:
    'تعرف على معرض وحدة اليمن للسيارات - أكبر معرض للسيارات في اليمن. نقدم أفضل السيارات الجديدة والمستعملة بأسعار منافسة وجودة عالية مع ضمان وفحص شامل.',
  keywords: [
    'معرض وحدة اليمن',
    'معرض سيارات صنعاء',
    'من نحن',
    'معرض سيارات اليمن',
    'تواصل معنا',
  ],
  openGraph: {
    title: 'من نحن | معرض وحدة اليمن للسيارات',
    description: 'تعرف على معرض وحدة اليمن للسيارات - أكبر معرض للسيارات في اليمن',
    type: 'website',
    url: 'https://fazaacaetg.com/about',
  },
  twitter: {
    card: 'summary',
    title: 'من نحن | معرض وحدة اليمن للسيارات',
    description: 'تعرف على معرض وحدة اليمن للسيارات',
  },
  alternates: {
    canonical: '/about',
  },
};

// Static page - no revalidation needed
export const revalidate = false;

export default function AboutPage() {
  return <AboutPageClient />;
}
