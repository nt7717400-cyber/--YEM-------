import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CarDetailsClient from './CarDetailsClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata dynamically for each car
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.fazaacaetg.com';

  try {
    const response = await fetch(`${apiUrl}/cars/${id}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return {
        title: 'السيارة غير موجودة',
        description: 'لم يتم العثور على السيارة المطلوبة',
      };
    }

    const data = await response.json();
    const car = data.data;

    if (!car) {
      return {
        title: 'السيارة غير موجودة',
        description: 'لم يتم العثور على السيارة المطلوبة',
      };
    }

    const title = `${car.brand} ${car.model} ${car.year}`;
    const description = `${car.name} - ${car.car_condition === 'NEW' ? 'جديدة' : 'مستعملة'} - السعر: ${car.price?.toLocaleString('ar-YE')} ريال`;
    const imageUrl = car.images?.[0]?.url || '/logo.png';

    return {
      title,
      description,
      keywords: [car.brand, car.model, `${car.year}`, 'سيارة للبيع', 'معرض سيارات'],
      openGraph: {
        title: `${title} | معرض وحدة اليمن للسيارات`,
        description,
        type: 'website',
        url: `https://fazaacaetg.com/cars/${id}`,
        images: [
          {
            url: imageUrl.startsWith('http') ? imageUrl : `https://api.fazaacaetg.com${imageUrl}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl.startsWith('http') ? imageUrl : `https://api.fazaacaetg.com${imageUrl}`],
      },
      alternates: {
        canonical: `/cars/${id}`,
      },
    };
  } catch {
    return {
      title: 'تفاصيل السيارة',
      description: 'عرض تفاصيل السيارة - معرض وحدة اليمن للسيارات',
    };
  }
}

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

// Dynamic rendering for car details
export const dynamic = 'force-dynamic';

export default async function CarDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID
  if (!id || isNaN(Number(id))) {
    notFound();
  }

  return <CarDetailsClient />;
}
